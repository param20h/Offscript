import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { invoiceUpdateSchema } from "@/lib/validations/invoice";
import { calculateInvoicePricing } from "@/lib/invoices/pricing";
import { validateOrigin } from "@/lib/security";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPrivateSession();
    if (!session.authenticated) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured on server" },
        { status: 503 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const [invoiceRes, itemsRes, paymentsRes, activityRes] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, clients(*), proposals(id, proposal_number, title)")
        .eq("id", id)
        .single(),
      supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("payments")
        .select("*")
        .eq("invoice_id", id)
        .order("payment_date", { ascending: false }),
      supabase
        .from("invoice_activity")
        .select("*")
        .eq("invoice_id", id)
        .order("created_at", { ascending: false }),
    ]);

    if (invoiceRes.error || !invoiceRes.data) {
      return NextResponse.json(
        { error: invoiceRes.error?.message || "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      invoice: invoiceRes.data,
      client: invoiceRes.data.clients,
      proposal: invoiceRes.data.proposals,
      items: itemsRes.data || [],
      payments: paymentsRes.data || [],
      activity: activityRes.data || [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Cross-Origin validation (SEC-04)
    const originCheck = validateOrigin(request);
    if (!originCheck.valid) {
      return NextResponse.json(
        { error: originCheck.reason || "Cross-origin request rejected." },
        { status: 403 }
      );
    }

    // 2. Authentication check
    const session = await getPrivateSession();
    if (!session.authenticated) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured on server" },
        { status: 503 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // 3. Fetch existing invoice
    const { data: existingInvoice, error: fetchErr } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !existingInvoice) {
      return NextResponse.json(
        { error: fetchErr?.message || "Invoice not found" },
        { status: 404 }
      );
    }

    // 4. Commercial Immortality Guard:
    // Once issued or paid, line items and totals CANNOT be mutated silently.
    if (existingInvoice.status !== "draft") {
      return NextResponse.json(
        {
          error: `Issued invoices cannot have their commercial terms or line items modified (Current status: ${existingInvoice.status}). Use an explicit void or cancellation workflow.`,
        },
        { status: 409 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = invoiceUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData = parseResult.data;

    // Determine items for recalculation
    let itemsToCalculate: { quantity: number; unit_price: number }[] = [];
    if (updateData.items) {
      itemsToCalculate = updateData.items.map((i) => ({
        quantity: i.quantity,
        unit_price: i.unit_price,
      }));
    } else {
      const { data: currentItems } = await supabase
        .from("invoice_items")
        .select("quantity, unit_price")
        .eq("invoice_id", id);
      itemsToCalculate = currentItems || [];
    }

    const pricing = calculateInvoicePricing({
      items: itemsToCalculate,
      discount_type: updateData.discount_type || existingInvoice.discount_type,
      discount_value:
        updateData.discount_value !== undefined
          ? updateData.discount_value
          : existingInvoice.discount_value,
      tax_rate:
        updateData.tax_rate !== undefined
          ? updateData.tax_rate
          : existingInvoice.tax_rate,
      amount_paid: existingInvoice.amount_paid,
    });

    const invoiceUpdatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      subtotal: pricing.subtotal,
      discount_amount: pricing.discount_amount,
      tax_amount: pricing.tax_amount,
      total_amount: pricing.total_amount,
      balance_due: pricing.balance_due,
    };

    if (updateData.due_date !== undefined) invoiceUpdatePayload.due_date = updateData.due_date;
    if (updateData.issue_date !== undefined) invoiceUpdatePayload.issue_date = updateData.issue_date;
    if (updateData.discount_type !== undefined) invoiceUpdatePayload.discount_type = updateData.discount_type;
    if (updateData.discount_value !== undefined) invoiceUpdatePayload.discount_value = updateData.discount_value;
    if (updateData.tax_rate !== undefined) invoiceUpdatePayload.tax_rate = updateData.tax_rate;
    if (updateData.notes !== undefined) invoiceUpdatePayload.notes = updateData.notes;
    if (updateData.payment_instructions !== undefined)
      invoiceUpdatePayload.payment_instructions = updateData.payment_instructions;

    // Update parent invoice
    const { data: updatedInvoice, error: updateErr } = await supabase
      .from("invoices")
      .update(invoiceUpdatePayload as any)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // If items were provided, replace invoice_items
    if (updateData.items) {
      await supabase.from("invoice_items").delete().eq("invoice_id", id);

      const itemsPayload = updateData.items.map((item, idx) => ({
        invoice_id: id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit || "units",
        unit_price: item.unit_price,
        total_price: pricing.line_item_totals[idx],
        sort_order: item.sort_order ?? idx,
      }));

      await supabase.from("invoice_items").insert(itemsPayload);
    }

    // Log activity
    await supabase.from("invoice_activity").insert({
      invoice_id: id,
      event_type: "updated",
      actor: session.adminId || "Studio Admin",
      description: `Draft invoice ${existingInvoice.invoice_number} updated.`,
      metadata: { total_amount: pricing.total_amount },
    });

    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const originCheck = validateOrigin(request);
    if (!originCheck.valid) {
      return NextResponse.json(
        { error: originCheck.reason || "Cross-origin request rejected." },
        { status: 403 }
      );
    }

    const session = await getPrivateSession();
    if (!session.authenticated) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured on server" },
        { status: 503 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data: invoice } = await supabase
      .from("invoices")
      .select("status, invoice_number")
      .eq("id", id)
      .single();

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status !== "draft") {
      return NextResponse.json(
        {
          error: `Only draft invoices can be deleted. Invoice ${invoice.invoice_number} is in status '${invoice.status}'. Use the void workflow instead.`,
        },
        { status: 400 }
      );
    }

    const { error: delErr } = await supabase.from("invoices").delete().eq("id", id);
    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

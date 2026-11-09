import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  InvoiceStatus,
  InvoiceType,
} from "@/lib/db/supabase";
import { invoiceCreateSchema } from "@/lib/validations/invoice";
import { calculateInvoicePricing, fromPaise, round2, toPaise } from "@/lib/invoices/pricing";
import { validateOrigin } from "@/lib/security";

/**
 * Generates the next sequential human-readable invoice number (e.g., OFF-INV-2026-001).
 */
async function generateNextInvoiceNumber(supabase: any): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `OFF-INV-${currentYear}-`;

  const { data } = await supabase
    .from("invoices")
    .select("invoice_number")
    .ilike("invoice_number", `${prefix}%`)
    .order("invoice_number", { ascending: false })
    .limit(1);

  let nextSequence = 1;
  if (data && data.length > 0 && data[0].invoice_number) {
    const lastNumStr = data[0].invoice_number.replace(prefix, "");
    const parsed = parseInt(lastNumStr, 10);
    if (!isNaN(parsed)) {
      nextSequence = parsed + 1;
    }
  }

  const padded = nextSequence.toString().padStart(3, "0");
  return `${prefix}${padded}`;
}

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("client_id");
    const proposalId = searchParams.get("proposal_id");
    const status = searchParams.get("status");
    const invoiceType = searchParams.get("invoice_type");
    const search = searchParams.get("search")?.toLowerCase().trim();
    const sort = searchParams.get("sort") || "created_desc";

    const supabase = getSupabaseServerClient();

    let query = supabase
      .from("invoices")
      .select("*, clients(id, name, company_name, email)");

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    if (proposalId) {
      query = query.eq("proposal_id", proposalId);
    }

    if (status && status !== "all") {
      query = query.eq("status", status as InvoiceStatus);
    }

    if (invoiceType && invoiceType !== "all") {
      query = query.eq("invoice_type", invoiceType as InvoiceType);
    }

    if (sort === "created_asc") {
      query = query.order("created_at", { ascending: true });
    } else if (sort === "due_date") {
      query = query.order("due_date", { ascending: true });
    } else if (sort === "amount_desc") {
      query = query.order("total_amount", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let records = data || [];

    if (search) {
      records = records.filter((inv: any) => {
        const num = (inv.invoice_number || "").toLowerCase();
        const clientName = (inv.clients?.name || "").toLowerCase();
        const company = (inv.clients?.company_name || "").toLowerCase();
        return (
          num.includes(search) ||
          clientName.includes(search) ||
          company.includes(search)
        );
      });
    }

    // Financial Metrics calculation in integer paise
    const totalCount = records.length;
    let totalInvoicedPaise = 0;
    let totalPaidPaise = 0;
    let totalBalancePaise = 0;
    let totalOverduePaise = 0;

    const todayStr = new Date().toISOString().split("T")[0];

    for (const inv of records) {
      if (inv.status !== "cancelled" && inv.status !== "void") {
        totalInvoicedPaise += toPaise(Number(inv.total_amount) || 0);
        totalPaidPaise += toPaise(Number(inv.amount_paid) || 0);
        const bal = toPaise(Number(inv.balance_due) || 0);
        totalBalancePaise += bal;

        if (bal > 0 && inv.due_date < todayStr && inv.status !== "draft") {
          totalOverduePaise += bal;
        }
      }
    }

    return NextResponse.json({
      invoices: records,
      metrics: {
        total: totalCount,
        totalInvoiced: fromPaise(totalInvoicedPaise),
        totalPaid: fromPaise(totalPaidPaise),
        totalBalanceDue: fromPaise(totalBalancePaise),
        totalOverdue: fromPaise(totalOverduePaise),
        draftCount: records.filter((i: any) => i.status === "draft").length,
        issuedCount: records.filter((i: any) => i.status === "issued").length,
        partiallyPaidCount: records.filter((i: any) => i.status === "partially_paid").length,
        paidCount: records.filter((i: any) => i.status === "paid").length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json().catch(() => ({}));
    const parseResult = invoiceCreateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validData = parseResult.data;
    const supabase = getSupabaseServerClient();

    // Verify client exists
    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("id, name, company_name, email")
      .eq("id", validData.client_id)
      .single();

    if (clientErr || !client) {
      return NextResponse.json(
        { error: "Selected client does not exist." },
        { status: 400 }
      );
    }

    // Duplicate obligation check for proposal advance or milestone
    if (validData.proposal_id) {
      if (validData.invoice_type === "advance") {
        const { data: existingAdvance } = await supabase
          .from("invoices")
          .select("id, invoice_number, status")
          .eq("proposal_id", validData.proposal_id)
          .eq("invoice_type", "advance")
          .not("status", "in", "(cancelled,void)")
          .limit(1);

        if (existingAdvance && existingAdvance.length > 0) {
          return NextResponse.json(
            {
              error: `An active advance invoice (${existingAdvance[0].invoice_number}) already exists for this proposal.`,
            },
            { status: 409 }
          );
        }
      } else if (validData.milestone_id) {
        const { data: existingMilestone } = await supabase
          .from("invoices")
          .select("id, invoice_number, status")
          .eq("milestone_id", validData.milestone_id)
          .not("status", "in", "(cancelled,void)")
          .limit(1);

        if (existingMilestone && existingMilestone.length > 0) {
          return NextResponse.json(
            {
              error: `An active invoice (${existingMilestone[0].invoice_number}) already exists for this proposal milestone.`,
            },
            { status: 409 }
          );
        }
      }
    }

    // 3. Authoritative Integer Paise Pricing Calculations
    const pricing = calculateInvoicePricing({
      items: validData.items.map((i) => ({
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
      discount_type: validData.discount_type,
      discount_value: validData.discount_value,
      tax_rate: validData.tax_rate,
      amount_paid: 0,
    });

    // 4. Generate next invoice sequence number
    const invoiceNumber = await generateNextInvoiceNumber(supabase);

    // 5. Insert Invoice Parent Record
    const { data: newInvoice, error: invoiceInsertErr } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        client_id: validData.client_id,
        proposal_id: validData.proposal_id,
        milestone_id: validData.milestone_id,
        invoice_type: validData.invoice_type,
        status: "draft",
        currency: validData.currency,
        issue_date: validData.issue_date,
        due_date: validData.due_date,
        subtotal: pricing.subtotal,
        discount_type: validData.discount_type,
        discount_value: validData.discount_value,
        discount_amount: pricing.discount_amount,
        tax_rate: validData.tax_rate,
        tax_amount: pricing.tax_amount,
        total_amount: pricing.total_amount,
        amount_paid: 0.0,
        balance_due: pricing.total_amount,
        notes: validData.notes,
        payment_instructions: validData.payment_instructions,
        delivery_status: "draft",
        created_by: session.adminId || "Studio Admin",
      })
      .select()
      .single();

    if (invoiceInsertErr || !newInvoice) {
      return NextResponse.json(
        {
          error: invoiceInsertErr?.message.includes("does not exist")
            ? "Database migration 005 required: Run supabase/migrations/005_phase3d_invoices_payments.sql in the Supabase SQL Editor."
            : invoiceInsertErr?.message || "Failed to create invoice record",
        },
        { status: 500 }
      );
    }

    const invoiceId = newInvoice.id;

    // 6. Insert Line Items
    if (validData.items.length > 0) {
      const itemsPayload = validData.items.map((item, idx) => ({
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit || "units",
        unit_price: item.unit_price,
        total_price: pricing.line_item_totals[idx],
        sort_order: item.sort_order ?? idx,
      }));

      await supabase.from("invoice_items").insert(itemsPayload);
    }

    // 7. Record Activity Log
    await supabase.from("invoice_activity").insert({
      invoice_id: invoiceId,
      event_type: "created",
      actor: session.adminId || "Studio Admin",
      description: `Draft invoice ${invoiceNumber} created for ${client.name} (${client.company_name}).`,
      metadata: { total_amount: pricing.total_amount, currency: validData.currency },
    });

    return NextResponse.json({
      success: true,
      invoice_id: invoiceId,
      invoice_number: invoiceNumber,
      invoice: newInvoice,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

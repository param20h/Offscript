import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { validateOrigin } from "@/lib/security";

export async function POST(
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

    const [invoiceRes, itemsRes] = await Promise.all([
      supabase.from("invoices").select("*, clients(*)").eq("id", id).single(),
      supabase.from("invoice_items").select("*").eq("invoice_id", id).order("sort_order"),
    ]);

    if (invoiceRes.error || !invoiceRes.data) {
      return NextResponse.json(
        { error: invoiceRes.error?.message || "Invoice not found" },
        { status: 404 }
      );
    }

    const invoice = invoiceRes.data;
    const client = invoice.clients;

    if (invoice.status !== "draft") {
      return NextResponse.json(
        { error: `Invoice is already in status '${invoice.status}'.` },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    const snapshotData = {
      invoice_number: invoice.invoice_number,
      client: {
        id: client.id,
        name: client.name,
        company_name: client.company_name,
        email: client.email,
        address: client.address,
      },
      currency: invoice.currency,
      subtotal: invoice.subtotal,
      discount_amount: invoice.discount_amount,
      tax_rate: invoice.tax_rate,
      tax_amount: invoice.tax_amount,
      total_amount: invoice.total_amount,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      items: itemsRes.data || [],
      payment_instructions: invoice.payment_instructions,
      notes: invoice.notes,
      frozen_at: nowIso,
    };

    const { error: updateErr } = await supabase
      .from("invoices")
      .update({
        status: "issued",
        issued_at: nowIso,
        snapshot: snapshotData,
        updated_at: nowIso,
      } as any)
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    await supabase.from("invoice_activity").insert({
      invoice_id: id,
      event_type: "issued",
      actor: session.adminId || "Studio Admin",
      description: `Invoice ${invoice.invoice_number} officially issued to ${client.name}.`,
      metadata: { total_amount: invoice.total_amount, due_date: invoice.due_date },
    });

    return NextResponse.json({
      success: true,
      status: "issued",
      issued_at: nowIso,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

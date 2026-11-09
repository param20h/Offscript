import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { generateInvoicePDF } from "@/lib/invoices/pdf";
import { sendInvoiceToClient } from "@/lib/email/invoice";
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

    let customMessage: string | undefined;
    try {
      const body = await request.json();
      if (body && typeof body.custom_message === "string") {
        customMessage = body.custom_message.trim().slice(0, 2000);
      }
    } catch {
      // Body is optional
    }

    const supabase = getSupabaseServerClient();

    const [invoiceRes, itemsRes, paymentsRes] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, clients(*), proposals(proposal_number)")
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
        .order("payment_date", { ascending: true }),
    ]);

    if (invoiceRes.error || !invoiceRes.data) {
      return NextResponse.json(
        { error: invoiceRes.error?.message || "Invoice not found" },
        { status: 404 }
      );
    }

    const invoice = invoiceRes.data;
    const client = invoice.clients;

    if (!client || !client.email) {
      return NextResponse.json(
        { error: "Associated client record missing valid email destination" },
        { status: 400 }
      );
    }

    const items = itemsRes.data || [];
    const payments = paymentsRes.data || [];

    // 1. Generate PDF
    const pdfBuffer = generateInvoicePDF({
      invoice,
      client,
      items,
      payments,
      linkedProposalNumber: invoice.proposals?.proposal_number || null,
    });

    // 2. Dispatch via Resend
    const dispatchResult = await sendInvoiceToClient({
      invoice,
      client,
      pdfBuffer,
      customMessage,
    });

    if (!dispatchResult.success) {
      await supabase.from("invoice_activity").insert({
        invoice_id: id,
        event_type: "send_failed",
        actor: session.adminId || "Studio Admin",
        description: `Failed to dispatch invoice email to ${client.email}: ${dispatchResult.error}`,
        metadata: {
          error: dispatchResult.error,
          unconfigured: dispatchResult.unconfigured,
          attempted_to: client.email,
        },
      });

      return NextResponse.json(
        {
          error: dispatchResult.error || "Failed to dispatch invoice email",
          unconfigured: dispatchResult.unconfigured,
        },
        { status: dispatchResult.unconfigured ? 503 : 502 }
      );
    }

    // 3. Update Invoice State & Snapshot
    const nowIso = new Date().toISOString();
    const isNewIssue = invoice.status === "draft";
    const newStatus = isNewIssue ? "issued" : invoice.status;

    const snapshotData = invoice.snapshot || {
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
      items,
      payment_instructions: invoice.payment_instructions,
      notes: invoice.notes,
      frozen_at: nowIso,
    };

    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      sent_at: nowIso,
      delivery_status: "accepted_by_provider",
      resend_id: dispatchResult.messageId || null,
      snapshot: snapshotData,
      updated_at: nowIso,
    };

    if (isNewIssue) {
      updatePayload.issued_at = nowIso;
    }

    await supabase
      .from("invoices")
      .update(updatePayload as any)
      .eq("id", id);

    // 4. Record Activity Log
    await supabase.from("invoice_activity").insert({
      invoice_id: id,
      event_type: "emailed",
      actor: session.adminId || "Studio Admin",
      description: `Invoice ${invoice.invoice_number} dispatched to ${client.email} via Resend (Provider Accepted).`,
      metadata: {
        sent_to: client.email,
        resend_message_id: dispatchResult.messageId,
        custom_message_provided: Boolean(customMessage),
        delivery_status: "accepted_by_provider",
      },
    });

    return NextResponse.json({
      success: true,
      messageId: dispatchResult.messageId,
      sent_at: nowIso,
      delivery_status: "accepted_by_provider",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

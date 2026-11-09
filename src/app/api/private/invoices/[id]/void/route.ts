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

    let reason = "Voided by administrator";
    try {
      const body = await request.json();
      if (body?.reason && typeof body.reason === "string") {
        reason = body.reason.trim().slice(0, 500);
      }
    } catch {}

    const supabase = getSupabaseServerClient();

    const [invoiceRes, paymentsRes] = await Promise.all([
      supabase.from("invoices").select("*").eq("id", id).single(),
      supabase.from("payments").select("*").eq("invoice_id", id).eq("status", "recorded"),
    ]);

    if (invoiceRes.error || !invoiceRes.data) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const invoice = invoiceRes.data;
    const activePayments = paymentsRes.data || [];

    if (activePayments.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot void invoice ${invoice.invoice_number} because it has ${activePayments.length} active recorded payment(s). Reverse all payments before voiding.`,
        },
        { status: 400 }
      );
    }

    const targetStatus = invoice.status === "draft" ? "cancelled" : "void";
    const nowIso = new Date().toISOString();

    const { error: updateErr } = await supabase
      .from("invoices")
      .update({
        status: targetStatus,
        updated_at: nowIso,
      } as any)
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    await supabase.from("invoice_activity").insert({
      invoice_id: id,
      event_type: targetStatus === "void" ? "voided" : "cancelled",
      actor: session.adminId || "Studio Admin",
      description: `Invoice ${invoice.invoice_number} marked as ${targetStatus}. Reason: ${reason}`,
      metadata: { previous_status: invoice.status, reason },
    });

    return NextResponse.json({
      success: true,
      status: targetStatus,
      reason,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

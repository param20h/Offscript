import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { paymentReverseSchema } from "@/lib/validations/invoice";
import { calculatePaymentLedger, formatCurrency } from "@/lib/invoices/pricing";
import { validateOrigin } from "@/lib/security";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
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

    const { id, paymentId } = await params;
    if (!id || !paymentId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = paymentReverseSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { reversal_reason } = parseResult.data;
    const supabase = getSupabaseServerClient();

    // 1. Fetch payment and parent invoice
    const [paymentRes, invoiceRes] = await Promise.all([
      supabase.from("payments").select("*").eq("id", paymentId).eq("invoice_id", id).single(),
      supabase.from("invoices").select("*").eq("id", id).single(),
    ]);

    if (paymentRes.error || !paymentRes.data) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    if (invoiceRes.error || !invoiceRes.data) {
      return NextResponse.json({ error: "Invoice record not found" }, { status: 404 });
    }

    const payment = paymentRes.data;
    const invoice = invoiceRes.data;

    if (payment.status === "reversed") {
      return NextResponse.json(
        { error: "This payment has already been reversed." },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();

    // 2. Mark payment as reversed (Never delete history)
    const { data: reversedPayment, error: reverseErr } = await supabase
      .from("payments")
      .update({
        status: "reversed",
        reversal_reason,
        reversed_at: nowIso,
        reversed_by: session.adminId || "Studio Admin",
      } as any)
      .eq("id", paymentId)
      .select()
      .single();

    if (reverseErr) {
      return NextResponse.json({ error: reverseErr.message }, { status: 500 });
    }

    // 3. Fetch all payments to recalculate ledger
    const { data: allPayments } = await supabase
      .from("payments")
      .select("*")
      .eq("invoice_id", id);

    const newLedger = calculatePaymentLedger({
      totalAmount: invoice.total_amount,
      payments: allPayments || [],
    });

    // Derive updated invoice status
    let newStatus = invoice.status;
    let paidAt = invoice.paid_at;

    if (newLedger.balance_due === 0) {
      newStatus = "paid";
    } else if (newLedger.total_paid > 0) {
      newStatus = "partially_paid";
      paidAt = null;
    } else {
      newStatus = invoice.issued_at ? "issued" : "draft";
      paidAt = null;
    }

    await supabase
      .from("invoices")
      .update({
        amount_paid: newLedger.total_paid,
        balance_due: newLedger.balance_due,
        status: newStatus,
        paid_at: paidAt,
        updated_at: nowIso,
      } as any)
      .eq("id", id);

    // 4. Log audit activity
    await supabase.from("invoice_activity").insert({
      invoice_id: id,
      event_type: "payment_reversed",
      actor: session.adminId || "Studio Admin",
      description: `Payment of ${formatCurrency(payment.amount, payment.currency)} reversed. Reason: ${reversal_reason}`,
      metadata: {
        payment_id: paymentId,
        reversed_amount: payment.amount,
        reversal_reason,
        new_balance_due: newLedger.balance_due,
        new_status: newStatus,
      },
    });

    return NextResponse.json({
      success: true,
      reversed_payment: reversedPayment,
      invoice_status: newStatus,
      amount_paid: newLedger.total_paid,
      balance_due: newLedger.balance_due,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { paymentCreateSchema } from "@/lib/validations/invoice";
import { calculatePaymentLedger, formatCurrency, toPaise } from "@/lib/invoices/pricing";
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
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("invoice_id", id)
      .order("payment_date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ payments: payments || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
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

    const body = await request.json().catch(() => ({}));
    const parseResult = paymentCreateSchema.safeParse(body);

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

    // 3. Fetch invoice and existing payments
    const [invoiceRes, paymentsRes] = await Promise.all([
      supabase.from("invoices").select("*").eq("id", id).single(),
      supabase.from("payments").select("*").eq("invoice_id", id),
    ]);

    if (invoiceRes.error || !invoiceRes.data) {
      return NextResponse.json(
        { error: invoiceRes.error?.message || "Invoice not found" },
        { status: 404 }
      );
    }

    const invoice = invoiceRes.data;

    // Invoices must not be void or cancelled to record payments
    if (invoice.status === "cancelled" || invoice.status === "void") {
      return NextResponse.json(
        { error: `Cannot record payment against an invoice in status '${invoice.status}'.` },
        { status: 400 }
      );
    }

    // Currency check
    if (validData.currency !== invoice.currency) {
      return NextResponse.json(
        {
          error: `Payment currency (${validData.currency}) does not match invoice currency (${invoice.currency}).`,
        },
        { status: 400 }
      );
    }

    const existingPayments = paymentsRes.data || [];
    const currentLedger = calculatePaymentLedger({
      totalAmount: invoice.total_amount,
      payments: existingPayments,
    });

    const paymentAmountPaise = toPaise(validData.amount);

    // Prevent payment exceeding remaining balance
    if (paymentAmountPaise > currentLedger.balance_due_paise) {
      return NextResponse.json(
        {
          error: `Payment amount (${formatCurrency(validData.amount, invoice.currency)}) exceeds outstanding balance (${formatCurrency(currentLedger.balance_due, invoice.currency)}). Overpayment is not permitted.`,
        },
        { status: 400 }
      );
    }

    // 4. Insert payment record into ledger
    const { data: newPayment, error: paymentInsertErr } = await supabase
      .from("payments")
      .insert({
        invoice_id: id,
        client_id: invoice.client_id,
        amount: validData.amount,
        currency: validData.currency,
        payment_method: validData.payment_method,
        transaction_reference: validData.transaction_reference,
        payment_date: validData.payment_date,
        status: "recorded",
        notes: validData.notes,
        recorded_by: session.adminId || "Studio Admin",
      })
      .select()
      .single();

    if (paymentInsertErr || !newPayment) {
      return NextResponse.json(
        { error: paymentInsertErr?.message || "Failed to record payment" },
        { status: 500 }
      );
    }

    // 5. Recalculate ledger totals
    const updatedPayments = [...existingPayments, newPayment];
    const newLedger = calculatePaymentLedger({
      totalAmount: invoice.total_amount,
      payments: updatedPayments,
    });

    // Derive new invoice status
    const nowIso = new Date().toISOString();
    let newStatus = invoice.status;
    let paidAt = invoice.paid_at;

    if (newLedger.balance_due === 0) {
      newStatus = "paid";
      paidAt = nowIso;
    } else if (newLedger.total_paid > 0) {
      newStatus = "partially_paid";
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

    // 6. Record activity log
    await supabase.from("invoice_activity").insert({
      invoice_id: id,
      event_type: "payment_recorded",
      actor: session.adminId || "Studio Admin",
      description: `Payment of ${formatCurrency(validData.amount, invoice.currency)} recorded via ${validData.payment_method.toUpperCase().replace("_", " ")}.`,
      metadata: {
        payment_id: newPayment.id,
        amount: validData.amount,
        currency: validData.currency,
        transaction_reference: validData.transaction_reference,
        new_balance_due: newLedger.balance_due,
        new_status: newStatus,
      },
    });

    return NextResponse.json({
      success: true,
      payment: newPayment,
      invoice_status: newStatus,
      amount_paid: newLedger.total_paid,
      balance_due: newLedger.balance_due,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

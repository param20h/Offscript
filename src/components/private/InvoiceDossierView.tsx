"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  ExternalLink,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  Mail,
  Calendar,
  Layers,
  History,
  AlertCircle,
  PlusCircle,
  RotateCcw,
  Ban,
  FileCheck,
} from "lucide-react";
import { InvoiceDetailData } from "@/app/private/(portal)/invoices/[id]/page";
import { PaymentMethod } from "@/lib/db/supabase";
import { formatCurrency } from "@/lib/invoices/pricing";

export default function InvoiceDossierView({
  initialData,
}: {
  initialData: InvoiceDetailData;
}) {
  const [data, setData] = useState<InvoiceDetailData>(initialData);

  // Modals state
  const [showSendModal, setShowSendModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [reversingPaymentId, setReversingPaymentId] = useState<string | null>(null);
  const [showVoidModal, setShowVoidModal] = useState(false);

  // Form states
  const [customMessage, setCustomMessage] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<number>(initialData.invoice.balance_due);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [paymentNotes, setPaymentNotes] = useState("");

  const [reversalReason, setReversalReason] = useState("");
  const [voidReason, setVoidReason] = useState("");

  // Loading & alerts
  const [isSending, setIsSending] = useState(false);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [isReversing, setIsReversing] = useState(false);
  const [isVoiding, setIsVoiding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const { invoice, client, proposal, items, payments, activity } = data;

  const isPaid = invoice.status === "paid";
  const isVoid = invoice.status === "void" || invoice.status === "cancelled";

  // 1. Issue Invoice
  const handleIssueInvoice = async () => {
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/private/invoices/${invoice.id}/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to issue invoice");

      setData((prev) => ({
        ...prev,
        invoice: {
          ...prev.invoice,
          status: "issued",
          issued_at: resData.issued_at,
        },
        activity: [
          {
            id: `act-${Date.now()}`,
            invoice_id: invoice.id,
            event_type: "issued",
            actor: "Studio Admin",
            description: `Invoice ${invoice.invoice_number} officially issued.`,
            metadata: {},
            created_at: new Date().toISOString(),
          },
          ...prev.activity,
        ],
      }));

      setActionSuccess(`Invoice ${invoice.invoice_number} has been officially issued.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to issue invoice");
    }
  };

  // 2. Send Invoice via Resend
  const handleSendInvoice = async () => {
    setIsSending(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/private/invoices/${invoice.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custom_message: customMessage.trim() || undefined }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to dispatch invoice");

      setData((prev) => ({
        ...prev,
        invoice: {
          ...prev.invoice,
          status: prev.invoice.status === "draft" ? "issued" : prev.invoice.status,
          sent_at: resData.sent_at,
          delivery_status: "accepted_by_provider",
          resend_id: resData.messageId || null,
        },
        activity: [
          {
            id: `act-${Date.now()}`,
            invoice_id: invoice.id,
            event_type: "emailed",
            actor: "Studio Admin",
            description: `Invoice ${invoice.invoice_number} sent to ${client.email} via Resend.`,
            metadata: { message_id: resData.messageId },
            created_at: new Date().toISOString(),
          },
          ...prev.activity,
        ],
      }));

      setShowSendModal(false);
      setActionSuccess(`Invoice vector PDF sent to ${client.email} (Accepted by provider).`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Dispatch failed");
    } finally {
      setIsSending(false);
    }
  };

  // 3. Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      setActionError("Payment amount must be greater than zero.");
      return;
    }

    if (paymentAmount > invoice.balance_due) {
      setActionError(`Payment amount cannot exceed remaining balance of ${formatCurrency(invoice.balance_due, invoice.currency)}.`);
      return;
    }

    setIsRecordingPayment(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/private/invoices/${invoice.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentAmount,
          currency: invoice.currency,
          payment_method: paymentMethod,
          transaction_reference: paymentRef.trim() || null,
          payment_date: paymentDate,
          notes: paymentNotes.trim() || null,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to record payment");

      setData((prev) => ({
        ...prev,
        invoice: {
          ...prev.invoice,
          status: resData.invoice_status,
          amount_paid: resData.amount_paid,
          balance_due: resData.balance_due,
        },
        payments: [resData.payment, ...prev.payments],
        activity: [
          {
            id: `act-${Date.now()}`,
            invoice_id: invoice.id,
            event_type: "payment_recorded",
            actor: "Studio Admin",
            description: `Payment of ${formatCurrency(paymentAmount, invoice.currency)} recorded.`,
            metadata: { payment_id: resData.payment.id },
            created_at: new Date().toISOString(),
          },
          ...prev.activity,
        ],
      }));

      setShowPaymentModal(false);
      setPaymentRef("");
      setPaymentNotes("");
      setPaymentAmount(resData.balance_due);
      setActionSuccess(`Payment of ${formatCurrency(paymentAmount, invoice.currency)} recorded in ledger.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setIsRecordingPayment(false);
    }
  };

  // 4. Reverse Payment
  const handleReversePayment = async () => {
    if (!reversingPaymentId || !reversalReason.trim()) return;

    setIsReversing(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(
        `/api/private/invoices/${invoice.id}/payments/${reversingPaymentId}/reverse`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reversal_reason: reversalReason.trim() }),
        }
      );

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to reverse payment");

      setData((prev) => ({
        ...prev,
        invoice: {
          ...prev.invoice,
          status: resData.invoice_status,
          amount_paid: resData.amount_paid,
          balance_due: resData.balance_due,
        },
        payments: prev.payments.map((p) =>
          p.id === reversingPaymentId ? resData.reversed_payment : p
        ),
        activity: [
          {
            id: `act-${Date.now()}`,
            invoice_id: invoice.id,
            event_type: "payment_reversed",
            actor: "Studio Admin",
            description: `Payment reversed: ${reversalReason}`,
            metadata: { payment_id: reversingPaymentId },
            created_at: new Date().toISOString(),
          },
          ...prev.activity,
        ],
      }));

      setReversingPaymentId(null);
      setReversalReason("");
      setActionSuccess("Payment successfully reversed in ledger. Balances recalculated.");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reverse payment");
    } finally {
      setIsReversing(false);
    }
  };

  // 5. Void Invoice
  const handleVoidInvoice = async () => {
    setIsVoiding(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/private/invoices/${invoice.id}/void`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: voidReason.trim() || undefined }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to void invoice");

      setData((prev) => ({
        ...prev,
        invoice: {
          ...prev.invoice,
          status: resData.status,
        },
        activity: [
          {
            id: `act-${Date.now()}`,
            invoice_id: invoice.id,
            event_type: resData.status === "void" ? "voided" : "cancelled",
            actor: "Studio Admin",
            description: `Invoice marked as ${resData.status}: ${voidReason}`,
            metadata: {},
            created_at: new Date().toISOString(),
          },
          ...prev.activity,
        ],
      }));

      setShowVoidModal(false);
      setActionSuccess(`Invoice marked as ${resData.status}.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to void invoice");
    } finally {
      setIsVoiding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-sm flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {isVoid && (
        <div className="p-3 bg-white/5 border border-white/10 text-ivory/60 text-xs font-mono rounded-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ban className="w-4 h-4 text-red-400" />
            <span>This invoice has been voided / cancelled and is no longer an active commercial obligation.</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-bold">Void Record</span>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="bg-obsidian-light/60 border border-ivory/10 p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/private/invoices/${invoice.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-ivory/10 hover:border-ivory/30 text-ivory text-xs font-mono rounded-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View PDF</span>
          </a>

          <a
            href={`/api/private/invoices/${invoice.id}/pdf?download=true`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-ivory/10 hover:border-ivory/30 text-ivory text-xs font-mono rounded-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Vector PDF</span>
          </a>

          {!isVoid && (
            <>
              <button
                type="button"
                onClick={() => setShowSendModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-ivory/10 hover:border-acid/40 text-ivory hover:text-acid text-xs font-mono rounded-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{invoice.sent_at ? "Resend Invoice" : "Send to Client"}</span>
              </button>

              <button
                type="button"
                disabled={isPaid}
                onClick={() => {
                  setPaymentAmount(invoice.balance_due);
                  setShowPaymentModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            </>
          )}
        </div>

        {/* State actions */}
        <div className="flex items-center gap-2">
          {invoice.status === "draft" && (
            <button
              type="button"
              onClick={handleIssueInvoice}
              className="px-3 py-1.5 text-xs font-mono bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-sm transition-colors"
            >
              Issue Invoice
            </button>
          )}

          {!isVoid && !isPaid && (
            <button
              type="button"
              onClick={() => setShowVoidModal(true)}
              className="px-2.5 py-1 text-xs font-mono bg-white/5 hover:bg-white/10 border border-ivory/10 text-ivory/40 hover:text-red-400 rounded-sm transition-colors"
            >
              Void Invoice
            </button>
          )}
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-obsidian-light/40 border border-ivory/10 p-4 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
            Total Invoiced
          </div>
          <div className="text-xl font-mono font-bold text-ivory mt-1">
            {formatCurrency(invoice.total_amount, invoice.currency)}
          </div>
          <div className="text-[10px] font-mono text-ivory/40 mt-1">
            Subtotal: {formatCurrency(invoice.subtotal, invoice.currency)}
          </div>
        </div>

        <div className="bg-obsidian-light/40 border border-ivory/10 p-4 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
            Recorded Payments
          </div>
          <div className="text-xl font-mono font-bold text-acid mt-1">
            {formatCurrency(invoice.amount_paid, invoice.currency)}
          </div>
          <div className="text-[10px] font-mono text-acid/60 mt-1">
            {payments.filter((p) => p.status === "recorded").length} ledger transactions
          </div>
        </div>

        <div className="bg-obsidian-light/40 border border-ivory/10 p-4 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
            Balance Due
          </div>
          <div
            className={`text-xl font-mono font-bold mt-1 ${
              invoice.balance_due > 0 ? "text-amber-400" : "text-ivory/40"
            }`}
          >
            {formatCurrency(invoice.balance_due, invoice.currency)}
          </div>
          <div className="text-[10px] font-mono text-ivory/40 mt-1">
            Due date: {new Date(invoice.due_date).toLocaleDateString()}
          </div>
        </div>

        <div className="bg-obsidian-light/40 border border-ivory/10 p-4 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
            Payment Status
          </div>
          <div className="text-lg font-mono font-bold text-ivory mt-1 uppercase">
            {invoice.status.replace("_", " ")}
          </div>
          <div className="text-[10px] font-mono text-ivory/40 mt-1">
            {invoice.paid_at
              ? `Settled on ${new Date(invoice.paid_at).toLocaleDateString()}`
              : "Awaiting settlement"}
          </div>
        </div>
      </div>

      {/* Account & Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client Account Card */}
        <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-acid flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            <span>Client Billing Profile</span>
          </div>

          <div>
            <Link
              href={`/private/clients/${client.id}`}
              className="text-base font-semibold text-ivory hover:text-acid transition-colors flex items-center gap-1"
            >
              <span>{client.name}</span>
              <ExternalLink className="w-3 h-3 text-ivory/40" />
            </Link>
            {client.company_name && (
              <div className="text-xs font-mono text-ivory/60 mt-0.5">{client.company_name}</div>
            )}
            <div className="text-xs font-mono text-ivory/40 mt-1 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{client.email}</span>
            </div>
          </div>

          {proposal && (
            <div className="pt-2 border-t border-ivory/10 text-xs font-mono">
              <span className="text-ivory/40">Linked Proposal:</span>{" "}
              <Link
                href={`/private/proposals/${proposal.id}`}
                className="text-acid hover:underline font-bold"
              >
                {proposal.proposal_number}
              </Link>
            </div>
          )}
        </div>

        {/* Invoice Statement Metadata Card */}
        <div className="md:col-span-2 bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-acid">
            Commercial Snapshot & Remittance
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs font-mono">
            <div>
              <span className="text-ivory/40 block text-[10px]">Issue Date</span>
              <span className="text-ivory font-semibold">
                {new Date(invoice.issue_date).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="text-ivory/40 block text-[10px]">Due Date</span>
              <span className="text-ivory font-semibold">
                {new Date(invoice.due_date).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="text-ivory/40 block text-[10px]">Dispatched At</span>
              <span className="text-ivory font-semibold">
                {invoice.sent_at ? new Date(invoice.sent_at).toLocaleDateString() : "Not Emailed"}
              </span>
            </div>

            <div>
              <span className="text-ivory/40 block text-[10px]">Delivery State</span>
              <span className="text-acid font-semibold uppercase text-[10px]">
                {invoice.delivery_status}
              </span>
            </div>
          </div>

          {invoice.payment_instructions && (
            <div className="pt-3 border-t border-ivory/10 text-xs font-mono text-ivory/70">
              <span className="text-[10px] text-ivory/40 block uppercase">Remittance Note:</span>
              <span>{invoice.payment_instructions}</span>
            </div>
          )}
        </div>
      </div>

      {/* Statement of Charges Table */}
      <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          <span>Statement of Charges</span>
        </div>

        <div className="border border-ivory/10 rounded-sm overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-obsidian-light/60 border-b border-ivory/10 text-ivory/40 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3 text-left">Unit</th>
                <th className="p-3 text-right">Rate</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory/10">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="p-3 text-ivory font-medium">{item.description}</td>
                  <td className="p-3 text-right text-ivory/70">{item.quantity}</td>
                  <td className="p-3 text-left text-ivory/50">{item.unit}</td>
                  <td className="p-3 text-right text-ivory/70">
                    {formatCurrency(item.unit_price, invoice.currency)}
                  </td>
                  <td className="p-3 text-right font-bold text-ivory">
                    {formatCurrency(item.total_price, invoice.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Ledger Table */}
      <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Payment Ledger & Settlement History</span>
          </div>
          {!isVoid && !isPaid && (
            <button
              type="button"
              onClick={() => {
                setPaymentAmount(invoice.balance_due);
                setShowPaymentModal(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-white/5 border border-ivory/10 hover:border-acid/40 text-ivory rounded-sm"
            >
              <PlusCircle className="w-3 h-3" />
              <span>Record Payment</span>
            </button>
          )}
        </div>

        {payments.length === 0 ? (
          <div className="text-xs font-mono text-ivory/40 p-6 border border-dashed border-ivory/10 rounded-sm text-center">
            No payments recorded against this invoice yet.
          </div>
        ) : (
          <div className="border border-ivory/10 rounded-sm overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-obsidian-light/60 border-b border-ivory/10 text-ivory/40 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Transaction Reference</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory/10">
                {payments.map((p) => {
                  const isReversed = p.status === "reversed";
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-white/[0.02] ${isReversed ? "opacity-50" : ""}`}
                    >
                      <td className="p-3 text-ivory">
                        {new Date(p.payment_date).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-ivory/70 uppercase text-[11px]">
                        {p.payment_method.replace("_", " ")}
                      </td>
                      <td className="p-3 text-ivory/60">
                        {p.transaction_reference || "—"}
                      </td>
                      <td className="p-3 text-right font-bold text-acid">
                        {formatCurrency(p.amount, p.currency)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] uppercase px-1.5 py-0.5 rounded-xs border ${
                            isReversed
                              ? "bg-red-500/10 border-red-500/20 text-red-400"
                              : "bg-acid/10 border-acid/20 text-acid"
                          }`}
                        >
                          {p.status}
                        </span>
                        {p.reversal_reason && (
                          <div className="text-[10px] text-red-400/70 mt-0.5">
                            Reason: {p.reversal_reason}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {!isReversed && (
                          <button
                            type="button"
                            onClick={() => {
                              setReversingPaymentId(p.id);
                              setReversalReason("");
                            }}
                            className="inline-flex items-center gap-1 text-[11px] text-ivory/40 hover:text-red-400 transition-colors"
                            title="Reverse payment in ledger"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reverse</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit Activity Log */}
      <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-ivory/60 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          <span>Invoice Audit Trail & Ledger Events</span>
        </div>

        {activity.length === 0 ? (
          <div className="text-xs font-mono text-ivory/40 py-2">No activity recorded yet.</div>
        ) : (
          <div className="space-y-2">
            {activity.map((act) => (
              <div
                key={act.id}
                className="p-2.5 bg-obsidian/50 border border-ivory/5 rounded-sm flex items-start justify-between text-xs font-mono"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-ivory uppercase tracking-wider text-[10px] px-1.5 py-0.5 bg-white/5 rounded-xs mr-2">
                    {act.event_type}
                  </span>
                  <span className="text-ivory/70">{act.description}</span>
                </div>
                <span className="text-[10px] text-ivory/40 shrink-0 ml-3">
                  {new Date(act.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-obsidian border border-ivory/20 rounded-sm max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
              <h3 className="font-display text-lg font-bold text-ivory flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-acid" />
                <span>Record Ledger Payment</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="text-ivory/40 hover:text-ivory"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs font-mono">
              <div className="bg-obsidian-light/50 p-3 rounded-sm border border-ivory/10 text-ivory/70 flex justify-between">
                <span>Remaining Balance Due:</span>
                <span className="font-bold text-acid">
                  {formatCurrency(invoice.balance_due, invoice.currency)}
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-ivory/60 mb-1">
                  Payment Amount ({invoice.currency}) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  max={invoice.balance_due}
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-obsidian-light border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-ivory/60 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-obsidian-light border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
                  >
                    <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="upi">UPI</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-ivory/60 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-obsidian-light border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-ivory/60 mb-1">
                  Transaction / UTR Reference
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. UTR1283918239 or UPI Ref"
                  className="w-full px-3 py-2 bg-obsidian-light border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-ivory/60 mb-1">
                  Internal Notes (Optional)
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Verified via ICICI statement"
                  className="w-full px-3 py-2 bg-obsidian-light border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-ivory/10">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 text-xs text-ivory/60 hover:text-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingPayment || paymentAmount <= 0}
                  className="px-4 py-2 bg-acid text-obsidian font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 transition-colors disabled:opacity-40"
                >
                  {isRecordingPayment ? "Recording..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reverse Payment Modal */}
      {reversingPaymentId && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-obsidian border border-red-500/30 rounded-sm max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
              <h3 className="font-display text-base font-bold text-red-400 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span>Reverse Ledger Payment</span>
              </h3>
              <button
                type="button"
                onClick={() => setReversingPaymentId(null)}
                className="text-ivory/40 hover:text-ivory"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-mono text-ivory/70 leading-relaxed">
              Reversing this payment will restore the invoice balance due. The original payment transaction will remain in the audit ledger with a reversed status.
            </p>

            <div>
              <label className="block text-[11px] font-mono text-ivory/60 mb-1">
                Reason for Reversal *
              </label>
              <textarea
                rows={3}
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="e.g. Bank chargeback, payment bounced, or administrative typo..."
                className="w-full p-2.5 text-xs font-mono bg-obsidian-light border border-ivory/20 text-ivory rounded-sm focus:border-red-400 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-ivory/10">
              <button
                type="button"
                onClick={() => setReversingPaymentId(null)}
                className="px-3 py-1.5 text-xs font-mono text-ivory/60 hover:text-ivory"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isReversing || !reversalReason.trim()}
                onClick={handleReversePayment}
                className="px-4 py-2 bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-red-600 transition-colors disabled:opacity-40"
              >
                {isReversing ? "Reversing..." : "Confirm Reversal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Invoice Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-obsidian border border-ivory/20 rounded-sm max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
              <h3 className="font-display text-lg font-bold text-ivory flex items-center gap-2">
                <Send className="w-4 h-4 text-acid" />
                <span>Dispatch Invoice to Client</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSendModal(false)}
                className="text-ivory/40 hover:text-ivory"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-obsidian-light/60 p-3 rounded-sm border border-ivory/10 space-y-1">
                <div className="flex justify-between">
                  <span className="text-ivory/40">From:</span>
                  <span className="text-ivory">OFFSCRIPT Studio &lt;inquiries@offscript.param20h.me&gt;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory/40">To:</span>
                  <span className="text-acid font-bold">{client.name} &lt;{client.email}&gt;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory/40">Attachment:</span>
                  <span className="text-ivory">{invoice.invoice_number}.pdf</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-ivory/60 mb-1">
                  Personal Cover Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g. Hi Alex, attached is the commercial invoice for the recent milestone deployment..."
                  className="w-full p-2.5 text-xs font-mono bg-obsidian-light border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
                />
              </div>

              <div className="text-[11px] text-ivory/40">
                Resend transactional email will be dispatched. Status will be marked as &quot;accepted_by_provider&quot; and an immutable snapshot will be recorded.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-ivory/10">
              <button
                type="button"
                disabled={isSending}
                onClick={() => setShowSendModal(false)}
                className="px-3 py-1.5 text-xs font-mono text-ivory/60 hover:text-ivory"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSending}
                onClick={handleSendInvoice}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? "Sending via Resend..." : "Confirm & Send"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-obsidian border border-ivory/20 rounded-sm max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
              <h3 className="font-display text-base font-bold text-ivory flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-400" />
                <span>Void Invoice {invoice.invoice_number}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowVoidModal(false)}
                className="text-ivory/40 hover:text-ivory"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-mono text-ivory/70 leading-relaxed">
              Voiding an invoice marks it as invalid and nullifies the balance due. Active payments must be reversed before an invoice can be voided.
            </p>

            <div>
              <label className="block text-[11px] font-mono text-ivory/60 mb-1">
                Reason for Voiding (Optional)
              </label>
              <textarea
                rows={3}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Scope was rescoped under a new invoice..."
                className="w-full p-2.5 text-xs font-mono bg-obsidian-light border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-ivory/10">
              <button
                type="button"
                onClick={() => setShowVoidModal(false)}
                className="px-3 py-1.5 text-xs font-mono text-ivory/60 hover:text-ivory"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isVoiding}
                onClick={handleVoidInvoice}
                className="px-4 py-2 bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-sm hover:bg-red-600 transition-colors disabled:opacity-40"
              >
                {isVoiding ? "Voiding..." : "Confirm Void"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

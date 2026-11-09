"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  DollarSign,
  Building,
  Save,
  AlertCircle,
  FileSpreadsheet,
  Info,
} from "lucide-react";
import { ClientRecord } from "@/lib/db/supabase";
import { ProposalWithMilestones } from "@/app/private/(portal)/invoices/new/page";
import { calculateInvoicePricing, formatCurrency } from "@/lib/invoices/pricing";

interface LineItemForm {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

const DEFAULT_PAYMENT_INSTRUCTIONS =
  "Please remit payment via NEFT/RTGS bank transfer or UPI within the due date specified. Reference invoice number in transaction description.";

export default function InvoiceEditorView({
  clients,
  proposals,
  preselectedClientId,
  preselectedProposalId,
  preselectedMilestoneId,
  preselectedType,
}: {
  clients: ClientRecord[];
  proposals: ProposalWithMilestones[];
  preselectedClientId?: string;
  preselectedProposalId?: string;
  preselectedMilestoneId?: string;
  preselectedType?: string;
}) {
  const router = useRouter();

  // Selected client & proposal context
  const [clientId, setClientId] = useState<string>(
    preselectedClientId || clients[0]?.id || ""
  );
  const [proposalId, setProposalId] = useState<string>(preselectedProposalId || "");
  const [milestoneId, setMilestoneId] = useState<string>(preselectedMilestoneId || "");
  const [invoiceType, setInvoiceType] = useState<string>(
    preselectedType || "custom"
  );

  // Currency & Dates
  const [currency, setCurrency] = useState("INR");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });

  // Financial adjustments
  const [discountType, setDiscountType] = useState<"none" | "percentage" | "fixed">("none");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [enableTax, setEnableTax] = useState<boolean>(false);
  const [taxRate, setTaxRate] = useState<number>(18);

  // Notes & Instructions
  const [paymentInstructions, setPaymentInstructions] = useState(DEFAULT_PAYMENT_INSTRUCTIONS);
  const [notes, setNotes] = useState("");

  // Line items
  const [items, setItems] = useState<LineItemForm[]>([
    {
      id: "item-1",
      description: "Digital Engineering & Full-Stack Application Architecture",
      quantity: 1,
      unit: "services",
      unit_price: 50000,
    },
  ]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter proposals relevant to the selected client
  const clientProposals = useMemo(() => {
    return proposals.filter((p) => p.client_id === clientId);
  }, [proposals, clientId]);

  const selectedProposal = useMemo(() => {
    return proposals.find((p) => p.id === proposalId);
  }, [proposals, proposalId]);

  // When proposal or invoice type changes, pre-populate line items if advance or milestone
  useEffect(() => {
    if (!selectedProposal) return;

    if (invoiceType === "advance") {
      setCurrency(selectedProposal.currency);
      setItems([
        {
          id: `item-${Date.now()}`,
          description: `Advance Deposit (${selectedProposal.advance_percentage}%) for Proposal ${selectedProposal.proposal_number}: ${selectedProposal.title}`,
          quantity: 1,
          unit: "deposit",
          unit_price: selectedProposal.advance_amount,
        },
      ]);
    } else if (invoiceType === "milestone" && milestoneId) {
      const milestone = selectedProposal.proposal_milestones?.find(
        (m) => m.id === milestoneId
      );
      if (milestone) {
        setCurrency(selectedProposal.currency);
        setItems([
          {
            id: `item-${Date.now()}`,
            description: `Milestone Payment: ${milestone.title} (${selectedProposal.proposal_number}) — ${milestone.description || ""}`,
            quantity: 1,
            unit: "milestone",
            unit_price: milestone.amount,
          },
        ]);
      }
    }
  }, [selectedProposal, invoiceType, milestoneId]);

  // Authoritative integer paise pricing engine
  const pricing = useMemo(() => {
    return calculateInvoicePricing({
      items: items.map((i) => ({ quantity: i.quantity, unit_price: i.unit_price })),
      discount_type: discountType,
      discount_value: discountValue,
      tax_rate: enableTax ? taxRate : null,
      amount_paid: 0,
    });
  }, [items, discountType, discountValue, enableTax, taxRate]);

  // Handlers for items
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: "",
        quantity: 1,
        unit: "units",
        unit_price: 10000,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, updates: Partial<LineItemForm>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  };

  // Submit handler
  const handleSave = async (shouldIssueImmediately = false) => {
    if (!clientId) {
      setError("Please select a target client account.");
      return;
    }

    if (!dueDate) {
      setError("Please specify a payment due date.");
      return;
    }

    if (items.some((i) => !i.description.trim())) {
      setError("All line items must contain a description.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        client_id: clientId,
        proposal_id: proposalId || null,
        milestone_id: milestoneId || null,
        invoice_type: invoiceType,
        currency,
        issue_date: issueDate,
        due_date: dueDate,
        discount_type: discountType,
        discount_value: discountValue,
        tax_rate: enableTax ? taxRate : null,
        notes: notes.trim() || null,
        payment_instructions: paymentInstructions.trim() || null,
        items: items.map((i, idx) => ({
          description: i.description.trim(),
          quantity: Number(i.quantity) || 1,
          unit: i.unit.trim() || "units",
          unit_price: Number(i.unit_price) || 0,
          sort_order: idx,
        })),
      };

      const res = await fetch("/api/private/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create invoice");
      }

      const invoiceId = data.invoice_id || data.invoice?.id;

      if (shouldIssueImmediately && invoiceId) {
        await fetch(`/api/private/invoices/${invoiceId}/issue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      }

      router.push(`/private/invoices/${invoiceId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Creation failed";
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Account & Proposal Linkage */}
      <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-2">
          <Building className="w-4 h-4" />
          <span>1. Client Account & Commercial Context</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-ivory/60 mb-1">
              Billed Client Account *
            </label>
            {clients.length === 0 ? (
              <div className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-sm">
                No clients found.{" "}
                <Link href="/private/clients" className="underline font-bold">
                  Create a client first
                </Link>
              </div>
            ) : (
              <select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setProposalId("");
                  setMilestoneId("");
                }}
                className="w-full px-3 py-2 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company_name ? `(${c.company_name})` : ""} — {c.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ivory/60 mb-1">
              Linked Proposal (Optional)
            </label>
            <select
              value={proposalId}
              onChange={(e) => {
                setProposalId(e.target.value);
                setMilestoneId("");
              }}
              className="w-full px-3 py-2 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
            >
              <option value="">No Proposal Linkage (Custom Invoice)</option>
              {clientProposals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.proposal_number} — {p.title} ({p.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ivory/60 mb-1">
              Invoice Obligation Type
            </label>
            <select
              value={invoiceType}
              onChange={(e) => setInvoiceType(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
            >
              <option value="custom">Custom Billing Statement</option>
              <option value="advance">Advance Project Retainer</option>
              <option value="milestone">Milestone Progress Invoice</option>
              <option value="final">Final Project Settlement</option>
            </select>
          </div>
        </div>

        {/* Milestone Selector if Proposal + Milestone type selected */}
        {selectedProposal && invoiceType === "milestone" && (
          <div className="pt-2 border-t border-ivory/5">
            <label className="block text-[11px] font-mono text-acid mb-1">
              Select Proposal Milestone *
            </label>
            <select
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              className="w-full md:w-1/2 px-3 py-2 text-xs font-mono bg-obsidian border border-acid/40 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
            >
              <option value="">Choose milestone from agreed schedule...</option>
              {selectedProposal.proposal_milestones?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} — {formatCurrency(m.amount, selectedProposal.currency)} ({m.percentage}%)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Commercial Terms & Calendar */}
      <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          <span>2. Billing Currency & Calendar Terms</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-ivory/60 mb-1">
              Billing Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
            >
              <option value="INR">INR (₹) — Indian Rupee</option>
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="GBP">GBP (£) — British Pound</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ivory/60 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ivory/60 mb-1">
              Payment Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 3. Statement of Charges & Line Items */}
      <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            <span>3. Itemized Statement of Charges</span>
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-white/5 border border-ivory/10 hover:border-acid/40 text-ivory rounded-sm"
          >
            <Plus className="w-3 h-3" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const itemTotal = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
            return (
              <div
                key={item.id}
                className="p-3 bg-obsidian/70 border border-ivory/10 rounded-sm grid grid-cols-1 md:grid-cols-12 gap-3 items-start"
              >
                <div className="md:col-span-6 space-y-1">
                  <label className="block text-[10px] font-mono text-ivory/40">
                    Description #{idx + 1}
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    placeholder="Engineering deliverable or service description..."
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono text-ivory/40">
                    Qty & Unit
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0.1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                      className="w-16 px-2 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm focus:border-acid focus:outline-hidden text-right"
                    />
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                      placeholder="units"
                      className="w-full px-2 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono text-ivory/40">
                    Rate ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={item.unit_price}
                    onChange={(e) => updateItem(item.id, { unit_price: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm focus:border-acid focus:outline-hidden text-right"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-[10px] font-mono text-ivory/40">
                    Total
                  </label>
                  <div className="py-1.5 text-xs font-mono text-ivory font-bold truncate">
                    {formatCurrency(itemTotal, currency)}
                  </div>
                </div>

                <div className="md:col-span-1 pt-5 text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    className="text-ivory/30 hover:text-red-400 disabled:opacity-20 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Adjustments: Discount & Tax */}
        <div className="pt-4 border-t border-ivory/10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-obsidian/60 p-3 rounded-sm border border-ivory/5 space-y-2">
            <div className="text-[11px] font-mono text-ivory/60">Commercial Discount</div>
            <div className="flex items-center gap-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm"
              >
                <option value="none">No Discount</option>
                <option value="fixed">Fixed ({currency})</option>
                <option value="percentage">Percentage (%)</option>
              </select>
              {discountType !== "none" && (
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                  placeholder="Value"
                  className="w-32 px-2.5 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm text-right"
                />
              )}
            </div>
          </div>

          <div className="bg-obsidian/60 p-3 rounded-sm border border-ivory/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-ivory/60">Tax / GST Configuration</span>
              <label className="flex items-center gap-1.5 text-xs font-mono text-ivory/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableTax}
                  onChange={(e) => setEnableTax(e.target.checked)}
                  className="rounded border-ivory/20 accent-acid"
                />
                <span>Include Tax</span>
              </label>
            </div>
            {enableTax && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                  className="w-24 px-2.5 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm text-right"
                />
                <span className="text-xs font-mono text-ivory/50">% (Optional tax rate)</span>
              </div>
            )}
            <div className="text-[10px] font-mono text-ivory/30 flex items-center gap-1">
              <Info className="w-3 h-3 shrink-0" />
              <span>Statutory registration is configurable. Tax is never assumed without owner approval.</span>
            </div>
          </div>
        </div>

        {/* Pricing Summary Box */}
        <div className="bg-obsidian border border-ivory/15 p-4 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/40">
              Commercial Engine Totals (Integer Paise Calculated)
            </div>
            <div className="text-xs font-mono text-ivory/60">
              Subtotal: {formatCurrency(pricing.subtotal, currency)} | Discount: -{formatCurrency(pricing.discount_amount, currency)} | Tax: +{formatCurrency(pricing.tax_amount, currency)}
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xl font-mono font-bold text-acid">
              {formatCurrency(pricing.total_amount, currency)}
            </div>
            <div className="text-[11px] font-mono text-ivory/70">
              Balance Due: <span className="font-bold text-ivory">{formatCurrency(pricing.balance_due, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Payment Remittance Instructions & Notes */}
      <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-acid">
          4. Remittance Instructions & Internal Notes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-ivory/60 mb-1">
              Payment Remittance Instructions (Printed on PDF)
            </label>
            <textarea
              rows={3}
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              className="w-full p-2.5 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ivory/60 mb-1">
              Internal Statement Notes (Private to Studio)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Approved via Slack by client founder..."
              className="w-full p-2.5 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-t border-ivory/10 pt-5 flex items-center justify-between gap-4">
        <div className="text-xs font-mono text-ivory/40">
          Invoices are sequentially numbered upon creation (e.g. OFF-INV-2026-001).
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
            className="px-4 py-2 border border-ivory/20 bg-white/5 hover:bg-white/10 text-ivory text-xs font-mono uppercase tracking-wider rounded-sm transition-colors disabled:opacity-40"
          >
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
            className="inline-flex items-center gap-2 px-5 py-2 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 transition-colors disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Creating..." : "Save & Issue Immediately"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

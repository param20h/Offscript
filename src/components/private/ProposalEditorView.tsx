"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Layers,
  FileCheck,
  Building,
  Save,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { ClientRecord } from "@/lib/db/supabase";
import { calculateProposalPricing, formatCurrency } from "@/lib/proposals/pricing";

interface LineItemForm {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
}

interface DeliverableForm {
  id: string;
  title: string;
  description: string;
  estimated_timeline: string;
}

interface MilestoneForm {
  id: string;
  title: string;
  description: string;
  percentage: number;
  trigger_condition: string;
}

const DEFAULT_TERMS = `1. ENGAGEMENT & SCOPE
OFFSCRIPT Studio will execute the deliverables specified in this scope proposal. Any alterations, additions, or bespoke features beyond this specification will be scoped and billed separately.

2. COMMERCIAL TERMS & ADVANCE
Work commences upon receipt of the advance payment specified herein. Milestones are invoiced per schedule and payable within 7 business days.

3. INTELLECTUAL PROPERTY
Full intellectual property rights for custom code and project deliverables transfer to the client upon receipt of final settlement payment. Third-party libraries retain their respective open-source licenses.

4. REVISIONS & USER ACCEPTANCE
Each milestone phase includes two rounds of focused revisions within scope. Acceptance is deemed granted 5 business days after milestone staging delivery unless written objections are submitted.

5. HOSTING & THIRD-PARTY PROVIDERS
Client provides direct accounts for third-party cloud infrastructure (Vercel, Supabase, domain registrars, AI model providers). Production hosting charges remain client responsibility.`;

export default function ProposalEditorView({
  clients,
  preselectedClientId,
  preselectedInquiryId,
}: {
  clients: ClientRecord[];
  preselectedClientId?: string;
  preselectedInquiryId?: string;
}) {
  const router = useRouter();

  // Basic Details
  const [clientId, setClientId] = useState<string>(preselectedClientId || (clients[0]?.id || ""));
  const [inquiryId] = useState<string | undefined>(preselectedInquiryId);
  const [title, setTitle] = useState("Full-Stack Web Application & Cloud Architecture");
  const [summary, setSummary] = useState(
    "Architecture, responsive frontend engineering, secure API routes, database schema modeling, and production deployment on Vercel."
  );
  const [currency, setCurrency] = useState("INR");
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });

  // Financials
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [advancePercentage, setAdvancePercentage] = useState<number>(50);

  // Line Items
  const [items, setItems] = useState<LineItemForm[]>([
    {
      id: "item-1",
      title: "Core Architecture & Next.js Foundation",
      description: "App router setup, design tokens, responsive typography, and navigation framework.",
      quantity: 1,
      unit_price: 65000,
    },
    {
      id: "item-2",
      title: "Database Modeling & API Route Development",
      description: "PostgreSQL schema, migrations, server-side validation with Zod, and rate-limiting.",
      quantity: 1,
      unit_price: 55000,
    },
    {
      id: "item-3",
      title: "Production Infrastructure & Vercel Deployment",
      description: "Custom domain configuration, security headers, transactional email, and analytics.",
      quantity: 1,
      unit_price: 30000,
    },
  ]);

  // Deliverables
  const [deliverables, setDeliverables] = useState<DeliverableForm[]>([
    {
      id: "deliv-1",
      title: "Production Next.js Application",
      description: "Responsive, accessible web application meeting WCAG AA standards.",
      estimated_timeline: "Sprint 1-2 (Weeks 1-2)",
    },
    {
      id: "deliv-2",
      title: "Database Schema & API Layer",
      description: "Supabase PostgreSQL migrations and server-side route handlers.",
      estimated_timeline: "Sprint 2-3 (Weeks 2-3)",
    },
    {
      id: "deliv-3",
      title: "Deployment & Production Verification",
      description: "Live Vercel staging and production release with verified DNS and email.",
      estimated_timeline: "Sprint 4 (Week 4)",
    },
  ]);

  // Milestones
  const [milestones, setMilestones] = useState<MilestoneForm[]>([
    {
      id: "mile-1",
      title: "Contract Initiation & Kickoff",
      description: "Project mobilization and architecture specifications.",
      percentage: 50,
      trigger_condition: "Upon proposal acceptance & deposit invoice clearance",
    },
    {
      id: "mile-2",
      title: "Staging Release & Acceptance Review",
      description: "Functional MVP review on private preview environment.",
      percentage: 30,
      trigger_condition: "Upon staging environment deployment",
    },
    {
      id: "mile-3",
      title: "Production Release & Final Handover",
      description: "Domain cutover, documentation handover, and code repository transfer.",
      percentage: 20,
      trigger_condition: "Upon production release and acceptance sign-off",
    },
  ]);

  // Terms
  const [terms, setTerms] = useState(DEFAULT_TERMS);

  // Status & submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live pricing calculation
  const pricing = useMemo(() => {
    return calculateProposalPricing({
      items: items.map((i) => ({ quantity: i.quantity, unit_price: i.unit_price })),
      discount_type: discountAmount > 0 ? "fixed" : "none",
      discount_value: discountAmount,
      advance_percentage: advancePercentage,
    });
  }, [items, discountAmount, advancePercentage]);

  // Milestone validation
  const milestoneTotalPercentage = useMemo(() => {
    return milestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);
  }, [milestones]);

  const isMilestonesValid = Math.abs(milestoneTotalPercentage - 100) < 0.001;

  // Handlers for Items
  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        title: "",
        description: "",
        quantity: 1,
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

  // Handlers for Deliverables
  const addDeliverable = () => {
    setDeliverables((prev) => [
      ...prev,
      {
        id: `deliv-${Date.now()}`,
        title: "",
        description: "",
        estimated_timeline: "Sprint 1",
      },
    ]);
  };

  const removeDeliverable = (id: string) => {
    if (deliverables.length <= 1) return;
    setDeliverables((prev) => prev.filter((d) => d.id !== id));
  };

  const updateDeliverable = (id: string, updates: Partial<DeliverableForm>) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  // Handlers for Milestones
  const addMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      {
        id: `mile-${Date.now()}`,
        title: "",
        description: "",
        percentage: 0,
        trigger_condition: "Upon milestone milestone completion",
      },
    ]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length <= 1) return;
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMilestone = (id: string, updates: Partial<MilestoneForm>) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  // Submission handler
  const handleSave = async (targetStatus: "draft" | "ready") => {
    if (!clientId) {
      setError("Please select or assign a client for this proposal.");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a proposal title.");
      return;
    }

    if (items.some((i) => !i.title.trim())) {
      setError("All line items must have a title.");
      return;
    }

    if (!isMilestonesValid) {
      setError(`Milestone percentages must sum to 100% (currently ${milestoneTotalPercentage}%).`);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        client_id: clientId,
        inquiry_id: inquiryId || null,
        title: title.trim(),
        executive_summary: summary.trim() || null,
        currency,
        discount_type: discountAmount > 0 ? "fixed" : "none",
        discount_value: discountAmount,
        advance_percentage: advancePercentage,
        valid_until: validUntil,
        terms_and_conditions: terms,
        items: items.map((i, idx) => ({
          title: i.title.trim(),
          description: i.description.trim() || null,
          quantity: Number(i.quantity) || 1,
          unit: "units",
          unit_price: Number(i.unit_price) || 0,
          sort_order: idx,
        })),
        deliverables: deliverables.map((d, idx) => ({
          title: d.title.trim(),
          description: d.description.trim() || null,
          acceptance_criteria: d.estimated_timeline.trim() || null,
          sort_order: idx,
        })),
        milestones: milestones.map((m, idx) => {
          const pct = Number(m.percentage) || 0;
          const amt = (pricing.total_amount * pct) / 100;
          return {
            title: m.title.trim(),
            description: m.description.trim() || null,
            percentage: pct,
            amount: amt,
            due_description: m.trigger_condition.trim() || null,
            sort_order: idx,
          };
        }),
      };

      const res = await fetch("/api/private/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create proposal");
      }

      router.push(`/private/proposals/${data.proposal.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed";
      setError(message);
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

      {/* Client & Core Metadata */}
      <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-2">
          <Building className="w-4 h-4" />
          <span>1. Client & Document Baseline</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-ivory/60 mb-1">
              Client Account *
            </label>
            {clients.length === 0 ? (
              <div className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-sm">
                No clients found in CRM.{" "}
                <Link href="/private/clients" className="underline font-bold">
                  Create a client first
                </Link>
              </div>
            ) : (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
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
              Currency
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
              Validity Expiration
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-2">
          <div>
            <label className="block text-[11px] font-mono text-ivory/60 mb-1">
              Proposal Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next-Gen Cloud Platform & AI Automation"
              className="w-full px-3 py-2 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ivory/60 mb-1">
              Executive Summary & Scope Synopsis
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Concise overview of engineering objectives and architectural scope..."
              className="w-full px-3 py-2 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Scope Line Items */}
      <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>2. Scope Line Items & Financials</span>
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
                <div className="md:col-span-5 space-y-1">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    placeholder={`Item ${idx + 1} Title`}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    placeholder="Specification detail..."
                    className="w-full px-2.5 py-1 text-[11px] font-mono bg-obsidian-light/50 border border-ivory/5 text-ivory/70 rounded-sm focus:border-acid focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono text-ivory/40 mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm focus:border-acid focus:outline-hidden text-right"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono text-ivory/40 mb-1">
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

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono text-ivory/40 mb-1">
                    Total
                  </label>
                  <div className="px-2 py-1.5 text-xs font-mono text-ivory font-bold bg-white/5 border border-ivory/5 rounded-sm text-right">
                    {formatCurrency(itemTotal, currency)}
                  </div>
                </div>

                <div className="md:col-span-1 pt-6 text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    className="text-ivory/30 hover:text-red-400 disabled:opacity-20 transition-colors p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial Adjustments Grid */}
        <div className="pt-4 border-t border-ivory/10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-mono text-ivory/60 mb-1">
              Commercial Discount ({currency})
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden text-right"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ivory/60 mb-1">
              Applicable Tax / GST ({currency})
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={taxAmount}
              onChange={(e) => setTaxAmount(Number(e.target.value) || 0)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden text-right"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-ivory/60 mb-1">
              Advance Deposit Required (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="5"
              value={advancePercentage}
              onChange={(e) => setAdvancePercentage(Number(e.target.value) || 0)}
              className="w-full px-3 py-1.5 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden text-right"
            />
          </div>
        </div>

        {/* Pricing Summary Box */}
        <div className="bg-obsidian border border-ivory/15 p-4 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/40">
              Commercial Engine Totals
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
              Advance ({advancePercentage}%):{" "}
              <span className="font-bold text-ivory">
                {formatCurrency(pricing.advance_amount, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deliverables Section */}
      <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>3. Technical Deliverables & Specifications</span>
          </h3>
          <button
            type="button"
            onClick={addDeliverable}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-white/5 border border-ivory/10 hover:border-acid/40 text-ivory rounded-sm"
          >
            <Plus className="w-3 h-3" />
            <span>Add Deliverable</span>
          </button>
        </div>

        <div className="space-y-3">
          {deliverables.map((deliv, idx) => (
            <div
              key={deliv.id}
              className="p-3 bg-obsidian/70 border border-ivory/10 rounded-sm grid grid-cols-1 md:grid-cols-12 gap-3 items-start"
            >
              <div className="md:col-span-5">
                <input
                  type="text"
                  value={deliv.title}
                  onChange={(e) => updateDeliverable(deliv.id, { title: e.target.value })}
                  placeholder={`Deliverable ${idx + 1} Name`}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-4">
                <input
                  type="text"
                  value={deliv.description}
                  onChange={(e) => updateDeliverable(deliv.id, { description: e.target.value })}
                  placeholder="Detailed functional specifications..."
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <input
                  type="text"
                  value={deliv.estimated_timeline}
                  onChange={(e) =>
                    updateDeliverable(deliv.id, { estimated_timeline: e.target.value })
                  }
                  placeholder="e.g. Week 2"
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm focus:border-acid focus:outline-hidden text-right"
                />
              </div>

              <div className="md:col-span-1 text-right pt-1.5">
                <button
                  type="button"
                  onClick={() => removeDeliverable(deliv.id)}
                  disabled={deliverables.length <= 1}
                  className="text-ivory/30 hover:text-red-400 disabled:opacity-20 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone Payment Schedule */}
      <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              <span>4. Milestone Payment Schedule</span>
            </h3>
            <p className="text-[11px] font-mono text-ivory/50 mt-0.5">
              Milestone percentages must reconcile to exactly 100%.
            </p>
          </div>
          <button
            type="button"
            onClick={addMilestone}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono bg-white/5 border border-ivory/10 hover:border-acid/40 text-ivory rounded-sm"
          >
            <Plus className="w-3 h-3" />
            <span>Add Milestone</span>
          </button>
        </div>

        <div className="space-y-3">
          {milestones.map((m, idx) => {
            const milestoneValue = (pricing.total_amount * (Number(m.percentage) || 0)) / 100;
            return (
              <div
                key={m.id}
                className="p-3 bg-obsidian/70 border border-ivory/10 rounded-sm grid grid-cols-1 md:grid-cols-12 gap-3 items-start"
              >
                <div className="md:col-span-4 space-y-1">
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => updateMilestone(m.id, { title: e.target.value })}
                    placeholder={`Milestone ${idx + 1}`}
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
                  />
                  <input
                    type="text"
                    value={m.description}
                    onChange={(e) => updateMilestone(m.id, { description: e.target.value })}
                    placeholder="Milestone description..."
                    className="w-full px-2.5 py-1 text-[11px] font-mono bg-obsidian-light/50 border border-ivory/5 text-ivory/70 rounded-sm focus:border-acid focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono text-ivory/40 mb-1">
                    Allocation %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={m.percentage}
                    onChange={(e) =>
                      updateMilestone(m.id, { percentage: Number(e.target.value) })
                    }
                    className="w-full px-2 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm focus:border-acid focus:outline-hidden text-right"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono text-ivory/40 mb-1">
                    Value
                  </label>
                  <div className="px-2 py-1.5 text-xs font-mono text-ivory font-bold bg-white/5 border border-ivory/5 rounded-sm text-right">
                    {formatCurrency(milestoneValue, currency)}
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[10px] font-mono text-ivory/40 mb-1">
                    Release Trigger
                  </label>
                  <input
                    type="text"
                    value={m.trigger_condition}
                    onChange={(e) =>
                      updateMilestone(m.id, { trigger_condition: e.target.value })
                    }
                    placeholder="e.g. Upon staging deployment"
                    className="w-full px-2.5 py-1.5 text-xs font-mono bg-obsidian-light border border-ivory/10 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-1 text-right pt-6">
                  <button
                    type="button"
                    onClick={() => removeMilestone(m.id)}
                    disabled={milestones.length <= 1}
                    className="text-ivory/30 hover:text-red-400 disabled:opacity-20 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Milestone Reconciliation Badge */}
        <div
          className={`p-2.5 rounded-sm text-xs font-mono flex items-center justify-between border ${
            isMilestonesValid
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {isMilestonesValid ? (
              <FileCheck className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>
              Total Milestone Allocation: <strong>{milestoneTotalPercentage}%</strong> / 100%
            </span>
          </div>
          {!isMilestonesValid && (
            <span className="text-[10px] font-bold">
              Adjustment needed: {100 - milestoneTotalPercentage}%
            </span>
          )}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-acid">
          5. Commercial & Legal Terms
        </h3>
        <textarea
          rows={7}
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          className="w-full p-3 text-xs font-mono bg-obsidian border border-ivory/20 text-ivory/80 rounded-sm focus:border-acid focus:outline-hidden"
        />
      </div>

      {/* Actions Bar */}
      <div className="border-t border-ivory/10 pt-5 flex items-center justify-between gap-4">
        <div className="text-xs font-mono text-ivory/40">
          Proposals are sequentially numbered upon creation (e.g. OFF-PROP-2026-001).
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting || !isMilestonesValid}
            onClick={() => handleSave("draft")}
            className="px-4 py-2 border border-ivory/20 bg-white/5 hover:bg-white/10 text-ivory text-xs font-mono uppercase tracking-wider rounded-sm transition-colors disabled:opacity-40"
          >
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </button>

          <button
            type="button"
            disabled={isSubmitting || !isMilestonesValid}
            onClick={() => handleSave("ready")}
            className="inline-flex items-center gap-2 px-5 py-2 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 transition-colors disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Creating..." : "Save & Ready for Issuance"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

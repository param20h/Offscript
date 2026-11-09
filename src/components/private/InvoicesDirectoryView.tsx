"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Receipt,
  ArrowUpRight,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  AlertCircle,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { InvoiceStatus, InvoiceType } from "@/lib/db/supabase";
import { formatCurrency, fromPaise, toPaise } from "@/lib/invoices/pricing";
import { InvoiceWithClient } from "@/app/private/(portal)/invoices/page";

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  draft: {
    label: "Draft",
    bg: "bg-white/5",
    text: "text-ivory/60",
    border: "border-white/10",
    icon: Clock,
  },
  issued: {
    label: "Issued",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    icon: Send,
  },
  partially_paid: {
    label: "Partially Paid",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    icon: Clock,
  },
  paid: {
    label: "Paid",
    bg: "bg-acid/10",
    text: "text-acid",
    border: "border-acid/30",
    icon: CheckCircle2,
  },
  overdue: {
    label: "Overdue",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    icon: AlertTriangle,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-white/5",
    text: "text-ivory/40",
    border: "border-white/10",
    icon: XCircle,
  },
  void: {
    label: "Void",
    bg: "bg-white/5",
    text: "text-ivory/40",
    border: "border-white/10",
    icon: XCircle,
  },
};

export default function InvoicesDirectoryView({
  initialInvoices,
}: {
  initialInvoices: InvoiceWithClient[];
}) {
  const [invoices] = useState<InvoiceWithClient[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      // Status filter
      if (selectedStatus === "overdue") {
        if (
          inv.status === "paid" ||
          inv.status === "cancelled" ||
          inv.status === "void" ||
          inv.due_date >= todayStr
        ) {
          return false;
        }
      } else if (selectedStatus !== "all" && inv.status !== selectedStatus) {
        return false;
      }

      // Type filter
      if (selectedType !== "all" && inv.invoice_type !== selectedType) {
        return false;
      }

      // Search filter
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        inv.invoice_number.toLowerCase().includes(term) ||
        (inv.clients?.name && inv.clients.name.toLowerCase().includes(term)) ||
        (inv.clients?.company_name && inv.clients.company_name.toLowerCase().includes(term))
      );
    });
  }, [invoices, search, selectedStatus, selectedType, todayStr]);

  // Financial Metrics in integer paise
  const metrics = useMemo(() => {
    let invoicedPaise = 0;
    let paidPaise = 0;
    let balancePaise = 0;
    let overduePaise = 0;

    for (const inv of invoices) {
      if (inv.status !== "cancelled" && inv.status !== "void") {
        invoicedPaise += toPaise(Number(inv.total_amount) || 0);
        paidPaise += toPaise(Number(inv.amount_paid) || 0);
        const bal = toPaise(Number(inv.balance_due) || 0);
        balancePaise += bal;

        if (bal > 0 && inv.due_date < todayStr && inv.status !== "draft") {
          overduePaise += bal;
        }
      }
    }

    return {
      total: invoices.length,
      totalInvoiced: fromPaise(invoicedPaise),
      totalPaid: fromPaise(paidPaise),
      totalBalance: fromPaise(balancePaise),
      totalOverdue: fromPaise(overduePaise),
    };
  }, [invoices, todayStr]);

  const tabs: { key: string; label: string; count: number }[] = [
    { key: "all", label: "All Invoices", count: invoices.length },
    { key: "draft", label: "Drafts", count: invoices.filter((i) => i.status === "draft").length },
    { key: "issued", label: "Issued", count: invoices.filter((i) => i.status === "issued").length },
    { key: "partially_paid", label: "Partially Paid", count: invoices.filter((i) => i.status === "partially_paid").length },
    { key: "paid", label: "Paid", count: invoices.filter((i) => i.status === "paid").length },
    {
      key: "overdue",
      label: "Overdue",
      count: invoices.filter(
        (i) => i.status !== "paid" && i.status !== "cancelled" && i.status !== "void" && i.due_date < todayStr && i.status !== "draft"
      ).length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-obsidian-light/60 border border-ivory/10 p-4 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
            Total Invoiced
          </div>
          <div className="text-xl md:text-2xl font-mono font-bold text-ivory mt-1">
            {formatCurrency(metrics.totalInvoiced, "INR")}
          </div>
          <div className="text-[10px] font-mono text-ivory/40 mt-1">
            {metrics.total} commercial statements
          </div>
        </div>

        <div className="bg-obsidian-light/60 border border-ivory/10 p-4 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
            Collected Revenue
          </div>
          <div className="text-xl md:text-2xl font-mono font-bold text-acid mt-1">
            {formatCurrency(metrics.totalPaid, "INR")}
          </div>
          <div className="text-[10px] font-mono text-acid/60 mt-1">
            Confirmed in bank/ledger
          </div>
        </div>

        <div className="bg-obsidian-light/60 border border-ivory/10 p-4 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
            Outstanding Balance
          </div>
          <div className="text-xl md:text-2xl font-mono font-bold text-amber-400 mt-1">
            {formatCurrency(metrics.totalBalance, "INR")}
          </div>
          <div className="text-[10px] font-mono text-amber-400/60 mt-1">
            Receivables pending
          </div>
        </div>

        <div className="bg-obsidian-light/60 border border-ivory/10 p-4 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
            Overdue Balance
          </div>
          <div
            className={`text-xl md:text-2xl font-mono font-bold mt-1 ${
              metrics.totalOverdue > 0 ? "text-red-400" : "text-ivory"
            }`}
          >
            {formatCurrency(metrics.totalOverdue, "INR")}
          </div>
          <div className="text-[10px] font-mono text-ivory/40 mt-1">
            Past payment due date
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-obsidian-light/40 border border-ivory/10 rounded-sm">
          {tabs.map((tab) => {
            const active = selectedStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-3 py-1.5 text-xs font-mono transition-colors rounded-xs ${
                  active
                    ? "bg-acid text-obsidian font-bold shadow-xs"
                    : "text-ivory/60 hover:text-ivory hover:bg-white/5"
                }`}
              >
                {tab.label}
                <span
                  className={`ml-1.5 text-[10px] ${
                    active ? "text-obsidian/70" : "text-ivory/40"
                  }`}
                >
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Invoice Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-mono bg-obsidian-light/60 border border-ivory/10 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
          >
            <option value="all">All Types</option>
            <option value="advance">Advance</option>
            <option value="milestone">Milestone</option>
            <option value="final">Final</option>
            <option value="custom">Custom</option>
          </select>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-obsidian-light/60 border border-ivory/10 text-ivory placeholder-ivory/30 rounded-sm focus:outline-hidden focus:border-acid/60"
            />
          </div>
        </div>
      </div>

      {/* Invoices List */}
      {filtered.length === 0 ? (
        <div className="border border-ivory/10 bg-obsidian-light/30 rounded-sm p-12 text-center">
          <Receipt className="w-8 h-8 text-ivory/20 mx-auto mb-3" />
          <h3 className="text-sm font-mono font-medium text-ivory/70">
            No invoices found
          </h3>
          <p className="text-xs font-mono text-ivory/40 mt-1 max-w-sm mx-auto">
            {search || selectedStatus !== "all" || selectedType !== "all"
              ? "Try adjusting your search terms or filters."
              : "No invoices have been created yet. Generate an invoice from an accepted proposal or create a custom one."}
          </p>
          <div className="mt-4">
            <Link
              href="/private/invoices/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 transition-colors"
            >
              Create Invoice
            </Link>
          </div>
        </div>
      ) : (
        <div className="border border-ivory/10 bg-obsidian-light/20 rounded-sm overflow-hidden">
          <div className="divide-y divide-ivory/10">
            {filtered.map((invoice) => {
              const isOverdue =
                invoice.status !== "paid" &&
                invoice.status !== "cancelled" &&
                invoice.status !== "void" &&
                invoice.due_date < todayStr &&
                invoice.status !== "draft";

              const statusCfg = isOverdue
                ? STATUS_CONFIG.overdue
                : STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;
              const StatusIcon = statusCfg.icon;

              const clientName = invoice.clients?.name || "Unassigned Client";
              const clientCompany = invoice.clients?.company_name;

              return (
                <div
                  key={invoice.id}
                  className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-acid tracking-wide">
                        {invoice.invoice_number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        <StatusIcon className="w-2.5 h-2.5" />
                        {statusCfg.label}
                      </span>
                      <span className="text-[10px] font-mono text-ivory/40 uppercase tracking-wider px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-xs">
                        {invoice.invoice_type}
                      </span>
                      {invoice.delivery_status === "accepted_by_provider" && (
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-xs">
                          Emailed (Provider Accepted)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-ivory/50">
                      <span className="flex items-center gap-1 text-ivory/80 font-medium">
                        <Building className="w-3 h-3 text-ivory/40" />
                        {clientName}
                        {clientCompany && clientCompany !== "Independent" && ` (${clientCompany})`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-ivory/30" />
                        Due {new Date(invoice.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-ivory/5">
                    <div className="text-left md:text-right">
                      <div className="font-mono text-base font-bold text-ivory">
                        {formatCurrency(invoice.total_amount, invoice.currency)}
                      </div>
                      <div className="text-[10px] font-mono text-ivory/50">
                        Paid:{" "}
                        <span className="text-acid font-semibold">
                          {formatCurrency(invoice.amount_paid, invoice.currency)}
                        </span>{" "}
                        | Balance:{" "}
                        <span
                          className={`font-semibold ${
                            invoice.balance_due > 0 ? "text-amber-400" : "text-ivory/40"
                          }`}
                        >
                          {formatCurrency(invoice.balance_due, invoice.currency)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/private/invoices/${invoice.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border border-ivory/10 bg-obsidian-light text-ivory/60 hover:text-ivory hover:border-ivory/30 rounded-sm transition-colors"
                        title="Download Vector PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <Link
                        href={`/private/invoices/${invoice.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-ivory/10 hover:border-acid/40 text-ivory hover:text-acid text-xs font-mono transition-colors rounded-sm"
                      >
                        <span>Dossier</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

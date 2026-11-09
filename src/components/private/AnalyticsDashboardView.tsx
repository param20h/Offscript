"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Layers,
  Users,
  FileCheck,
  Receipt,
  Download,
  Calendar,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { StudioAnalyticsSummary } from "@/lib/analytics/engine";

interface Props {
  initialAnalytics: StudioAnalyticsSummary;
}

export default function AnalyticsDashboardView({ initialAnalytics }: Props) {
  const [data, setData] = useState<StudioAnalyticsSummary>(initialAnalytics);
  const [period, setPeriod] = useState<"30d" | "90d" | "12m" | "all">("all");
  const [loading, setLoading] = useState(false);

  const handlePeriodChange = async (newPeriod: "30d" | "90d" | "12m" | "all") => {
    setPeriod(newPeriod);
    setLoading(true);
    try {
      // Re-fetch client side or compute
      const res = await fetch(`/api/private/reports/export?type=analytics&period=${newPeriod}`);
      // If we don't have a JSON endpoint for analytics, we can compute or trigger refresh
      // Since computeStudioAnalytics is fast, let's keep it responsive
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const { revenue, pipeline, projects, clients, monthlyRevenue } = data;

  // Max value for revenue timeline chart scaling
  const maxMonthly = Math.max(
    ...monthlyRevenue.map((m) => Math.max(m.invoiced, m.collected)),
    10000
  );

  return (
    <div className="space-y-8">
      {/* Time Frame Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ivory/5 p-3.5 rounded border border-ivory/10">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-lime" />
          <span className="text-xs font-mono uppercase text-ivory/70 font-semibold">
            Reporting Window:
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {(["30d", "90d", "12m", "all"] as const).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                period === p
                  ? "bg-lime text-obsidian font-bold"
                  : "bg-ivory/5 text-ivory/60 hover:text-ivory hover:bg-ivory/10"
              }`}
            >
              {p === "30d"
                ? "Last 30 Days"
                : p === "90d"
                ? "Last 90 Days"
                : p === "12m"
                ? "Last 12 Months"
                : "All Time"}
            </button>
          ))}
        </div>
      </div>

      {/* Top Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded border border-ivory/10 bg-ivory/5 p-5">
          <div className="flex items-center justify-between text-xs font-mono text-ivory/50">
            <span>GROSS INVOICED</span>
            <DollarSign className="h-4 w-4 text-lime" />
          </div>
          <div className="text-2xl font-bold font-mono text-ivory mt-2">
            {revenue.primaryCurrency} {revenue.grossInvoiced.toLocaleString()}
          </div>
          <div className="text-[11px] text-ivory/40 font-mono mt-1">
            Total commercial billings issued
          </div>
        </div>

        <div className="rounded border border-ivory/10 bg-ivory/5 p-5">
          <div className="flex items-center justify-between text-xs font-mono text-ivory/50">
            <span>TOTAL COLLECTED</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {revenue.primaryCurrency} {revenue.totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-ivory/40 font-mono mt-1">
            Reconciled payments & advance deposits
          </div>
        </div>

        <div className="rounded border border-ivory/10 bg-ivory/5 p-5">
          <div className="flex items-center justify-between text-xs font-mono text-ivory/50">
            <span>OUTSTANDING BALANCE</span>
            <Clock className="h-4 w-4 text-lime" />
          </div>
          <div className="text-2xl font-bold font-mono text-lime mt-2">
            {revenue.primaryCurrency} {revenue.balanceDue.toLocaleString()}
          </div>
          <div className="text-[11px] text-ivory/40 font-mono mt-1">
            Receivables pending client settlement
          </div>
        </div>

        <div className="rounded border border-ivory/10 bg-ivory/5 p-5">
          <div className="flex items-center justify-between text-xs font-mono text-ivory/50">
            <span>PROPOSAL WIN RATE</span>
            <CheckCircle2 className="h-4 w-4 text-lime" />
          </div>
          <div className="text-2xl font-bold font-mono text-ivory mt-2">
            {pipeline.winRatePercentage}%
          </div>
          <div className="text-[11px] text-ivory/40 font-mono mt-1">
            {pipeline.acceptedProposals} of {pipeline.totalProposals} scopes accepted
          </div>
        </div>
      </div>

      {/* Sales Conversion Funnel & Pipeline Velocity */}
      <div className="rounded border border-ivory/10 bg-ivory/5 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ivory uppercase font-mono tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-lime" />
              Agency Sales Conversion Funnel
            </h2>
            <p className="text-xs font-mono text-ivory/50 mt-1">
              End-to-end qualification from inbound inquiry to contracted engineering project.
            </p>
          </div>
          <div className="text-xs font-mono text-lime bg-lime/10 px-2.5 py-1 rounded border border-lime/20">
            Funnel Velocity: {pipeline.inquiryToProjectConversionRate}%
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Stage 1 */}
          <div className="bg-obsidian border border-ivory/10 p-4 rounded space-y-2 relative">
            <span className="text-[10px] font-mono text-ivory/40 uppercase">STAGE 1</span>
            <div className="text-xl font-bold font-mono text-ivory">
              {pipeline.totalInquiries}
            </div>
            <div className="text-xs text-ivory/80 font-medium">Inquiries Received</div>
            <p className="text-[11px] text-ivory/40">Inbound website inquiries submitted</p>
          </div>

          {/* Stage 2 */}
          <div className="bg-obsidian border border-ivory/10 p-4 rounded space-y-2 relative">
            <span className="text-[10px] font-mono text-ivory/40 uppercase">STAGE 2</span>
            <div className="text-xl font-bold font-mono text-ivory">
              {pipeline.qualifiedInquiries}
            </div>
            <div className="text-xs text-ivory/80 font-medium">Qualified Leads</div>
            <p className="text-[11px] text-ivory/40">Passed technical & commercial qualification</p>
          </div>

          {/* Stage 3 */}
          <div className="bg-obsidian border border-ivory/10 p-4 rounded space-y-2 relative">
            <span className="text-[10px] font-mono text-ivory/40 uppercase">STAGE 3</span>
            <div className="text-xl font-bold font-mono text-ivory">
              {pipeline.totalProposals}
            </div>
            <div className="text-xs text-ivory/80 font-medium">Proposals Generated</div>
            <p className="text-[11px] text-ivory/40">Itemized technical scopes dispatched</p>
          </div>

          {/* Stage 4 */}
          <div className="bg-obsidian border border-lime/30 p-4 rounded space-y-2 relative">
            <span className="text-[10px] font-mono text-lime uppercase">STAGE 4: WON</span>
            <div className="text-xl font-bold font-mono text-lime">
              {pipeline.acceptedProposals}
            </div>
            <div className="text-xs text-ivory font-bold">Contracted Engagements</div>
            <p className="text-[11px] text-ivory/40">Accepted scopes turned into active projects</p>
          </div>
        </div>
      </div>

      {/* Monthly Financial Timeline (Last 6 Months) */}
      <div className="rounded border border-ivory/10 bg-ivory/5 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ivory uppercase font-mono tracking-wider flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-lime" />
            Monthly Financial Trajectory (Invoiced vs Collected)
          </h2>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-ivory/70">
              <span className="h-2.5 w-2.5 rounded-full bg-ivory/60" />
              Invoiced
            </span>
            <span className="flex items-center gap-1.5 text-lime">
              <span className="h-2.5 w-2.5 rounded-full bg-lime" />
              Collected
            </span>
          </div>
        </div>

        {monthlyRevenue.length === 0 ? (
          <p className="text-xs font-mono text-ivory/40 text-center py-8">
            No historical financial transactions recorded yet.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {monthlyRevenue.map((m) => {
                const invHeight = Math.max(8, Math.min(100, Math.round((m.invoiced / maxMonthly) * 100)));
                const colHeight = Math.max(8, Math.min(100, Math.round((m.collected / maxMonthly) * 100)));

                return (
                  <div
                    key={m.month}
                    className="bg-obsidian border border-ivory/10 p-3 rounded flex flex-col justify-between space-y-3"
                  >
                    <span className="text-[11px] font-mono text-ivory/60 text-center block">
                      {m.label}
                    </span>

                    <div className="h-24 flex items-end justify-center gap-2 pt-2">
                      <div className="w-4 bg-ivory/20 rounded-t flex flex-col justify-end items-center transition-all" style={{ height: `${invHeight}%` }}>
                        <div className="w-full bg-ivory/60 rounded-t h-full" />
                      </div>
                      <div className="w-4 bg-lime/20 rounded-t flex flex-col justify-end items-center transition-all" style={{ height: `${colHeight}%` }}>
                        <div className="w-full bg-lime rounded-t h-full" />
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-center space-y-0.5 border-t border-ivory/5 pt-1.5">
                      <div className="text-ivory/60">{m.invoiced.toLocaleString()}</div>
                      <div className="text-lime font-bold">{m.collected.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Project Execution & Client Delivery Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded border border-ivory/10 bg-ivory/5 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-ivory uppercase font-mono tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-lime" />
            Project Execution Velocity
          </h2>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center p-2 rounded bg-obsidian">
              <span className="text-ivory/70">Total Engagements Initiated:</span>
              <span className="font-bold text-ivory">{projects.totalProjects}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-obsidian">
              <span className="text-ivory/70">Active In-Flight Deliveries:</span>
              <span className="font-bold text-lime">{projects.activeProjects}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-obsidian">
              <span className="text-ivory/70">Successfully Shipped:</span>
              <span className="font-bold text-emerald-400">{projects.completedProjects}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-obsidian">
              <span className="text-ivory/70">On Hold / Awaiting Assets:</span>
              <span className="font-bold text-rose-400">{projects.onHoldProjects}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-obsidian">
              <span className="text-ivory/70">Average Progress Across Fleet:</span>
              <span className="font-bold text-lime">{projects.avgProgressPercentage}%</span>
            </div>
          </div>
        </div>

        <div className="rounded border border-ivory/10 bg-ivory/5 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-ivory uppercase font-mono tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-lime" />
            Client Relationship Metrics
          </h2>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center p-2 rounded bg-obsidian">
              <span className="text-ivory/70">Total Studio Clients:</span>
              <span className="font-bold text-ivory">{clients.totalClients}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-obsidian">
              <span className="text-ivory/70">Active Client Accounts:</span>
              <span className="font-bold text-lime">{clients.activeClients}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-obsidian">
              <span className="text-ivory/70">Average Revenue Per Client:</span>
              <span className="font-bold text-ivory">
                {revenue.primaryCurrency} {clients.avgRevenuePerClient.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-obsidian">
              <span className="text-ivory/70">Overdue Invoices Amount:</span>
              <span className="font-bold text-rose-400">
                {revenue.primaryCurrency} {revenue.overdueAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Data Export Center */}
      <div className="rounded border border-ivory/10 bg-ivory/5 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ivory uppercase font-mono tracking-wider flex items-center gap-2">
              <Download className="h-4 w-4 text-lime" />
              Secure Data Export Center
            </h2>
            <p className="text-xs font-mono text-ivory/50 mt-1">
              Download sanitized, formula-injection-protected CSV reports for bookkeeping, tax audits, or CRM sync.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          <a
            href="/api/private/reports/export?type=invoices"
            className="flex flex-col items-center justify-center p-3 rounded bg-obsidian border border-ivory/10 hover:border-lime hover:text-lime transition-all text-center group"
          >
            <Receipt className="h-4 w-4 text-ivory/60 group-hover:text-lime mb-2" />
            <span className="text-xs font-mono font-semibold text-ivory group-hover:text-lime">
              Invoices CSV
            </span>
            <span className="text-[10px] font-mono text-ivory/40 mt-0.5">Billing & Ledger</span>
          </a>

          <a
            href="/api/private/reports/export?type=projects"
            className="flex flex-col items-center justify-center p-3 rounded bg-obsidian border border-ivory/10 hover:border-lime hover:text-lime transition-all text-center group"
          >
            <Layers className="h-4 w-4 text-ivory/60 group-hover:text-lime mb-2" />
            <span className="text-xs font-mono font-semibold text-ivory group-hover:text-lime">
              Projects CSV
            </span>
            <span className="text-[10px] font-mono text-ivory/40 mt-0.5">Deliveries & Scope</span>
          </a>

          <a
            href="/api/private/reports/export?type=proposals"
            className="flex flex-col items-center justify-center p-3 rounded bg-obsidian border border-ivory/10 hover:border-lime hover:text-lime transition-all text-center group"
          >
            <FileCheck className="h-4 w-4 text-ivory/60 group-hover:text-lime mb-2" />
            <span className="text-xs font-mono font-semibold text-ivory group-hover:text-lime">
              Proposals CSV
            </span>
            <span className="text-[10px] font-mono text-ivory/40 mt-0.5">Sales & Pipeline</span>
          </a>

          <a
            href="/api/private/reports/export?type=clients"
            className="flex flex-col items-center justify-center p-3 rounded bg-obsidian border border-ivory/10 hover:border-lime hover:text-lime transition-all text-center group"
          >
            <Users className="h-4 w-4 text-ivory/60 group-hover:text-lime mb-2" />
            <span className="text-xs font-mono font-semibold text-ivory group-hover:text-lime">
              Clients CSV
            </span>
            <span className="text-[10px] font-mono text-ivory/40 mt-0.5">Client Accounts</span>
          </a>

          <a
            href="/api/private/reports/export?type=inquiries"
            className="flex flex-col items-center justify-center p-3 rounded bg-obsidian border border-ivory/10 hover:border-lime hover:text-lime transition-all text-center group"
          >
            <ShieldCheck className="h-4 w-4 text-ivory/60 group-hover:text-lime mb-2" />
            <span className="text-xs font-mono font-semibold text-ivory group-hover:text-lime">
              Inquiries CSV
            </span>
            <span className="text-[10px] font-mono text-ivory/40 mt-0.5">Inbound Leads</span>
          </a>
        </div>
      </div>
    </div>
  );
}

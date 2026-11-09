"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  FileSpreadsheet,
  ArrowUpRight,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { ProposalStatus } from "@/lib/db/supabase";
import { formatCurrency } from "@/lib/proposals/pricing";
import { ProposalWithClient } from "@/app/private/(portal)/proposals/page";

const STATUS_CONFIG: Record<
  ProposalStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  draft: {
    label: "Draft",
    bg: "bg-white/5",
    text: "text-ivory/60",
    border: "border-white/10",
    icon: Clock,
  },
  ready: {
    label: "Ready",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    icon: AlertCircle,
  },
  sent: {
    label: "Sent",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    icon: Send,
  },
  accepted: {
    label: "Accepted",
    bg: "bg-acid/10",
    text: "text-acid",
    border: "border-acid/30",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    icon: XCircle,
  },
  viewed: {
    label: "Viewed",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    icon: Clock,
  },
  expired: {
    label: "Expired",
    bg: "bg-white/5",
    text: "text-ivory/40",
    border: "border-white/10",
    icon: Clock,
  },
  withdrawn: {
    label: "Withdrawn",
    bg: "bg-white/5",
    text: "text-ivory/40",
    border: "border-white/10",
    icon: XCircle,
  },
};

export default function ProposalsDirectoryView({
  initialProposals,
}: {
  initialProposals: ProposalWithClient[];
}) {
  const [proposals] = useState<ProposalWithClient[]>(initialProposals);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      if (selectedStatus !== "all" && p.status !== selectedStatus) {
        return false;
      }
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        p.proposal_number.toLowerCase().includes(term) ||
        p.title.toLowerCase().includes(term) ||
        (p.clients?.name && p.clients.name.toLowerCase().includes(term)) ||
        (p.clients?.company_name && p.clients.company_name.toLowerCase().includes(term))
      );
    });
  }, [proposals, search, selectedStatus]);

  // Aggregate metrics
  const metrics = useMemo(() => {
    const total = proposals.length;
    let totalPipeline = 0;
    let acceptedValue = 0;
    let sentCount = 0;
    let acceptedCount = 0;

    for (const p of proposals) {
      if (p.status !== "rejected" && p.status !== "withdrawn") {
        totalPipeline += p.total_amount;
      }
      if (p.status === "accepted") {
        acceptedValue += p.total_amount;
        acceptedCount += 1;
      }
      if (p.status === "sent") {
        sentCount += 1;
      }
    }

    return {
      total,
      totalPipeline,
      acceptedValue,
      sentCount,
      acceptedCount,
    };
  }, [proposals]);

  const tabs: { key: string; label: string; count: number }[] = [
    { key: "all", label: "All Proposals", count: proposals.length },
    { key: "draft", label: "Drafts", count: proposals.filter((p) => p.status === "draft").length },
    { key: "sent", label: "Out for Review", count: proposals.filter((p) => p.status === "sent").length },
    { key: "accepted", label: "Accepted", count: proposals.filter((p) => p.status === "accepted").length },
    { key: "rejected", label: "Rejected", count: proposals.filter((p) => p.status === "rejected").length },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-obsidian-light/60 border border-ivory/10 p-4 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
            Total Pipeline
          </div>
          <div className="text-xl md:text-2xl font-mono font-bold text-ivory mt-1">
            {formatCurrency(metrics.totalPipeline, "INR")}
          </div>
          <div className="text-[10px] font-mono text-ivory/40 mt-1">
            {metrics.total} total proposals
          </div>
        </div>

        <div className="bg-obsidian-light/60 border border-ivory/10 p-4 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
            Accepted / Booked
          </div>
          <div className="text-xl md:text-2xl font-mono font-bold text-acid mt-1">
            {formatCurrency(metrics.acceptedValue, "INR")}
          </div>
          <div className="text-[10px] font-mono text-acid/60 mt-1">
            {metrics.acceptedCount} commercial wins
          </div>
        </div>

        <div className="bg-obsidian-light/60 border border-ivory/10 p-4 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
            Pending Review
          </div>
          <div className="text-xl md:text-2xl font-mono font-bold text-amber-400 mt-1">
            {metrics.sentCount}
          </div>
          <div className="text-[10px] font-mono text-amber-400/60 mt-1">
            Dispatched to clients
          </div>
        </div>

        <div className="bg-obsidian-light/60 border border-ivory/10 p-4 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
            Conversion Rate
          </div>
          <div className="text-xl md:text-2xl font-mono font-bold text-ivory mt-1">
            {metrics.total > 0
              ? `${Math.round((metrics.acceptedCount / metrics.total) * 100)}%`
              : "0%"}
          </div>
          <div className="text-[10px] font-mono text-ivory/40 mt-1">
            Accepted / Total
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ivory/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search proposals or clients..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-obsidian-light/60 border border-ivory/10 text-ivory placeholder-ivory/30 rounded-sm focus:outline-hidden focus:border-acid/60"
          />
        </div>
      </div>

      {/* Proposals List */}
      {filtered.length === 0 ? (
        <div className="border border-ivory/10 bg-obsidian-light/30 rounded-sm p-12 text-center">
          <FileSpreadsheet className="w-8 h-8 text-ivory/20 mx-auto mb-3" />
          <h3 className="text-sm font-mono font-medium text-ivory/70">
            No proposals found
          </h3>
          <p className="text-xs font-mono text-ivory/40 mt-1 max-w-sm mx-auto">
            {search || selectedStatus !== "all"
              ? "Try adjusting your search terms or status filter."
              : "No proposals have been generated yet. Draft your first executive scope document."}
          </p>
          <div className="mt-4">
            <Link
              href="/private/proposals/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 transition-colors"
            >
              Draft Proposal
            </Link>
          </div>
        </div>
      ) : (
        <div className="border border-ivory/10 bg-obsidian-light/20 rounded-sm overflow-hidden">
          <div className="divide-y divide-ivory/10">
            {filtered.map((proposal) => {
              const statusCfg = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.draft;
              const StatusIcon = statusCfg.icon;
              const clientName = proposal.clients?.name || "Unassigned Client";
              const clientCompany = proposal.clients?.company_name;

              return (
                <div
                  key={proposal.id}
                  className="p-4 sm:p-5 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-acid tracking-wide">
                        {proposal.proposal_number}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        <StatusIcon className="w-2.5 h-2.5" />
                        {statusCfg.label}
                      </span>
                      {proposal.delivery_status === "delivered" && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-xs">
                          Delivered
                        </span>
                      )}
                      {proposal.delivery_status === "accepted_by_provider" && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-xs">
                          Dispatched (Provider Accepted)
                        </span>
                      )}
                    </div>

                    <h2 className="font-display text-base font-semibold text-ivory truncate">
                      <Link
                        href={`/private/proposals/${proposal.id}`}
                        className="hover:text-acid transition-colors"
                      >
                        {proposal.title}
                      </Link>
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-ivory/50">
                      <span className="flex items-center gap-1 text-ivory/70">
                        <Building className="w-3 h-3 text-ivory/40" />
                        {clientName}
                        {clientCompany && ` (${clientCompany})`}
                      </span>
                      {proposal.valid_until && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-ivory/30" />
                          Valid until {new Date(proposal.valid_until).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-ivory/5">
                    <div className="text-left md:text-right">
                      <div className="font-mono text-base font-bold text-ivory">
                        {formatCurrency(proposal.total_amount, proposal.currency)}
                      </div>
                      <div className="text-[10px] font-mono text-ivory/40">
                        Advance {proposal.advance_percentage}% (
                        {formatCurrency(proposal.advance_amount, proposal.currency)})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/private/proposals/${proposal.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border border-ivory/10 bg-obsidian-light text-ivory/60 hover:text-ivory hover:border-ivory/30 rounded-sm transition-colors"
                        title="Download Vector PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <Link
                        href={`/private/proposals/${proposal.id}`}
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

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowRight,
  Inbox,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { InquiryRecord } from "@/lib/db/supabase";

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Qualified", value: "qualified" },
  { label: "Proposal Sent", value: "proposal_sent" },
  { label: "Converted", value: "converted" },
  { label: "Rejected", value: "rejected" },
];

export default function InquiriesDirectoryView({
  initialInquiries,
}: {
  initialInquiries: InquiryRecord[];
}) {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDiscipline, setSelectedDiscipline] = useState("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Filtered and sorted inquiries
  const filtered = useMemo(() => {
    let list = [...initialInquiries];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (i) =>
          (i.name || "").toLowerCase().includes(q) ||
          (i.email || "").toLowerCase().includes(q) ||
          (i.company || "").toLowerCase().includes(q) ||
          (i.description || "").toLowerCase().includes(q) ||
          (i.project_type || "").toLowerCase().includes(q)
      );
    }

    if (selectedStatus !== "all") {
      list = list.filter(
        (i) => (i.business_status || "new").toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    if (selectedDiscipline !== "all") {
      list = list.filter((i) =>
        (i.project_type || "").toLowerCase().includes(selectedDiscipline.toLowerCase())
      );
    }

    list.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

    return list;
  }, [initialInquiries, search, selectedStatus, selectedDiscipline, sortOrder]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return "bg-acid/10 text-acid border-acid/30";
      case "reviewing":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "qualified":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "proposal_in_progress":
      case "proposal_sent":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "accepted":
      case "converted":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "rejected":
      case "archived":
        return "bg-ivory/10 text-ivory/40 border-ivory/20";
      default:
        return "bg-ivory/10 text-ivory/60 border-ivory/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-ivory/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client, email, company, brief..."
            className="w-full bg-[#161616] border border-ivory/10 pl-9 pr-3.5 py-2 text-xs font-mono text-ivory placeholder-ivory/30 rounded-sm focus:outline-none focus:border-acid transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Discipline Selector */}
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="bg-[#161616] border border-ivory/10 px-3 py-2 text-xs font-mono text-ivory/80 rounded-sm focus:outline-none focus:border-acid transition-colors cursor-pointer"
          >
            <option value="all">All Disciplines</option>
            <option value="Web">Web Development</option>
            <option value="AI">AI & Agents</option>
            <option value="SaaS">SaaS & Custom Software</option>
            <option value="Cloud">Backend & Cloud</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="px-3 py-2 bg-[#161616] border border-ivory/10 text-xs font-mono text-ivory/70 hover:text-ivory rounded-sm transition-colors cursor-pointer"
          >
            Sort: {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-ivory/10">
        {STATUS_FILTERS.map((tab) => {
          const isActive = selectedStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-ivory/10 text-acid font-semibold border-b border-acid"
                  : "text-ivory/50 hover:text-ivory hover:bg-ivory/[0.03]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Inquiries Counter */}
      <div className="flex items-center justify-between text-xs font-mono text-ivory/40">
        <span>Showing {filtered.length} of {initialInquiries.length} inquiries</span>
      </div>

      {/* Inquiries List */}
      {filtered.length === 0 ? (
        <div className="border border-ivory/10 bg-[#141414] rounded-sm p-12 text-center">
          <Inbox className="w-8 h-8 text-ivory/20 mx-auto mb-3" />
          <div className="text-sm font-mono text-ivory/60">No matching inquiries found</div>
          <div className="text-xs font-mono text-ivory/30 mt-1">
            Try adjusting your search criteria or filter status.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inquiry) => {
            const status = inquiry.business_status || "new";
            const dateStr = new Date(inquiry.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={inquiry.id}
                className="border border-ivory/10 bg-[#141414] hover:border-ivory/25 rounded-sm p-5 transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    {/* Header line */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-display font-semibold text-base text-ivory">
                        {inquiry.name}
                      </span>
                      <span className="text-xs font-mono text-ivory/50">
                        {inquiry.company && inquiry.company !== "Independent"
                          ? inquiry.company
                          : "Independent Client"}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border ${getStatusBadge(
                          status
                        )}`}
                      >
                        {status.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] font-mono text-ivory/30">
                        {dateStr}
                      </span>
                    </div>

                    {/* Brief description snippet */}
                    <p className="text-xs text-ivory/70 line-clamp-2 leading-relaxed">
                      {inquiry.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-4 text-xs font-mono text-ivory/40 pt-1 flex-wrap">
                      <span className="text-ivory/70">{inquiry.project_type}</span>
                      <span>•</span>
                      <span>
                        Budget:{" "}
                        <strong className="text-ivory font-normal">
                          {inquiry.currency} {inquiry.budget_range}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>Timeline: {inquiry.timeline}</span>
                      <span>•</span>
                      <span className="text-ivory/30">{inquiry.email}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto pt-2 lg:pt-0">
                    <Link
                      href={`/private/inquiries/${inquiry.id}`}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-ivory/[0.04] hover:bg-acid hover:text-obsidian text-ivory text-xs font-mono border border-ivory/15 hover:border-acid rounded-sm transition-all"
                    >
                      <span>Open Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

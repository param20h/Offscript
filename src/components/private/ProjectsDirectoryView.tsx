"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { ProjectWithRelations } from "@/app/private/(portal)/projects/page";

interface Props {
  initialProjects: ProjectWithRelations[];
}

export default function ProjectsDirectoryView({ initialProjects }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const metrics = useMemo(() => {
    const total = initialProjects.length;
    const active = initialProjects.filter((p) =>
      ["planning", "scheduled", "in_progress", "review"].includes(p.status)
    ).length;
    const completed = initialProjects.filter((p) => p.status === "completed").length;
    const onHold = initialProjects.filter((p) => p.status === "on_hold").length;
    const avgProgress =
      total > 0
        ? Math.round(
            initialProjects.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) /
              total
          )
        : 0;

    return { total, active, completed, onHold, avgProgress };
  }, [initialProjects]);

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (priorityFilter !== "all" && p.priority !== priorityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const clientName = (p.clients?.name || "").toLowerCase();
        const companyName = (p.clients?.company_name || "").toLowerCase();
        const title = (p.title || "").toLowerCase();
        const num = (p.project_number || "").toLowerCase();
        return (
          title.includes(q) ||
          num.includes(q) ||
          clientName.includes(q) ||
          companyName.includes(q)
        );
      }
      return true;
    });
  }, [initialProjects, search, statusFilter, priorityFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-lime/10 text-lime border-lime/30";
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "review":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "on_hold":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "scheduled":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "planning":
      default:
        return "bg-ivory/10 text-ivory/80 border-ivory/20";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-rose-400 font-bold";
      case "high":
        return "text-amber-400 font-semibold";
      case "low":
        return "text-ivory/50";
      default:
        return "text-ivory/80";
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded border border-ivory/10 bg-ivory/5 p-4">
          <div className="flex items-center justify-between text-ivory/60 text-xs">
            <span>ACTIVE ENGAGEMENTS</span>
            <Layers className="h-4 w-4 text-lime" />
          </div>
          <div className="text-2xl font-bold font-mono text-ivory mt-2">
            {metrics.active}
          </div>
          <div className="text-[11px] text-ivory/50 mt-1">
            {metrics.total} total projects in studio
          </div>
        </div>

        <div className="rounded border border-ivory/10 bg-ivory/5 p-4">
          <div className="flex items-center justify-between text-ivory/60 text-xs">
            <span>AVG DELIVERY PROGRESS</span>
            <TrendingUp className="h-4 w-4 text-lime" />
          </div>
          <div className="text-2xl font-bold font-mono text-lime mt-2">
            {metrics.avgProgress}%
          </div>
          <div className="text-[11px] text-ivory/50 mt-1">
            Aggregated across all scopes
          </div>
        </div>

        <div className="rounded border border-ivory/10 bg-ivory/5 p-4">
          <div className="flex items-center justify-between text-ivory/60 text-xs">
            <span>COMPLETED DELIVERIES</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-ivory mt-2">
            {metrics.completed}
          </div>
          <div className="text-[11px] text-ivory/50 mt-1">
            Successfully shipped
          </div>
        </div>

        <div className="rounded border border-ivory/10 bg-ivory/5 p-4">
          <div className="flex items-center justify-between text-ivory/60 text-xs">
            <span>ON HOLD / BLOCKED</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-ivory mt-2">
            {metrics.onHold}
          </div>
          <div className="text-[11px] text-ivory/50 mt-1">
            Requiring intervention
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-ivory/5 p-3 rounded border border-ivory/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ivory/40" />
          <input
            type="text"
            placeholder="Search projects, client, or number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-obsidian/70 border border-ivory/10 rounded text-xs text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-lime"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-ivory/60">
            <Filter className="h-3 w-3" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-obsidian/70 border border-ivory/10 rounded text-xs text-ivory px-2 py-1.5 focus:outline-none focus:border-lime"
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-obsidian/70 border border-ivory/10 rounded text-xs text-ivory px-2 py-1.5 focus:outline-none focus:border-lime"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      {filteredProjects.length === 0 ? (
        <div className="rounded border border-ivory/10 bg-ivory/5 p-12 text-center">
          <p className="text-sm font-mono text-ivory/60">
            No projects match the selected filters.
          </p>
          <div className="mt-4">
            <Link
              href="/private/projects/new"
              className="inline-flex items-center gap-2 rounded bg-lime px-3 py-1.5 text-xs font-semibold text-obsidian hover:bg-lime/90"
            >
              Initialize First Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-ivory/10 bg-obsidian">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory/5 border-b border-ivory/10 text-ivory/50 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Target Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory/5">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-ivory/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-ivory font-mono">
                      {p.project_number}
                    </div>
                    <div className="text-ivory/80 font-medium truncate max-w-xs mt-0.5">
                      {p.title}
                    </div>
                    <div className="text-[10px] text-ivory/40 uppercase font-mono mt-0.5">
                      {p.project_type}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-ivory">
                      {p.clients?.company_name || p.clients?.name || "Direct Client"}
                    </div>
                    <div className="text-[11px] text-ivory/40">
                      {p.clients?.email || "—"}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 uppercase font-mono text-[11px]">
                    <span className={getPriorityBadge(p.priority)}>
                      {p.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase font-mono rounded border ${getStatusBadge(
                        p.status
                      )}`}
                    >
                      {p.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-28 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-ivory/60">
                        <span>Delivery</span>
                        <span>{p.progress_percentage || 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-ivory/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-lime transition-all duration-300"
                          style={{ width: `${Math.min(100, p.progress_percentage || 0)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-ivory/60">
                    {p.estimated_completion_date ? (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-ivory/40" />
                        {new Date(p.estimated_completion_date).toLocaleDateString()}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/private/projects/${p.id}`}
                      className="inline-flex items-center gap-1 rounded bg-ivory/10 px-2.5 py-1 text-[11px] font-mono text-ivory hover:bg-lime hover:text-obsidian transition-colors"
                    >
                      <span>Dossier</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

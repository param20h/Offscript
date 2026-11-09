"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  FileCheck,
  CheckCircle2,
} from "lucide-react";
import {
  ClientRecord,
  ProposalRecord,
  ProposalDeliverableRecord,
  ProposalMilestoneRecord,
} from "@/lib/db/supabase";

interface ProposalWithDetails extends ProposalRecord {
  proposal_deliverables?: ProposalDeliverableRecord[];
  proposal_milestones?: ProposalMilestoneRecord[];
}

interface Props {
  clients: ClientRecord[];
  proposals: ProposalWithDetails[];
  initialClientId: string;
  initialProposalId: string;
  preloadedProposal: ProposalWithDetails | null;
}

interface MilestoneInput {
  title: string;
  description: string;
  start_date: string;
  due_date: string;
  client_visible: boolean;
}

export default function ProjectCreatorView({
  clients,
  proposals,
  initialClientId,
  initialProposalId,
  preloadedProposal,
}: Props) {
  const router = useRouter();

  const [clientId, setClientId] = useState(initialClientId);
  const [proposalId, setProposalId] = useState(initialProposalId);

  const [title, setTitle] = useState(preloadedProposal?.title ? `Project: ${preloadedProposal.title}` : "");
  const [description, setDescription] = useState(preloadedProposal?.project_overview || "");
  const [projectType, setProjectType] = useState("web_app");
  const [status, setStatus] = useState("planning");
  const [priority, setPriority] = useState("medium");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [completionDate, setCompletionDate] = useState("");
  const [totalBudget, setTotalBudget] = useState(preloadedProposal ? preloadedProposal.total_amount.toString() : "0");
  const [currency, setCurrency] = useState(preloadedProposal?.currency || "INR");
  const [internalNotes, setInternalNotes] = useState("");
  const [clientVisibleSummary, setClientVisibleSummary] = useState(
    preloadedProposal?.executive_summary || ""
  );

  // Initialize milestones from proposal if available
  const initialMilestones: MilestoneInput[] = [];
  if (preloadedProposal?.proposal_milestones && preloadedProposal.proposal_milestones.length > 0) {
    preloadedProposal.proposal_milestones.forEach((m) => {
      initialMilestones.push({
        title: m.title,
        description: m.description || m.due_description || "",
        start_date: "",
        due_date: "",
        client_visible: true,
      });
    });
  } else if (preloadedProposal?.proposal_deliverables && preloadedProposal.proposal_deliverables.length > 0) {
    preloadedProposal.proposal_deliverables.forEach((d) => {
      initialMilestones.push({
        title: d.title,
        description: d.description || "",
        start_date: "",
        due_date: "",
        client_visible: true,
      });
    });
  }

  const [milestones, setMilestones] = useState<MilestoneInput[]>(
    initialMilestones.length > 0
      ? initialMilestones
      : [
          {
            title: "Phase 1: Architecture & Technical Discovery",
            description: "System architecture, database schema, and design validation.",
            start_date: "",
            due_date: "",
            client_visible: true,
          },
        ]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProposalChange = (pId: string) => {
    setProposalId(pId);
    if (!pId) return;

    const prop = proposals.find((p) => p.id === pId);
    if (prop) {
      if (!clientId) setClientId(prop.client_id);
      setTitle(`Project: ${prop.title}`);
      if (prop.project_overview) setDescription(prop.project_overview);
      if (prop.executive_summary) setClientVisibleSummary(prop.executive_summary);
      setTotalBudget(prop.total_amount.toString());
      setCurrency(prop.currency);

      if (prop.proposal_milestones && prop.proposal_milestones.length > 0) {
        setMilestones(
          prop.proposal_milestones.map((m) => ({
            title: m.title,
            description: m.description || m.due_description || "",
            start_date: "",
            due_date: "",
            client_visible: true,
          }))
        );
      } else if (prop.proposal_deliverables && prop.proposal_deliverables.length > 0) {
        setMilestones(
          prop.proposal_deliverables.map((d) => ({
            title: d.title,
            description: d.description || "",
            start_date: "",
            due_date: "",
            client_visible: true,
          }))
        );
      }
    }
  };

  const addMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      {
        title: `Phase ${prev.length + 1}: Implementation`,
        description: "",
        start_date: "",
        due_date: "",
        client_visible: true,
      },
    ]);
  };

  const removeMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof MilestoneInput, value: unknown) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clientId) {
      setError("Please select a client for this project.");
      return;
    }
    if (!title.trim()) {
      setError("Project title is required.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        client_id: clientId,
        proposal_id: proposalId || null,
        title: title.trim(),
        description: description.trim() || null,
        project_type: projectType,
        status,
        priority,
        start_date: startDate || null,
        estimated_completion_date: completionDate || null,
        total_budget: parseFloat(totalBudget) || 0,
        currency,
        internal_notes: internalNotes.trim() || null,
        client_visible_summary: clientVisibleSummary.trim() || null,
        milestones: milestones.map((m, idx) => ({
          title: m.title.trim(),
          description: m.description.trim() || null,
          status: "pending",
          start_date: m.start_date || null,
          due_date: m.due_date || null,
          progress_percentage: 0,
          sort_order: idx,
          client_visible: m.client_visible,
        })),
      };

      const res = await fetch("/api/private/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize project");
      }

      router.push(`/private/projects/${data.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 rounded border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Core Setup Card */}
      <div className="rounded border border-ivory/10 bg-ivory/5 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-ivory uppercase font-mono tracking-wider flex items-center gap-2">
          <Layers className="h-4 w-4 text-lime" />
          Engagement Architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-ivory/60 mb-1">
              Client <span className="text-lime">*</span>
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
              required
            >
              <option value="">Select a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name ? `${c.company_name} (${c.name})` : c.name} — {c.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-ivory/60 mb-1">
              Link Accepted Proposal (Optional)
            </label>
            <select
              value={proposalId}
              onChange={(e) => handleProposalChange(e.target.value)}
              className="w-full bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
            >
              <option value="">None / Standalone Project</option>
              {proposals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.proposal_number} — {p.title} ({p.currency} {p.total_amount})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-ivory/60 mb-1">
            Project Title <span className="text-lime">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Next-Gen Enterprise RAG & Autonomous Workflow System"
            className="w-full bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-mono text-ivory/60 mb-1">
              Project Type
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
            >
              <option value="web_app">Web App / SaaS</option>
              <option value="ai_agent">AI Agent / Autonomous</option>
              <option value="rag_pipeline">RAG & Vector Knowledge</option>
              <option value="cloud_arch">Cloud & Backend Infra</option>
              <option value="design_system">Design System & UI</option>
              <option value="custom">Custom Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-ivory/60 mb-1">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
            >
              <option value="planning">Planning</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-ivory/60 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
            >
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-ivory/60 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-ivory/60 mb-1">
              Total Budget
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="w-full bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ivory/60 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ivory/60 mb-1">
              Target Completion
            </label>
            <input
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className="w-full bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-ivory/60 mb-1">
            Technical Scope & Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Executive overview of technical scope and requirements..."
            className="w-full bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-ivory/60 mb-1">
            Client-Facing Summary (Visible in Client Project Portal)
          </label>
          <textarea
            rows={2}
            value={clientVisibleSummary}
            onChange={(e) => setClientVisibleSummary(e.target.value)}
            placeholder="High-level summary visible to the client in their secure project portal..."
            className="w-full bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
          />
        </div>
      </div>

      {/* Delivery Milestones Card */}
      <div className="rounded border border-ivory/10 bg-ivory/5 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ivory uppercase font-mono tracking-wider flex items-center gap-2">
            <Calendar className="h-4 w-4 text-lime" />
            Delivery Milestones ({milestones.length})
          </h2>
          <button
            type="button"
            onClick={addMilestone}
            className="inline-flex items-center gap-1.5 rounded bg-ivory/10 px-2.5 py-1 text-xs font-mono text-ivory hover:bg-lime hover:text-obsidian transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add Milestone
          </button>
        </div>

        <div className="space-y-3">
          {milestones.map((m, index) => (
            <div
              key={index}
              className="rounded border border-ivory/10 bg-obsidian/70 p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={m.title}
                  onChange={(e) => updateMilestone(index, "title", e.target.value)}
                  placeholder="Milestone Title"
                  className="flex-1 bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-2.5 py-1.5 focus:outline-none focus:border-lime font-medium"
                />
                <button
                  type="button"
                  onClick={() => removeMilestone(index)}
                  className="text-ivory/40 hover:text-rose-400 p-1 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={m.description}
                  onChange={(e) => updateMilestone(index, "description", e.target.value)}
                  placeholder="Deliverables, scope notes, or criteria..."
                  className="md:col-span-2 bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-2.5 py-1.5 focus:outline-none focus:border-lime"
                />

                <input
                  type="date"
                  value={m.due_date}
                  onChange={(e) => updateMilestone(index, "due_date", e.target.value)}
                  className="bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-2.5 py-1.5 focus:outline-none focus:border-lime"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-ivory/60">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={m.client_visible}
                    onChange={(e) => updateMilestone(index, "client_visible", e.target.checked)}
                    className="accent-lime"
                  />
                  <span>Display milestone to client in portal</span>
                </label>
                <span className="font-mono text-[10px] text-ivory/40">Phase {index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Notes Card */}
      <div className="rounded border border-ivory/10 bg-ivory/5 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-ivory uppercase font-mono tracking-wider">
          Studio Internal Notes (Never Client-Facing)
        </h2>
        <textarea
          rows={3}
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Private engineering notes, repo links, infrastructure credentials references..."
          className="w-full bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
        />
      </div>

      {/* Submission Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-ivory/10">
        <button
          type="button"
          onClick={() => router.push("/private/projects")}
          className="px-4 py-2 text-xs font-mono text-ivory/60 hover:text-ivory transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded bg-lime px-5 py-2 text-xs font-semibold text-obsidian hover:bg-lime/90 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span>Initializing Project...</span>
          ) : (
            <>
              <FileCheck className="h-4 w-4" />
              <span>Create Project Dossier</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

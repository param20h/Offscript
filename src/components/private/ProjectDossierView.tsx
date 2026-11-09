"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  CheckCircle2,
  Clock,
  Calendar,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Send,
  Eye,
  Lock,
  FileText,
  DollarSign,
  ArrowUpRight,
  Activity,
  ChevronRight,
} from "lucide-react";
import { FullProjectDossier } from "@/app/private/(portal)/projects/[id]/page";
import {
  ProjectMilestoneRecord,
  ProjectTaskRecord,
  ProjectUpdateRecord,
} from "@/lib/db/supabase";

interface Props {
  initialDossier: FullProjectDossier;
}

export default function ProjectDossierView({ initialDossier }: Props) {
  const [dossier, setDossier] = useState<FullProjectDossier>(initialDossier);
  const [activeTab, setActiveTab] = useState<"delivery" | "updates" | "commercial" | "activity">("delivery");

  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Milestone Form State
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("");
  const [newMilestoneClientVis, setNewMilestoneClientVis] = useState(true);
  const [submittingMilestone, setSubmittingMilestone] = useState(false);

  // New Task Form State
  const [showAddTask, setShowAddTask] = useState<string | null>(null); // milestone_id or "unassigned"
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);

  // New Update Form State
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [updateType, setUpdateType] = useState("general");
  const [updateVisibility, setUpdateVisibility] = useState<"internal" | "client">("internal");
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  const project = dossier.project;
  const client = dossier.client;
  const proposal = dossier.proposal;

  const handleStatusChange = async (newStatus: string) => {
    setSavingStatus(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/private/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update project status");

      setDossier((prev) => ({
        ...prev,
        project: { ...prev.project, status: newStatus as any },
      }));
      setStatusMessage("Project status updated successfully.");
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Error updating status");
    } finally {
      setSavingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      const res = await fetch(`/api/private/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      if (res.ok) {
        setDossier((prev) => ({
          ...prev,
          project: { ...prev.project, priority: newPriority as any },
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    setSubmittingMilestone(true);
    try {
      const res = await fetch(`/api/private/projects/${project.id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newMilestoneTitle.trim(),
          description: newMilestoneDesc.trim() || null,
          due_date: newMilestoneDueDate || null,
          client_visible: newMilestoneClientVis,
          sort_order: dossier.milestones.length,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add milestone");

      setDossier((prev) => ({
        ...prev,
        milestones: [...prev.milestones, data.milestone],
        project: { ...prev.project, progress_percentage: data.progress },
      }));

      setNewMilestoneTitle("");
      setNewMilestoneDesc("");
      setNewMilestoneDueDate("");
      setShowAddMilestone(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creating milestone");
    } finally {
      setSubmittingMilestone(false);
    }
  };

  const handleToggleMilestoneStatus = async (milestone: ProjectMilestoneRecord) => {
    const nextStatus = milestone.status === "completed" ? "in_progress" : "completed";
    const nextProgress = nextStatus === "completed" ? 100 : 50;

    try {
      const res = await fetch(`/api/private/projects/${project.id}/milestones`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestone_id: milestone.id,
          status: nextStatus,
          progress_percentage: nextProgress,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDossier((prev) => ({
        ...prev,
        milestones: prev.milestones.map((m) =>
          m.id === milestone.id ? data.milestone : m
        ),
        project: { ...prev.project, progress_percentage: data.progress },
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: React.FormEvent, milestoneId: string | null) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setSubmittingTask(true);
    try {
      const res = await fetch(`/api/private/projects/${project.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestone_id: milestoneId,
          title: newTaskTitle.trim(),
          description: newTaskDesc.trim() || null,
          priority: newTaskPriority,
          due_date: newTaskDueDate || null,
          status: "todo",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add task");

      setDossier((prev) => ({
        ...prev,
        tasks: [...prev.tasks, data.task],
        project: { ...prev.project, progress_percentage: data.progress },
      }));

      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskDueDate("");
      setShowAddTask(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creating task");
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleToggleTaskStatus = async (task: ProjectTaskRecord) => {
    const nextStatus = task.status === "completed" ? "todo" : "completed";

    try {
      const res = await fetch(`/api/private/projects/${project.id}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: task.id,
          status: nextStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDossier((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === task.id ? data.task : t)),
        project: { ...prev.project, progress_percentage: data.progress },
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(
        `/api/private/projects/${project.id}/tasks?task_id=${taskId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDossier((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
        project: { ...prev.project, progress_percentage: data.progress },
      }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting task");
    }
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim() || !updateContent.trim()) return;

    setSubmittingUpdate(true);
    try {
      const res = await fetch(`/api/private/projects/${project.id}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updateTitle.trim(),
          content: updateContent.trim(),
          update_type: updateType,
          visibility: updateVisibility,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post update");

      setDossier((prev) => ({
        ...prev,
        updates: [data.update, ...prev.updates],
      }));

      setUpdateTitle("");
      setUpdateContent("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error posting update");
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!confirm("Delete this project update?")) return;

    try {
      const res = await fetch(
        `/api/private/projects/${project.id}/updates?update_id=${updateId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete update");

      setDossier((prev) => ({
        ...prev,
        updates: prev.updates.filter((u) => u.id !== updateId),
      }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting update");
    }
  };

  // Financial reconciliation
  const totalInvoiced = dossier.invoices.reduce((acc, inv) => acc + (inv.total_amount || 0), 0);
  const totalPaid = dossier.invoices.reduce((acc, inv) => acc + (inv.amount_paid || 0), 0);
  const totalBalance = dossier.invoices.reduce((acc, inv) => acc + (inv.balance_due || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overview & Delivery Status Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Project Controls & Progress */}
        <div className="lg:col-span-2 rounded border border-ivory/10 bg-ivory/5 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase text-ivory/50">DELIVERY PROGRESS</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-3xl font-bold text-lime">
                  {project.progress_percentage || 0}%
                </span>
                <span className="text-xs text-ivory/60 font-mono">
                  {dossier.milestones.filter((m) => m.status === "completed").length} of {dossier.milestones.length} milestones completed
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="block text-[10px] font-mono text-ivory/50 uppercase mb-1">
                  Status
                </label>
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={savingStatus}
                  className="bg-obsidian border border-ivory/20 rounded text-xs text-ivory px-2.5 py-1.5 focus:outline-none focus:border-lime"
                >
                  <option value="planning">Planning</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-ivory/50 uppercase mb-1">
                  Priority
                </label>
                <select
                  value={project.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="bg-obsidian border border-ivory/20 rounded text-xs text-ivory px-2.5 py-1.5 focus:outline-none focus:border-lime"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-ivory/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-lime transition-all duration-500"
              style={{ width: `${Math.min(100, project.progress_percentage || 0)}%` }}
            />
          </div>

          {statusMessage && (
            <p className="text-xs font-mono text-lime">{statusMessage}</p>
          )}

          {/* Target Dates & Client Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-ivory/10 text-xs font-mono">
            <div>
              <span className="text-ivory/40 block text-[10px]">START DATE</span>
              <span className="text-ivory">
                {project.start_date ? new Date(project.start_date).toLocaleDateString() : "—"}
              </span>
            </div>
            <div>
              <span className="text-ivory/40 block text-[10px]">TARGET DUE</span>
              <span className="text-ivory">
                {project.estimated_completion_date ? new Date(project.estimated_completion_date).toLocaleDateString() : "—"}
              </span>
            </div>
            <div>
              <span className="text-ivory/40 block text-[10px]">CLIENT CONTACT</span>
              <span className="text-ivory truncate block">
                {client?.name}
              </span>
            </div>
            <div>
              <span className="text-ivory/40 block text-[10px]">CLIENT EMAIL</span>
              <span className="text-ivory truncate block">
                {client?.email}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Commercial Reconciliation Card */}
        <div className="rounded border border-ivory/10 bg-ivory/5 p-6 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-mono uppercase text-ivory/50 flex items-center justify-between">
              <span>COMMERCIAL METRICS</span>
              <DollarSign className="h-4 w-4 text-lime" />
            </span>

            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-ivory/5 pb-1">
                <span className="text-ivory/60">Total Budget:</span>
                <span className="text-ivory font-bold">
                  {project.currency} {project.total_budget.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-ivory/5 pb-1">
                <span className="text-ivory/60">Invoiced:</span>
                <span className="text-ivory">
                  {project.currency} {totalInvoiced.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-ivory/5 pb-1">
                <span className="text-ivory/60">Collected / Paid:</span>
                <span className="text-emerald-400">
                  {project.currency} {totalPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-ivory/60">Balance Outstanding:</span>
                <span className="text-lime font-bold">
                  {project.currency} {totalBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-ivory/10 flex flex-col gap-2">
            {proposal ? (
              <Link
                href={`/private/proposals/${proposal.id}`}
                className="inline-flex items-center justify-between text-xs font-mono text-ivory/80 hover:text-lime p-2 rounded bg-obsidian border border-ivory/10 transition-colors"
              >
                <span>Scope Ref: {proposal.proposal_number}</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="text-[11px] font-mono text-ivory/40">Standalone engagement (No linked proposal)</span>
            )}
            <Link
              href={`/private/invoices/new?client_id=${project.client_id}&proposal_id=${proposal?.id || ""}`}
              className="inline-flex items-center justify-center gap-1.5 rounded bg-ivory/10 py-1.5 text-xs font-mono text-ivory hover:bg-lime hover:text-obsidian transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Generate Milestone Invoice
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-4 border-b border-ivory/10 pb-2 text-xs font-mono uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("delivery")}
          className={`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-colors ${
            activeTab === "delivery"
              ? "border-lime text-lime font-bold"
              : "border-transparent text-ivory/50 hover:text-ivory"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Milestones & Tasks ({dossier.milestones.length})
        </button>

        <button
          onClick={() => setActiveTab("updates")}
          className={`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-colors ${
            activeTab === "updates"
              ? "border-lime text-lime font-bold"
              : "border-transparent text-ivory/50 hover:text-ivory"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          Project Updates ({dossier.updates.length})
        </button>

        <button
          onClick={() => setActiveTab("commercial")}
          className={`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-colors ${
            activeTab === "commercial"
              ? "border-lime text-lime font-bold"
              : "border-transparent text-ivory/50 hover:text-ivory"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Commercial & Invoices ({dossier.invoices.length})
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 pb-2 -mb-2 border-b-2 transition-colors ${
            activeTab === "activity"
              ? "border-lime text-lime font-bold"
              : "border-transparent text-ivory/50 hover:text-ivory"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          Audit Trail
        </button>
      </div>

      {/* TAB 1: MILESTONES & TASKS */}
      {activeTab === "delivery" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ivory uppercase font-mono tracking-wider">
              Project Delivery Phases & Scope
            </h2>
            <button
              onClick={() => setShowAddMilestone(true)}
              className="inline-flex items-center gap-1.5 rounded bg-lime px-3 py-1.5 text-xs font-semibold text-obsidian hover:bg-lime/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Milestone
            </button>
          </div>

          {/* Add Milestone Form Modal/Drawer */}
          {showAddMilestone && (
            <form
              onSubmit={handleAddMilestone}
              className="rounded border border-lime/30 bg-ivory/5 p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-mono text-lime uppercase">
                  Add Delivery Milestone
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddMilestone(false)}
                  className="text-ivory/50 hover:text-ivory text-xs font-mono"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Milestone Title (e.g. Phase 2: RAG Pipeline Integration)"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="md:col-span-2 bg-obsidian border border-ivory/20 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
                  required
                />
                <input
                  type="date"
                  value={newMilestoneDueDate}
                  onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                  className="bg-obsidian border border-ivory/20 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
                />
              </div>

              <textarea
                rows={2}
                placeholder="Scope details, acceptance criteria, or technical deliverables..."
                value={newMilestoneDesc}
                onChange={(e) => setNewMilestoneDesc(e.target.value)}
                className="w-full bg-obsidian border border-ivory/20 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-ivory/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMilestoneClientVis}
                    onChange={(e) => setNewMilestoneClientVis(e.target.checked)}
                    className="accent-lime"
                  />
                  <span>Make visible to client in Project Portal</span>
                </label>

                <button
                  type="submit"
                  disabled={submittingMilestone}
                  className="rounded bg-lime px-4 py-1.5 text-xs font-semibold text-obsidian hover:bg-lime/90 disabled:opacity-50"
                >
                  {submittingMilestone ? "Creating..." : "Save Milestone"}
                </button>
              </div>
            </form>
          )}

          {/* Milestones Accordion / List */}
          {dossier.milestones.length === 0 ? (
            <div className="rounded border border-ivory/10 bg-ivory/5 p-8 text-center text-xs font-mono text-ivory/50">
              No milestones defined yet. Click "Add Milestone" to establish project scope phases.
            </div>
          ) : (
            <div className="space-y-4">
              {dossier.milestones.map((milestone, idx) => {
                const milestoneTasks = dossier.tasks.filter(
                  (t) => t.milestone_id === milestone.id
                );
                const isCompleted = milestone.status === "completed";

                return (
                  <div
                    key={milestone.id}
                    className="rounded border border-ivory/10 bg-ivory/5 p-5 space-y-4 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleMilestoneStatus(milestone)}
                          className={`mt-0.5 rounded-full p-1 border transition-colors ${
                            isCompleted
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                              : "border-ivory/30 text-transparent hover:border-lime"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-ivory/40 uppercase">
                              Phase {idx + 1}
                            </span>
                            <h3
                              className={`text-sm font-semibold ${
                                isCompleted
                                  ? "line-through text-ivory/50"
                                  : "text-ivory"
                              }`}
                            >
                              {milestone.title}
                            </h3>
                            {milestone.client_visible ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-lime bg-lime/10 px-1.5 py-0.5 rounded">
                                <Eye className="h-2.5 w-2.5" />
                                Portal
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-ivory/40 bg-ivory/10 px-1.5 py-0.5 rounded">
                                <Lock className="h-2.5 w-2.5" />
                                Internal
                              </span>
                            )}
                          </div>
                          {milestone.description && (
                            <p className="text-xs text-ivory/70 mt-1">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-ivory/60 self-end sm:self-auto">
                        {milestone.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-ivory/40" />
                            {new Date(milestone.due_date).toLocaleDateString()}
                          </span>
                        )}
                        <button
                          onClick={() =>
                            setShowAddTask(
                              showAddTask === milestone.id ? null : milestone.id
                            )
                          }
                          className="inline-flex items-center gap-1 rounded bg-ivory/10 px-2 py-1 text-[11px] text-ivory hover:bg-lime hover:text-obsidian transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                          Add Task
                        </button>
                      </div>
                    </div>

                    {/* Add Task Form */}
                    {showAddTask === milestone.id && (
                      <form
                        onSubmit={(e) => handleAddTask(e, milestone.id)}
                        className="rounded border border-ivory/20 bg-obsidian p-3 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-lime">
                            Add Task to Phase {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowAddTask(null)}
                            className="text-[11px] text-ivory/40 hover:text-ivory font-mono"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                          <input
                            type="text"
                            placeholder="Task title..."
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="md:col-span-2 bg-ivory/5 border border-ivory/10 rounded text-xs text-ivory px-2.5 py-1.5 focus:outline-none focus:border-lime"
                            required
                          />
                          <select
                            value={newTaskPriority}
                            onChange={(e) => setNewTaskPriority(e.target.value as any)}
                            className="bg-ivory/5 border border-ivory/10 rounded text-xs text-ivory px-2.5 py-1.5 focus:outline-none focus:border-lime"
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                            <option value="urgent">Urgent Priority</option>
                          </select>
                          <button
                            type="submit"
                            disabled={submittingTask}
                            className="rounded bg-lime px-3 py-1.5 text-xs font-semibold text-obsidian hover:bg-lime/90 disabled:opacity-50"
                          >
                            {submittingTask ? "Saving..." : "Create Task"}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Tasks List */}
                    {milestoneTasks.length > 0 && (
                      <div className="pt-2 border-t border-ivory/5 space-y-1.5">
                        {milestoneTasks.map((t) => {
                          const taskDone = t.status === "completed";
                          return (
                            <div
                              key={t.id}
                              className="flex items-center justify-between p-2 rounded bg-obsidian/40 border border-ivory/5 hover:border-ivory/10 text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <button
                                  onClick={() => handleToggleTaskStatus(t)}
                                  className={`rounded p-0.5 border transition-colors ${
                                    taskDone
                                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                      : "border-ivory/30 text-transparent hover:border-lime"
                                  }`}
                                >
                                  <Check className="h-2.5 w-2.5" />
                                </button>
                                <span
                                  className={`${
                                    taskDone
                                      ? "line-through text-ivory/40"
                                      : "text-ivory/90"
                                  }`}
                                >
                                  {t.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                <span
                                  className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                                    t.priority === "urgent"
                                      ? "bg-rose-500/20 text-rose-400"
                                      : t.priority === "high"
                                      ? "bg-amber-500/20 text-amber-400"
                                      : "text-ivory/40"
                                  }`}
                                >
                                  {t.priority}
                                </span>
                                <button
                                  onClick={() => handleDeleteTask(t.id)}
                                  className="text-ivory/30 hover:text-rose-400 p-0.5 transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROJECT UPDATES */}
      {activeTab === "updates" && (
        <div className="space-y-6">
          {/* Post Update Form */}
          <form
            onSubmit={handlePostUpdate}
            className="rounded border border-ivory/10 bg-ivory/5 p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ivory uppercase font-mono tracking-wider flex items-center gap-2">
                <Send className="h-4 w-4 text-lime" />
                Publish Project Update
              </h2>
              <div className="flex items-center gap-2">
                <label className="text-xs font-mono text-ivory/60">Visibility:</label>
                <select
                  value={updateVisibility}
                  onChange={(e) => setUpdateVisibility(e.target.value as any)}
                  className="bg-obsidian border border-ivory/20 rounded text-xs text-ivory px-2.5 py-1 focus:outline-none focus:border-lime"
                >
                  <option value="internal">Internal Only (Studio Confidential)</option>
                  <option value="client">Client Portal Visible</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Update Headline (e.g. Stage 1 deployed to staging environment)"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
                className="md:col-span-3 bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
                required
              />
              <select
                value={updateType}
                onChange={(e) => setUpdateType(e.target.value)}
                className="bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
              >
                <option value="general">General Progress</option>
                <option value="milestone_shipped">Milestone Shipped</option>
                <option value="blocker">Blocker / Action Required</option>
                <option value="release">Production Release</option>
              </select>
            </div>

            <textarea
              rows={3}
              placeholder="Detailed progress report, architecture notes, or staging links..."
              value={updateContent}
              onChange={(e) => setUpdateContent(e.target.value)}
              className="w-full bg-obsidian border border-ivory/10 rounded text-xs text-ivory px-3 py-2 focus:outline-none focus:border-lime"
              required
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-ivory/40">
                {updateVisibility === "client"
                  ? "✓ This update will be visible to the client in their secure portal."
                  : "🔒 Confidential studio engineering notes."}
              </span>
              <button
                type="submit"
                disabled={submittingUpdate}
                className="rounded bg-lime px-4 py-1.5 text-xs font-semibold text-obsidian hover:bg-lime/90 disabled:opacity-50"
              >
                {submittingUpdate ? "Publishing..." : "Post Update"}
              </button>
            </div>
          </form>

          {/* Updates Timeline */}
          <div className="space-y-4">
            {dossier.updates.length === 0 ? (
              <div className="rounded border border-ivory/10 bg-ivory/5 p-8 text-center text-xs font-mono text-ivory/50">
                No project updates published yet.
              </div>
            ) : (
              dossier.updates.map((up) => (
                <div
                  key={up.id}
                  className="rounded border border-ivory/10 bg-ivory/5 p-5 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                          up.visibility === "client"
                            ? "bg-lime/10 text-lime border border-lime/30"
                            : "bg-ivory/10 text-ivory/60 border border-ivory/20"
                        }`}
                      >
                        {up.visibility === "client" ? "CLIENT PORTAL" : "INTERNAL ONLY"}
                      </span>
                      <h3 className="text-sm font-semibold text-ivory">{up.title}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-ivory/40">
                        {new Date(up.created_at).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteUpdate(up.id)}
                        className="text-ivory/30 hover:text-rose-400 p-1 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-ivory/80 whitespace-pre-wrap leading-relaxed">
                    {up.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COMMERCIAL & INVOICES */}
      {activeTab === "commercial" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ivory uppercase font-mono tracking-wider">
              Linked Commercial Invoices ({dossier.invoices.length})
            </h2>
            <Link
              href={`/private/invoices/new?client_id=${project.client_id}&proposal_id=${proposal?.id || ""}`}
              className="inline-flex items-center gap-1.5 rounded bg-lime px-3 py-1.5 text-xs font-semibold text-obsidian hover:bg-lime/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Invoice for Project
            </Link>
          </div>

          {dossier.invoices.length === 0 ? (
            <div className="rounded border border-ivory/10 bg-ivory/5 p-8 text-center text-xs font-mono text-ivory/50">
              No invoices generated for this engagement yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded border border-ivory/10 bg-obsidian">
              <table className="w-full text-left text-xs">
                <thead className="bg-ivory/5 border-b border-ivory/10 text-ivory/50 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Balance Due</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory/5">
                  {dossier.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-ivory/[0.02]">
                      <td className="py-3 px-4 font-mono font-semibold text-ivory">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-ivory/10 text-ivory/80">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-ivory">
                        {inv.currency} {inv.total_amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-400">
                        {inv.currency} {inv.amount_paid.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-lime">
                        {inv.currency} {inv.balance_due.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-ivory/60">
                        {new Date(inv.due_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/private/invoices/${inv.id}`}
                          className="inline-flex items-center gap-1 rounded bg-ivory/10 px-2 py-1 text-[11px] font-mono text-ivory hover:bg-lime hover:text-obsidian"
                        >
                          <span>Manage</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-ivory uppercase font-mono tracking-wider">
            Chronological Project Activity
          </h2>
          <div className="space-y-2">
            {dossier.activities.length === 0 ? (
              <div className="rounded border border-ivory/10 bg-ivory/5 p-6 text-center text-xs font-mono text-ivory/50">
                No activity recorded yet.
              </div>
            ) : (
              dossier.activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between p-3 rounded bg-ivory/5 border border-ivory/5 text-xs font-mono"
                >
                  <div>
                    <span className="text-lime mr-2 font-bold">[{act.event_type}]</span>
                    <span className="text-ivory">{act.description}</span>
                  </div>
                  <span className="text-ivory/40 text-[10px] shrink-0 ml-4">
                    {new Date(act.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

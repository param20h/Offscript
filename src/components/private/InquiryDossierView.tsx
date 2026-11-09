"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Building,
  Calendar,
  DollarSign,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  UserPlus,
  ExternalLink,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { InquiryRecord, InquiryNoteRecord, InquiryBusinessStatus, ClientType, ClientStatus } from "@/lib/db/supabase";

const BUSINESS_STATUSES: { value: InquiryBusinessStatus; label: string }[] = [
  { value: "new", label: "New (Unreviewed)" },
  { value: "reviewing", label: "Reviewing" },
  { value: "qualified", label: "Qualified Lead" },
  { value: "proposal_in_progress", label: "Proposal In Progress" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "accepted", label: "Proposal Accepted" },
  { value: "rejected", label: "Rejected / Declined" },
  { value: "converted", label: "Converted to Active Client" },
  { value: "archived", label: "Archived" },
];

export default function InquiryDossierView({
  inquiry,
  initialNotes,
}: {
  inquiry: InquiryRecord;
  initialNotes: InquiryNoteRecord[];
}) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<InquiryBusinessStatus>(
    (inquiry.business_status as InquiryBusinessStatus) || "new"
  );
  const [convertedClientId, setConvertedClientId] = useState<string | null>(
    inquiry.converted_client_id || null
  );
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [notes, setNotes] = useState<InquiryNoteRecord[]>(initialNotes);
  const [noteContent, setNoteContent] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // Conversion Modal State
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertForm, setConvertForm] = useState({
    name: inquiry.name || "",
    company_name: inquiry.company && inquiry.company !== "Independent" ? inquiry.company : "Independent",
    email: inquiry.email || "",
    phone: "",
    website: "",
    industry: inquiry.project_type || "",
    client_type: "startup" as ClientType,
    status: "active" as ClientStatus,
    initial_note: `Client converted from qualified inquiry. Scope: ${inquiry.project_type} (${inquiry.currency} ${inquiry.budget_range}).`,
  });
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [conversionSuccessMessage, setConversionSuccessMessage] = useState<string | null>(null);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as InquiryBusinessStatus;
    setCurrentStatus(newStatus);
    setIsUpdatingStatus(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/private/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setStatusMessage("Status updated successfully.");
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setIsSubmittingNote(true);
    setNoteError(null);

    try {
      const res = await fetch(`/api/private/inquiries/${inquiry.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save note");
      }

      if (data.note) {
        setNotes([data.note, ...notes]);
      }
      setNoteContent("");
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : "Error saving note");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConverting(true);
    setConvertError(null);

    try {
      const res = await fetch(`/api/private/inquiries/${inquiry.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(convertForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to convert inquiry to client");
      }

      setConvertedClientId(data.client_id);
      setCurrentStatus("converted");
      setIsConvertModalOpen(false);
      setConversionSuccessMessage("Inquiry successfully converted into an active client record.");
      router.refresh();
    } catch (err) {
      setConvertError(err instanceof Error ? err.message : "Conversion error");
    } finally {
      setIsConverting(false);
    }
  };

  const createdDate = new Date(inquiry.created_at).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-8 relative">
      {/* Back button and converted badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/private/inquiries"
          className="inline-flex items-center gap-2 text-xs font-mono text-ivory/60 hover:text-acid transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Inquiries Directory</span>
        </Link>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          {convertedClientId ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/private/clients/${convertedClientId}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded hover:bg-emerald-500/20 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Converted Client Profile</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Link
                href={`/private/proposals/new?client_id=${convertedClientId}&inquiry_id=${inquiry.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-acid/10 border border-acid/30 text-acid rounded hover:bg-acid/20 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Draft Proposal</span>
              </Link>
            </div>
          ) : (
            <button
              onClick={() => setIsConvertModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-acid text-obsidian font-semibold rounded hover:bg-[#cbf52b] transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Convert to Client</span>
            </button>
          )}
          <span className="text-ivory/30">ID: {inquiry.id.slice(0, 8)}...</span>
        </div>
      </div>

      {conversionSuccessMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{conversionSuccessMessage}</span>
          </div>
          {convertedClientId && (
            <Link
              href={`/private/clients/${convertedClientId}`}
              className="underline text-emerald-400 font-semibold hover:text-emerald-200"
            >
              Open Client CRM Profile →
            </Link>
          )}
        </div>
      )}

      {/* Main Dossier Header Card */}
      <div className="border border-ivory/10 bg-[#141414] rounded-sm p-6 lg:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-ivory/10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-ivory">
                {inquiry.name}
              </h1>
              <span className="text-xs font-mono text-ivory/50 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                {inquiry.company && inquiry.company !== "Independent"
                  ? inquiry.company
                  : "Independent Client"}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-ivory/60 pt-1">
              <a
                href={`mailto:${inquiry.email}`}
                className="inline-flex items-center gap-1.5 text-acid hover:underline"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{inquiry.email}</span>
              </a>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-ivory/40">
                <Calendar className="w-3.5 h-3.5" />
                <span>Submitted {createdDate}</span>
              </span>
            </div>
          </div>

          {/* Workflow Status Controller */}
          <div className="bg-[#181818] border border-ivory/10 p-4 rounded-sm space-y-2 shrink-0 min-w-[280px]">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
                Business Lifecycle Status
              </label>
              {isUpdatingStatus && <Loader2 className="w-3 h-3 text-acid animate-spin" />}
            </div>

            <select
              value={currentStatus}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
              className="w-full bg-[#111111] border border-ivory/20 px-3 py-2 text-xs font-mono text-acid font-semibold rounded-sm focus:outline-none focus:border-acid transition-colors cursor-pointer"
            >
              {BUSINESS_STATUSES.map((s) => (
                <option key={s.value} value={s.value} className="bg-obsidian text-ivory font-mono">
                  {s.label}
                </option>
              ))}
            </select>

            {statusMessage && (
              <div
                className={`text-[11px] font-mono ${
                  statusMessage.includes("successfully") ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {statusMessage}
              </div>
            )}
          </div>
        </div>

        {/* Project Metrics Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-2">
          <div className="p-3.5 rounded bg-ivory/[0.02] border border-ivory/5">
            <span className="text-ivory/40 block text-[10px] uppercase mb-1">Discipline</span>
            <span className="text-ivory font-medium">{inquiry.project_type}</span>
          </div>
          <div className="p-3.5 rounded bg-ivory/[0.02] border border-ivory/5">
            <span className="text-ivory/40 block text-[10px] uppercase mb-1">Budget Scope</span>
            <span className="text-acid font-semibold">
              {inquiry.currency} {inquiry.budget_range}
            </span>
          </div>
          <div className="p-3.5 rounded bg-ivory/[0.02] border border-ivory/5">
            <span className="text-ivory/40 block text-[10px] uppercase mb-1">Target Timeline</span>
            <span className="text-ivory font-medium">{inquiry.timeline}</span>
          </div>
          <div className="p-3.5 rounded bg-ivory/[0.02] border border-ivory/5">
            <span className="text-ivory/40 block text-[10px] uppercase mb-1">Notification State</span>
            <span
              className={`font-mono capitalize ${
                inquiry.delivery_status === "delivered" ? "text-emerald-400" : "text-ivory/60"
              }`}
            >
              {inquiry.delivery_status}
            </span>
          </div>
        </div>

        {/* Full Project Brief */}
        <div className="space-y-3 pt-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-ivory/40 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Client Scope Brief</span>
          </h2>
          <div className="bg-[#111111] border border-ivory/10 p-5 rounded-sm text-sm text-ivory/90 leading-relaxed font-sans whitespace-pre-wrap selection:bg-acid selection:text-obsidian">
            {inquiry.description}
          </div>
        </div>

        {/* Technical Intake Metadata */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ivory/30">
            Intake Metadata & Telemetry
          </span>
          <div className="p-3 bg-ivory/[0.01] border border-ivory/5 rounded-sm text-[11px] font-mono text-ivory/40 flex flex-wrap gap-4">
            <span>Delivery Attempts: {inquiry.delivery_attempts}</span>
            {inquiry.last_delivery_error && (
              <span className="text-red-400">Error: {inquiry.last_delivery_error}</span>
            )}
            <span>
              IP Hash:{" "}
              {typeof inquiry.metadata?.ip_hash === "string"
                ? inquiry.metadata.ip_hash.slice(0, 16) + "..."
                : "None"}
            </span>
            <span>Created: {inquiry.created_at}</span>
            <span>Updated: {inquiry.updated_at}</span>
          </div>
        </div>
      </div>

      {/* Internal Agency Notes Section */}
      <div className="border border-ivory/10 bg-[#141414] rounded-sm p-6 lg:p-8 space-y-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-ivory flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-acid" />
            <span>Internal Studio Notes</span>
          </h2>
          <p className="text-xs font-mono text-ivory/40 mt-1">
            Private notes, qualification thoughts, proposal details, and call summaries. Never visible to the client.
          </p>
        </div>

        {/* Note Submission Form */}
        <form onSubmit={handleAddNote} className="space-y-3">
          <textarea
            rows={3}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Add internal studio qualification note, discovery call details, or client requirement..."
            className="w-full bg-[#111111] border border-ivory/15 p-3 text-xs font-mono text-ivory placeholder-ivory/30 rounded-sm focus:outline-none focus:border-acid transition-colors leading-relaxed"
          />

          {noteError && (
            <div className="text-xs font-mono text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{noteError}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingNote || !noteContent.trim()}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-acid text-obsidian text-xs font-mono font-semibold rounded-sm hover:bg-[#cbf52b] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmittingNote ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Note...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Record Internal Note</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Chronological Notes Feed */}
        <div className="space-y-3 pt-2">
          {notes.length === 0 ? (
            <div className="text-xs font-mono text-ivory/30 p-4 border border-dashed border-ivory/10 rounded-sm text-center">
              No internal notes recorded for this inquiry yet.
            </div>
          ) : (
            notes.map((note) => {
              const noteDate = new Date(note.created_at).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <div
                  key={note.id}
                  className="p-4 border border-ivory/10 bg-[#161616] rounded-sm space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-ivory/40">
                    <span className="text-acid font-semibold">{note.author}</span>
                    <span>{noteDate}</span>
                  </div>
                  <div className="text-xs font-mono text-ivory/80 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Convert to Client Modal */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-ivory/20 rounded-sm w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-ivory/10">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-acid" />
                <h3 className="font-display font-semibold text-base text-ivory">
                  Convert Inquiry to Client Profile
                </h3>
              </div>
              <button
                onClick={() => setIsConvertModalOpen(false)}
                className="text-ivory/40 hover:text-ivory transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-ivory/50">
              Review and establish a permanent client CRM record for this inquiry. The original inquiry brief will remain archived and connected.
            </p>

            {convertError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded">
                {convertError}
              </div>
            )}

            <form onSubmit={handleConvertSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={convertForm.name}
                    onChange={(e) => setConvertForm({ ...convertForm, name: e.target.value })}
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={convertForm.company_name}
                    onChange={(e) => setConvertForm({ ...convertForm, company_name: e.target.value })}
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={convertForm.email}
                    onChange={(e) => setConvertForm({ ...convertForm, email: e.target.value })}
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={convertForm.phone}
                    onChange={(e) => setConvertForm({ ...convertForm, phone: e.target.value })}
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Client Type
                  </label>
                  <select
                    value={convertForm.client_type}
                    onChange={(e) => setConvertForm({ ...convertForm, client_type: e.target.value as ClientType })}
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none cursor-pointer"
                  >
                    <option value="startup">Startup</option>
                    <option value="small_business">Small Business</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="agency">Agency</option>
                    <option value="individual">Individual</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    CRM Status
                  </label>
                  <select
                    value={convertForm.status}
                    onChange={(e) => setConvertForm({ ...convertForm, status: e.target.value as ClientStatus })}
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none cursor-pointer"
                  >
                    <option value="active">Active Client</option>
                    <option value="prospect">Prospect</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={convertForm.website}
                    onChange={(e) => setConvertForm({ ...convertForm, website: e.target.value })}
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                  Initial CRM Internal Note
                </label>
                <textarea
                  rows={2}
                  value={convertForm.initial_note}
                  onChange={(e) => setConvertForm({ ...convertForm, initial_note: e.target.value })}
                  className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-ivory/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-ivory/60 hover:text-ivory transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConverting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-acid text-obsidian font-mono text-xs font-semibold rounded hover:bg-[#cbf52b] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Client Profile...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Confirm Conversion</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

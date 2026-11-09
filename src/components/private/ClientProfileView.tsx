"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  Edit2,
  Archive,
  RefreshCw,
  MessageSquare,
  Send,
  Loader2,
  FileSpreadsheet,
  Receipt,
  FolderGit2,
  Inbox,
  ArrowRight,
  X,
  AlertCircle,
  CheckCircle2,
  Plus,
  Key,
  Copy,
  Check,
  ExternalLink,
  Layers,
} from "lucide-react";
import {
  ClientRecord,
  ClientNoteRecord,
  ClientStatus,
  ClientType,
  ProposalRecord,
  InvoiceRecord,
} from "@/lib/db/supabase";
import { formatCurrency as formatProposalCurrency } from "@/lib/proposals/pricing";
import { formatCurrency as formatInvoiceCurrency } from "@/lib/invoices/pricing";

const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: "active", label: "Active Client" },
  { value: "prospect", label: "Prospect (In Discussion)" },
  { value: "lead", label: "Qualified Lead" },
  { value: "inactive", label: "Inactive Account" },
  { value: "archived", label: "Archived" },
];

export default function ClientProfileView({
  client: initialClient,
  notes: initialNotes,
  inquiries: initialInquiries,
  proposals: initialProposals = [],
  invoices: initialInvoices = [],
  projects: initialProjects = [],
}: {
  client: ClientRecord;
  notes: ClientNoteRecord[];
  inquiries: any[];
  proposals?: ProposalRecord[];
  invoices?: InvoiceRecord[];
  projects?: any[];
}) {
  const router = useRouter();
  const [client, setClient] = useState<ClientRecord>(initialClient);
  const [notes, setNotes] = useState<ClientNoteRecord[]>(initialNotes);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Client Portal Token Management State
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [copiedPortal, setCopiedPortal] = useState(false);
  const [isGeneratingPortal, setIsGeneratingPortal] = useState(false);
  const [portalMessage, setPortalMessage] = useState<string | null>(null);

  const handleGeneratePortal = async () => {
    setIsGeneratingPortal(true);
    setPortalMessage(null);
    try {
      const res = await fetch(`/api/private/clients/${client.id}/portal-token`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate portal link");
      setPortalUrl(data.url);
      setPortalMessage("Secure client portal link generated (valid for 30 days).");
    } catch (err) {
      setPortalMessage(err instanceof Error ? err.message : "Error generating link");
    } finally {
      setIsGeneratingPortal(false);
    }
  };

  const handleRevokePortal = async () => {
    if (!confirm("Revoke client portal access? Any existing links will stop working.")) return;
    setIsGeneratingPortal(true);
    try {
      const res = await fetch(`/api/private/clients/${client.id}/portal-token`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke link");
      setPortalUrl(null);
      setPortalMessage("Client portal access revoked.");
    } catch (err) {
      setPortalMessage(err instanceof Error ? err.message : "Error revoking link");
    } finally {
      setIsGeneratingPortal(false);
    }
  };

  // Invoices summary metrics
  const totalInvoiced = initialInvoices.reduce(
    (acc, inv) => acc + (inv.status !== "void" && inv.status !== "cancelled" ? Number(inv.total_amount) : 0),
    0
  );
  const totalPaid = initialInvoices.reduce((acc, inv) => acc + Number(inv.amount_paid || 0), 0);
  const totalDue = initialInvoices.reduce(
    (acc, inv) => acc + (inv.status !== "void" && inv.status !== "cancelled" ? Number(inv.balance_due || 0) : 0),
    0
  );
  const primaryCurrency = initialInvoices[0]?.currency || "INR";

  // Note submission state
  const [noteContent, setNoteContent] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: client.name || "",
    company_name: client.company_name || "",
    email: client.email || "",
    phone: client.phone || "",
    website: client.website || "",
    industry: client.industry || "",
    company_size: client.company_size || "",
    address: client.address || "",
    client_type: client.client_type || "startup",
    status: client.status || "active",
    notes: client.notes || "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: ClientStatus) => {
    setIsUpdatingStatus(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/private/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update client status");
      }

      setClient({ ...client, status: newStatus });
      setStatusMessage("Client status updated successfully.");
      setTimeout(() => setStatusMessage(null), 3000);
      router.refresh();
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
      const res = await fetch(`/api/private/clients/${client.id}/notes`, {
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEdit(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/private/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update client");
      }

      setClient(data.client);
      setIsEditModalOpen(false);
      setStatusMessage("Client profile updated.");
      setTimeout(() => setStatusMessage(null), 3000);
      router.refresh();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "lead":
        return "bg-acid/10 text-acid border-acid/30";
      case "prospect":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "inactive":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "archived":
        return "bg-ivory/10 text-ivory/40 border-ivory/20";
      default:
        return "bg-ivory/10 text-ivory/60 border-ivory/20";
    }
  };

  const createdStr = new Date(client.created_at).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="space-y-8">
      {/* Navigation and Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/private/clients"
          className="inline-flex items-center gap-2 text-xs font-mono text-ivory/60 hover:text-acid transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Clients Directory</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-ivory/15 hover:border-acid text-xs font-mono text-ivory rounded transition-colors cursor-pointer"
          >
            <Edit2 className="w-3 h-3 text-acid" />
            <span>Edit Profile</span>
          </button>
          {client.status === "archived" ? (
            <button
              onClick={() => handleStatusChange("active")}
              disabled={isUpdatingStatus}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded hover:bg-emerald-500/20 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reactivate</span>
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange("archived")}
              disabled={isUpdatingStatus}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-ivory/15 hover:border-red-400/40 text-xs font-mono text-ivory/50 hover:text-red-400 rounded transition-colors cursor-pointer"
            >
              <Archive className="w-3 h-3" />
              <span>Archive</span>
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Client Profile Header */}
      <div className="border border-ivory/10 bg-[#141414] rounded-sm p-6 lg:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-ivory/10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-ivory">
                {client.name}
              </h1>
              <span
                className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border ${getStatusBadge(
                  client.status
                )}`}
              >
                {client.status}
              </span>
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border border-ivory/10 text-ivory/40 bg-ivory/[0.02]">
                {client.client_type.replace(/_/g, " ")}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-ivory/60 pt-1 flex-wrap">
              <span className="flex items-center gap-1.5 text-ivory">
                <Building className="w-3.5 h-3.5 text-ivory/40" />
                <span>{client.company_name}</span>
              </span>
              {client.industry && (
                <>
                  <span>•</span>
                  <span>{client.industry}</span>
                </>
              )}
              <span>•</span>
              <span className="text-ivory/40">Since {createdStr}</span>
            </div>
          </div>

          {/* Status Quick Controller */}
          <div className="bg-[#181818] border border-ivory/10 p-4 rounded-sm space-y-2 shrink-0 min-w-[260px]">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono uppercase tracking-wider text-ivory/50">
                CRM Account Status
              </label>
              {isUpdatingStatus && <Loader2 className="w-3 h-3 text-acid animate-spin" />}
            </div>

            <select
              value={client.status}
              onChange={(e) => handleStatusChange(e.target.value as ClientStatus)}
              disabled={isUpdatingStatus}
              className="w-full bg-[#111111] border border-ivory/20 px-3 py-2 text-xs font-mono text-acid font-semibold rounded-sm focus:outline-none focus:border-acid transition-colors cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-obsidian text-ivory font-mono">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact & Company Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono pt-2">
          <div className="p-3.5 rounded bg-ivory/[0.02] border border-ivory/5 space-y-1">
            <span className="text-ivory/40 block text-[10px] uppercase">Email</span>
            <a
              href={`mailto:${client.email}`}
              className="text-acid hover:underline block truncate font-medium"
            >
              {client.email}
            </a>
          </div>

          <div className="p-3.5 rounded bg-ivory/[0.02] border border-ivory/5 space-y-1">
            <span className="text-ivory/40 block text-[10px] uppercase">Phone</span>
            <span className="text-ivory/80 block truncate">
              {client.phone || "Not recorded"}
            </span>
          </div>

          <div className="p-3.5 rounded bg-ivory/[0.02] border border-ivory/5 space-y-1">
            <span className="text-ivory/40 block text-[10px] uppercase">Website</span>
            {client.website ? (
              <a
                href={client.website.startsWith("http") ? client.website : `https://${client.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-acid hover:underline block truncate font-medium"
              >
                {client.website.replace(/^https?:\/\//, "")}
              </a>
            ) : (
              <span className="text-ivory/40">None</span>
            )}
          </div>

          <div className="p-3.5 rounded bg-ivory/[0.02] border border-ivory/5 space-y-1">
            <span className="text-ivory/40 block text-[10px] uppercase">Company Size</span>
            <span className="text-ivory/80 block truncate">
              {client.company_size || "Not specified"}
            </span>
          </div>
        </div>

        {/* Overview & Address */}
        {(client.notes || client.address) && (
          <div className="pt-2 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
            {client.notes && (
              <div className="p-4 bg-ivory/[0.01] border border-ivory/10 rounded space-y-1">
                <span className="text-ivory/40 text-[10px] uppercase block">Client Overview</span>
                <p className="text-ivory/80 leading-relaxed font-sans text-xs">{client.notes}</p>
              </div>
            )}
            {client.address && (
              <div className="p-4 bg-ivory/[0.01] border border-ivory/10 rounded space-y-1">
                <span className="text-ivory/40 text-[10px] uppercase block">Billing Address</span>
                <p className="text-ivory/80 leading-relaxed font-sans text-xs">{client.address}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Internal CRM Notes Section */}
      <div className="border border-ivory/10 bg-[#141414] rounded-sm p-6 lg:p-8 space-y-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-ivory flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-acid" />
            <span>Internal CRM Notes</span>
          </h2>
          <p className="text-xs font-mono text-ivory/40 mt-1">
            Private studio logs, call summaries, contract negotiations, and client communication context.
          </p>
        </div>

        {/* Note Form */}
        <form onSubmit={handleAddNote} className="space-y-3">
          <textarea
            rows={3}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Log call summary, client feedback, project scope expansion or payment discussion..."
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
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-acid text-obsidian text-xs font-mono font-semibold rounded-sm hover:bg-[#cbf52b] transition-all disabled:opacity-40 cursor-pointer"
            >
              {isSubmittingNote ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Recording Note...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Save CRM Note</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Notes Feed */}
        <div className="space-y-3 pt-2">
          {notes.length === 0 ? (
            <div className="text-xs font-mono text-ivory/30 p-4 border border-dashed border-ivory/10 rounded-sm text-center">
              No internal notes recorded for this client yet.
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

      {/* Connected Original Inquiries */}
      <div className="border border-ivory/10 bg-[#141414] rounded-sm p-6 lg:p-8 space-y-4">
        <div>
          <h2 className="font-display text-base font-semibold text-ivory flex items-center gap-2">
            <Inbox className="w-4 h-4 text-ivory/60" />
            <span>Connected Website Inquiries ({initialInquiries.length})</span>
          </h2>
          <p className="text-xs font-mono text-ivory/40 mt-0.5">
            Original intake briefs and project requirements submitted by this client.
          </p>
        </div>

        {initialInquiries.length === 0 ? (
          <div className="text-xs font-mono text-ivory/30 p-4 border border-dashed border-ivory/10 rounded-sm text-center">
            No connected website inquiries. Client was created directly.
          </div>
        ) : (
          <div className="divide-y divide-ivory/5">
            {initialInquiries.map((inq: any) => (
              <div
                key={inq.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-ivory font-medium">
                    <span>{inq.project_type}</span>
                    <span className="text-ivory/40">•</span>
                    <span className="text-acid">
                      {inq.currency} {inq.budget_range}
                    </span>
                    <span className="text-ivory/40">•</span>
                    <span className="text-ivory/50">{inq.timeline}</span>
                  </div>
                  <div className="text-[11px] font-mono text-ivory/40">
                    Submitted {new Date(inq.created_at).toLocaleDateString()}
                  </div>
                </div>

                <Link
                  href={`/private/inquiries/${inq.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ivory/[0.03] hover:bg-ivory/[0.08] text-xs font-mono text-ivory rounded transition-colors self-start sm:self-auto"
                >
                  <span>View Original Brief</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Commercial Proposals & Scopes (Phase 3C Active) */}
      <div className="border border-ivory/10 bg-[#141414] rounded-sm p-6 lg:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-ivory flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-acid" />
              <span>Commercial Proposals & Scopes ({initialProposals.length})</span>
            </h2>
            <p className="text-xs font-mono text-ivory/40 mt-0.5">
              Executive architectural proposals, milestone payment plans, and vector PDF agreements.
            </p>
          </div>

          <Link
            href={`/private/proposals/new?client_id=${client.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Proposal</span>
          </Link>
        </div>

        {initialProposals.length === 0 ? (
          <div className="text-xs font-mono text-ivory/30 p-6 border border-dashed border-ivory/10 rounded-sm text-center space-y-2">
            <div>No proposals drafted for this account yet.</div>
            <Link
              href={`/private/proposals/new?client_id=${client.id}`}
              className="inline-block text-xs font-mono text-acid underline hover:text-acid/80"
            >
              Draft initial scope proposal &rarr;
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ivory/5 border border-ivory/10 bg-obsidian/40 rounded-sm overflow-hidden">
            {initialProposals.map((prop) => (
              <div
                key={prop.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-acid">
                      {prop.proposal_number}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs bg-white/5 border border-ivory/10 text-ivory/60">
                      {prop.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-ivory">
                    {prop.title}
                  </div>
                  <div className="text-[11px] font-mono text-ivory/40">
                    Created {new Date(prop.created_at).toLocaleDateString()}
                    {prop.valid_until && ` • Valid until ${new Date(prop.valid_until).toLocaleDateString()}`}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-ivory">
                      {formatProposalCurrency(prop.total_amount, prop.currency)}
                    </div>
                    <div className="text-[10px] font-mono text-ivory/40">
                      Advance {prop.advance_percentage}%
                    </div>
                  </div>

                  <Link
                    href={`/private/proposals/${prop.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-ivory/10 hover:border-acid/40 text-ivory hover:text-acid text-xs font-mono transition-colors rounded-sm"
                  >
                    <span>Dossier</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoices & Billing (Phase 3D Active) */}
      <div className="border border-ivory/10 bg-[#141414] rounded-sm p-6 lg:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-ivory flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Invoices & Financial Ledger ({initialInvoices.length})</span>
            </h2>
            <p className="text-xs font-mono text-ivory/40 mt-0.5">
              Advance retainers, milestone billings, payment ledger, and PDF invoices.
            </p>
          </div>

          <Link
            href={`/private/invoices/new?client_id=${client.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </Link>
        </div>

        {/* Financial Stat Pills */}
        {initialInvoices.length > 0 && (
          <div className="grid grid-cols-3 gap-3 p-3 bg-obsidian/60 border border-ivory/5 rounded-sm font-mono text-xs">
            <div>
              <div className="text-[10px] text-ivory/40 uppercase tracking-wider">Total Invoiced</div>
              <div className="text-sm font-bold text-ivory mt-0.5">
                {formatInvoiceCurrency(totalInvoiced, primaryCurrency)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400/80 uppercase tracking-wider">Collected Revenue</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">
                {formatInvoiceCurrency(totalPaid, primaryCurrency)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-amber-400/80 uppercase tracking-wider">Outstanding Balance</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">
                {formatInvoiceCurrency(totalDue, primaryCurrency)}
              </div>
            </div>
          </div>
        )}

        {initialInvoices.length === 0 ? (
          <div className="text-xs font-mono text-ivory/30 p-6 border border-dashed border-ivory/10 rounded-sm text-center space-y-2">
            <div>No invoices generated for this client account.</div>
            <Link
              href={`/private/invoices/new?client_id=${client.id}`}
              className="inline-block text-xs font-mono text-acid underline hover:text-acid/80"
            >
              Issue an advance or custom invoice &rarr;
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ivory/5 border border-ivory/10 bg-obsidian/40 rounded-sm overflow-hidden">
            {initialInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-acid">
                      {inv.invoice_number}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs bg-white/5 border border-ivory/10 text-ivory/60">
                      {inv.invoice_type}
                    </span>
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs font-bold ${
                      inv.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : inv.status === "partially_paid"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : inv.status === "overdue"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-white/5 text-ivory/60 border border-ivory/10"
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-ivory">
                    {inv.notes || `${inv.invoice_type.toUpperCase()} Billing`}
                  </div>
                  <div className="text-[11px] font-mono text-ivory/40">
                    Issued {new Date(inv.issue_date).toLocaleDateString()}
                    {inv.due_date && ` • Due ${new Date(inv.due_date).toLocaleDateString()}`}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-ivory">
                      {formatInvoiceCurrency(Number(inv.total_amount), inv.currency)}
                    </div>
                    {Number(inv.balance_due) > 0 && inv.status !== "paid" && (
                      <div className="text-[10px] font-mono text-amber-400/80">
                        Due: {formatInvoiceCurrency(Number(inv.balance_due), inv.currency)}
                      </div>
                    )}
                    {inv.status === "paid" && (
                      <div className="text-[10px] font-mono text-emerald-400/80">
                        Fully Settled
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/private/invoices/${inv.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-ivory/10 hover:border-acid/40 text-ivory hover:text-acid text-xs font-mono transition-colors rounded-sm"
                  >
                    <span>Dossier</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Projects & Deliverables */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-acid" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-ivory">
              Active Projects & Deliverables ({initialProjects.length})
            </h3>
          </div>
          <Link
            href={`/private/projects/new?client_id=${client.id}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-acid/10 hover:bg-acid/20 border border-acid/30 text-acid text-xs font-mono rounded-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Initialize Project</span>
          </Link>
        </div>

        {initialProjects.length === 0 ? (
          <div className="p-8 border border-ivory/10 bg-obsidian/40 rounded-sm text-center">
            <p className="text-xs font-mono text-ivory/40">
              No active projects created for this client yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-ivory/5 border border-ivory/10 bg-obsidian/40 rounded-sm overflow-hidden">
            {initialProjects.map((prj: any) => (
              <div
                key={prj.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-acid">
                      {prj.project_number}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs bg-white/5 border border-ivory/10 text-ivory/60">
                      {prj.project_type}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs bg-lime/10 text-lime border border-lime/20">
                      {prj.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-ivory">
                    {prj.title}
                  </div>
                  <div className="text-[11px] font-mono text-ivory/40">
                    Delivery Progress: {prj.progress_percentage || 0}%
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <Link
                    href={`/private/projects/${prj.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-ivory/10 hover:border-acid/40 text-ivory hover:text-acid text-xs font-mono transition-colors rounded-sm"
                  >
                    <span>Dossier</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Client-Facing Portal Access Control */}
      <div className="border border-ivory/10 bg-obsidian/50 p-5 rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ivory/10">
          <div className="space-y-0.5">
            <div className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-1.5 font-bold">
              <Key className="w-3.5 h-3.5" />
              <span>Client Project Portal Link (Token Security)</span>
            </div>
            <p className="text-[11px] font-mono text-ivory/40">
              Grant client read-only access to their live deliverables, milestones, proposals, and invoices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isGeneratingPortal}
              onClick={handleGeneratePortal}
              className="px-3 py-1.5 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 disabled:opacity-50 transition-colors"
            >
              {isGeneratingPortal ? "Generating..." : portalUrl ? "Regenerate Link" : "Generate Portal Link"}
            </button>

            {portalUrl && (
              <button
                type="button"
                disabled={isGeneratingPortal}
                onClick={handleRevokePortal}
                className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded-sm hover:bg-rose-500/20 transition-colors"
              >
                Revoke
              </button>
            )}
          </div>
        </div>

        {portalMessage && (
          <p className="text-xs font-mono text-lime">{portalMessage}</p>
        )}

        {portalUrl && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={portalUrl}
                className="flex-1 bg-obsidian border border-ivory/20 rounded text-xs font-mono text-ivory px-3 py-2 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(portalUrl);
                  setCopiedPortal(true);
                  setTimeout(() => setCopiedPortal(false), 2000);
                }}
                className="px-3 py-2 bg-ivory/10 hover:bg-lime hover:text-obsidian text-xs font-mono text-ivory rounded transition-colors flex items-center gap-1"
              >
                {copiedPortal ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPortal ? "Copied" : "Copy"}</span>
              </button>
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-ivory/10 hover:bg-ivory/20 text-xs font-mono text-ivory rounded transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Edit Client Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-ivory/20 rounded-sm w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-ivory/10">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-acid" />
                <h3 className="font-display font-semibold text-base text-ivory">
                  Edit Client Profile
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-ivory/40 hover:text-ivory transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={editForm.company_name}
                    onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
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
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                    Client Type
                  </label>
                  <select
                    value={editForm.client_type}
                    onChange={(e) => setEditForm({ ...editForm, client_type: e.target.value as ClientType })}
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
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ClientStatus })}
                    className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="prospect">Prospect</option>
                    <option value="lead">Lead</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                  Billing Address
                </label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Street address, city, country"
                  className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-ivory/60 mb-1">
                  Internal Overview / Notes
                </label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full bg-[#181818] border border-ivory/15 px-3 py-2 text-xs font-mono text-ivory rounded focus:border-acid focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-ivory/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-ivory/60 hover:text-ivory transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-acid text-obsidian font-mono text-xs font-semibold rounded hover:bg-[#cbf52b] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
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

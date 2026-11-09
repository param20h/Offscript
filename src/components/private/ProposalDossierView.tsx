"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  ExternalLink,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  Mail,
  Calendar,
  Layers,
  Receipt,
  FileCheck,
  History,
  AlertCircle,
  Lock,
  ChevronDown,
  Key,
  Copy,
  Check,
  Eye,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { ProposalDetailData } from "@/app/private/(portal)/proposals/[id]/page";
import { ProposalStatus } from "@/lib/db/supabase";
import { formatCurrency } from "@/lib/proposals/pricing";
import { ProposalTokenMetadata } from "@/lib/proposals/tokens";

export default function ProposalDossierView({
  initialData,
}: {
  initialData: ProposalDetailData;
}) {
  const [data, setData] = useState<ProposalDetailData>(initialData);
  const [isSending, setIsSending] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Client access token state
  const [tokenMeta, setTokenMeta] = useState<ProposalTokenMetadata | undefined>(
    initialData.tokenMetadata
  );
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isManagingToken, setIsManagingToken] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(30);

  const { proposal, client, items, deliverables, milestones, activity } = data;
  const isAccepted = proposal.status === "accepted";

  // Generate or Regenerate Client Access Link
  const handleGenerateToken = async () => {
    setIsManagingToken(true);
    setActionError(null);
    setActionSuccess(null);
    setCopiedLink(false);

    try {
      const res = await fetch(`/api/private/proposals/${proposal.id}/access-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresInDays }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to generate client link");
      }

      setGeneratedUrl(resData.accessUrl);
      setTokenMeta({
        exists: true,
        expires_at: resData.expiresAt,
        revoked_at: null,
        last_accessed_at: null,
        access_count: 0,
        is_active: true,
        is_expired: false,
        is_revoked: false,
      });

      setActionSuccess("Cryptographically secure client access link generated successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate link";
      setActionError(message);
    } finally {
      setIsManagingToken(false);
    }
  };

  // Revoke Client Access Link
  const handleRevokeToken = async () => {
    if (
      !confirm(
        "Are you sure you want to revoke this client access link? The client will immediately be denied access."
      )
    ) {
      return;
    }

    setIsManagingToken(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/private/proposals/${proposal.id}/access-token`, {
        method: "DELETE",
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to revoke client link");
      }

      setGeneratedUrl(null);
      setTokenMeta((prev) =>
        prev
          ? {
              ...prev,
              revoked_at: new Date().toISOString(),
              is_active: false,
              is_revoked: true,
            }
          : undefined
      );

      setActionSuccess("Client access link revoked immediately. Token hash invalidated.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to revoke link";
      setActionError(message);
    } finally {
      setIsManagingToken(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Handle status update
  const handleUpdateStatus = async (newStatus: ProposalStatus, note?: string) => {
    setStatusUpdating(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/private/proposals/${proposal.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to update status");
      }

      setData((prev) => ({
        ...prev,
        proposal: {
          ...prev.proposal,
          status: newStatus,
          accepted_at: newStatus === "accepted" ? new Date().toISOString() : prev.proposal.accepted_at,
          rejected_at: newStatus === "rejected" ? new Date().toISOString() : prev.proposal.rejected_at,
        },
        activity: [
          {
            id: `act-${Date.now()}`,
            proposal_id: proposal.id,
            event_type: "status_changed",
            actor: "admin",
            description: `Status changed to ${newStatus}`,
            metadata: { previous_status: proposal.status, new_status: newStatus, note },
            created_at: new Date().toISOString(),
          },
          ...prev.activity,
        ],
      }));

      setActionSuccess(`Status successfully transitioned to ${newStatus}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed";
      setActionError(message);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle email send
  const handleSendProposal = async () => {
    setIsSending(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/private/proposals/${proposal.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custom_message: customMessage.trim() || undefined }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to dispatch proposal");
      }

      setData((prev) => ({
        ...prev,
        proposal: {
          ...prev.proposal,
          status: prev.proposal.status === "draft" || prev.proposal.status === "ready" ? "sent" : prev.proposal.status,
          sent_at: resData.sent_at || new Date().toISOString(),
          delivery_status: resData.delivery_status || "accepted_by_provider",
          resend_id: resData.messageId || null,
        },
        activity: [
          {
            id: `act-${Date.now()}`,
            proposal_id: proposal.id,
            event_type: "sent",
            actor: "admin",
            description: "Proposal sent to client via Resend",
            metadata: { sent_to: client.email, resend_id: resData.messageId },
            created_at: new Date().toISOString(),
          },
          ...prev.activity,
        ],
      }));

      setShowSendModal(false);
      setActionSuccess(`Proposal vector PDF successfully dispatched to ${client.email} via Resend.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Dispatch failed";
      setActionError(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-sm flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {isAccepted && (
        <div className="p-4 bg-acid/10 border border-acid/20 text-acid text-xs font-mono rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Commercial terms accepted and locked on {new Date(proposal.accepted_at!).toLocaleDateString()}. Ready for billing.</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/private/invoices/new?client_id=${client.id}&proposal_id=${proposal.id}&type=advance`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 transition-colors"
            >
              <span>+ Generate Advance Invoice</span>
            </Link>
            <Link
              href={`/private/invoices/new?client_id=${client.id}&proposal_id=${proposal.id}&type=milestone`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 border border-acid/30 text-ivory text-xs font-mono rounded-sm hover:bg-white/20 transition-colors"
            >
              <span>+ Milestone Invoice</span>
            </Link>
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="bg-obsidian-light/60 border border-ivory/10 p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/private/proposals/${proposal.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-ivory/10 hover:border-ivory/30 text-ivory text-xs font-mono rounded-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View PDF</span>
          </a>

          <a
            href={`/api/private/proposals/${proposal.id}/pdf?download=true`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-ivory/10 hover:border-ivory/30 text-ivory text-xs font-mono rounded-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Vector PDF</span>
          </a>

          <button
            type="button"
            onClick={() => setShowSendModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{proposal.status === "sent" ? "Resend to Client" : "Send to Client"}</span>
          </button>

          <Link
            href={`/private/projects/new?proposal_id=${proposal.id}&client_id=${proposal.client_id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lime/10 border border-lime/30 text-lime text-xs font-mono font-bold rounded-sm hover:bg-lime hover:text-obsidian transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Convert to Project</span>
          </Link>
        </div>

        {/* Status Transition Control */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-ivory/40">Status:</span>
          {proposal.status !== "accepted" && (
            <button
              type="button"
              disabled={statusUpdating}
              onClick={() => handleUpdateStatus("accepted", "Accepted by client")}
              className="px-2.5 py-1 text-xs font-mono bg-acid/10 hover:bg-acid/20 border border-acid/30 text-acid rounded-sm transition-colors"
            >
              Mark Accepted
            </button>
          )}

          {proposal.status !== "rejected" && proposal.status !== "accepted" && (
            <button
              type="button"
              disabled={statusUpdating}
              onClick={() => handleUpdateStatus("rejected", "Declined by client")}
              className="px-2.5 py-1 text-xs font-mono bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-sm transition-colors"
            >
              Mark Rejected
            </button>
          )}

          {proposal.status === "draft" && (
            <button
              type="button"
              disabled={statusUpdating}
              onClick={() => handleUpdateStatus("ready", "Marked ready for delivery")}
              className="px-2.5 py-1 text-xs font-mono bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-sm transition-colors"
            >
              Mark Ready
            </button>
          )}

          {proposal.status !== "withdrawn" && proposal.status !== "accepted" && (
            <button
              type="button"
              disabled={statusUpdating}
              onClick={() => handleUpdateStatus("withdrawn", "Withdrawn by studio")}
              className="px-2.5 py-1 text-xs font-mono bg-white/5 hover:bg-white/10 border border-ivory/10 text-ivory/40 rounded-sm transition-colors"
            >
              Withdraw
            </button>
          )}
        </div>
      </div>

      {/* Client Access Link & Document Viewer Control Panel */}
      <div className="bg-obsidian-light/60 border border-ivory/10 p-5 rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ivory/10">
          <div className="space-y-0.5">
            <div className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-1.5 font-bold">
              <Key className="w-3.5 h-3.5" />
              <span>Client-Facing Document Access (Token Security)</span>
            </div>
            <p className="text-[11px] font-mono text-ivory/40">
              Generate isolated, read-only proposal viewer links for clients. SHA-256 hashed in Supabase; zero admin exposure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {tokenMeta?.is_active ? (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Link
              </span>
            ) : tokenMeta?.is_revoked ? (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-xs bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                Revoked
              </span>
            ) : tokenMeta?.is_expired ? (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                Expired
              </span>
            ) : (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-xs bg-white/5 text-ivory/50 border border-ivory/10">
                No Link Generated
              </span>
            )}
          </div>
        </div>

        {/* Generated URL copy bar */}
        {generatedUrl && (
          <div className="p-3 bg-acid/10 border border-acid/30 rounded-sm space-y-2">
            <div className="text-[11px] font-mono text-acid font-semibold flex items-center justify-between">
              <span>Secure Client URL Generated:</span>
              <span className="text-[10px] text-ivory/60 font-normal">Single-time display for security</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedUrl}
                className="w-full bg-obsidian border border-acid/40 px-3 py-1.5 text-xs font-mono text-ivory rounded-sm focus:outline-hidden selection:bg-acid selection:text-obsidian"
              />
              <button
                type="button"
                onClick={() => handleCopy(generatedUrl)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-acid text-obsidian text-xs font-mono font-bold uppercase rounded-sm hover:bg-acid/90 transition-colors shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </button>
              <a
                href={generatedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-ivory text-xs font-mono rounded-sm transition-colors shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Test View</span>
              </a>
            </div>
          </div>
        )}

        {/* Telemetry and Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-obsidian/60 border border-ivory/5 rounded-sm">
            <div className="text-[10px] text-ivory/40 uppercase">Expiration Date</div>
            <div className="text-ivory font-semibold mt-1">
              {tokenMeta?.expires_at ? new Date(tokenMeta.expires_at).toLocaleDateString() : "—"}
            </div>
          </div>

          <div className="p-3 bg-obsidian/60 border border-ivory/5 rounded-sm">
            <div className="text-[10px] text-ivory/40 uppercase">Client Access Count</div>
            <div className="text-ivory font-semibold mt-1">
              {tokenMeta?.access_count || 0} views
            </div>
          </div>

          <div className="p-3 bg-obsidian/60 border border-ivory/5 rounded-sm">
            <div className="text-[10px] text-ivory/40 uppercase">Last Accessed</div>
            <div className="text-ivory font-semibold mt-1">
              {tokenMeta?.last_accessed_at ? new Date(tokenMeta.last_accessed_at).toLocaleString() : "Never"}
            </div>
          </div>

          <div className="p-3 bg-obsidian/60 border border-ivory/5 rounded-sm flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-ivory/40 uppercase">Validity (Days)</div>
              <input
                type="number"
                min={1}
                max={365}
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 30)}
                className="w-16 bg-obsidian border border-ivory/20 px-2 py-0.5 text-xs text-ivory rounded-sm mt-0.5 focus:border-acid focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isManagingToken}
                onClick={handleGenerateToken}
                className="px-2.5 py-1.5 bg-acid text-obsidian text-[11px] font-mono font-bold uppercase rounded-sm hover:bg-acid/90 transition-colors disabled:opacity-50"
              >
                {tokenMeta?.exists ? "Regenerate" : "Generate"}
              </button>
              {tokenMeta?.is_active && (
                <button
                  type="button"
                  disabled={isManagingToken}
                  onClick={handleRevokeToken}
                  className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-sm transition-colors"
                  title="Revoke access immediately"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Client & Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client & Metadata Card */}
        <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-acid flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            <span>Target Account</span>
          </div>

          <div>
            <Link
              href={`/private/clients/${client.id}`}
              className="text-base font-semibold text-ivory hover:text-acid transition-colors flex items-center gap-1"
            >
              <span>{client.name}</span>
              <ExternalLink className="w-3 h-3 text-ivory/40" />
            </Link>
            {client.company_name && (
              <div className="text-xs font-mono text-ivory/60 mt-0.5">{client.company_name}</div>
            )}
            <div className="text-xs font-mono text-ivory/40 mt-1 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{client.email}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-ivory/10 space-y-1 text-[11px] font-mono text-ivory/50">
            <div className="flex justify-between">
              <span>Created:</span>
              <span className="text-ivory">{new Date(proposal.created_at).toLocaleDateString()}</span>
            </div>
            {proposal.valid_until && (
              <div className="flex justify-between">
                <span>Valid Until:</span>
                <span className="text-ivory">{new Date(proposal.valid_until).toLocaleDateString()}</span>
              </div>
            )}
            {proposal.sent_at && (
              <div className="flex justify-between">
                <span>Dispatched:</span>
                <span className="text-amber-400">{new Date(proposal.sent_at).toLocaleDateString()}</span>
              </div>
            )}
            {proposal.accepted_at && (
              <div className="flex justify-between">
                <span>Accepted:</span>
                <span className="text-acid">{new Date(proposal.accepted_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Commercial Figures Card */}
        <div className="md:col-span-2 bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-acid">
              Commercial Summary ({proposal.currency})
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <div className="text-[10px] font-mono text-ivory/40">Subtotal</div>
                <div className="text-base font-mono font-semibold text-ivory">
                  {formatCurrency(proposal.subtotal, proposal.currency)}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-ivory/40">Discount</div>
                <div className="text-base font-mono font-semibold text-ivory/70">
                  -{formatCurrency(proposal.discount_amount, proposal.currency)}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-ivory/40">Tax / GST</div>
                <div className="text-base font-mono font-semibold text-ivory/70">
                  +{formatCurrency(proposal.tax_amount || 0, proposal.currency)}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono text-acid">Total Investment</div>
                <div className="text-xl font-mono font-bold text-acid">
                  {formatCurrency(proposal.total_amount, proposal.currency)}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-ivory/10 flex items-center justify-between text-xs font-mono">
            <span className="text-ivory/60">
              Required Advance Deposit ({proposal.advance_percentage}%):
            </span>
            <span className="text-base font-bold text-ivory">
              {formatCurrency(proposal.advance_amount, proposal.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Scope Summary Description */}
      {proposal.executive_summary && (
        <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/40 mb-2">
            Executive Summary
          </div>
          <p className="text-xs font-mono text-ivory/80 leading-relaxed whitespace-pre-line">
            {proposal.executive_summary}
          </p>
        </div>
      )}

      {/* Scope Items Table */}
      <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          <span>Scope Breakdown & Line Items</span>
        </div>

        <div className="border border-ivory/10 rounded-sm overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-obsidian-light/60 border-b border-ivory/10 text-ivory/40 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3">Item & Specifications</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3 text-right">Rate</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory/10">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02]">
                  <td className="p-3">
                    <div className="font-semibold text-ivory">{item.title}</div>
                    {item.description && (
                      <div className="text-[11px] text-ivory/50 mt-0.5">{item.description}</div>
                    )}
                  </td>
                  <td className="p-3 text-right text-ivory/70">{item.quantity}</td>
                  <td className="p-3 text-right text-ivory/70">
                    {formatCurrency(item.unit_price, proposal.currency)}
                  </td>
                  <td className="p-3 text-right font-bold text-ivory">
                    {formatCurrency(item.total_price, proposal.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deliverables & Milestones Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deliverables */}
        <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Technical Deliverables</span>
          </div>

          <div className="space-y-2.5">
            {deliverables.map((deliv, idx) => (
              <div
                key={deliv.id}
                className="p-3 bg-obsidian/60 border border-ivory/10 rounded-sm flex items-start justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-semibold text-ivory">
                    {idx + 1}. {deliv.title}
                  </div>
                  {deliv.description && (
                    <div className="text-[11px] font-mono text-ivory/50 mt-1">
                      {deliv.description}
                    </div>
                  )}
                </div>
                {deliv.acceptance_criteria && (
                  <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-xs bg-white/5 border border-ivory/10 text-ivory/60">
                    {deliv.acceptance_criteria}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Milestone Payment Schedule</span>
          </div>

          <div className="space-y-2.5">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="p-3 bg-obsidian/60 border border-ivory/10 rounded-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-ivory">{m.title}</div>
                  <div className="text-xs font-mono font-bold text-acid">
                    {m.percentage}% ({formatCurrency(m.amount, proposal.currency)})
                  </div>
                </div>

                {m.description && (
                  <div className="text-[11px] font-mono text-ivory/50">{m.description}</div>
                )}

                {m.due_description && (
                  <div className="text-[10px] font-mono text-ivory/40 pt-1 border-t border-ivory/5 flex items-center justify-between gap-2">
                    <span>Release Trigger: {m.due_description}</span>
                    {isAccepted && (
                      <Link
                        href={`/private/invoices/new?client_id=${client.id}&proposal_id=${proposal.id}&type=milestone&milestone_id=${m.id}`}
                        className="text-[10px] text-acid hover:underline inline-flex items-center gap-1 font-mono shrink-0"
                      >
                        Bill Milestone &rarr;
                      </Link>
                    )}
                  </div>
                )}
                {!m.due_description && isAccepted && (
                  <div className="pt-1 border-t border-ivory/5 flex justify-end">
                    <Link
                      href={`/private/invoices/new?client_id=${client.id}&proposal_id=${proposal.id}&type=milestone&milestone_id=${m.id}`}
                      className="text-[10px] text-acid hover:underline inline-flex items-center gap-1 font-mono"
                    >
                      Bill Milestone &rarr;
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commercial Terms & Conditions */}
      {proposal.terms_and_conditions && (
        <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-ivory/40">
            Terms & Conditions
          </div>
          <p className="text-[11px] font-mono text-ivory/60 leading-relaxed whitespace-pre-line">
            {proposal.terms_and_conditions}
          </p>
        </div>
      )}

      {/* Activity Trail */}
      <div className="bg-obsidian-light/40 border border-ivory/10 p-5 rounded-sm space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-ivory/60 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          <span>Activity & Audit Trail</span>
        </div>

        {activity.length === 0 ? (
          <div className="text-xs font-mono text-ivory/40 py-2">No activity recorded yet.</div>
        ) : (
          <div className="space-y-2">
            {activity.map((act) => (
              <div
                key={act.id}
                className="p-2.5 bg-obsidian/50 border border-ivory/5 rounded-sm flex items-start justify-between text-xs font-mono"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-ivory uppercase tracking-wider text-[10px] px-1.5 py-0.5 bg-white/5 rounded-xs mr-2">
                    {act.event_type}
                  </span>
                  <span className="text-ivory/70">{JSON.stringify(act.metadata)}</span>
                </div>
                <span className="text-[10px] text-ivory/40 shrink-0 ml-3">
                  {new Date(act.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-obsidian border border-ivory/20 rounded-sm max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
              <h3 className="font-display text-lg font-bold text-ivory flex items-center gap-2">
                <Send className="w-4 h-4 text-acid" />
                <span>Dispatch Executive Proposal</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSendModal(false)}
                className="text-ivory/40 hover:text-ivory"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-obsidian-light/60 p-3 rounded-sm border border-ivory/10 space-y-1">
                <div className="flex justify-between">
                  <span className="text-ivory/40">From:</span>
                  <span className="text-ivory">OFFSCRIPT Studio &lt;inquiries@offscript.param20h.me&gt;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory/40">To:</span>
                  <span className="text-acid font-bold">{client.name} &lt;{client.email}&gt;</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ivory/40">Attachment:</span>
                  <span className="text-ivory">{proposal.proposal_number}.pdf</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-ivory/60 mb-1">
                  Personal Cover Note (Optional)
                </label>
                <textarea
                  rows={4}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g. Hi Alex, pleasure speaking yesterday. Attached is the architectural scope and commercial roadmap for your review..."
                  className="w-full p-2.5 text-xs font-mono bg-obsidian-light border border-ivory/20 text-ivory rounded-sm focus:border-acid focus:outline-hidden"
                />
              </div>

              <div className="text-[11px] text-ivory/40">
                Resend transactional email will be dispatched. The proposal status will automatically transition to &quot;Sent&quot; and an immutable snapshot of all terms will be recorded.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-ivory/10">
              <button
                type="button"
                disabled={isSending}
                onClick={() => setShowSendModal(false)}
                className="px-3 py-1.5 text-xs font-mono text-ivory/60 hover:text-ivory"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSending}
                onClick={handleSendProposal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? "Sending via Resend..." : "Confirm & Send"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

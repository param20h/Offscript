import React from "react";
import { Metadata } from "next";
import { verifyAndRetrieveProposalByToken } from "@/lib/proposals/tokens";
import { formatCurrency } from "@/lib/proposals/pricing";
import {
  Download,
  ExternalLink,
  Mail,
  ShieldCheck,
  AlertCircle,
  Clock,
  Lock,
  Building,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Project Proposal | OFFSCRIPT Studio",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default async function ClientProposalViewerPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // 1. Authoritative token verification against database
  const access = await verifyAndRetrieveProposalByToken(token);

  // 2. Render error states cleanly without disclosing sensitive internal identifiers
  if (!access.valid) {
    let errorTitle = "Proposal Unavailable";
    let errorDescription =
      "The requested proposal document could not be located. The link may be incomplete or invalid.";
    let icon = <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-4" />;

    if (access.reason === "expired") {
      errorTitle = "Proposal Link Expired";
      errorDescription =
        "This commercial proposal link has passed its validity window. Please reach out to OFFSCRIPT Studio to request a refreshed proposal link.";
      icon = <Clock className="w-10 h-10 text-amber-400 mx-auto mb-4" />;
    } else if (access.reason === "revoked") {
      errorTitle = "Proposal Link Superseded";
      errorDescription =
        "This access link has been superseded by a revised scope or closed by the studio. Please contact us for the latest document.";
      icon = <Lock className="w-10 h-10 text-red-400 mx-auto mb-4" />;
    }

    return (
      <div className="min-h-screen bg-[#141414] text-ivory flex flex-col justify-between p-6 sm:p-12 font-sans selection:bg-acid selection:text-obsidian">
        {/* Header */}
        <header className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-ivory/10 pb-6">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-bold tracking-tight text-ivory">
              OFFSCRIPT
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-acid px-2 py-0.5 rounded-xs bg-acid/10 border border-acid/20">
              Studio
            </span>
          </div>
          <span className="text-[11px] font-mono text-ivory/40">Secure Document Viewer</span>
        </header>

        {/* Error Card */}
        <main className="max-w-md w-full mx-auto my-auto text-center p-8 bg-obsidian-light/60 border border-ivory/10 rounded-sm space-y-4">
          {icon}
          <h1 className="font-display text-xl font-bold text-ivory">{errorTitle}</h1>
          <p className="text-xs font-mono text-ivory/60 leading-relaxed">
            {errorDescription}
          </p>
          <div className="pt-4 border-t border-ivory/10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="mailto:offscript@param20h.me?subject=Inquiry regarding proposal access"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 transition-colors w-full sm:w-auto"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact OFFSCRIPT</span>
            </a>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-4xl w-full mx-auto text-center border-t border-ivory/10 pt-6 text-[11px] font-mono text-ivory/40">
          <span>Prepared with care by OFFSCRIPT Studio • </span>
          <a
            href="mailto:offscript@param20h.me"
            className="text-ivory/60 hover:text-acid underline transition-colors"
          >
            offscript@param20h.me
          </a>
        </footer>
      </div>
    );
  }

  const { proposal, client } = access;
  const pdfUrl = `/api/client/proposals/${encodeURIComponent(token)}/pdf`;
  const downloadUrl = `${pdfUrl}?download=true`;

  const createdDate = new Date(proposal.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const validUntilDate = proposal.valid_until
    ? new Date(proposal.valid_until).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#111111] text-ivory flex flex-col font-sans selection:bg-acid selection:text-obsidian">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#161616]/95 backdrop-blur-md border-b border-ivory/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Studio Wordmark & Proposal Meta */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold tracking-tight text-ivory">
                OFFSCRIPT
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-acid px-2 py-0.5 rounded-xs bg-acid/10 border border-acid/20">
                PROPOSAL
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-ivory/40 border-l border-ivory/10 pl-4">
              <span className="text-ivory/70 font-semibold">{proposal.proposal_number}</span>
              <span>•</span>
              <span className="text-ivory/60">{client.company_name || client.name}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-ivory/15 hover:border-ivory/30 text-ivory text-xs font-mono rounded-sm transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in New Tab</span>
              <span className="sm:hidden">Open</span>
            </a>

            <a
              href={downloadUrl}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm hover:bg-acid/90 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Document Metadata Summary Header */}
        <div className="bg-[#161616] border border-ivory/10 p-5 rounded-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-acid">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Client Scope Document</span>
              </div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-ivory">
                {proposal.title}
              </h1>
              <p className="text-xs font-mono text-ivory/50">
                Prepared exclusively for{" "}
                <span className="text-ivory font-semibold">{client.company_name || client.name}</span>
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono border-t lg:border-t-0 lg:border-l border-ivory/10 pt-3 lg:pt-0 lg:pl-6 shrink-0">
              <div>
                <div className="text-[10px] uppercase text-ivory/40">Proposal Value</div>
                <div className="font-bold text-ivory text-sm mt-0.5">
                  {formatCurrency(proposal.total_amount, proposal.currency)}
                </div>
              </div>

              {validUntilDate && (
                <div>
                  <div className="text-[10px] uppercase text-ivory/40">Valid Until</div>
                  <div className="font-medium text-ivory/80 text-xs mt-0.5">
                    {validUntilDate}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[10px] uppercase text-ivory/40">Issued Date</div>
                <div className="font-medium text-ivory/80 text-xs mt-0.5">
                  {createdDate}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded PDF Viewer Box */}
        <div className="flex-1 min-h-[70vh] lg:min-h-[78vh] bg-[#1a1a1a] border border-ivory/15 rounded-sm overflow-hidden relative shadow-2xl flex flex-col">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full flex-1 border-0 rounded-sm"
            title={`Proposal ${proposal.proposal_number}`}
          />
        </div>

        {/* Mobile Download Prompt (visible on smaller viewports where iframes are constrained) */}
        <div className="sm:hidden p-4 bg-obsidian-light/60 border border-ivory/10 rounded-sm text-center space-y-2">
          <p className="text-xs font-mono text-ivory/60">
            Having trouble viewing the PDF on mobile?
          </p>
          <a
            href={downloadUrl}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm w-full"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Vector PDF</span>
          </a>
        </div>
      </main>

      {/* Minimal Client Footer */}
      <footer className="border-t border-ivory/10 bg-[#141414] px-4 sm:px-8 py-5 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-ivory/40">
          <div className="flex items-center gap-2">
            <span>Prepared with care by OFFSCRIPT Studio.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Questions or revisions?</span>
            <a
              href="mailto:offscript@param20h.me"
              className="text-acid hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <Mail className="w-3 h-3" />
              <span>offscript@param20h.me</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

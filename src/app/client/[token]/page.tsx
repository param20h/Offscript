import React from "react";
import { notFound } from "next/navigation";
import {
  Layers,
  FileCheck,
  Receipt,
  Download,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Mail,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { verifyClientPortalToken } from "@/lib/client-portal/tokens";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Client Project Portal | OFFSCRIPT Studio",
  description: "Secure client portal for engagement tracking, deliverables, proposals, and commercial invoices.",
};

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const dossier = await verifyClientPortalToken(token);

  if (!dossier) {
    return (
      <div className="min-h-screen bg-[#F0EDE5] text-[#171717] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#171717]/10 p-8 rounded-sm shadow-sm text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-[#171717]/5 text-[#171717] flex items-center justify-center mx-auto">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight">
            Portal Link Expired or Invalid
          </h1>
          <p className="text-xs text-[#171717]/60 leading-relaxed font-mono">
            This secure project portal link is either expired, revoked, or invalid. For security reasons, client access tokens expire after 30 days.
          </p>
          <div className="pt-2 border-t border-[#171717]/10">
            <p className="text-[11px] font-mono text-[#171717]/50">
              To request a refreshed link, contact:{" "}
              <a
                href="mailto:offscript@param20h.me"
                className="text-[#171717] font-semibold underline"
              >
                offscript@param20h.me
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { client, proposals, invoices, projects } = dossier;

  // Overview metrics
  const activeProjectsCount = projects.filter((p) =>
    ["planning", "scheduled", "in_progress", "review"].includes(p.status)
  ).length;

  const totalOutstanding = invoices.reduce(
    (acc, inv) => acc + (inv.balance_due || 0),
    0
  );

  const primaryCurrency = invoices[0]?.currency || "INR";

  return (
    <div className="min-h-screen bg-[#F0EDE5] text-[#171717] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Top Header */}
        <header className="border-b border-[#171717]/15 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-display font-extrabold text-xl tracking-tight text-[#171717]">
                OFFSCRIPT
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase bg-[#171717] text-[#D6FF35] px-2 py-0.5 rounded-xs font-bold">
                CLIENT PORTAL
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#171717]">
              {client.company_name || client.name}
            </h1>
            <p className="text-xs font-mono text-[#171717]/60 mt-1 flex items-center gap-2">
              <span>Client ID: {client.id.slice(0, 8)}</span>
              <span>·</span>
              <span>Official Rep: {client.name}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs font-mono text-[#171717]/70 bg-white/70 border border-[#171717]/10 p-3 rounded-sm">
            <div>
              <span className="block text-[10px] text-[#171717]/40 uppercase">Studio Contact</span>
              <a
                href="mailto:offscript@param20h.me"
                className="font-medium text-[#171717] hover:underline"
              >
                offscript@param20h.me
              </a>
            </div>
            <div className="hidden sm:block border-l border-[#171717]/10 h-6" />
            <div>
              <span className="block text-[10px] text-[#171717]/40 uppercase">Domain</span>
              <span className="font-medium text-[#171717]">offscript.param20h.me</span>
            </div>
          </div>
        </header>

        {/* High-Level Overview Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#171717]/10 p-5 rounded-sm shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono text-[#171717]/50 uppercase">
              <span>Active Projects</span>
              <Layers className="h-4 w-4 text-[#171717]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#171717] mt-2">
              {activeProjectsCount}
            </div>
            <div className="text-[11px] font-mono text-[#171717]/50 mt-1">
              {projects.length} total engagements
            </div>
          </div>

          <div className="bg-white border border-[#171717]/10 p-5 rounded-sm shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono text-[#171717]/50 uppercase">
              <span>Proposals & SOWs</span>
              <FileCheck className="h-4 w-4 text-[#171717]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#171717] mt-2">
              {proposals.length}
            </div>
            <div className="text-[11px] font-mono text-[#171717]/50 mt-1">
              {proposals.filter((p) => p.status === "accepted").length} accepted scopes
            </div>
          </div>

          <div className="bg-white border border-[#171717]/10 p-5 rounded-sm shadow-xs">
            <div className="flex items-center justify-between text-xs font-mono text-[#171717]/50 uppercase">
              <span>Outstanding Balance</span>
              <Receipt className="h-4 w-4 text-[#171717]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#171717] mt-2">
              {primaryCurrency} {totalOutstanding.toLocaleString()}
            </div>
            <div className="text-[11px] font-mono text-[#171717]/50 mt-1">
              Across {invoices.filter((i) => (i.balance_due || 0) > 0).length} pending invoice(s)
            </div>
          </div>
        </section>

        {/* Section 1: Active Projects & Delivery Milestones */}
        <section className="space-y-6">
          <div className="border-b border-[#171717]/15 pb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-[#171717] flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#171717]" />
              Projects & Engineering Deliverables
            </h2>
            <span className="text-xs font-mono text-[#171717]/50">
              {projects.length} Engagement(s)
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white/50 border border-[#171717]/10 p-8 rounded-sm text-center text-xs font-mono text-[#171717]/50">
              No active projects currently provisioned for this account.
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white border border-[#171717]/10 rounded-sm p-6 space-y-6 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#171717]/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-[#171717]/5 px-2 py-0.5 rounded text-[#171717]">
                          {project.project_number}
                        </span>
                        <h3 className="font-display text-lg font-bold text-[#171717]">
                          {project.title}
                        </h3>
                      </div>
                      <p className="text-xs font-mono text-[#171717]/60 mt-1 uppercase">
                        Type: {project.project_type} · Status: {project.status.replace("_", " ")}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-[#171717]">
                          {project.progress_percentage || 0}% Complete
                        </div>
                        <div className="w-28 h-1.5 bg-[#171717]/10 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-[#171717] transition-all duration-300"
                            style={{
                              width: `${Math.min(100, project.progress_percentage || 0)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {project.client_visible_summary && (
                    <div className="text-xs text-[#171717]/80 leading-relaxed bg-[#F0EDE5]/60 p-3.5 rounded border border-[#171717]/5">
                      <span className="font-mono text-[10px] text-[#171717]/40 uppercase block mb-1">
                        Executive Overview
                      </span>
                      {project.client_visible_summary}
                    </div>
                  )}

                  {/* Milestones */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-[#171717]/70">
                      Phase Milestones & Deliverables
                    </h4>

                    {project.milestones.length === 0 ? (
                      <p className="text-xs font-mono text-[#171717]/40">
                        Milestones are currently being scheduled by the engineering team.
                      </p>
                    ) : (
                      <div className="divide-y divide-[#171717]/5 border border-[#171717]/10 rounded overflow-hidden">
                        {project.milestones.map((m, idx) => (
                          <div
                            key={m.id}
                            className="p-3.5 flex items-start justify-between gap-4 bg-white hover:bg-[#F0EDE5]/30 transition-colors"
                          >
                            <div className="flex items-start gap-2.5">
                              <span
                                className={`mt-0.5 rounded-full p-1 ${
                                  m.status === "completed"
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : "bg-[#171717]/5 text-[#171717]/40"
                                }`}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </span>
                              <div>
                                <div className="text-xs font-semibold text-[#171717]">
                                  Phase {idx + 1}: {m.title}
                                </div>
                                {m.description && (
                                  <p className="text-[11px] text-[#171717]/60 mt-0.5">
                                    {m.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span
                                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-medium ${
                                  m.status === "completed"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : m.status === "in_progress"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-[#171717]/5 text-[#171717]/50"
                                }`}
                              >
                                {m.status.replace("_", " ")}
                              </span>
                              {m.due_date && (
                                <div className="text-[10px] font-mono text-[#171717]/40 mt-1">
                                  Target: {new Date(m.due_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Client Updates Feed */}
                  {project.updates.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-[#171717]/10">
                      <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-[#171717]/70">
                        Recent Studio Progress Updates
                      </h4>

                      <div className="space-y-2">
                        {project.updates.map((up) => (
                          <div
                            key={up.id}
                            className="bg-[#F0EDE5]/50 border border-[#171717]/10 p-3.5 rounded text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#171717]">
                                {up.title}
                              </span>
                              <span className="text-[10px] font-mono text-[#171717]/40">
                                {new Date(up.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[#171717]/75 whitespace-pre-wrap leading-relaxed">
                              {up.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Scopes & Proposals */}
        <section className="space-y-6">
          <div className="border-b border-[#171717]/15 pb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-[#171717] flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-[#171717]" />
              Project Proposals & Scopes of Work
            </h2>
            <span className="text-xs font-mono text-[#171717]/50">
              {proposals.length} Document(s)
            </span>
          </div>

          {proposals.length === 0 ? (
            <div className="bg-white/50 border border-[#171717]/10 p-8 rounded-sm text-center text-xs font-mono text-[#171717]/50">
              No formal proposals currently published for this account.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposals.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white border border-[#171717]/10 p-5 rounded-sm space-y-4 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#171717]">
                        {prop.proposal_number}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-medium ${
                          prop.status === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-[#171717]/5 text-[#171717]/60"
                        }`}
                      >
                        {prop.status}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-[#171717]">
                      {prop.title}
                    </h3>

                    {prop.executive_summary && (
                      <p className="text-xs text-[#171717]/70 line-clamp-2">
                        {prop.executive_summary}
                      </p>
                    )}

                    <div className="pt-2 text-xs font-mono text-[#171717]/60">
                      Total Commitment:{" "}
                      <span className="font-bold text-[#171717]">
                        {prop.currency} {prop.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#171717]/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#171717]/40">
                      Issued {new Date(prop.created_at).toLocaleDateString()}
                    </span>
                    <a
                      href={`/api/private/proposals/${prop.id}/pdf?download=true`}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#171717] hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 3: Billing & Invoices */}
        <section className="space-y-6">
          <div className="border-b border-[#171717]/15 pb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-[#171717] flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[#171717]" />
              Commercial Invoices & Statements
            </h2>
            <span className="text-xs font-mono text-[#171717]/50">
              {invoices.length} Statement(s)
            </span>
          </div>

          {invoices.length === 0 ? (
            <div className="bg-white/50 border border-[#171717]/10 p-8 rounded-sm text-center text-xs font-mono text-[#171717]/50">
              No invoices generated for this account.
            </div>
          ) : (
            <div className="overflow-x-auto bg-white border border-[#171717]/10 rounded-sm shadow-xs">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#171717]/5 border-b border-[#171717]/10 text-[#171717]/60 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Balance Due</th>
                    <th className="py-3 px-4 text-right">Official Document</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#171717]/5">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#F0EDE5]/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#171717]">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3.5 px-4 text-[#171717]/60">
                        {new Date(inv.issue_date).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-[#171717]/60">
                        {new Date(inv.due_date).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inv.status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : inv.status === "partially_paid"
                              ? "bg-amber-100 text-amber-800"
                              : inv.status === "overdue"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-[#171717]/5 text-[#171717]/70"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#171717]">
                        {inv.currency} {inv.total_amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#171717]">
                        {inv.currency} {inv.balance_due.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`/api/client/invoices/${token}/${inv.id}/pdf?download=true`}
                          className="inline-flex items-center gap-1 bg-[#171717] text-[#F0EDE5] px-2.5 py-1 rounded text-[11px] font-semibold hover:bg-[#171717]/85 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          <span>PDF</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Portal Footer */}
        <footer className="pt-8 border-t border-[#171717]/15 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#171717]/50 gap-4">
          <div>
            OFFSCRIPT Studio · Digital Engineering Studio · All Rights Reserved
          </div>
          <div>
            Direct Inquiries:{" "}
            <a href="mailto:offscript@param20h.me" className="text-[#171717] underline">
              offscript@param20h.me
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

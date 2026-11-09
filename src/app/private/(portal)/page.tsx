import React from "react";
import Link from "next/link";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  InquiryRecord,
  ClientRecord,
  ProposalRecord,
  InvoiceRecord,
} from "@/lib/db/supabase";
import { formatCurrency } from "@/lib/invoices/pricing";
import {
  Inbox,
  Clock,
  TrendingUp,
  ArrowRight,
  Server,
  Mail,
  Zap,
  Users,
  Building,
  UserCheck,
  UserPlus,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PrivateOverviewPage() {
  let inquiries: InquiryRecord[] = [];
  let clients: ClientRecord[] = [];
  let proposals: ProposalRecord[] = [];
  let invoices: InvoiceRecord[] = [];
  let dbError: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient();

      const [inquiriesRes, clientsRes, proposalsRes, invoicesRes] = await Promise.all([
        supabase
          .from("inquiries")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("clients")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("proposals")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("invoices")
          .select("*")
          .order("issue_date", { ascending: false }),
      ]);

      if (inquiriesRes.error) {
        dbError = inquiriesRes.error.message;
      } else if (inquiriesRes.data) {
        inquiries = inquiriesRes.data.map((d) => ({
          ...d,
          business_status: d.business_status || "new",
        }));
      }

      if (!clientsRes.error && clientsRes.data) {
        clients = clientsRes.data;
      }

      if (!proposalsRes.error && proposalsRes.data) {
        proposals = proposalsRes.data;
      }

      if (!invoicesRes.error && invoicesRes.data) {
        invoices = invoicesRes.data;
      }
    } catch (e) {
      dbError = e instanceof Error ? e.message : "Error connecting to Supabase";
    }
  } else {
    dbError = "Supabase server credentials not configured in environment";
  }

  // Calculate inquiry metrics
  const totalInquiries = inquiries.length;
  const newInquiries = inquiries.filter((i) => (i.business_status || "new") === "new").length;
  const awaitingConversion = inquiries.filter(
    (i) =>
      ["qualified", "accepted", "proposal_sent"].includes(i.business_status || "new") &&
      !i.converted_client_id
  );

  // Calculate client metrics
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const recentClients = clients.slice(0, 4);
  const recentInquiries = inquiries.slice(0, 5);

  // Financial Metrics: Strictly separate Accepted Pipeline vs Actual Collected Cash
  const acceptedProposalsValue = proposals
    .filter((p) => p.status === "accepted")
    .reduce((acc, p) => acc + Number(p.total_amount || 0), 0);

  const activeInvoices = invoices.filter(
    (inv) => inv.status !== "void" && inv.status !== "cancelled"
  );

  const totalInvoicedValue = activeInvoices.reduce(
    (acc, inv) => acc + Number(inv.total_amount || 0),
    0
  );

  const totalCollectedRevenue = activeInvoices.reduce(
    (acc, inv) => acc + Number(inv.amount_paid || 0),
    0
  );

  const totalOutstandingReceivables = activeInvoices.reduce(
    (acc, inv) => acc + Number(inv.balance_due || 0),
    0
  );

  const totalOverdueReceivables = activeInvoices
    .filter((inv) => inv.status === "overdue")
    .reduce((acc, inv) => acc + Number(inv.balance_due || 0), 0);

  const recentInvoices = invoices.slice(0, 4);

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
    <div className="space-y-8">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-ivory">
            Studio Operations Overview
          </h1>
          <p className="text-xs font-mono text-ivory/50 mt-1">
            Real-time pipeline metrics, lead intake, CRM accounts, and agency lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <Link
            href="/private/invoices"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-ivory/[0.05] hover:bg-ivory/[0.1] text-ivory border border-ivory/15 text-xs font-mono rounded-sm transition-all cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            <span>Invoices ({invoices.length})</span>
          </Link>
          <Link
            href="/private/proposals"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-ivory/[0.05] hover:bg-ivory/[0.1] text-ivory border border-ivory/15 text-xs font-mono rounded-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-acid" />
            <span>Proposals ({proposals.length})</span>
          </Link>
          <Link
            href="/private/clients"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-ivory/[0.05] hover:bg-ivory/[0.1] text-ivory border border-ivory/15 text-xs font-mono rounded-sm transition-all cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-acid" />
            <span>Clients ({totalClients})</span>
          </Link>
          <Link
            href="/private/inquiries"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-acid text-obsidian text-xs font-mono font-semibold rounded-sm hover:bg-[#cbf52b] transition-all cursor-pointer"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Inquiries ({totalInquiries})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {dbError && (
        <div className="p-4 rounded-sm bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <div className="font-semibold mb-1">Database Notice:</div>
          <div>{dbError}</div>
          <div className="text-amber-400/70 mt-1 text-[11px]">
            If database migration 003 has not been applied yet, run{" "}
            <code>supabase/migrations/003_phase3b_client_management.sql</code> in the Supabase SQL editor.
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inquiries */}
        <div className="border border-ivory/10 bg-[#161616] p-5 rounded-sm relative overflow-hidden group hover:border-ivory/20 transition-colors">
          <div className="flex items-center justify-between text-ivory/40 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Total Inquiries</span>
            <Inbox className="w-4 h-4 text-ivory/60" />
          </div>
          <div className="text-3xl font-display font-bold text-ivory">{totalInquiries}</div>
          <div className="text-[11px] font-mono text-ivory/40 mt-2">
            Persisted website intake
          </div>
        </div>

        {/* New / Action Required */}
        <div className="border border-acid/20 bg-acid/[0.02] p-5 rounded-sm relative overflow-hidden group hover:border-acid/40 transition-colors">
          <div className="flex items-center justify-between text-acid/80 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">New Inquiries</span>
            <span className="w-2 h-2 rounded-full bg-acid animate-ping" />
          </div>
          <div className="text-3xl font-display font-bold text-acid">{newInquiries}</div>
          <div className="text-[11px] font-mono text-ivory/50 mt-2">
            Unreviewed briefs
          </div>
        </div>

        {/* CRM Total Clients */}
        <div className="border border-ivory/10 bg-[#161616] p-5 rounded-sm relative overflow-hidden group hover:border-ivory/20 transition-colors">
          <div className="flex items-center justify-between text-ivory/40 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">CRM Clients</span>
            <Users className="w-4 h-4 text-acid" />
          </div>
          <div className="text-3xl font-display font-bold text-ivory">{totalClients}</div>
          <div className="text-[11px] font-mono text-ivory/40 mt-2">
            Managed studio accounts
          </div>
        </div>

        {/* Active Client Engagements */}
        <div className="border border-ivory/10 bg-[#161616] p-5 rounded-sm relative overflow-hidden group hover:border-ivory/20 transition-colors">
          <div className="flex items-center justify-between text-ivory/40 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Active Clients</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-display font-bold text-emerald-400">{activeClients}</div>
          <div className="text-[11px] font-mono text-ivory/40 mt-2">
            Engaged contracts
          </div>
        </div>
      </div>

      {/* Financial Operations Overview (Phase 3D) */}
      <div className="border border-ivory/10 bg-[#141414] rounded-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-ivory/10">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-acid flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span>Agency Financial Performance</span>
            </div>
            <p className="text-[11px] font-mono text-ivory/40 mt-0.5">
              Strict separation of committed proposal pipeline versus actual collected cash in bank.
            </p>
          </div>

          <Link
            href="/private/invoices"
            className="text-xs font-mono text-acid hover:underline inline-flex items-center gap-1"
          >
            <span>Invoices Ledger</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-obsidian/60 border border-ivory/5 rounded-sm">
            <div className="text-[10px] font-mono uppercase text-ivory/40">Committed Scope (Pipeline)</div>
            <div className="text-xl font-display font-bold text-ivory mt-1">
              {formatCurrency(acceptedProposalsValue, "INR")}
            </div>
            <div className="text-[10px] font-mono text-ivory/40 mt-1">
              Accepted proposals
            </div>
          </div>

          <div className="p-4 bg-obsidian/60 border border-ivory/5 rounded-sm">
            <div className="text-[10px] font-mono uppercase text-ivory/40">Total Invoiced</div>
            <div className="text-xl font-display font-bold text-ivory mt-1">
              {formatCurrency(totalInvoicedValue, "INR")}
            </div>
            <div className="text-[10px] font-mono text-ivory/40 mt-1">
              {activeInvoices.length} active invoices
            </div>
          </div>

          <div className="p-4 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-sm">
            <div className="text-[10px] font-mono uppercase text-emerald-400/80">Collected Revenue</div>
            <div className="text-xl font-display font-bold text-emerald-400 mt-1">
              {formatCurrency(totalCollectedRevenue, "INR")}
            </div>
            <div className="text-[10px] font-mono text-emerald-400/60 mt-1">
              Realized bank receipts
            </div>
          </div>

          <div className="p-4 bg-amber-500/[0.04] border border-amber-500/20 rounded-sm">
            <div className="text-[10px] font-mono uppercase text-amber-400/80">Outstanding Receivables</div>
            <div className="text-xl font-display font-bold text-amber-400 mt-1">
              {formatCurrency(totalOutstandingReceivables, "INR")}
            </div>
            <div className="text-[10px] font-mono text-amber-400/60 mt-1">
              {totalOverdueReceivables > 0 ? `Overdue: ${formatCurrency(totalOverdueReceivables, "INR")}` : "All within terms"}
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Banner: Qualified Inquiries Awaiting Conversion */}
      {awaitingConversion.length > 0 && (
        <div className="p-4 bg-acid/[0.04] border border-acid/25 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-mono text-acid font-semibold flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span>
                {awaitingConversion.length} Qualified Inquir{awaitingConversion.length === 1 ? "y" : "ies"} Awaiting Client Conversion
              </span>
            </div>
            <p className="text-[11px] font-mono text-ivory/60">
              Open the inquiry dossier and select &quot;Convert to Client&quot; to establish official CRM accounts.
            </p>
          </div>
          <Link
            href={`/private/inquiries/${awaitingConversion[0].id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-acid text-obsidian text-xs font-mono font-semibold rounded shrink-0 self-start sm:self-auto hover:bg-[#cbf52b] transition-all"
          >
            <span>Convert Lead</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Grid: Recent Inquiries + Recent Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries List */}
        <div className="border border-ivory/10 bg-[#141414] rounded-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-ivory/10 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-ivory">Recent Inquiries</h2>
              <p className="text-xs font-mono text-ivory/40 mt-0.5">Inbound website project leads.</p>
            </div>
            <Link
              href="/private/inquiries"
              className="text-xs font-mono text-acid hover:underline inline-flex items-center gap-1"
            >
              <span>Directory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-ivory/5 flex-1">
            {recentInquiries.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-ivory/40">
                No inquiries recorded yet.
              </div>
            ) : (
              recentInquiries.map((inquiry) => {
                const status = inquiry.business_status || "new";
                return (
                  <div
                    key={inquiry.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-ivory/[0.02] transition-colors"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-ivory truncate">{inquiry.name}</span>
                        <span className="text-[11px] font-mono text-ivory/40 truncate">
                          ({inquiry.company || "Independent"})
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${getStatusBadge(
                            status
                          )}`}
                        >
                          {status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-ivory/40">
                        {inquiry.project_type} • {inquiry.currency} {inquiry.budget_range}
                      </div>
                    </div>
                    <Link
                      href={`/private/inquiries/${inquiry.id}`}
                      className="text-xs font-mono text-ivory/60 hover:text-acid transition-colors shrink-0"
                    >
                      Dossier →
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent CRM Clients List */}
        <div className="border border-ivory/10 bg-[#141414] rounded-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-ivory/10 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-ivory">CRM Accounts</h2>
              <p className="text-xs font-mono text-ivory/40 mt-0.5">Active and managed clients.</p>
            </div>
            <Link
              href="/private/clients"
              className="text-xs font-mono text-acid hover:underline inline-flex items-center gap-1"
            >
              <span>All Clients</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-ivory/5 flex-1">
            {recentClients.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-ivory/40">
                No client accounts created yet.
              </div>
            ) : (
              recentClients.map((c) => (
                <div
                  key={c.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-ivory/[0.02] transition-colors"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-ivory truncate">{c.name}</span>
                      <span className="text-[11px] font-mono text-ivory/40 truncate">
                        ({c.company_name})
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-ivory/10 text-acid bg-acid/[0.05]">
                        {c.status}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-ivory/40 truncate">{c.email}</div>
                  </div>
                  <Link
                    href={`/private/clients/${c.id}`}
                    className="text-xs font-mono text-ivory/60 hover:text-acid transition-colors shrink-0"
                  >
                    Profile →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Invoices Ledger Preview */}
      {invoices.length > 0 && (
        <div className="border border-ivory/10 bg-[#141414] rounded-sm overflow-hidden">
          <div className="p-5 border-b border-ivory/10 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-ivory">Recent Invoices &amp; Payment Status</h2>
              <p className="text-xs font-mono text-ivory/40 mt-0.5">Direct billing obligations and settlement tracking.</p>
            </div>
            <Link
              href="/private/invoices"
              className="text-xs font-mono text-acid hover:underline inline-flex items-center gap-1"
            >
              <span>All Invoices ({invoices.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-ivory/5">
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ivory/[0.02] transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-acid">{inv.invoice_number}</span>
                    <span className="text-xs font-medium text-ivory truncate">{inv.notes || `${inv.invoice_type.toUpperCase()} Invoice`}</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-ivory/10 text-ivory/60 bg-white/5">
                      {inv.invoice_type}
                    </span>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
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
                  <div className="text-[11px] font-mono text-ivory/40">
                    Issued {new Date(inv.issue_date).toLocaleDateString()}
                    {inv.due_date && ` • Due ${new Date(inv.due_date).toLocaleDateString()}`}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-ivory">
                      {formatCurrency(Number(inv.total_amount), inv.currency)}
                    </div>
                    {Number(inv.balance_due) > 0 && inv.status !== "paid" && (
                      <div className="text-[10px] font-mono text-amber-400/80">
                        Balance: {formatCurrency(Number(inv.balance_due), inv.currency)}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/private/invoices/${inv.id}`}
                    className="text-xs font-mono text-ivory/60 hover:text-acid transition-colors shrink-0"
                  >
                    Dossier &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Infrastructure & Security Integrity Card */}
      <div className="border border-ivory/10 bg-[#141414] p-5 rounded-sm">
        <h3 className="text-xs font-mono uppercase tracking-wider text-ivory/40 mb-4">
          Agency System & Integration Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded border border-ivory/5 bg-ivory/[0.01] space-y-1">
            <div className="flex items-center gap-2 text-ivory/70">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">Supabase PostgreSQL</span>
            </div>
            <div className="text-ivory/40 text-[11px]">
              {isSupabaseConfigured() ? "Connected (Service Role RLS)" : "Unconfigured"}
            </div>
          </div>

          <div className="p-3.5 rounded border border-ivory/5 bg-ivory/[0.01] space-y-1">
            <div className="flex items-center gap-2 text-ivory/70">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">Resend Email Gateway</span>
            </div>
            <div className="text-ivory/40 text-[11px]">
              Sender: inquiries@offscript.param20h.me
            </div>
          </div>

          <div className="p-3.5 rounded border border-ivory/5 bg-ivory/[0.01] space-y-1">
            <div className="flex items-center gap-2 text-ivory/70">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">Upstash Redis</span>
            </div>
            <div className="text-ivory/40 text-[11px]">
              Rate Limiter (5 fails/15m) & Session Revocation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

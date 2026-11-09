import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  ClientRecord,
  ProposalRecord,
  ProposalMilestoneRecord,
} from "@/lib/db/supabase";
import InvoiceEditorView from "@/components/private/InvoiceEditorView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Commercial Invoice | OFFSCRIPT Operations",
};

export interface ProposalWithMilestones extends ProposalRecord {
  proposal_milestones?: ProposalMilestoneRecord[];
}

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{
    client_id?: string;
    proposal_id?: string;
    milestone_id?: string;
    type?: string;
  }>;
}) {
  const { client_id, proposal_id, milestone_id, type } = await searchParams;

  let clients: ClientRecord[] = [];
  let proposals: ProposalWithMilestones[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient();
      const [clientsRes, proposalsRes] = await Promise.all([
        supabase.from("clients").select("*").order("name", { ascending: true }),
        supabase
          .from("proposals")
          .select("*, proposal_milestones(*)")
          .in("status", ["ready", "sent", "accepted"])
          .order("created_at", { ascending: false }),
      ]);

      if (clientsRes.data) clients = clientsRes.data;
      if (proposalsRes.data) proposals = proposalsRes.data as ProposalWithMilestones[];
    } catch {
      // Graceful fallback
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-ivory/10 pb-5">
        <Link
          href="/private/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ivory/40 hover:text-ivory transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Invoices</span>
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ivory">
          Commercial Invoice Builder
        </h1>
        <p className="text-xs font-mono text-ivory/50 mt-1">
          Generate advance retainers, milestone progress billings, or custom professional engineering statements.
        </p>
      </div>

      <InvoiceEditorView
        clients={clients}
        proposals={proposals}
        preselectedClientId={client_id}
        preselectedProposalId={proposal_id}
        preselectedMilestoneId={milestone_id}
        preselectedType={type}
      />
    </div>
  );
}

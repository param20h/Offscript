import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  ClientRecord,
  ProposalRecord,
  ProposalDeliverableRecord,
  ProposalMilestoneRecord,
} from "@/lib/db/supabase";
import ProjectCreatorView from "@/components/private/ProjectCreatorView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Initialize Project | OFFSCRIPT Operations",
};

export interface ProposalWithDetails extends ProposalRecord {
  proposal_deliverables?: ProposalDeliverableRecord[];
  proposal_milestones?: ProposalMilestoneRecord[];
}

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{
    client_id?: string;
    proposal_id?: string;
  }>;
}) {
  const { client_id, proposal_id } = await searchParams;

  let clients: ClientRecord[] = [];
  let eligibleProposals: ProposalWithDetails[] = [];
  let selectedProposal: ProposalWithDetails | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient();
      const [clientsRes, proposalsRes] = await Promise.all([
        supabase.from("clients").select("*").order("name", { ascending: true }),
        supabase
          .from("proposals")
          .select("*, proposal_deliverables(*), proposal_milestones(*)")
          .in("status", ["accepted", "ready", "sent"])
          .order("created_at", { ascending: false }),
      ]);

      if (clientsRes.data) clients = clientsRes.data;
      if (proposalsRes.data) {
        eligibleProposals = proposalsRes.data as ProposalWithDetails[];
        if (proposal_id) {
          selectedProposal =
            eligibleProposals.find((p) => p.id === proposal_id) || null;
        }
      }
    } catch {
      // Graceful fallback
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-ivory/10 pb-5">
        <Link
          href="/private/projects"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ivory/60 hover:text-lime transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Projects Directory
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ivory">
          Initialize Project Engagement
        </h1>
        <p className="text-xs font-mono text-ivory/50 mt-1">
          Scaffold a digital engineering project, import scope deliverables, configure milestone tracking, and prepare delivery.
        </p>
      </div>

      <ProjectCreatorView
        clients={clients}
        proposals={eligibleProposals}
        initialClientId={client_id || selectedProposal?.client_id || ""}
        initialProposalId={proposal_id || ""}
        preloadedProposal={selectedProposal}
      />
    </div>
  );
}

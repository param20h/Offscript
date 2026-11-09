import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  ProposalRecord,
  ClientRecord,
  ProposalItemRecord,
  ProposalDeliverableRecord,
  ProposalMilestoneRecord,
  ProposalActivityRecord,
} from "@/lib/db/supabase";
import {
  getActiveProposalTokenMetadata,
  ProposalTokenMetadata,
} from "@/lib/proposals/tokens";
import ProposalDossierView from "@/components/private/ProposalDossierView";

export const dynamic = "force-dynamic";

export interface ProposalDetailData {
  proposal: ProposalRecord;
  client: ClientRecord;
  items: ProposalItemRecord[];
  deliverables: ProposalDeliverableRecord[];
  milestones: ProposalMilestoneRecord[];
  activity: ProposalActivityRecord[];
  tokenMetadata?: ProposalTokenMetadata;
}

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  let proposalData: ProposalDetailData | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient();
      const [proposalRes, itemsRes, deliverablesRes, milestonesRes, activityRes] =
        await Promise.all([
          supabase
            .from("proposals")
            .select("*, clients(*)")
            .eq("id", id)
            .single(),
          supabase
            .from("proposal_items")
            .select("*")
            .eq("proposal_id", id)
            .order("sort_order", { ascending: true }),
          supabase
            .from("proposal_deliverables")
            .select("*")
            .eq("proposal_id", id)
            .order("sort_order", { ascending: true }),
          supabase
            .from("proposal_milestones")
            .select("*")
            .eq("proposal_id", id)
            .order("sort_order", { ascending: true }),
          supabase
            .from("proposal_activity")
            .select("*")
            .eq("proposal_id", id)
            .order("created_at", { ascending: false }),
        ]);

      if (proposalRes.data && proposalRes.data.clients) {
        let tokenMetadata: ProposalTokenMetadata | undefined = undefined;
        try {
          tokenMetadata = await getActiveProposalTokenMetadata(id);
        } catch {
          // Token table might not yet be queried
        }

        proposalData = {
          proposal: proposalRes.data,
          client: proposalRes.data.clients,
          items: itemsRes.data || [],
          deliverables: deliverablesRes.data || [],
          milestones: milestonesRes.data || [],
          activity: activityRes.data || [],
          tokenMetadata,
        };
      }
    } catch {
      // Handled below
    }
  }

  if (!proposalData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-ivory/10 pb-5">
        <Link
          href="/private/proposals"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ivory/40 hover:text-ivory transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Proposals</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-acid">
                {proposalData.proposal.proposal_number}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs bg-white/5 border border-white/10 text-ivory/60">
                {proposalData.proposal.status}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ivory mt-1">
              {proposalData.proposal.title}
            </h1>
          </div>
        </div>
      </div>

      <ProposalDossierView initialData={proposalData} />
    </div>
  );
}

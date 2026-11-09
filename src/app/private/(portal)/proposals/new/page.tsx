import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  ClientRecord,
} from "@/lib/db/supabase";
import ProposalEditorView from "@/components/private/ProposalEditorView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Scope Proposal | OFFSCRIPT Operations",
};

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ client_id?: string; inquiry_id?: string }>;
}) {
  const { client_id, inquiry_id } = await searchParams;

  let clients: ClientRecord[] = [];
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient();
      const { data } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });
      if (data) {
        clients = data;
      }
    } catch {
      // Table may not yet be migrated
    }
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
        <h1 className="font-display text-2xl font-bold tracking-tight text-ivory">
          Scope Proposal Builder
        </h1>
        <p className="text-xs font-mono text-ivory/50 mt-1">
          Architect precision deliverables, milestone payment schedules, and vector PDF documentation.
        </p>
      </div>

      <ProposalEditorView
        clients={clients}
        preselectedClientId={client_id}
        preselectedInquiryId={inquiry_id}
      />
    </div>
  );
}

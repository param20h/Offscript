import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  ProjectRecord,
  ClientRecord,
  ProposalRecord,
  ProjectMilestoneRecord,
  ProjectTaskRecord,
  ProjectUpdateRecord,
  ProjectActivityRecord,
  InvoiceRecord,
} from "@/lib/db/supabase";
import ProjectDossierView from "@/components/private/ProjectDossierView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Project Dossier | OFFSCRIPT Operations",
};

export interface FullProjectDossier {
  project: ProjectRecord;
  client: ClientRecord;
  proposal: ProposalRecord | null;
  milestones: ProjectMilestoneRecord[];
  tasks: ProjectTaskRecord[];
  updates: ProjectUpdateRecord[];
  invoices: InvoiceRecord[];
  activities: ProjectActivityRecord[];
}

export default async function ProjectDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    notFound();
  }

  const supabase = getSupabaseServerClient();

  const { data: project, error: prjErr } = await supabase
    .from("projects")
    .select("*, clients(*), proposals(*)")
    .eq("id", id)
    .single();

  if (prjErr || !project) {
    notFound();
  }

  const client = (project as any).clients as ClientRecord;
  const proposal = ((project as any).proposals as ProposalRecord) || null;

  const [milestonesRes, tasksRes, updatesRes, activitiesRes, invoicesRes] =
    await Promise.all([
      supabase
        .from("project_milestones")
        .select("*")
        .eq("project_id", id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("project_tasks")
        .select("*")
        .eq("project_id", id)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("project_updates")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("project_activity")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false })
        .limit(30),
      proposal?.id
        ? supabase
            .from("invoices")
            .select("*")
            .eq("proposal_id", proposal.id)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as InvoiceRecord[] }),
    ]);

  const dossier: FullProjectDossier = {
    project,
    client,
    proposal,
    milestones: (milestonesRes.data as ProjectMilestoneRecord[]) || [],
    tasks: (tasksRes.data as ProjectTaskRecord[]) || [],
    updates: (updatesRes.data as ProjectUpdateRecord[]) || [],
    invoices: (invoicesRes.data as InvoiceRecord[]) || [],
    activities: (activitiesRes.data as ProjectActivityRecord[]) || [],
  };

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-lime/10 text-lime border border-lime/20">
                {project.project_number}
              </span>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ivory">
                {project.title}
              </h1>
            </div>
            <p className="text-xs font-mono text-ivory/50 mt-1">
              Client: {client?.company_name || client?.name || "Direct Client"} · Engagement Type: {project.project_type?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      <ProjectDossierView initialDossier={dossier} />
    </div>
  );
}

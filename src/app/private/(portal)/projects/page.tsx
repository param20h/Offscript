import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  ProjectRecord,
  ClientRecord,
  ProposalRecord,
} from "@/lib/db/supabase";
import ProjectsDirectoryView from "@/components/private/ProjectsDirectoryView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Projects & Delivery Tracking | OFFSCRIPT Operations",
};

export interface ProjectWithRelations extends ProjectRecord {
  clients?: ClientRecord | null;
  proposals?: ProposalRecord | null;
}

export default async function PrivateProjectsPage() {
  let projects: ProjectWithRelations[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("projects")
        .select("*, clients(*), proposals(*)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        projects = data as ProjectWithRelations[];
      }
    } catch {
      // Table may not yet be migrated in development
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-ivory/10 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ivory">
            Projects & Delivery Tracking
          </h1>
          <p className="text-xs font-mono text-ivory/50 mt-1">
            Active engagements, milestone delivery, task execution, and client updates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/private/projects/new"
            className="inline-flex items-center gap-2 rounded bg-lime px-3 py-1.5 text-xs font-semibold text-obsidian hover:bg-lime/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>
      </div>

      <ProjectsDirectoryView initialProjects={projects} />
    </div>
  );
}

import React from "react";
import Link from "next/link";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  ClientRecord,
  ClientNoteRecord,
  ProposalRecord,
  InvoiceRecord,
} from "@/lib/db/supabase";
import ClientProfileView from "@/components/private/ClientProfileView";
import { ArrowLeft, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Client Profile | OFFSCRIPT CRM",
};

export default async function PrivateClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <div className="p-8 text-center text-xs font-mono text-amber-400">
        Supabase server credentials not configured.
      </div>
    );
  }

  const supabase = getSupabaseServerClient();

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !client) {
    return (
      <div className="border border-ivory/10 bg-[#141414] p-12 text-center rounded-sm max-w-xl mx-auto my-12 space-y-4">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <h2 className="font-display text-lg font-bold text-ivory">Client Record Not Found</h2>
        <p className="text-xs font-mono text-ivory/50">
          The requested client record ({id}) could not be located in the CRM database.
        </p>
        <Link
          href="/private/clients"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-ivory/10 hover:bg-ivory/20 text-xs font-mono text-ivory rounded-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Clients Directory</span>
        </Link>
      </div>
    );
  }

  // Load client notes
  let notes: ClientNoteRecord[] = [];
  try {
    const { data: notesData } = await supabase
      .from("client_notes")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false });

    if (notesData) {
      notes = notesData;
    }
  } catch {
    // Ignore error if table not yet migrated
  }

  // Load related inquiries
  let inquiries: any[] = [];
  try {
    const { data: inqData } = await supabase
      .from("inquiries")
      .select("id, name, company, project_type, currency, budget_range, timeline, business_status, created_at")
      .or(`converted_client_id.eq.${id},email.eq.${client.email}`)
      .order("created_at", { ascending: false });

    if (inqData) {
      inquiries = inqData;
    }
  } catch {
    // Ignore error
  }

  // Load client proposals (Phase 3C)
  let proposals: ProposalRecord[] = [];
  try {
    const { data: propData } = await supabase
      .from("proposals")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false });

    if (propData) {
      proposals = propData;
    }
  } catch {
    // Ignore error if proposals table not yet migrated
  }

  // Load client invoices (Phase 3D)
  let invoices: InvoiceRecord[] = [];
  try {
    const { data: invData } = await supabase
      .from("invoices")
      .select("*")
      .eq("client_id", id)
      .order("issue_date", { ascending: false });

    if (invData) {
      invoices = invData;
    }
  } catch {
    // Ignore error if invoices table not yet migrated
  }

  // Load client projects (Phase 3F)
  let projects: any[] = [];
  try {
    const { data: prjData } = await supabase
      .from("projects")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false });

    if (prjData) {
      projects = prjData;
    }
  } catch {
    // Ignore error if projects table not yet migrated
  }

  return (
    <ClientProfileView
      client={client}
      notes={notes}
      inquiries={inquiries}
      proposals={proposals}
      invoices={invoices}
      projects={projects}
    />
  );
}

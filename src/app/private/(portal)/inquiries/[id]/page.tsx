import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServerClient, isSupabaseConfigured, InquiryRecord, InquiryNoteRecord } from "@/lib/db/supabase";
import InquiryDossierView from "@/components/private/InquiryDossierView";
import { ArrowLeft, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inquiry Dossier | OFFSCRIPT Operations",
};

export default async function PrivateInquiryDetailPage({
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

  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !inquiry) {
    return (
      <div className="border border-ivory/10 bg-[#141414] p-12 text-center rounded-sm max-w-xl mx-auto my-12 space-y-4">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <h2 className="font-display text-lg font-bold text-ivory">Inquiry Not Found</h2>
        <p className="text-xs font-mono text-ivory/50">
          The requested inquiry ({id}) could not be located in the database.
        </p>
        <Link
          href="/private/inquiries"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-ivory/10 hover:bg-ivory/20 text-xs font-mono text-ivory rounded-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Directory</span>
        </Link>
      </div>
    );
  }

  // Load notes if table exists
  let notes: InquiryNoteRecord[] = [];
  try {
    const { data: notesData } = await supabase
      .from("inquiry_notes")
      .select("*")
      .eq("inquiry_id", id)
      .order("created_at", { ascending: false });

    if (notesData) {
      notes = notesData;
    }
  } catch {
    // Notes table may not be migrated yet
  }

  const enrichedInquiry: InquiryRecord = {
    ...inquiry,
    business_status: inquiry.business_status || "new",
  };

  return <InquiryDossierView inquiry={enrichedInquiry} initialNotes={notes} />;
}

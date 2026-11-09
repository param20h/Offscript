import React from "react";
import { getSupabaseServerClient, isSupabaseConfigured, InquiryRecord } from "@/lib/db/supabase";
import InquiriesDirectoryView from "@/components/private/InquiriesDirectoryView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inquiries Directory | OFFSCRIPT Operations",
};

export default async function PrivateInquiriesPage() {
  let inquiries: InquiryRecord[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient();
      const { data } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        inquiries = data.map((d) => ({
          ...d,
          business_status: d.business_status || "new",
        }));
      }
    } catch {
      // Fallback empty if database error
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-ivory/10 pb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ivory">
          Client Inquiries Directory
        </h1>
        <p className="text-xs font-mono text-ivory/50 mt-1">
          Review inbound client briefs, update business lifecycle states, and inspect project requirements.
        </p>
      </div>

      <InquiriesDirectoryView initialInquiries={inquiries} />
    </div>
  );
}

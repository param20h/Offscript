import React from "react";
import { getSupabaseServerClient, isSupabaseConfigured, ClientRecord } from "@/lib/db/supabase";
import ClientsDirectoryView from "@/components/private/ClientsDirectoryView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clients Directory | OFFSCRIPT Operations",
};

export default async function PrivateClientsPage() {
  let clients: ClientRecord[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        clients = data;
      }
    } catch {
      // Fallback empty if table not yet migrated
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-ivory/10 pb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ivory">
          Clients & Accounts Directory
        </h1>
        <p className="text-xs font-mono text-ivory/50 mt-1">
          Client relationships, converted accounts, entity classifications, and CRM lifecycle states.
        </p>
      </div>

      <ClientsDirectoryView initialClients={clients} />
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  InvoiceRecord,
  ClientRecord,
} from "@/lib/db/supabase";
import InvoicesDirectoryView from "@/components/private/InvoicesDirectoryView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Invoices & Payment Ledger | OFFSCRIPT Operations",
};

export interface InvoiceWithClient extends InvoiceRecord {
  clients?: ClientRecord | null;
}

export default async function PrivateInvoicesPage() {
  let invoices: InvoiceWithClient[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("invoices")
        .select("*, clients(*)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        invoices = data as InvoiceWithClient[];
      }
    } catch {
      // Handled gracefully if table not yet migrated
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-ivory/10 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ivory">
            Invoices & Payment Ledger
          </h1>
          <p className="text-xs font-mono text-ivory/50 mt-1">
            Commercial billing statements, payment ledger entries, balance tracking, and PDF issuance.
          </p>
        </div>

        <Link
          href="/private/invoices/new"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-acid text-obsidian text-xs font-mono font-bold uppercase tracking-wider hover:bg-acid/90 transition-colors rounded-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Invoice</span>
        </Link>
      </div>

      <InvoicesDirectoryView initialInvoices={invoices} />
    </div>
  );
}

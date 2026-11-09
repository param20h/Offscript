import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  InvoiceRecord,
  ClientRecord,
  InvoiceItemRecord,
  PaymentRecord,
  InvoiceActivityRecord,
  ProposalRecord,
} from "@/lib/db/supabase";
import InvoiceDossierView from "@/components/private/InvoiceDossierView";

export const dynamic = "force-dynamic";

export interface InvoiceDetailData {
  invoice: InvoiceRecord;
  client: ClientRecord;
  proposal?: ProposalRecord | null;
  items: InvoiceItemRecord[];
  payments: PaymentRecord[];
  activity: InvoiceActivityRecord[];
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) notFound();

  let invoiceData: InvoiceDetailData | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServerClient();
      const [invoiceRes, itemsRes, paymentsRes, activityRes] = await Promise.all([
        supabase
          .from("invoices")
          .select("*, clients(*), proposals(*)")
          .eq("id", id)
          .single(),
        supabase
          .from("invoice_items")
          .select("*")
          .eq("invoice_id", id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("payments")
          .select("*")
          .eq("invoice_id", id)
          .order("payment_date", { ascending: false }),
        supabase
          .from("invoice_activity")
          .select("*")
          .eq("invoice_id", id)
          .order("created_at", { ascending: false }),
      ]);

      if (invoiceRes.data && invoiceRes.data.clients) {
        invoiceData = {
          invoice: invoiceRes.data,
          client: invoiceRes.data.clients,
          proposal: invoiceRes.data.proposals,
          items: itemsRes.data || [],
          payments: paymentsRes.data || [],
          activity: activityRes.data || [],
        };
      }
    } catch {
      // Handled below
    }
  }

  if (!invoiceData) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-ivory/10 pb-5">
        <Link
          href="/private/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-ivory/40 hover:text-ivory transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Invoices</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-acid">
                {invoiceData.invoice.invoice_number}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-xs bg-white/5 border border-white/10 text-ivory/60">
                {invoiceData.invoice.status}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-xs text-ivory/40">
                {invoiceData.invoice.invoice_type}
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ivory mt-1">
              Invoice Dossier · {invoiceData.client.name}
            </h1>
          </div>
        </div>
      </div>

      <InvoiceDossierView initialData={invoiceData} />
    </div>
  );
}

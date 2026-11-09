import { NextResponse } from "next/server";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { verifyClientPortalToken } from "@/lib/client-portal/tokens";
import { generateInvoicePDF } from "@/lib/invoices/pdf";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string; invoiceId: string }> }
) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { token, invoiceId } = await params;

    const portalDossier = await verifyClientPortalToken(token);
    if (!portalDossier) {
      return NextResponse.json({ error: "Invalid or expired portal token" }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();

    // Verify invoice belongs to the authenticated portal client
    const { data: invoice, error: invErr } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .eq("client_id", portalDossier.client.id)
      .single();

    if (invErr || !invoice) {
      return NextResponse.json({ error: "Invoice not found or unauthorized" }, { status: 404 });
    }

    // Fetch items and payments
    const [itemsRes, paymentsRes] = await Promise.all([
      supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoice.id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("payments")
        .select("*")
        .eq("invoice_id", invoice.id)
        .order("payment_date", { ascending: true }),
    ]);

    const pdfBuffer = generateInvoicePDF({
      invoice,
      client: portalDossier.client,
      items: itemsRes.data || [],
      payments: paymentsRes.data || [],
    });

    const isDownload = new URL(request.url).searchParams.get("download") === "true";
    const disposition = isDownload ? "attachment" : "inline";

    return new Response(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="OFFSCRIPT-${invoice.invoice_number}.pdf"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error generating PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

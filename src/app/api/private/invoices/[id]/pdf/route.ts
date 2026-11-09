import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { generateInvoicePDF } from "@/lib/invoices/pdf";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPrivateSession();
    if (!session.authenticated) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured on server" },
        { status: 503 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const [invoiceRes, itemsRes, paymentsRes] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, clients(*), proposals(proposal_number)")
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
        .order("payment_date", { ascending: true }),
    ]);

    if (invoiceRes.error || !invoiceRes.data) {
      return NextResponse.json(
        { error: invoiceRes.error?.message || "Invoice not found" },
        { status: 404 }
      );
    }

    const invoice = invoiceRes.data;
    const client = invoice.clients;

    if (!client) {
      return NextResponse.json(
        { error: "Associated client record missing" },
        { status: 404 }
      );
    }

    const pdfBuffer = generateInvoicePDF({
      invoice,
      client,
      items: itemsRes.data || [],
      payments: paymentsRes.data || [],
      linkedProposalNumber: invoice.proposals?.proposal_number || null,
    });

    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "true";
    const disposition = isDownload ? "attachment" : "inline";
    const filename = `${invoice.invoice_number || "OFF-INVOICE"}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${filename}"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

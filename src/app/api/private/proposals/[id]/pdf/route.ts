import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { generateProposalPDF } from "@/lib/proposals/pdf";

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
      return NextResponse.json({ error: "Missing proposal ID" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const [proposalRes, itemsRes, deliverablesRes, milestonesRes] =
      await Promise.all([
        supabase
          .from("proposals")
          .select("*, clients(*)")
          .eq("id", id)
          .single(),
        supabase
          .from("proposal_items")
          .select("*")
          .eq("proposal_id", id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("proposal_deliverables")
          .select("*")
          .eq("proposal_id", id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("proposal_milestones")
          .select("*")
          .eq("proposal_id", id)
          .order("sort_order", { ascending: true }),
      ]);

    if (proposalRes.error || !proposalRes.data) {
      return NextResponse.json(
        { error: proposalRes.error?.message || "Proposal not found" },
        { status: 404 }
      );
    }

    const proposal = proposalRes.data;
    const client = proposal.clients;

    if (!client) {
      return NextResponse.json(
        { error: "Associated client record missing" },
        { status: 404 }
      );
    }

    const pdfBuffer = generateProposalPDF({
      proposal,
      client,
      items: itemsRes.data || [],
      deliverables: deliverablesRes.data || [],
      milestones: milestonesRes.data || [],
    });

    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "true";
    const disposition = isDownload ? "attachment" : "inline";
    const filename = `${proposal.proposal_number || "OFF-PROPOSAL"}.pdf`;

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

import { NextResponse } from "next/server";
import { verifyAndRetrieveProposalByToken } from "@/lib/proposals/tokens";
import { generateProposalPDF } from "@/lib/proposals/pdf";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // 1. Authoritative token verification (expiry, revocation, hash lookup)
    const access = await verifyAndRetrieveProposalByToken(token);

    if (!access.valid) {
      if (access.reason === "expired") {
        return NextResponse.json(
          { error: "This proposal access link has expired. Please contact offscript@param20h.me to request a revised link." },
          { status: 410 }
        );
      }
      if (access.reason === "revoked") {
        return NextResponse.json(
          { error: "This proposal access link has been superseded or revoked." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Invalid or nonexistent proposal access token." },
        { status: 404 }
      );
    }

    const { proposal, client, items, deliverables, milestones } = access;

    // 2. Synthesize complete client record for PDF generator
    const fullClient = {
      ...client,
      phone: null,
      website: null,
      industry: null,
      company_size: null,
      address: null,
      client_type: "startup" as const,
      status: "active" as const,
      source: "manual" as const,
      created_by: "system",
      metadata: {},
      notes: null,
      created_at: proposal.created_at,
      updated_at: proposal.updated_at,
    };

    // 3. Generate authoritative vector PDF server-side
    const pdfBuffer = generateProposalPDF({
      proposal,
      client: fullClient,
      items,
      deliverables,
      milestones,
    });

    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "true";
    const filename = `${proposal.proposal_number || "OFFSCRIPT-Proposal"}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${filename}"`,
        "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error generating document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

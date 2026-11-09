import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { validateOrigin } from "@/lib/security";
import {
  createProposalAccessToken,
  revokeProposalAccessToken,
  getActiveProposalTokenMetadata,
} from "@/lib/proposals/tokens";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getPrivateSession();
    if (!session.authenticated) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const metadata = await getActiveProposalTokenMetadata(id);

    return NextResponse.json({ tokenMetadata: metadata });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. SEC-04 CSRF Origin check
    const originCheck = validateOrigin(request);
    if (!originCheck.valid) {
      return NextResponse.json(
        { error: originCheck.reason || "Cross-origin request rejected." },
        { status: 403 }
      );
    }

    // 2. Authentication check
    const session = await getPrivateSession();
    if (!session.authenticated) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;

    let expiresInDays = 30;
    try {
      const body = await request.json();
      if (body && typeof body.expiresInDays === "number" && body.expiresInDays > 0) {
        expiresInDays = Math.min(365, body.expiresInDays);
      }
    } catch {
      // Use default 30 days
    }

    const result = await createProposalAccessToken({
      proposalId: id,
      expiresInDays,
      createdBy: session.adminId || "admin",
    });

    return NextResponse.json({
      success: true,
      accessUrl: result.accessUrl,
      token: result.token,
      expiresAt: result.expiresAt,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate access link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. SEC-04 CSRF Origin check
    const originCheck = validateOrigin(request);
    if (!originCheck.valid) {
      return NextResponse.json(
        { error: originCheck.reason || "Cross-origin request rejected." },
        { status: 403 }
      );
    }

    // 2. Authentication check
    const session = await getPrivateSession();
    if (!session.authenticated) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const revoked = await revokeProposalAccessToken(id);

    return NextResponse.json({ success: revoked });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to revoke access link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

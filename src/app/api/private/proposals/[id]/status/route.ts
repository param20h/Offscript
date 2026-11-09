import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured, ProposalStatus } from "@/lib/db/supabase";
import { validateOrigin } from "@/lib/security";

const VALID_STATUSES: ProposalStatus[] = [
  "draft",
  "ready",
  "sent",
  "accepted",
  "rejected",
  "withdrawn",
];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Cross-Origin validation (SEC-04)
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

    const body = await request.json();
    const newStatus = body?.status as ProposalStatus;
    const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : null;

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    // 3. Fetch existing proposal
    const { data: proposal, error: fetchError } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json(
        { error: fetchError?.message || "Proposal not found" },
        { status: 404 }
      );
    }

    const oldStatus = proposal.status;
    const nowIso = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      updated_at: nowIso,
    };

    if (newStatus === "accepted" && !proposal.accepted_at) {
      updatePayload.accepted_at = nowIso;
    } else if (newStatus === "rejected" && !proposal.rejected_at) {
      updatePayload.rejected_at = nowIso;
    }

    const { error: updateError } = await supabase
      .from("proposals")
      .update(updatePayload as any)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 4. Log activity
    await supabase.from("proposal_activity").insert({
      proposal_id: id,
      event_type: "status_changed",
      actor: session.adminId || "admin",
      description: `Status changed from ${oldStatus} to ${newStatus}`,
      metadata: {
        previous_status: oldStatus,
        new_status: newStatus,
        note,
      },
    });

    return NextResponse.json({
      success: true,
      proposal_id: id,
      previous_status: oldStatus,
      new_status: newStatus,
      updated_at: nowIso,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

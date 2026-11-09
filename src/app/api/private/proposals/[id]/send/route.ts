import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { generateProposalPDF } from "@/lib/proposals/pdf";
import { sendProposalToClient } from "@/lib/email/proposal";
import { validateOrigin } from "@/lib/security";
import { createProposalAccessToken } from "@/lib/proposals/tokens";

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

    let customMessage: string | undefined;
    try {
      const body = await request.json();
      if (body && typeof body.custom_message === "string") {
        customMessage = body.custom_message.trim().slice(0, 2000);
      }
    } catch {
      // Body is optional
    }

    const supabase = getSupabaseServerClient();

    // 3. Fetch proposal with client and all related records
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

    if (!client || !client.email) {
      return NextResponse.json(
        { error: "Associated client record missing valid email destination" },
        { status: 400 }
      );
    }

    const items = itemsRes.data || [];
    const deliverables = deliverablesRes.data || [];
    const milestones = milestonesRes.data || [];

    // 4. Generate or refresh client access link
    let accessUrl: string | undefined;
    try {
      const tokenResult = await createProposalAccessToken({
        proposalId: id,
        expiresInDays: 30,
        createdBy: session.adminId || "admin",
      });
      accessUrl = tokenResult.accessUrl;
    } catch (tokenErr) {
      console.warn("[PROPOSAL_SEND] Could not generate client access link:", tokenErr);
    }

    // 5. Freeze snapshot & persist proposal BEFORE dispatching email
    const nowIso = new Date().toISOString();
    const snapshotData = {
      proposal_number: proposal.proposal_number,
      title: proposal.title,
      summary: proposal.executive_summary,
      currency: proposal.currency,
      subtotal: proposal.subtotal,
      discount_amount: proposal.discount_amount,
      tax_amount: proposal.tax_amount,
      total_amount: proposal.total_amount,
      advance_percentage: proposal.advance_percentage,
      advance_amount: proposal.advance_amount,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company_name,
      },
      items,
      deliverables,
      milestones,
      terms_and_conditions: proposal.terms_and_conditions,
      frozen_at: nowIso,
    };

    const initialUpdatePayload: Record<string, unknown> = {
      status: proposal.status === "draft" || proposal.status === "ready" ? "sent" : proposal.status,
      snapshot: snapshotData,
      updated_at: nowIso,
    };

    await supabase
      .from("proposals")
      .update(initialUpdatePayload as any)
      .eq("id", id);

    // 6. Generate authoritative vector PDF
    const pdfBuffer = generateProposalPDF({
      proposal,
      client,
      items,
      deliverables,
      milestones,
    });

    // 7. Dispatch proposal via Resend
    const dispatchResult = await sendProposalToClient({
      proposal,
      client,
      pdfBuffer,
      customMessage,
      accessUrl,
    });

    if (!dispatchResult.success) {
      // Log failed dispatch activity
      await supabase.from("proposal_activity").insert({
        proposal_id: id,
        event_type: "send_failed",
        actor: session.adminId || "admin",
        description: "Failed to dispatch proposal email",
        metadata: {
          error: dispatchResult.error,
          unconfigured: dispatchResult.unconfigured,
          attempted_to: client.email,
        },
      });

      return NextResponse.json(
        {
          error: dispatchResult.error || "Failed to dispatch proposal email",
          unconfigured: dispatchResult.unconfigured,
        },
        { status: dispatchResult.unconfigured ? 503 : 502 }
      );
    }

    // 8. Record delivery acceptance
    const postDispatchPayload: Record<string, unknown> = {
      sent_at: nowIso,
      delivery_status: "accepted_by_provider",
      resend_id: dispatchResult.messageId || null,
      updated_at: nowIso,
    };

    const { error: updateError } = await supabase
      .from("proposals")
      .update(postDispatchPayload as any)
      .eq("id", id);

    if (updateError) {
      console.error("[PROPOSAL_SEND] Failed to record send update:", updateError);
    }

    // 7. Log proposal activity
    await supabase.from("proposal_activity").insert({
      proposal_id: id,
      event_type: "sent",
      actor: session.adminId || "admin",
      description: "Proposal vector PDF dispatched to client via Resend (Provider Accepted)",
      metadata: {
        sent_to: client.email,
        resend_message_id: dispatchResult.messageId,
        custom_message_provided: Boolean(customMessage),
        delivery_status: "accepted_by_provider",
      },
    });

    return NextResponse.json({
      success: true,
      messageId: dispatchResult.messageId,
      sent_at: nowIso,
      delivery_status: "accepted_by_provider",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

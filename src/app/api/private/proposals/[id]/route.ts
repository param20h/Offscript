import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { proposalUpdateSchema } from "@/lib/validations/proposal";
import { calculateProposalPricing } from "@/lib/proposals/pricing";
import { validateOrigin } from "@/lib/security";

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

    const [proposalRes, itemsRes, deliverablesRes, milestonesRes, activityRes] =
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
        supabase
          .from("proposal_activity")
          .select("*")
          .eq("proposal_id", id)
          .order("created_at", { ascending: false }),
      ]);

    if (proposalRes.error || !proposalRes.data) {
      return NextResponse.json(
        { error: proposalRes.error?.message || "Proposal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      proposal: proposalRes.data,
      client: proposalRes.data.clients,
      items: itemsRes.data || [],
      deliverables: deliverablesRes.data || [],
      milestones: milestonesRes.data || [],
      activity: activityRes.data || [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
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

    const supabase = getSupabaseServerClient();

    // Fetch existing proposal to check status
    const { data: existingProposal, error: fetchErr } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !existingProposal) {
      return NextResponse.json(
        { error: fetchErr?.message || "Proposal not found" },
        { status: 404 }
      );
    }

    // Commercial Immortality Guard:
    // Once accepted, commercial documents must not be silently mutated
    if (existingProposal.status === "accepted") {
      return NextResponse.json(
        {
          error:
            "This proposal has already been formally accepted by the client. Accepted commercial documents cannot be modified. Create a new revision if scope changes.",
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = proposalUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData = parseResult.data;

    // Determine items to calculate pricing
    let itemsToCalculate: { quantity: number; unit_price: number }[] = [];
    if (updateData.items) {
      itemsToCalculate = updateData.items.map((i) => ({
        quantity: i.quantity,
        unit_price: i.unit_price,
      }));
    } else {
      const { data: currentItems } = await supabase
        .from("proposal_items")
        .select("quantity, unit_price")
        .eq("proposal_id", id);
      itemsToCalculate = currentItems || [];
    }

    const pricing = calculateProposalPricing({
      items: itemsToCalculate,
      discount_type: updateData.discount_type || existingProposal.discount_type,
      discount_value:
        updateData.discount_value !== undefined
          ? updateData.discount_value
          : existingProposal.discount_value,
      tax_rate:
        updateData.tax_rate !== undefined
          ? updateData.tax_rate
          : existingProposal.tax_rate,
      advance_percentage:
        updateData.advance_percentage !== undefined
          ? updateData.advance_percentage
          : existingProposal.advance_percentage,
    });

    const proposalUpdatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      subtotal: pricing.subtotal,
      discount_amount: pricing.discount_amount,
      tax_amount: pricing.tax_amount,
      total_amount: pricing.total_amount,
      advance_amount: pricing.advance_amount,
      remaining_balance: pricing.remaining_balance,
    };

    if (updateData.title !== undefined) proposalUpdatePayload.title = updateData.title;
    if (updateData.project_overview !== undefined) proposalUpdatePayload.project_overview = updateData.project_overview;
    if (updateData.executive_summary !== undefined) proposalUpdatePayload.executive_summary = updateData.executive_summary;
    if (updateData.problem_statement !== undefined) proposalUpdatePayload.problem_statement = updateData.problem_statement;
    if (updateData.proposed_solution !== undefined) proposalUpdatePayload.proposed_solution = updateData.proposed_solution;
    if (updateData.scope_of_work !== undefined) proposalUpdatePayload.scope_of_work = updateData.scope_of_work;
    if (updateData.assumptions !== undefined) proposalUpdatePayload.assumptions = updateData.assumptions;
    if (updateData.exclusions !== undefined) proposalUpdatePayload.exclusions = updateData.exclusions;
    if (updateData.terms_and_conditions !== undefined) proposalUpdatePayload.terms_and_conditions = updateData.terms_and_conditions;
    if (updateData.currency !== undefined) proposalUpdatePayload.currency = updateData.currency;
    if (updateData.discount_type !== undefined) proposalUpdatePayload.discount_type = updateData.discount_type;
    if (updateData.discount_value !== undefined) proposalUpdatePayload.discount_value = updateData.discount_value;
    if (updateData.tax_rate !== undefined) proposalUpdatePayload.tax_rate = updateData.tax_rate;
    if (updateData.advance_percentage !== undefined) proposalUpdatePayload.advance_percentage = updateData.advance_percentage;
    if (updateData.valid_until !== undefined) proposalUpdatePayload.valid_until = updateData.valid_until;

    // Update proposal parent
    const { data: updatedProposal, error: updateErr } = await supabase
      .from("proposals")
      .update(proposalUpdatePayload as any)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Replace items if provided
    if (updateData.items) {
      await supabase.from("proposal_items").delete().eq("proposal_id", id);
      const itemsPayload = updateData.items.map((item, idx) => ({
        proposal_id: id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total_price: pricing.line_item_totals[idx],
        sort_order: item.sort_order ?? idx,
      }));
      await supabase.from("proposal_items").insert(itemsPayload);
    }

    // Replace deliverables if provided
    if (updateData.deliverables) {
      await supabase.from("proposal_deliverables").delete().eq("proposal_id", id);
      const deliverablesPayload = updateData.deliverables.map((del, idx) => ({
        proposal_id: id,
        title: del.title,
        description: del.description,
        acceptance_criteria: del.acceptance_criteria,
        sort_order: del.sort_order ?? idx,
      }));
      await supabase.from("proposal_deliverables").insert(deliverablesPayload);
    }

    // Replace milestones if provided
    if (updateData.milestones) {
      await supabase.from("proposal_milestones").delete().eq("proposal_id", id);
      const milestonesPayload = updateData.milestones.map((m, idx) => ({
        proposal_id: id,
        title: m.title,
        description: m.description,
        amount: m.amount,
        percentage: m.percentage,
        due_description: m.due_description,
        sort_order: m.sort_order ?? idx,
      }));
      await supabase.from("proposal_milestones").insert(milestonesPayload);
    }

    // Record activity log
    await supabase.from("proposal_activity").insert({
      proposal_id: id,
      event_type: "updated",
      actor: session.adminId || "Studio Admin",
      description: `Proposal ${existingProposal.proposal_number} updated. Commercial total: ${pricing.total_amount}.`,
    });

    return NextResponse.json({
      success: true,
      proposal: updatedProposal,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

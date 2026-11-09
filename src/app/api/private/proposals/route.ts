import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured, ProposalStatus } from "@/lib/db/supabase";
import { proposalCreateSchema } from "@/lib/validations/proposal";
import { calculateProposalPricing, round2 } from "@/lib/proposals/pricing";
import { validateOrigin } from "@/lib/security";

/**
 * Generates the next sequential human-readable proposal number (e.g., OFF-PROP-2026-001).
 */
async function generateNextProposalNumber(supabase: any): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `OFF-PROP-${currentYear}-`;

  const { data } = await supabase
    .from("proposals")
    .select("proposal_number")
    .ilike("proposal_number", `${prefix}%`)
    .order("created_at", { ascending: false })
    .limit(1);

  if (!data || data.length === 0) {
    return `${prefix}001`;
  }

  const lastNumber = data[0].proposal_number;
  const match = lastNumber.match(/(\d+)$/);
  const nextSeq = match ? parseInt(match[1], 10) + 1 : 1;
  return `${prefix}${String(nextSeq).padStart(3, "0")}`;
}

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const status = searchParams.get("status")?.trim() || "";
    const clientId = searchParams.get("client_id")?.trim() || "";
    const sort = searchParams.get("sort") || "created_desc";

    const supabase = getSupabaseServerClient();

    let query = supabase
      .from("proposals")
      .select("*, clients(id, name, company_name, email)");

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    if (status && status !== "all") {
      query = query.eq("status", status as ProposalStatus);
    }

    if (sort === "created_asc") {
      query = query.order("created_at", { ascending: true });
    } else if (sort === "value_desc") {
      query = query.order("total_amount", { ascending: false });
    } else if (sort === "updated_desc") {
      query = query.order("updated_at", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let records = data || [];

    if (search) {
      records = records.filter((p: any) => {
        const title = (p.title || "").toLowerCase();
        const num = (p.proposal_number || "").toLowerCase();
        const clientName = (p.clients?.name || "").toLowerCase();
        const company = (p.clients?.company_name || "").toLowerCase();
        return (
          title.includes(search) ||
          num.includes(search) ||
          clientName.includes(search) ||
          company.includes(search)
        );
      });
    }

    // Compute metrics
    const totalCount = records.length;
    const draftCount = records.filter((p: any) => p.status === "draft").length;
    const sentCount = records.filter((p: any) => p.status === "sent").length;
    const acceptedCount = records.filter((p: any) => p.status === "accepted").length;
    const rejectedCount = records.filter((p: any) => p.status === "rejected").length;

    const totalProposedValue = round2(
      records.reduce((sum: number, p: any) => sum + (Number(p.total_amount) || 0), 0)
    );
    const acceptedValue = round2(
      records
        .filter((p: any) => p.status === "accepted")
        .reduce((sum: number, p: any) => sum + (Number(p.total_amount) || 0), 0)
    );

    return NextResponse.json({
      proposals: records,
      metrics: {
        total: totalCount,
        draft: draftCount,
        sent: sentCount,
        accepted: acceptedCount,
        rejected: rejectedCount,
        totalProposedValue,
        acceptedValue,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json().catch(() => ({}));
    const parseResult = proposalCreateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validData = parseResult.data;
    const supabase = getSupabaseServerClient();

    // Verify client exists
    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("id, name, company_name, email")
      .eq("id", validData.client_id)
      .single();

    if (clientErr || !client) {
      return NextResponse.json(
        { error: "Selected client does not exist." },
        { status: 400 }
      );
    }

    // 3. Decimal-Safe Pricing Calculations
    const pricing = calculateProposalPricing({
      items: validData.items,
      discount_type: validData.discount_type,
      discount_value: validData.discount_value,
      tax_rate: validData.tax_rate,
      advance_percentage: validData.advance_percentage,
    });

    // 4. Generate proposal number
    const proposalNumber = await generateNextProposalNumber(supabase);

    // 5. Insert Proposal Parent Record
    const { data: newProposal, error: proposalInsertErr } = await supabase
      .from("proposals")
      .insert({
        proposal_number: proposalNumber,
        client_id: validData.client_id,
        inquiry_id: validData.inquiry_id,
        title: validData.title,
        project_overview: validData.project_overview,
        executive_summary: validData.executive_summary,
        problem_statement: validData.problem_statement,
        proposed_solution: validData.proposed_solution,
        scope_of_work: validData.scope_of_work,
        assumptions: validData.assumptions,
        exclusions: validData.exclusions,
        terms_and_conditions: validData.terms_and_conditions,
        currency: validData.currency,
        subtotal: pricing.subtotal,
        discount_type: validData.discount_type,
        discount_value: validData.discount_value,
        discount_amount: pricing.discount_amount,
        tax_rate: validData.tax_rate,
        tax_amount: pricing.tax_amount,
        total_amount: pricing.total_amount,
        advance_percentage: validData.advance_percentage,
        advance_amount: pricing.advance_amount,
        remaining_balance: pricing.remaining_balance,
        status: "draft",
        valid_until: validData.valid_until,
        created_by: session.adminId || "Studio Admin",
      })
      .select()
      .single();

    if (proposalInsertErr || !newProposal) {
      return NextResponse.json(
        {
          error: proposalInsertErr?.message.includes("does not exist")
            ? "Database migration 004 required: Run supabase/migrations/004_phase3c_proposals.sql in the Supabase SQL Editor."
            : proposalInsertErr?.message || "Failed to create proposal record",
        },
        { status: 500 }
      );
    }

    const proposalId = newProposal.id;

    // 6. Insert Line Items
    if (validData.items.length > 0) {
      const itemsPayload = validData.items.map((item, idx) => ({
        proposal_id: proposalId,
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

    // 7. Insert Deliverables
    if (validData.deliverables && validData.deliverables.length > 0) {
      const deliverablesPayload = validData.deliverables.map((del, idx) => ({
        proposal_id: proposalId,
        title: del.title,
        description: del.description,
        acceptance_criteria: del.acceptance_criteria,
        sort_order: del.sort_order ?? idx,
      }));

      await supabase.from("proposal_deliverables").insert(deliverablesPayload);
    }

    // 8. Insert Milestones
    if (validData.milestones && validData.milestones.length > 0) {
      const milestonesPayload = validData.milestones.map((m, idx) => ({
        proposal_id: proposalId,
        title: m.title,
        description: m.description,
        amount: m.amount,
        percentage: m.percentage,
        due_description: m.due_description,
        sort_order: m.sort_order ?? idx,
      }));

      await supabase.from("proposal_milestones").insert(milestonesPayload);
    }

    // 9. Record Initial Activity Log
    await supabase.from("proposal_activity").insert({
      proposal_id: proposalId,
      event_type: "created",
      actor: session.adminId || "Studio Admin",
      description: `Draft proposal ${proposalNumber} created for ${client.name} (${client.company_name}).`,
      metadata: { total_amount: pricing.total_amount, currency: validData.currency },
    });

    return NextResponse.json({
      success: true,
      proposal_id: proposalId,
      proposal_number: proposalNumber,
      proposal: newProposal,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

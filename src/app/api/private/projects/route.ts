import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  ProjectStatus,
  ProjectPriority,
} from "@/lib/db/supabase";
import { projectCreateSchema } from "@/lib/validations/project";
import { validateOrigin } from "@/lib/security";

/**
 * Generates the next sequential human-readable project number (e.g. OFF-PRJ-2026-001).
 */
async function generateNextProjectNumber(supabase: any): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `OFF-PRJ-${currentYear}-`;

  const { data } = await supabase
    .from("projects")
    .select("project_number")
    .ilike("project_number", `${prefix}%`)
    .order("project_number", { ascending: false })
    .limit(1);

  let nextSequence = 1;
  if (data && data.length > 0 && data[0].project_number) {
    const lastNumStr = data[0].project_number.replace(prefix, "");
    const parsed = parseInt(lastNumStr, 10);
    if (!isNaN(parsed)) {
      nextSequence = parsed + 1;
    }
  }

  const padded = nextSequence.toString().padStart(3, "0");
  return `${prefix}${padded}`;
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
    const clientId = searchParams.get("client_id");
    const proposalId = searchParams.get("proposal_id");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search")?.toLowerCase().trim();

    const supabase = getSupabaseServerClient();
    let query = supabase
      .from("projects")
      .select("*, clients(id, name, company_name, email)")
      .order("created_at", { ascending: false });

    if (clientId) query = query.eq("client_id", clientId);
    if (proposalId) query = query.eq("proposal_id", proposalId);
    if (status && status !== "all") query = query.eq("status", status as ProjectStatus);
    if (priority && priority !== "all") query = query.eq("priority", priority as ProjectPriority);

    const { data: projects, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let records = projects || [];
    if (search) {
      records = records.filter(
        (p: any) =>
          p.title?.toLowerCase().includes(search) ||
          p.project_number?.toLowerCase().includes(search) ||
          p.clients?.company_name?.toLowerCase().includes(search) ||
          p.clients?.name?.toLowerCase().includes(search)
      );
    }

    const totalCount = records.length;
    const activeCount = records.filter(
      (p: any) => p.status === "in_progress" || p.status === "scheduled" || p.status === "review"
    ).length;
    const completedCount = records.filter((p: any) => p.status === "completed").length;
    const onHoldCount = records.filter((p: any) => p.status === "on_hold").length;

    return NextResponse.json({
      projects: records,
      metrics: {
        total: totalCount,
        active: activeCount,
        completed: completedCount,
        onHold: onHoldCount,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Database not configured on server" },
        { status: 503 }
      );
    }

    const rawBody = await request.json();
    const parseResult = projectCreateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || "Invalid project data";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const data = parseResult.data;
    const supabase = getSupabaseServerClient();

    // 3. Duplicate prevention: if proposal_id is provided, check if project already created
    if (data.proposal_id) {
      const { data: existingProject } = await supabase
        .from("projects")
        .select("id, project_number, title")
        .eq("proposal_id", data.proposal_id)
        .neq("status", "cancelled")
        .maybeSingle();

      if (existingProject) {
        return NextResponse.json(
          {
            error: `An active project (${existingProject.project_number}) is already linked to this proposal.`,
            existingProjectId: existingProject.id,
          },
          { status: 409 }
        );
      }
    }

    // 4. Generate sequential project number
    const projectNumber = await generateNextProjectNumber(supabase);

    // 5. Insert project record
    const { data: newProject, error: projectError } = await supabase
      .from("projects")
      .insert({
        project_number: projectNumber,
        client_id: data.client_id,
        proposal_id: data.proposal_id,
        title: data.title,
        description: data.description,
        project_type: data.project_type,
        status: data.status,
        priority: data.priority,
        start_date: data.start_date,
        estimated_completion_date: data.estimated_completion_date,
        progress_percentage: 0,
        total_budget: data.total_budget,
        currency: data.currency,
        internal_notes: data.internal_notes,
        client_visible_summary: data.client_visible_summary,
        created_by: session.adminId || "admin",
      })
      .select()
      .single();

    if (projectError || !newProject) {
      return NextResponse.json(
        { error: `Failed to create project: ${projectError?.message}` },
        { status: 500 }
      );
    }

    // 6. Insert initial milestones if provided (e.g. imported from proposal deliverables)
    if (data.milestones && data.milestones.length > 0) {
      const milestoneInserts = data.milestones.map((m, idx) => ({
        project_id: newProject.id,
        title: m.title,
        description: m.description,
        status: m.status || "pending",
        start_date: m.start_date || data.start_date,
        due_date: m.due_date || data.estimated_completion_date,
        progress_percentage: m.progress_percentage || 0,
        sort_order: m.sort_order ?? idx,
        client_visible: m.client_visible ?? true,
      }));

      await supabase.from("project_milestones").insert(milestoneInserts);
    }

    // 7. Audit log
    await supabase.from("project_activity").insert({
      project_id: newProject.id,
      event_type: "project_created",
      actor: session.adminId || "admin",
      description: `Project ${newProject.project_number} (${newProject.title}) established.`,
      metadata: {
        proposal_id: data.proposal_id,
        budget: data.total_budget,
        currency: data.currency,
      },
    });

    return NextResponse.json(
      {
        success: true,
        project: newProject,
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

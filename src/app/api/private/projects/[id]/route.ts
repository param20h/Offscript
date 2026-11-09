import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { projectUpdateSchema } from "@/lib/validations/project";
import { validateOrigin } from "@/lib/security";
import { calculateProjectProgress } from "@/lib/projects/progress";

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
    const supabase = getSupabaseServerClient();

    const [projectRes, milestonesRes, tasksRes, updatesRes, activityRes] =
      await Promise.all([
        supabase
          .from("projects")
          .select("*, clients(*), proposals(*)")
          .eq("id", id)
          .single(),
        supabase
          .from("project_milestones")
          .select("*")
          .eq("project_id", id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("project_tasks")
          .select("*")
          .eq("project_id", id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("project_updates")
          .select("*")
          .eq("project_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("project_activity")
          .select("*")
          .eq("project_id", id)
          .order("created_at", { ascending: false }),
      ]);

    if (projectRes.error || !projectRes.data) {
      return NextResponse.json(
        { error: projectRes.error?.message || "Project not found" },
        { status: 404 }
      );
    }

    const project = projectRes.data;
    const milestones = milestonesRes.data || [];
    const tasks = tasksRes.data || [];
    const updates = updatesRes.data || [];
    const activity = activityRes.data || [];

    // Calculate dynamic progress
    const progressStats = calculateProjectProgress({ milestones, tasks });

    // Also load linked invoices if any exist for this client or proposal
    let linkedInvoices: any[] = [];
    if (project.proposal_id) {
      const { data: invData } = await supabase
        .from("invoices")
        .select("id, invoice_number, invoice_type, status, total_amount, amount_paid, balance_due, currency, issue_date, due_date")
        .eq("proposal_id", project.proposal_id)
        .order("issue_date", { ascending: false });
      if (invData) linkedInvoices = invData;
    }

    return NextResponse.json({
      project,
      client: project.clients,
      proposal: project.proposals,
      milestones,
      tasks,
      updates,
      activity,
      invoices: linkedInvoices,
      progressStats,
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

    const { id } = await params;
    const rawBody = await request.json();
    const parseResult = projectUpdateSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || "Invalid update payload";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const data = parseResult.data;
    const supabase = getSupabaseServerClient();

    // Fetch current state
    const { data: currentProject, error: fetchErr } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !currentProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.status !== undefined) {
      updatePayload.status = data.status;
      if (data.status === "completed" && !currentProject.actual_completion_date) {
        updatePayload.actual_completion_date = new Date().toISOString().split("T")[0];
      }
    }
    if (data.priority !== undefined) updatePayload.priority = data.priority;
    if (data.start_date !== undefined) updatePayload.start_date = data.start_date;
    if (data.estimated_completion_date !== undefined) {
      updatePayload.estimated_completion_date = data.estimated_completion_date;
    }
    if (data.total_budget !== undefined) updatePayload.total_budget = data.total_budget;
    if (data.currency !== undefined) updatePayload.currency = data.currency;
    if (data.internal_notes !== undefined) updatePayload.internal_notes = data.internal_notes;
    if (data.client_visible_summary !== undefined) {
      updatePayload.client_visible_summary = data.client_visible_summary;
    }

    const { data: updated, error: updateError } = await supabase
      .from("projects")
      .update(updatePayload as any)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updated) {
      return NextResponse.json(
        { error: updateError?.message || "Failed to update project" },
        { status: 500 }
      );
    }

    // Audit activity if status changed
    if (data.status && data.status !== currentProject.status) {
      await supabase.from("project_activity").insert({
        project_id: id,
        event_type: "status_changed",
        actor: session.adminId || "admin",
        description: `Project status transitioned from ${currentProject.status} to ${data.status}.`,
        metadata: {
          previous_status: currentProject.status,
          new_status: data.status,
        },
      });
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const originCheck = validateOrigin(request);
    if (!originCheck.valid) {
      return NextResponse.json(
        { error: originCheck.reason || "Cross-origin request rejected." },
        { status: 403 }
      );
    }

    const session = await getPrivateSession();
    if (!session.authenticated) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseServerClient();

    const { data: project } = await supabase
      .from("projects")
      .select("id, status, project_number")
      .eq("id", id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.status !== "planning" && project.status !== "cancelled") {
      return NextResponse.json(
        { error: "Only projects in 'planning' or 'cancelled' status can be deleted." },
        { status: 400 }
      );
    }

    const { error: deleteErr } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { milestoneCreateSchema } from "@/lib/validations/project";
import { validateOrigin } from "@/lib/security";
import { calculateProjectProgress } from "@/lib/projects/progress";

export async function POST(
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

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured on server" }, { status: 503 });
    }

    const { id } = await params;
    const body = await request.json();

    const parseResult = milestoneCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid milestone data" },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const supabase = getSupabaseServerClient();

    const { data: milestone, error: insertErr } = await supabase
      .from("project_milestones")
      .insert({
        project_id: id,
        title: data.title,
        description: data.description,
        status: data.status,
        start_date: data.start_date,
        due_date: data.due_date,
        progress_percentage: data.progress_percentage,
        sort_order: data.sort_order,
        client_visible: data.client_visible,
      })
      .select()
      .single();

    if (insertErr || !milestone) {
      return NextResponse.json({ error: insertErr?.message || "Failed to create milestone" }, { status: 500 });
    }

    // Recalculate and update project overall progress
    const [milestonesRes, tasksRes] = await Promise.all([
      supabase.from("project_milestones").select("status, progress_percentage").eq("project_id", id),
      supabase.from("project_tasks").select("status").eq("project_id", id),
    ]);

    const stats = calculateProjectProgress({
      milestones: milestonesRes.data || [],
      tasks: tasksRes.data || [],
    });

    await supabase
      .from("projects")
      .update({ progress_percentage: stats.progress_percentage })
      .eq("id", id);

    // Audit log
    await supabase.from("project_activity").insert({
      project_id: id,
      event_type: "milestone_created",
      actor: session.adminId || "admin",
      description: `Milestone "${milestone.title}" added to project.`,
      metadata: { milestone_id: milestone.id },
    });

    return NextResponse.json({ success: true, milestone, progress: stats.progress_percentage }, { status: 201 });
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
    const body = await request.json();
    const { milestone_id, status, progress_percentage, client_visible, title, description, due_date } = body;

    if (!milestone_id) {
      return NextResponse.json({ error: "Missing milestone_id" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) {
      updatePayload.status = status;
      if (status === "completed") {
        updatePayload.completed_at = new Date().toISOString();
        updatePayload.progress_percentage = 100;
      }
    }
    if (progress_percentage !== undefined) updatePayload.progress_percentage = progress_percentage;
    if (client_visible !== undefined) updatePayload.client_visible = client_visible;
    if (title !== undefined) updatePayload.title = title;
    if (description !== undefined) updatePayload.description = description;
    if (due_date !== undefined) updatePayload.due_date = due_date;

    const { data: updated, error: updateErr } = await supabase
      .from("project_milestones")
      .update(updatePayload as any)
      .eq("id", milestone_id)
      .eq("project_id", id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Recalculate project progress
    const [milestonesRes, tasksRes] = await Promise.all([
      supabase.from("project_milestones").select("status, progress_percentage").eq("project_id", id),
      supabase.from("project_tasks").select("status").eq("project_id", id),
    ]);

    const stats = calculateProjectProgress({
      milestones: milestonesRes.data || [],
      tasks: tasksRes.data || [],
    });

    await supabase
      .from("projects")
      .update({ progress_percentage: stats.progress_percentage })
      .eq("id", id);

    // Activity log
    await supabase.from("project_activity").insert({
      project_id: id,
      event_type: status === "completed" ? "milestone_completed" : "milestone_updated",
      actor: session.adminId || "admin",
      description: status === "completed"
        ? `Milestone "${updated.title}" marked completed.`
        : `Milestone "${updated.title}" updated.`,
      metadata: { milestone_id, status },
    });

    return NextResponse.json({ success: true, milestone: updated, progress: stats.progress_percentage });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

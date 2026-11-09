import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { taskCreateSchema } from "@/lib/validations/project";
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

    const parseResult = taskCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid task data" },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const supabase = getSupabaseServerClient();

    const { data: task, error: insertErr } = await supabase
      .from("project_tasks")
      .insert({
        project_id: id,
        milestone_id: data.milestone_id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        start_date: data.start_date,
        due_date: data.due_date,
        assigned_to: data.assigned_to,
        client_visible: data.client_visible,
        sort_order: data.sort_order,
      })
      .select()
      .single();

    if (insertErr || !task) {
      return NextResponse.json({ error: insertErr?.message || "Failed to create task" }, { status: 500 });
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

    // Audit log
    await supabase.from("project_activity").insert({
      project_id: id,
      event_type: "task_created",
      actor: session.adminId || "admin",
      description: `Task "${task.title}" added to project.`,
      metadata: { task_id: task.id },
    });

    return NextResponse.json({ success: true, task, progress: stats.progress_percentage }, { status: 201 });
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

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured on server" }, { status: 503 });
    }

    const { id } = await params;
    const body = await request.json();
    const { task_id, ...updates } = body;

    if (!task_id) {
      return NextResponse.json({ error: "Task ID is required for updates" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // If marking as completed, set completed_at
    const patchPayload: Record<string, unknown> = { ...updates };
    if (updates.status === "completed") {
      patchPayload.completed_at = new Date().toISOString();
    } else if (updates.status && updates.status !== "completed") {
      patchPayload.completed_at = null;
    }

    const { data: updatedTask, error: updateErr } = await supabase
      .from("project_tasks")
      .update(patchPayload as any)
      .eq("id", task_id)
      .eq("project_id", id)
      .select()
      .single();

    if (updateErr || !updatedTask) {
      return NextResponse.json({ error: updateErr?.message || "Failed to update task" }, { status: 500 });
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

    // Audit log
    await supabase.from("project_activity").insert({
      project_id: id,
      event_type: "task_updated",
      actor: session.adminId || "admin",
      description: `Task "${updatedTask.title}" updated (status: ${updatedTask.status}).`,
      metadata: { task_id: updatedTask.id, updates },
    });

    return NextResponse.json({ success: true, task: updatedTask, progress: stats.progress_percentage });
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

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured on server" }, { status: 503 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("task_id");

    if (!taskId) {
      return NextResponse.json({ error: "task_id query parameter is required" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { error: delErr } = await supabase
      .from("project_tasks")
      .delete()
      .eq("id", taskId)
      .eq("project_id", id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    // Recalculate progress
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

    await supabase.from("project_activity").insert({
      project_id: id,
      event_type: "task_deleted",
      actor: session.adminId || "admin",
      description: `Task ${taskId} was deleted.`,
    });

    return NextResponse.json({ success: true, progress: stats.progress_percentage });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

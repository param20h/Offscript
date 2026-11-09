import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { projectUpdatePostSchema } from "@/lib/validations/project";
import { validateOrigin } from "@/lib/security";

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

    const parseResult = projectUpdatePostSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const supabase = getSupabaseServerClient();

    const { data: updateRecord, error: insertErr } = await supabase
      .from("project_updates")
      .insert({
        project_id: id,
        milestone_id: data.milestone_id,
        title: data.title,
        content: data.content,
        update_type: data.update_type,
        visibility: data.visibility,
        created_by: session.adminId || "OFFSCRIPT Studio",
      })
      .select()
      .single();

    if (insertErr || !updateRecord) {
      return NextResponse.json({ error: insertErr?.message || "Failed to post update" }, { status: 500 });
    }

    // Audit log
    await supabase.from("project_activity").insert({
      project_id: id,
      event_type: "update_posted",
      actor: session.adminId || "admin",
      description: `Project update "${updateRecord.title}" posted (${updateRecord.visibility}).`,
      metadata: { update_id: updateRecord.id, visibility: updateRecord.visibility },
    });

    return NextResponse.json({ success: true, update: updateRecord }, { status: 201 });
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
    const updateId = searchParams.get("update_id");

    if (!updateId) {
      return NextResponse.json({ error: "update_id query parameter is required" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { error: delErr } = await supabase
      .from("project_updates")
      .delete()
      .eq("id", updateId)
      .eq("project_id", id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    await supabase.from("project_activity").insert({
      project_id: id,
      event_type: "update_deleted",
      actor: session.adminId || "admin",
      description: `Update ${updateId} was deleted.`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

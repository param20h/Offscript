import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
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
      return NextResponse.json({ error: "Missing inquiry ID" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("inquiry_notes")
      .select("*")
      .eq("inquiry_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ notes: [], warning: error.message }, { status: 200 });
    }

    return NextResponse.json({ notes: data || [] });
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
      return NextResponse.json(
        { error: "Database not configured on server" },
        { status: 503 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing inquiry ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const author =
      typeof body.author === "string" && body.author.trim().length > 0
        ? body.author.trim()
        : session.adminId || "Studio Admin";

    if (!content) {
      return NextResponse.json(
        { error: "Note content cannot be empty" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("inquiry_notes")
      .insert({
        inquiry_id: id,
        author,
        content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: error.message.includes("does not exist")
            ? "Database migration 002 required: Run supabase/migrations/002_phase3a_admin_foundation.sql in the Supabase SQL Editor."
            : error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, note: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

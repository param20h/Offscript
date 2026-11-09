import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { clientNoteSchema } from "@/lib/validations/client";
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
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("client_notes")
      .select("*")
      .eq("client_id", id)
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
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = clientNoteSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { content, author } = parseResult.data;
    const authorName = author?.trim() || session.adminId || "Studio Admin";

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("client_notes")
      .insert({
        client_id: id,
        author: authorName,
        content,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: error.message.includes("does not exist")
            ? "Database migration 003 required: Run supabase/migrations/003_phase3b_client_management.sql in the Supabase SQL Editor."
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

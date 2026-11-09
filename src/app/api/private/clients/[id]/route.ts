import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured, ClientUpdate } from "@/lib/db/supabase";
import { clientUpdateSchema } from "@/lib/validations/client";
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
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: clientError?.message || "Client not found" },
        { status: 404 }
      );
    }

    // Fetch client notes
    let notes: unknown[] = [];
    try {
      const { data: notesData } = await supabase
        .from("client_notes")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false });

      if (notesData) {
        notes = notesData;
      }
    } catch {
      // Table may not exist yet
    }

    // Fetch related inquiries (either converted_client_id or same email)
    let inquiries: unknown[] = [];
    try {
      const { data: inqData } = await supabase
        .from("inquiries")
        .select("id, name, company, project_type, currency, budget_range, timeline, business_status, created_at")
        .or(`converted_client_id.eq.${id},email.eq.${client.email}`)
        .order("created_at", { ascending: false });

      if (inqData) {
        inquiries = inqData;
      }
    } catch {
      // Ignore query errors
    }

    return NextResponse.json({
      client,
      notes,
      inquiries,
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
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = clientUpdateSchema.safeParse(body);

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
    const updatePayload: ClientUpdate = {
      ...validData,
      updated_at: new Date().toISOString(),
    };

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("clients")
      .update(updatePayload)
      .eq("id", id)
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

    return NextResponse.json({
      success: true,
      client: data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

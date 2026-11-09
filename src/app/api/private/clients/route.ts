import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  ClientInsert,
  ClientStatus,
  ClientType,
} from "@/lib/db/supabase";
import { clientSchema } from "@/lib/validations/client";
import { validateOrigin } from "@/lib/security";

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
    const clientType = searchParams.get("type")?.trim() || "";
    const sort = searchParams.get("sort") || "created_desc";

    const supabase = getSupabaseServerClient();
    let query = supabase.from("clients").select("*");

    if (sort === "updated_desc") {
      query = query.order("updated_at", { ascending: false });
    } else if (sort === "created_asc") {
      query = query.order("created_at", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    if (status && status !== "all") {
      query = query.eq("status", status as ClientStatus);
    }

    if (clientType && clientType !== "all") {
      query = query.eq("client_type", clientType as ClientType);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let records = data || [];

    if (search) {
      records = records.filter((c) => {
        const name = (c.name || "").toLowerCase();
        const email = (c.email || "").toLowerCase();
        const company = (c.company_name || "").toLowerCase();
        const industry = (c.industry || "").toLowerCase();
        return (
          name.includes(search) ||
          email.includes(search) ||
          company.includes(search) ||
          industry.includes(search)
        );
      });
    }

    return NextResponse.json({ clients: records });
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
    const parseResult = clientSchema.safeParse(body);

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

    // Check for existing client with identical email
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id, name, company_name")
      .eq("email", validData.email)
      .maybeSingle();

    const insertPayload: ClientInsert = {
      name: validData.name,
      company_name: validData.company_name,
      email: validData.email,
      phone: validData.phone,
      website: validData.website,
      industry: validData.industry,
      company_size: validData.company_size,
      address: validData.address,
      client_type: validData.client_type,
      source: validData.source,
      status: validData.status,
      notes: validData.notes,
      created_by: session.adminId || "Studio Admin",
      metadata: existingClient ? { duplicate_email_warning: true } : {},
    };

    const { data, error } = await supabase
      .from("clients")
      .insert(insertPayload)
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
      warning: existingClient
        ? `Note: Another client (${existingClient.name} at ${existingClient.company_name}) shares this email address.`
        : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

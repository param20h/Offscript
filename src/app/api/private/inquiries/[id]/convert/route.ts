import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured, ClientInsert } from "@/lib/db/supabase";
import { convertInquirySchema } from "@/lib/validations/client";
import { validateOrigin } from "@/lib/security";

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
      return NextResponse.json({ error: "Missing inquiry ID" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // 3. Fetch original inquiry
    const { data: inquiry, error: inquiryError } = await supabase
      .from("inquiries")
      .select("*")
      .eq("id", id)
      .single();

    if (inquiryError || !inquiry) {
      return NextResponse.json(
        { error: inquiryError?.message || "Inquiry not found" },
        { status: 404 }
      );
    }

    // 4. Duplicate conversion guard
    if (inquiry.converted_client_id) {
      return NextResponse.json(
        {
          error: "This inquiry has already been converted into an active client record.",
          client_id: inquiry.converted_client_id,
        },
        { status: 409 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = convertInquirySchema.safeParse(body);

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

    // 5. Create new client record in CRM
    const clientPayload: ClientInsert = {
      name: validData.name,
      company_name: validData.company_name || inquiry.company || "Independent",
      email: validData.email || inquiry.email,
      phone: validData.phone || null,
      website: validData.website || null,
      industry: validData.industry || null,
      client_type: validData.client_type || "startup",
      status: validData.status || "lead",
      source: "inquiry",
      notes: `Converted from inquiry ${inquiry.id}. Discipline: ${inquiry.project_type}. Budget: ${inquiry.currency} ${inquiry.budget_range}. Timeline: ${inquiry.timeline}.`,
      created_by: session.adminId || "Studio Admin",
      metadata: {
        converted_from_inquiry_id: inquiry.id,
        inquiry_project_type: inquiry.project_type,
        inquiry_budget: `${inquiry.currency} ${inquiry.budget_range}`,
      },
    };

    const { data: newClient, error: clientCreateError } = await supabase
      .from("clients")
      .insert(clientPayload)
      .select()
      .single();

    if (clientCreateError || !newClient) {
      return NextResponse.json(
        {
          error: clientCreateError?.message.includes("does not exist")
            ? "Database migration 003 required: Run supabase/migrations/003_phase3b_client_management.sql in the Supabase SQL Editor."
            : clientCreateError?.message || "Failed to create client record",
        },
        { status: 500 }
      );
    }

    // 6. Update inquiry record (linking to client, status = 'converted')
    // Crucial: delivery_status remains strictly untouched
    const { error: inquiryUpdateError } = await supabase
      .from("inquiries")
      .update({
        converted_client_id: newClient.id,
        business_status: "converted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (inquiryUpdateError) {
      console.error("[CONVERT_UPDATE_ERROR] Failed to update inquiry status, rolling back client:", inquiryUpdateError);
      await supabase.from("clients").delete().eq("id", newClient.id);
      return NextResponse.json(
        { error: `Conversion aborted: failed to update inquiry record (${inquiryUpdateError.message})` },
        { status: 500 }
      );
    }

    // 7. Add internal note to inquiry documenting conversion
    try {
      await supabase.from("inquiry_notes").insert({
        inquiry_id: id,
        author: session.adminId || "Studio Admin",
        content: `Inquiry converted to client profile: "${newClient.name}" (${newClient.company_name}). Client ID: ${newClient.id}`,
      });
    } catch {
      // Ignore if notes table fails
    }

    // 8. If initial note provided, add note to new client profile
    if (validData.initial_note) {
      try {
        await supabase.from("client_notes").insert({
          client_id: newClient.id,
          author: session.adminId || "Studio Admin",
          content: validData.initial_note,
        });
      } catch {
        // Ignore note insert error
      }
    }

    return NextResponse.json({
      success: true,
      message: "Inquiry successfully converted to client profile.",
      client_id: newClient.id,
      client: newClient,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

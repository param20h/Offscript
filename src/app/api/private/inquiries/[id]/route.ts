import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  InquiryBusinessStatus,
  InquiryUpdate,
} from "@/lib/db/supabase";
import { validateOrigin } from "@/lib/security";

const VALID_BUSINESS_STATUSES: InquiryBusinessStatus[] = [
  "new",
  "reviewing",
  "qualified",
  "proposal_in_progress",
  "proposal_sent",
  "accepted",
  "rejected",
  "converted",
  "archived",
];

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

    // Try fetching internal notes
    let notes: unknown[] = [];
    try {
      const { data: notesData, error: notesError } = await supabase
        .from("inquiry_notes")
        .select("*")
        .eq("inquiry_id", id)
        .order("created_at", { ascending: false });

      if (!notesError && notesData) {
        notes = notesData;
      }
    } catch {
      // Notes table might not be migrated yet
    }

    return NextResponse.json({
      inquiry: {
        ...inquiry,
        business_status: inquiry.business_status || "new",
      },
      notes,
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
    const { business_status, converted_client_id } = body;

    if (business_status && !VALID_BUSINESS_STATUSES.includes(business_status)) {
      return NextResponse.json(
        {
          error: `Invalid business_status. Allowed values: ${VALID_BUSINESS_STATUSES.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    const updatePayload: InquiryUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (business_status) {
      updatePayload.business_status = business_status;
    }

    if (converted_client_id !== undefined) {
      updatePayload.converted_client_id = converted_client_id;
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("inquiries")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: error.message.includes("column inquiries.business_status does not exist")
            ? "Database migration 002 required: Run supabase/migrations/002_phase3a_admin_foundation.sql in the Supabase SQL Editor."
            : error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inquiry: data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

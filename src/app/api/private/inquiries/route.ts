import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";

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
    const discipline = searchParams.get("discipline")?.trim() || "";

    const supabase = getSupabaseServerClient();
    let query = supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (discipline && discipline !== "all") {
      query = query.ilike("project_type", `%${discipline}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let records = (data || []).map((row) => ({
      ...row,
      business_status: row.business_status || "new",
    }));

    if (status && status !== "all") {
      records = records.filter(
        (r) => (r.business_status || "new").toLowerCase() === status.toLowerCase()
      );
    }

    if (search) {
      records = records.filter((r) => {
        const name = (r.name || "").toLowerCase();
        const email = (r.email || "").toLowerCase();
        const company = (r.company || "").toLowerCase();
        const desc = (r.description || "").toLowerCase();
        return (
          name.includes(search) ||
          email.includes(search) ||
          company.includes(search) ||
          desc.includes(search)
        );
      });
    }

    return NextResponse.json({ inquiries: records });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

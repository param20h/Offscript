import { NextResponse } from "next/server";
import { getPrivateSession } from "@/lib/auth/session";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/db/supabase";
import { buildCsvRow } from "@/lib/analytics/engine";

export async function GET(request: Request) {
  try {
    const session = await getPrivateSession();
    if (!session.authenticated) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Database not configured on server" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "invoices";
    const supabase = getSupabaseServerClient();
    const dateStr = new Date().toISOString().slice(0, 10);

    let csvContent = "";
    let filename = `OFFSCRIPT-${type}-export-${dateStr}.csv`;

    if (type === "invoices") {
      const { data: invoices } = await supabase
        .from("invoices")
        .select("*, clients(name, company_name, email)")
        .order("created_at", { ascending: false });

      const headers = [
        "Invoice Number",
        "Client Name",
        "Company",
        "Client Email",
        "Issue Date",
        "Due Date",
        "Status",
        "Currency",
        "Subtotal",
        "Discount Amount",
        "Tax Amount",
        "Total Invoiced",
        "Amount Paid",
        "Balance Due",
        "Created At",
      ];
      csvContent += buildCsvRow(headers);

      (invoices || []).forEach((inv: any) => {
        csvContent += buildCsvRow([
          inv.invoice_number,
          inv.clients?.name || "",
          inv.clients?.company_name || "",
          inv.clients?.email || "",
          inv.issue_date,
          inv.due_date,
          inv.status,
          inv.currency,
          inv.subtotal,
          inv.discount_amount,
          inv.tax_amount,
          inv.total_amount,
          inv.amount_paid,
          inv.balance_due,
          inv.created_at,
        ]);
      });
    } else if (type === "projects") {
      const { data: projects } = await supabase
        .from("projects")
        .select("*, clients(name, company_name, email)")
        .order("created_at", { ascending: false });

      const headers = [
        "Project Number",
        "Title",
        "Client",
        "Company",
        "Project Type",
        "Status",
        "Priority",
        "Progress %",
        "Budget",
        "Currency",
        "Start Date",
        "Target Completion Date",
        "Created At",
      ];
      csvContent += buildCsvRow(headers);

      (projects || []).forEach((p: any) => {
        csvContent += buildCsvRow([
          p.project_number,
          p.title,
          p.clients?.name || "",
          p.clients?.company_name || "",
          p.project_type,
          p.status,
          p.priority,
          p.progress_percentage || 0,
          p.total_budget,
          p.currency,
          p.start_date || "",
          p.estimated_completion_date || "",
          p.created_at,
        ]);
      });
    } else if (type === "proposals") {
      const { data: proposals } = await supabase
        .from("proposals")
        .select("*, clients(name, company_name)")
        .order("created_at", { ascending: false });

      const headers = [
        "Proposal Number",
        "Title",
        "Client",
        "Company",
        "Status",
        "Subtotal",
        "Total Amount",
        "Currency",
        "Valid Until",
        "Sent At",
        "Accepted At",
        "Created At",
      ];
      csvContent += buildCsvRow(headers);

      (proposals || []).forEach((p: any) => {
        csvContent += buildCsvRow([
          p.proposal_number,
          p.title,
          p.clients?.name || "",
          p.clients?.company_name || "",
          p.status,
          p.subtotal,
          p.total_amount,
          p.currency,
          p.valid_until,
          p.sent_at || "",
          p.accepted_at || "",
          p.created_at,
        ]);
      });
    } else if (type === "clients") {
      const { data: clients } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      const headers = [
        "Client Name",
        "Company",
        "Email",
        "Phone",
        "Website",
        "Industry",
        "Client Type",
        "Status",
        "Created At",
      ];
      csvContent += buildCsvRow(headers);

      (clients || []).forEach((c) => {
        csvContent += buildCsvRow([
          c.name,
          c.company_name || "",
          c.email,
          c.phone || "",
          c.website || "",
          c.industry || "",
          c.client_type,
          c.status,
          c.created_at,
        ]);
      });
    } else if (type === "inquiries") {
      const { data: inquiries } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      const headers = [
        "Inquiry ID",
        "Name",
        "Email",
        "Company",
        "Project Type",
        "Budget Range",
        "Timeline",
        "Business Status",
        "Created At",
      ];
      csvContent += buildCsvRow(headers);

      (inquiries || []).forEach((inq) => {
        csvContent += buildCsvRow([
          inq.id,
          inq.name,
          inq.email,
          inq.company || "",
          inq.project_type,
          inq.budget_range,
          inq.timeline,
          inq.business_status,
          inq.created_at,
        ]);
      });
    } else {
      return NextResponse.json({ error: "Invalid report export type" }, { status: 400 });
    }

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error exporting report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

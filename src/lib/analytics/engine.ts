import {
  getSupabaseServerClient,
  isSupabaseConfigured,
  InvoiceRecord,
  PaymentRecord,
  ProposalRecord,
  InquiryRecord,
  ProjectRecord,
  ClientRecord,
} from "@/lib/db/supabase";

export interface AnalyticsPeriodFilter {
  period?: "30d" | "90d" | "12m" | "all";
}

export interface MonthlyRevenueData {
  month: string; // e.g. "2026-05"
  label: string; // e.g. "May 2026"
  invoiced: number;
  collected: number;
}

export interface StudioAnalyticsSummary {
  revenue: {
    grossInvoiced: number;
    totalCollected: number;
    balanceDue: number;
    overdueAmount: number;
    primaryCurrency: string;
  };
  pipeline: {
    totalInquiries: number;
    qualifiedInquiries: number;
    totalProposals: number;
    acceptedProposals: number;
    winRatePercentage: number;
    inquiryToProjectConversionRate: number;
  };
  projects: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
    avgProgressPercentage: number;
  };
  clients: {
    totalClients: number;
    activeClients: number;
    avgRevenuePerClient: number;
  };
  monthlyRevenue: MonthlyRevenueData[];
}

export function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);

  // Security: Prevent Formula Injection in Microsoft Excel & Google Sheets
  // If the cell begins with =, +, -, @, \t, or \r, prepend a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes and enclose in quotes
  return `"${str.replace(/"/g, '""')}"`;
}

export function buildCsvRow(fields: unknown[]): string {
  return fields.map(escapeCsvField).join(",") + "\r\n";
}

function getPeriodStartDate(period: "30d" | "90d" | "12m" | "all"): Date | null {
  if (period === "all") return null;
  const now = new Date();
  if (period === "30d") {
    now.setDate(now.getDate() - 30);
    return now;
  }
  if (period === "90d") {
    now.setDate(now.getDate() - 90);
    return now;
  }
  if (period === "12m") {
    now.setFullYear(now.getFullYear() - 1);
    return now;
  }
  return null;
}

export async function computeStudioAnalytics(
  period: "30d" | "90d" | "12m" | "all" = "all"
): Promise<StudioAnalyticsSummary> {
  const defaultSummary: StudioAnalyticsSummary = {
    revenue: {
      grossInvoiced: 0,
      totalCollected: 0,
      balanceDue: 0,
      overdueAmount: 0,
      primaryCurrency: "INR",
    },
    pipeline: {
      totalInquiries: 0,
      qualifiedInquiries: 0,
      totalProposals: 0,
      acceptedProposals: 0,
      winRatePercentage: 0,
      inquiryToProjectConversionRate: 0,
    },
    projects: {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      onHoldProjects: 0,
      avgProgressPercentage: 0,
    },
    clients: {
      totalClients: 0,
      activeClients: 0,
      avgRevenuePerClient: 0,
    },
    monthlyRevenue: [],
  };

  if (!isSupabaseConfigured()) {
    return defaultSummary;
  }

  const supabase = getSupabaseServerClient();
  const periodStart = getPeriodStartDate(period);
  const periodIso = periodStart ? periodStart.toISOString() : null;

  const [invoicesRes, paymentsRes, proposalsRes, inquiriesRes, projectsRes, clientsRes] =
    await Promise.all([
      supabase.from("invoices").select("*"),
      supabase.from("payments").select("*").eq("status", "recorded"),
      supabase.from("proposals").select("*"),
      supabase.from("inquiries").select("*"),
      supabase.from("projects").select("*"),
      supabase.from("clients").select("*"),
    ]);

  const allInvoices = (invoicesRes.data as InvoiceRecord[]) || [];
  const allPayments = (paymentsRes.data as PaymentRecord[]) || [];
  const allProposals = (proposalsRes.data as ProposalRecord[]) || [];
  const allInquiries = (inquiriesRes.data as InquiryRecord[]) || [];
  const allProjects = (projectsRes.data as ProjectRecord[]) || [];
  const allClients = (clientsRes.data as ClientRecord[]) || [];

  // Filter datasets based on created_at / issue_date if period is restricted
  const invoices = periodIso
    ? allInvoices.filter((i) => i.created_at >= periodIso)
    : allInvoices;
  const payments = periodIso
    ? allPayments.filter((p) => p.payment_date >= periodIso.slice(0, 10))
    : allPayments;
  const proposals = periodIso
    ? allProposals.filter((p) => p.created_at >= periodIso)
    : allProposals;
  const inquiries = periodIso
    ? allInquiries.filter((inq) => inq.created_at >= periodIso)
    : allInquiries;
  const projects = periodIso
    ? allProjects.filter((prj) => prj.created_at >= periodIso)
    : allProjects;

  // 1. Revenue Metrics (Using integer paise precision to eliminate floating point drift)
  let grossInvoicedPaise = 0;
  let totalCollectedPaise = 0;
  let balanceDuePaise = 0;
  let overduePaise = 0;
  const nowTime = Date.now();

  invoices.forEach((inv) => {
    if (inv.status === "void" || inv.status === "cancelled") return;

    const total = Math.round(Number(inv.total_amount) * 100);
    const paid = Math.round(Number(inv.amount_paid || 0) * 100);
    const due = Math.round(Number(inv.balance_due || 0) * 100);

    grossInvoicedPaise += total;
    totalCollectedPaise += paid;
    balanceDuePaise += due;

    if (due > 0 && new Date(inv.due_date).getTime() < nowTime) {
      overduePaise += due;
    }
  });

  const primaryCurrency = invoices[0]?.currency || "INR";

  // 2. Pipeline & Conversion
  const totalInquiries = inquiries.length;
  const qualifiedInquiries = inquiries.filter(
    (i) =>
      i.business_status === "reviewing" ||
      i.business_status === "proposal_in_progress" ||
      i.business_status === "proposal_sent" ||
      i.business_status === "accepted" ||
      i.business_status === "converted"
  ).length;

  const totalProposals = proposals.length;
  const acceptedProposals = proposals.filter((p) => p.status === "accepted").length;
  const winRatePercentage =
    totalProposals > 0 ? Math.round((acceptedProposals / totalProposals) * 100) : 0;

  const inquiryToProjectConversionRate =
    totalInquiries > 0 ? Math.round((allProjects.length / totalInquiries) * 100) : 0;

  // 3. Project Delivery
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) =>
    ["planning", "scheduled", "in_progress", "review"].includes(p.status)
  ).length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const onHoldProjects = projects.filter((p) => p.status === "on_hold").length;
  const avgProgressPercentage =
    totalProjects > 0
      ? Math.round(
          projects.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) /
            totalProjects
        )
      : 0;

  // 4. Clients
  const totalClients = allClients.length;
  const activeClients = allClients.filter((c) => c.status === "active").length;
  const avgRevenuePerClient =
    totalClients > 0 ? Math.round(grossInvoicedPaise / 100 / totalClients) : 0;

  // 5. Monthly Revenue Timeline (Last 6 Months)
  const monthlyMap: Record<string, { invoicedPaise: number; collectedPaise: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = { invoicedPaise: 0, collectedPaise: 0 };
  }

  allInvoices.forEach((inv) => {
    if (inv.status === "void" || inv.status === "cancelled") return;
    const key = inv.issue_date.slice(0, 7);
    if (monthlyMap[key]) {
      monthlyMap[key].invoicedPaise += Math.round(Number(inv.total_amount) * 100);
    }
  });

  allPayments.forEach((p) => {
    const key = p.payment_date.slice(0, 7);
    if (monthlyMap[key]) {
      monthlyMap[key].collectedPaise += Math.round(Number(p.amount) * 100);
    }
  });

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const monthlyRevenue: MonthlyRevenueData[] = Object.keys(monthlyMap).map((mKey) => {
    const [yearStr, monthStr] = mKey.split("-");
    const mIdx = parseInt(monthStr, 10) - 1;
    const label = `${monthNames[mIdx]} ${yearStr}`;
    return {
      month: mKey,
      label,
      invoiced: monthlyMap[mKey].invoicedPaise / 100,
      collected: monthlyMap[mKey].collectedPaise / 100,
    };
  });

  return {
    revenue: {
      grossInvoiced: grossInvoicedPaise / 100,
      totalCollected: totalCollectedPaise / 100,
      balanceDue: balanceDuePaise / 100,
      overdueAmount: overduePaise / 100,
      primaryCurrency,
    },
    pipeline: {
      totalInquiries,
      qualifiedInquiries,
      totalProposals,
      acceptedProposals,
      winRatePercentage,
      inquiryToProjectConversionRate,
    },
    projects: {
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      avgProgressPercentage,
    },
    clients: {
      totalClients,
      activeClients,
      avgRevenuePerClient,
    },
    monthlyRevenue,
  };
}

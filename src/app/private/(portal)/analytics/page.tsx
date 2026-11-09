import React from "react";
import { computeStudioAnalytics } from "@/lib/analytics/engine";
import AnalyticsDashboardView from "@/components/private/AnalyticsDashboardView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Business Intelligence & Analytics | OFFSCRIPT Operations",
};

export default async function PrivateAnalyticsPage() {
  const initialAnalytics = await computeStudioAnalytics("all");

  return (
    <div className="space-y-6">
      <div className="border-b border-ivory/10 pb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ivory">
          Business Intelligence & Financial Performance
        </h1>
        <p className="text-xs font-mono text-ivory/50 mt-1">
          Revenue reconciliation, sales conversion funnel, project delivery velocity, and data exports.
        </p>
      </div>

      <AnalyticsDashboardView initialAnalytics={initialAnalytics} />
    </div>
  );
}

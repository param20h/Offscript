import React from "react";
import {
  Skeleton,
  SkeletonMetric,
  SkeletonTable,
  SkeletonCard,
} from "@/components/ui/Skeleton";

export default function PrivatePortalLoading() {
  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>

      {/* KPI Metrics Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonMetric variant="dark" />
        <SkeletonMetric variant="dark" />
        <SkeletonMetric variant="dark" />
        <SkeletonMetric variant="dark" />
      </div>

      {/* Operations Overview Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-20" />
          </div>
          <SkeletonTable rows={4} cols={4} variant="dark" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <SkeletonCard variant="dark" />
        </div>
      </div>
    </div>
  );
}

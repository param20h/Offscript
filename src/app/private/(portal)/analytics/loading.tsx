import React from "react";
import { Skeleton, SkeletonMetric, SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonMetric variant="dark" />
        <SkeletonMetric variant="dark" />
        <SkeletonMetric variant="dark" />
        <SkeletonMetric variant="dark" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard variant="dark" className="h-72" />
        <SkeletonCard variant="dark" className="h-72" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <SkeletonTable rows={5} cols={5} variant="dark" />
      </div>
    </div>
  );
}

import React from "react";
import { Skeleton, SkeletonMetric, SkeletonTable } from "@/components/ui/Skeleton";

export default function ProposalsLoading() {
  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonMetric variant="dark" />
        <SkeletonMetric variant="dark" />
        <SkeletonMetric variant="dark" />
        <SkeletonMetric variant="dark" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-36" />
        </div>
        <SkeletonTable rows={6} cols={6} variant="dark" />
      </div>
    </div>
  );
}

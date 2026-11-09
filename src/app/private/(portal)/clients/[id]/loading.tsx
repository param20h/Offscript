import React from "react";
import { Skeleton, SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";

export default function ClientDetailLoading() {
  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 text-xs font-mono text-ivory/50">
        <Skeleton className="h-4 w-16" />
        <span>/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonCard variant="dark" />
        <SkeletonCard variant="dark" />
        <SkeletonCard variant="dark" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <SkeletonTable rows={4} cols={4} variant="dark" />
      </div>
    </div>
  );
}

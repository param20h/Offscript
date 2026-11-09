import React from "react";
import { Skeleton, SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";

export default function ClientPortalLoading() {
  return (
    <div className="min-h-screen bg-[#F0EDE5] text-[#171717] py-12 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header Skeleton */}
        <header className="border-b border-[#171717]/15 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton variant="light" className="h-6 w-36" />
              <Skeleton variant="light" className="h-5 w-24" />
            </div>
            <Skeleton variant="light" className="h-9 w-64" />
            <Skeleton variant="light" className="h-4 w-48" />
          </div>

          <div className="w-48">
            <Skeleton variant="light" className="h-12 w-full" />
          </div>
        </header>

        {/* High-Level Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonCard variant="light" className="h-28" />
          <SkeletonCard variant="light" className="h-28" />
          <SkeletonCard variant="light" className="h-28" />
        </div>

        {/* Projects Section */}
        <div className="space-y-4">
          <Skeleton variant="light" className="h-6 w-48" />
          <SkeletonCard variant="light" />
        </div>

        {/* Commercial Billing Section */}
        <div className="space-y-4">
          <Skeleton variant="light" className="h-6 w-52" />
          <SkeletonTable rows={4} cols={5} variant="light" />
        </div>
      </div>
    </div>
  );
}

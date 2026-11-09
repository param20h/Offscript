import React from "react";
import { Skeleton, SkeletonCard, SkeletonTable } from "@/components/ui/Skeleton";

export default function ProposalViewerLoading() {
  return (
    <div className="min-h-screen bg-[#111111] text-ivory flex flex-col font-sans animate-in fade-in duration-200">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-[#161616]/95 backdrop-blur-md border-b border-ivory/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton variant="dark" className="h-6 w-32" />
            <Skeleton variant="dark" className="h-5 w-20" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton variant="dark" className="h-8 w-28" />
            <Skeleton variant="dark" className="h-8 w-32" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8 flex-1">
        {/* Document Header Card */}
        <div className="border border-ivory/10 bg-[#171717] p-8 rounded-sm space-y-4">
          <Skeleton variant="dark" className="h-4 w-32" />
          <Skeleton variant="dark" className="h-9 w-96 max-w-full" />
          <Skeleton variant="dark" className="h-4 w-64" />
        </div>

        {/* Commercial Breakdown */}
        <div className="space-y-4">
          <Skeleton variant="dark" className="h-6 w-48" />
          <SkeletonTable rows={4} cols={4} variant="dark" />
        </div>

        {/* Milestones Schedule */}
        <div className="space-y-4">
          <Skeleton variant="dark" className="h-6 w-56" />
          <SkeletonCard variant="dark" />
        </div>
      </main>
    </div>
  );
}

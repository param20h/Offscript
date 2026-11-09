"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "dark" | "light" | "accent";
}

/**
 * Base architectural skeleton block.
 * Uses high-contrast subtle surface tone with hardware-accelerated pulse animation.
 * Respects prefers-reduced-motion globally via CSS.
 */
export function Skeleton({
  className,
  variant = "dark",
  ...props
}: SkeletonProps) {
  const variantStyles = {
    dark: "bg-white/[0.06] border border-white/[0.04]",
    light: "bg-[#171717]/[0.07] border border-[#171717]/[0.05]",
    accent: "bg-[#D6FF35]/15 border border-[#D6FF35]/20",
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-xs transition-opacity duration-300",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

/**
 * Multi-line skeleton text placeholder with variable line widths.
 */
export function SkeletonText({
  lines = 3,
  lastLineWidth = "60%",
  className,
  variant = "dark",
}: {
  lines?: number;
  lastLineWidth?: string;
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant={variant}
          style={{
            width: i === lines - 1 ? lastLineWidth : "100%",
          }}
          className="h-3.5"
        />
      ))}
    </div>
  );
}

/**
 * Architectural metric / KPI card placeholder.
 */
export function SkeletonMetric({
  variant = "dark",
  className,
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const containerStyles =
    variant === "dark"
      ? "bg-white/[0.02] border-white/10"
      : "bg-white/80 border-[#171717]/10";

  return (
    <div
      aria-hidden="true"
      className={cn("p-5 border rounded-sm space-y-3", containerStyles, className)}
    >
      <div className="flex items-center justify-between">
        <Skeleton variant={variant} className="h-3 w-24" />
        <Skeleton variant={variant} className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton variant={variant} className="h-8 w-36" />
      <Skeleton variant={variant} className="h-2.5 w-20" />
    </div>
  );
}

/**
 * Architectural card container with header and content lines.
 */
export function SkeletonCard({
  variant = "dark",
  className,
  children,
}: {
  variant?: "dark" | "light";
  className?: string;
  children?: React.ReactNode;
}) {
  const containerStyles =
    variant === "dark"
      ? "bg-white/[0.02] border-white/10"
      : "bg-white border-[#171717]/10 shadow-xs";

  return (
    <div
      aria-hidden="true"
      className={cn("p-6 border rounded-sm space-y-4", containerStyles, className)}
    >
      {children || (
        <>
          <div className="flex items-center justify-between border-b border-inherit pb-4">
            <Skeleton variant={variant} className="h-5 w-48" />
            <Skeleton variant={variant} className="h-4 w-20" />
          </div>
          <div className="space-y-3 pt-2">
            <Skeleton variant={variant} className="h-4 w-full" />
            <Skeleton variant={variant} className="h-4 w-4/5" />
            <Skeleton variant={variant} className="h-4 w-2/3" />
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Architectural data table skeleton with header and row cells.
 */
export function SkeletonTable({
  rows = 5,
  cols = 5,
  variant = "dark",
  className,
}: {
  rows?: number;
  cols?: number;
  variant?: "dark" | "light";
  className?: string;
}) {
  const borderClass = variant === "dark" ? "border-white/10" : "border-[#171717]/10";
  const rowBorderClass = variant === "dark" ? "border-white/[0.05]" : "border-[#171717]/[0.05]";

  return (
    <div
      aria-hidden="true"
      className={cn("w-full border rounded-sm overflow-hidden", borderClass, className)}
    >
      {/* Table Header Row */}
      <div
        className={cn(
          "grid gap-4 p-4 border-b",
          variant === "dark" ? "bg-white/[0.03]" : "bg-[#171717]/[0.03]",
          borderClass
        )}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton
            key={i}
            variant={variant}
            className={cn("h-3.5", i === 0 ? "w-24" : "w-16")}
          />
        ))}
      </div>

      {/* Table Body Rows */}
      <div className="divide-y divide-inherit">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className={cn("grid gap-4 p-4 items-center border-b last:border-b-0", rowBorderClass)}
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                variant={variant}
                className={cn(
                  "h-4",
                  cIdx === 0
                    ? "w-4/5 font-semibold"
                    : cIdx === cols - 1
                    ? "w-20 ml-auto"
                    : "w-3/4"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

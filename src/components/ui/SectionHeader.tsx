import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  index?: string;
  badge?: string;
  title: string | React.ReactNode;
  subtitle?: string;
  description?: string;
  align?: "left" | "center" | "split";
  className?: string;
  children?: React.ReactNode;
}

export default function SectionHeader({
  index,
  badge,
  title,
  subtitle,
  description,
  align = "left",
  className,
  children,
}: SectionHeaderProps) {
  if (align === "split") {
    return (
      <div
        className={cn(
          "flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 mb-12 border-b border-obsidian-border",
          className
        )}
      >
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            {index && (
              <span className="font-mono text-xs uppercase tracking-widest text-acid">
                {index}
              </span>
            )}
            {badge && (
              <span
                className={cn(
                  "font-mono text-xs uppercase tracking-wider text-acid font-medium",
                  index && "text-ivory-dim border-l border-obsidian-border pl-3 text-[10px]"
                )}
              >
                {badge}
              </span>
            )}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-ivory">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-lg text-ivory-muted font-sans font-light">
              {subtitle}
            </p>
          )}
        </div>
        <div className="lg:max-w-md">
          {description && (
            <p className="text-sm md:text-base text-ivory-muted/80 leading-relaxed font-sans mb-4">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-12 pb-6 border-b border-obsidian-border",
        align === "center" ? "text-center mx-auto max-w-3xl" : "max-w-3xl",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 mb-3",
          align === "center" && "justify-center"
        )}
      >
        {index && (
          <span className="font-mono text-xs uppercase tracking-widest text-acid">
            {index}
          </span>
        )}
        {badge && (
          <span
            className={cn(
              "font-mono text-xs uppercase tracking-wider text-acid font-medium",
              index && "text-ivory-dim border-l border-obsidian-border pl-3 text-[10px]"
            )}
          >
            {badge}
          </span>
        )}
      </div>
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-ivory">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-lg md:text-xl text-ivory-muted font-sans font-light">
          {subtitle}
        </p>
      )}
      {description && (
        <p className="mt-4 text-sm md:text-base text-ivory-muted/80 leading-relaxed">
          {description}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

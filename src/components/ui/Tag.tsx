import React from "react";
import { cn } from "@/lib/utils";

interface TagProps {
  children: React.ReactNode;
  variant?: "default" | "acid" | "outline" | "subtle";
  size?: "sm" | "md";
  className?: string;
}

export default function Tag({
  children,
  variant = "default",
  size = "sm",
  className,
}: TagProps) {
  const base =
    "inline-flex items-center font-mono font-medium tracking-wider uppercase transition-colors";

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  const variantClasses = {
    default: "bg-obsidian-subtle text-ivory-muted border border-obsidian-border",
    acid: "bg-acid/10 text-acid border border-acid/30",
    outline: "border border-ivory/20 text-ivory/80",
    subtle: "bg-transparent text-ivory-dim border-b border-obsidian-border rounded-none px-0",
  };

  return (
    <span className={cn(base, sizeClasses[size], variantClasses[variant], className)}>
      {children}
    </span>
  );
}

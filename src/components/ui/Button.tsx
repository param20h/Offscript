"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "acid";
  size?: "sm" | "md" | "lg";
  withArrow?: boolean;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  href,
  variant = "primary",
  size = "md",
  withArrow = false,
  external = false,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid disabled:opacity-50 disabled:pointer-events-none group relative overflow-hidden select-none cursor-pointer";

  const sizeStyles = {
    sm: "px-4 py-2 text-[11px] gap-1.5",
    md: "px-6 py-3.5 text-xs gap-2",
    lg: "px-8 py-4 text-sm gap-2.5",
  };

  const variantStyles = {
    // Primary: Acid lime background with black text
    primary:
      "bg-acid text-obsidian hover:bg-[#c2eb24] active:scale-[0.98] shadow-[0_0_24px_rgba(214,255,53,0.18)] hover:shadow-[0_0_32px_rgba(214,255,53,0.35)]",
    // Secondary: Warm Ivory background with dark text
    secondary:
      "bg-ivory text-obsidian hover:bg-white active:scale-[0.98]",
    // Outline: Hairline ivory border with transparent background
    outline:
      "border border-ivory/30 text-ivory hover:border-acid hover:text-acid active:scale-[0.98] bg-transparent backdrop-blur-xs",
    // Ghost: Minimalist hover state
    ghost:
      "text-ivory-muted hover:text-acid hover:bg-obsidian-subtle active:scale-[0.98]",
    // Acid Outline: Hairline acid lime border
    acid:
      "border border-acid/60 text-acid hover:bg-acid hover:text-obsidian active:scale-[0.98]",
  };

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      {withArrow && (
        <ArrowUpRight
          className={cn(
            "transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0",
            size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"
          )}
          aria-hidden="true"
        />
      )}
    </>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {content}
    </button>
  );
}

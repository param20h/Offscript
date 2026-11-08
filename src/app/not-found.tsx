import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="p-8 sm:p-12 border border-obsidian-border bg-obsidian-surface max-w-lg w-full relative">
        <span className="font-mono text-xs uppercase tracking-widest text-acid block mb-4">
          // 404: ERROR_RESOURCE_NOT_FOUND
        </span>
        <h1 className="font-display text-5xl sm:text-6xl font-bold text-ivory tracking-tight mb-4">
          OFF GRID.
        </h1>
        <p className="font-sans text-sm text-ivory-muted leading-relaxed mb-8">
          The requested coordinate does not exist within the studio directory or has been migrated.
        </p>
        <Button href="/" variant="primary" size="md" withArrow>
          RETURN TO HOMEPAGE
        </Button>
      </div>
    </div>
  );
}

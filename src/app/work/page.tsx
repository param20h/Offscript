import React from "react";
import type { Metadata } from "next";
import SectionHeader from "@/components/ui/SectionHeader";
import WorkIndex from "@/components/work/WorkIndex";

export const metadata: Metadata = {
  title: "Work — Verified Engineering Systems & Portfolio",
  description:
    "Explore OFFSCRIPT's portfolio of verified engineering systems, autonomous AI agents, developer tooling, and production platforms.",
};

export default function WorkPage() {
  return (
    <div className="w-full py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        index="// WORK PORTFOLIO"
        badge="ENGINEERING REPOSITORIES"
        title="VERIFIED SYSTEMS."
        subtitle="Autonomous agents, developer tooling, and production platforms built with technical rigor."
        description="Every system featured here is an authentic engineering artifact. We do not fabricate clients, vanity metrics, or speculative impact claims."
      />

      <WorkIndex />
    </div>
  );
}

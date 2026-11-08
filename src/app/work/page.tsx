import React from "react";
import type { Metadata } from "next";
import { PROJECTS } from "@/content/projects";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import MotionWrapper from "@/components/motion/MotionWrapper";
import { Terminal, Layers, Cpu } from "lucide-react";

export const metadata: Metadata = {
  title: "Work — Verified Engineering Systems",
  description:
    "Explore OFFSCRIPT's portfolio of verified engineering systems, intelligent tools, and AI prototypes.",
};

export default function WorkPage() {
  return (
    <div className="w-full py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        index="// WORK ARCHIVE"
        badge="ENGINEERING REPOSITORIES"
        title="VERIFIED SYSTEMS."
        subtitle="Autonomous agents, developer tooling, and production platforms."
        description="Every system featured here is an authentic engineering artifact. We do not fabricate clients, vanity metrics, or speculative impact claims."
      />

      <div className="space-y-12 mt-12">
        {PROJECTS.map((project, idx) => (
          <MotionWrapper
            key={project.slug}
            delay={idx * 0.08}
            className="p-6 sm:p-10 border border-obsidian-border bg-obsidian-surface hover:border-ivory/40 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-obsidian-border font-mono text-xs">
              <span className="text-acid font-bold">
                0{idx + 1} // {project.category.toUpperCase()}
              </span>
              <Tag variant="acid" size="sm">
                {project.status}
              </Tag>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-start">
              <div className="lg:col-span-7">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-ivory tracking-tight">
                  {project.title}
                </h2>
                <p className="font-mono text-xs text-acid tracking-wide mt-1 mb-4 uppercase">
                  {project.tagline}
                </p>
                <p className="font-sans text-base text-ivory-muted/90 leading-relaxed font-light mb-6">
                  {project.description}
                </p>

                <div className="p-4 bg-obsidian border border-obsidian-border mb-6">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-ivory-dim uppercase tracking-widest mb-1">
                    <Terminal className="w-3.5 h-3.5 text-acid" />
                    <span>System Architecture Blueprint</span>
                  </div>
                  <p className="font-mono text-xs text-ivory-muted">
                    {project.architectureSummary}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Tag key={tech} variant="default" size="sm">
                      {tech}
                    </Tag>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 border border-obsidian-border bg-obsidian p-6 flex flex-col justify-between">
                <div className="font-mono text-[11px] text-ivory-dim space-y-3">
                  <div className="flex justify-between border-b border-obsidian-border pb-2">
                    <span>STATUS</span>
                    <span className="text-acid">{project.status}</span>
                  </div>
                  <div className="flex justify-between border-b border-obsidian-border pb-2">
                    <span>SYSTEM ID</span>
                    <span className="text-ivory">{project.slug}</span>
                  </div>
                  <div className="flex justify-between border-b border-obsidian-border pb-2">
                    <span>VERIFICATION</span>
                    <span className="text-ivory">Source Code Verified</span>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-obsidian-border flex justify-end">
                  <Button
                    href="/contact"
                    variant="outline"
                    size="sm"
                    withArrow
                  >
                    INQUIRE ABOUT THIS ARCHITECTURE
                  </Button>
                </div>
              </div>
            </div>
          </MotionWrapper>
        ))}
      </div>
    </div>
  );
}

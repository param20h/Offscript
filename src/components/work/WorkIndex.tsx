"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PROJECTS, CATEGORIES, Project } from "@/content/projects";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import MotionWrapper from "@/components/motion/MotionWrapper";
import { ArrowUpRight, Terminal, Layers, Cpu, ShieldCheck, GitBranch, Database, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WorkIndex() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "All") return PROJECTS;
    return PROJECTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="space-y-12">
      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-obsidian-border font-mono text-xs">
        <span className="text-ivory-dim uppercase tracking-wider mr-2 text-[11px]">
          Filter Discipline:
        </span>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-3 py-1.5 uppercase tracking-wider text-[11px] transition-all duration-200 cursor-pointer border",
                isSelected
                  ? "bg-acid text-obsidian border-acid font-semibold"
                  : "bg-obsidian-surface text-ivory-muted hover:text-ivory border-obsidian-border hover:border-ivory/30"
              )}
            >
              {cat}
              <span className="ml-1.5 opacity-60 text-[10px]">
                ({cat === "All" ? PROJECTS.length : PROJECTS.filter((p) => p.category === cat).length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Projects Showcase Stream */}
      <div className="space-y-12">
        {filteredProjects.map((project, idx) => (
          <MotionWrapper
            key={project.slug}
            delay={idx * 0.06}
            className="group relative border border-obsidian-border bg-obsidian-surface p-6 sm:p-10 transition-all duration-300 hover:border-ivory/40"
          >
            {/* Top Metadata Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-obsidian-border font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="text-acid font-bold">
                  // 0{idx + 1}
                </span>
                <span className="text-ivory-dim uppercase tracking-wider">
                  {project.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Tag variant="acid" size="sm">
                  {project.status}
                </Tag>
              </div>
            </div>

            {/* Main Content Split: Editorial Info Left, Distinctive Diagram Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 items-start">
              {/* Left Column */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <Link href={`/work/${project.slug}`} className="group/link block">
                    <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ivory group-hover/link:text-acid transition-colors">
                      {project.title}
                    </h2>
                  </Link>

                  <p className="font-mono text-xs text-acid tracking-wide mt-1.5 mb-4 uppercase">
                    {project.tagline}
                  </p>
                  <p className="font-sans text-sm sm:text-base text-ivory-muted leading-relaxed font-light mb-6">
                    {project.description}
                  </p>
                </div>

                {/* Architecture Summary Box */}
                <div className="p-4 bg-obsidian border border-obsidian-border mb-6">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-ivory-dim uppercase tracking-widest mb-1">
                    <Terminal className="w-3.5 h-3.5 text-acid" />
                    <span>Architecture Blueprint</span>
                  </div>
                  <p className="font-mono text-xs text-ivory-muted leading-relaxed">
                    {project.architectureSummary}
                  </p>
                </div>

                {/* Tech Badges */}
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Tag key={tech} variant="default" size="sm">
                      {tech}
                    </Tag>
                  ))}
                </div>
              </div>

              {/* Right Column: Distinctive Interactive Schematic Card */}
              <div className="lg:col-span-5 flex flex-col h-full">
                <div className="w-full h-64 sm:h-72 border border-obsidian-border bg-obsidian relative overflow-hidden flex flex-col justify-between p-5 group-hover:border-acid/40 transition-colors">
                  {/* Subtle Grid */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

                  {/* Header */}
                  <div className="flex justify-between items-center font-mono text-[10px] text-ivory-dim border-b border-obsidian-border pb-2 z-10">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-acid rounded-none inline-block" />
                      SPEC // {project.slug.toUpperCase()}
                    </span>
                    <span className="text-acid">{project.verificationBadge}</span>
                  </div>

                  {/* Project-Specific Custom Topology Diagram */}
                  <div className="relative z-10 flex-1 flex items-center justify-center py-4">
                    <div className="w-full max-w-xs space-y-2 font-mono text-[11px]">
                      {project.slug === "myco-pr-intelligence" && (
                        <>
                          <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface">
                            <span className="text-ivory-muted flex items-center gap-1.5">
                              <GitBranch className="w-3.5 h-3.5 text-acid" />
                              GitHub PR AST Stream
                            </span>
                            <span className="text-acid text-[10px]">REST/Hook</span>
                          </div>
                          <div className="flex justify-center text-ivory-dim text-[10px]">
                            ↓ [Tree-sitter Symbol Parser]
                          </div>
                          <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface">
                            <span className="text-ivory flex items-center gap-1.5 font-medium">
                              <Cpu className="w-3.5 h-3.5 text-acid" />
                              Cross-Repo Breaking Risk
                            </span>
                            <span className="text-acid text-[10px]">0–100 Score</span>
                          </div>
                        </>
                      )}

                      {project.slug === "zenithflow" && (
                        <>
                          <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface">
                            <span className="text-ivory-muted flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5 text-acid" />
                              Command Palette Engine
                            </span>
                            <span className="text-acid text-[10px]">Sub-10ms</span>
                          </div>
                          <div className="flex justify-center text-ivory-dim text-[10px]">
                            ↓ [Optimistic Reactive Store]
                          </div>
                          <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface">
                            <span className="text-ivory flex items-center gap-1.5 font-medium">
                              <Zap className="w-3.5 h-3.5 text-acid" />
                              Async Task Orchestration
                            </span>
                            <span className="text-acid text-[10px]">Offline Cache</span>
                          </div>
                        </>
                      )}

                      {project.slug === "vesta-ai" && (
                        <>
                          <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface">
                            <span className="text-ivory-muted flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-acid" />
                              SEC Filings &amp; Transcripts
                            </span>
                            <span className="text-acid text-[10px]">10-K/10-Q</span>
                          </div>
                          <div className="flex justify-center text-ivory-dim text-[10px]">
                            ↓ [Multi-Agent Evaluator Graph]
                          </div>
                          <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface">
                            <span className="text-ivory flex items-center gap-1.5 font-medium">
                              <Cpu className="w-3.5 h-3.5 text-acid" />
                              Citation Verification Loop
                            </span>
                            <span className="text-acid text-[10px]">Zero Hallucination</span>
                          </div>
                        </>
                      )}

                      {project.slug === "campusiq" && (
                        <>
                          <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface">
                            <span className="text-ivory-muted flex items-center gap-1.5">
                              <Database className="w-3.5 h-3.5 text-acid" />
                              Concurrent Registration Stream
                            </span>
                            <span className="text-acid text-[10px]">Atomic Writes</span>
                          </div>
                          <div className="flex justify-center text-ivory-dim text-[10px]">
                            ↓ [Session Transactions + $inc]
                          </div>
                          <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface">
                            <span className="text-ivory flex items-center gap-1.5 font-medium">
                              <Layers className="w-3.5 h-3.5 text-acid" />
                              Realtime Attendance Hub
                            </span>
                            <span className="text-acid text-[10px]">Sub-10ms Agg</span>
                          </div>
                        </>
                      )}

                      {project.slug === "triage-ai" && (
                        <>
                          <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface">
                            <span className="text-ivory-muted flex items-center gap-1.5">
                              <Terminal className="w-3.5 h-3.5 text-acid" />
                              Incident Ingestion Stream
                            </span>
                            <span className="text-acid text-[10px]">Realtime</span>
                          </div>
                          <div className="flex justify-center text-ivory-dim text-[10px]">
                            ↓ [Embedding Match + Zero-Shot]
                          </div>
                          <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface">
                            <span className="text-ivory flex items-center gap-1.5 font-medium">
                              <Cpu className="w-3.5 h-3.5 text-acid" />
                              Deterministic On-Call Route
                            </span>
                            <span className="text-acid text-[10px]">Audit Logged</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center font-mono text-[10px] text-ivory-dim border-t border-obsidian-border pt-2 z-10">
                    <span>ARCHITECTURE: PRODUCTION_TESTED</span>
                    <span className="text-acid">STATUS: VERIFIED</span>
                  </div>
                </div>

                {/* Case Study Link */}
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/work/${project.slug}`}
                    className="font-mono text-xs text-ivory hover:text-acid flex items-center gap-1.5 transition-colors uppercase tracking-wider font-semibold group/btn"
                  >
                    <span>Read Architectural Case Study</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </MotionWrapper>
        ))}
      </div>

      {/* Verification Notice */}
      <div className="p-6 border border-obsidian-border bg-obsidian flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs text-ivory-dim">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-acid shrink-0" />
          <span>
            PROVENANCE NOTICE: All portfolio projects represent authentic, verified codebases and architectural designs. No fabricated metrics or fictional clients.
          </span>
        </div>
        <Button href="/contact" variant="acid" size="sm" withArrow>
          DISCUSS CUSTOM SYSTEM
        </Button>
      </div>
    </div>
  );
}

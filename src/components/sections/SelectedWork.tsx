"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PROJECTS, Project } from "@/content/projects";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import MotionWrapper from "@/components/motion/MotionWrapper";
import { ArrowUpRight, Code2, Layers, Cpu, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SelectedWork() {
  const [activeProject, setActiveProject] = useState<string>(PROJECTS[0].slug);

  return (
    <section id="work" className="relative w-full py-24 sm:py-32 bg-obsidian border-b border-obsidian-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <SectionHeader
          badge="PORTFOLIO INDEX"
          title="ENGINEERED SYSTEMS."
          subtitle="Real software architecture, autonomous AI agents, and intelligent products."
          description="Verified engineering systems and functional prototypes. No fabricated client case studies or artificial metrics—only real code and architectural depth."
          align="split"
        >
          <Button href="/work" variant="outline" size="sm" withArrow>
            VIEW ALL REPOSITORIES
          </Button>
        </SectionHeader>

        {/* Asymmetrical Project Showcase Grid */}
        <div className="space-y-12">
          {PROJECTS.map((project, index) => {
            const isFeatured = index === 0; // Myco PR Intelligence featured with expanded architectural card
            return (
              <MotionWrapper
                key={project.slug}
                delay={index * 0.08}
                className={cn(
                  "group relative border border-obsidian-border bg-obsidian-surface/60 transition-all duration-300 hover:border-ivory/40",
                  isFeatured ? "p-6 sm:p-10" : "p-6 sm:p-8"
                )}
              >
                {/* Upper Metadata Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-obsidian-border font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-acid font-bold">
                      SYSTEM //
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

                {/* Main Content Split: Details Left, Visual Architecture Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 items-start">
                  {/* Left Column: Title, Tagline, Description */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ivory group-hover:text-acid transition-colors">
                        {project.title}
                      </h3>
                      <p className="font-mono text-xs text-acid tracking-wide mt-1 mb-4 uppercase">
                        {project.tagline}
                      </p>
                      <p className="font-sans text-sm sm:text-base text-ivory-muted/90 leading-relaxed font-light mb-6">
                        {project.description}
                      </p>
                    </div>

                    {/* Architecture Summary Callout */}
                    <div className="p-4 bg-obsidian border border-obsidian-border mb-6">
                      <div className="flex items-center gap-2 font-mono text-[10px] text-ivory-dim uppercase tracking-widest mb-1">
                        <Terminal className="w-3.5 h-3.5 text-acid" />
                        <span>System Architecture</span>
                      </div>
                      <p className="font-mono text-xs text-ivory-muted">
                        {project.architectureSummary}
                      </p>
                    </div>

                    {/* Technology Stack Tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.technologies.map((tech) => (
                        <Tag key={tech} variant="default" size="sm">
                          {tech}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Architectural Wireframe / Blueprint Component */}
                  <div className="lg:col-span-5 flex flex-col h-full">
                    <div className="w-full h-56 sm:h-64 lg:h-72 border border-obsidian-border bg-obsidian relative overflow-hidden flex flex-col justify-between p-4 group-hover:border-acid/40 transition-colors">
                      {/* Grid background */}
                      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

                      {/* Header bar */}
                      <div className="flex justify-between items-center font-mono text-[10px] text-ivory-dim border-b border-obsidian-border pb-2 z-10">
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-acid rounded-none inline-block" />
                          SYS_SPEC: {project.slug.toUpperCase()}
                        </span>
                        <span>DIAG_v0.1</span>
                      </div>

                      {/* Project-Specific Schematic Topology Diagram */}
                      <div className="relative z-10 flex-1 flex items-center justify-center py-4">
                        <div className="w-full max-w-xs space-y-2 font-mono text-[11px]">
                          {project.slug === "myco-pr-intelligence" && (
                            <>
                              <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                                <span className="text-ivory-muted flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5 text-acid" />
                                  PR Diff Ingestion
                                </span>
                                <span className="text-acid text-[10px]">GitHub REST</span>
                              </div>
                              <div className="flex justify-center text-ivory-dim text-[10px]">
                                ↓ [Tree-sitter AST Parse]
                              </div>
                              <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface/90">
                                <span className="text-ivory flex items-center gap-1.5 font-medium">
                                  <Cpu className="w-3.5 h-3.5 text-acid" />
                                  Breaking Contract Matrix
                                </span>
                                <span className="text-acid text-[10px]">0–100 Score</span>
                              </div>
                            </>
                          )}

                          {project.slug === "zenithflow" && (
                            <>
                              <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                                <span className="text-ivory-muted flex items-center gap-1.5">
                                  <Terminal className="w-3.5 h-3.5 text-acid" />
                                  Command Engine
                                </span>
                                <span className="text-acid text-[10px]">Low Latency</span>
                              </div>
                              <div className="flex justify-center text-ivory-dim text-[10px]">
                                ↓ [Reactive State Bus]
                              </div>
                              <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface/90">
                                <span className="text-ivory flex items-center gap-1.5 font-medium">
                                  <Layers className="w-3.5 h-3.5 text-acid" />
                                  Async Orchestration Store
                                </span>
                                <span className="text-acid text-[10px]">Local-First</span>
                              </div>
                            </>
                          )}

                          {project.slug === "vesta-ai" && (
                            <>
                              <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                                <span className="text-ivory-muted flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5 text-acid" />
                                  SEC Disclosures &amp; Calls
                                </span>
                                <span className="text-acid text-[10px]">10-K / 10-Q</span>
                              </div>
                              <div className="flex justify-center text-ivory-dim text-[10px]">
                                ↓ [Multi-Agent Graph RAG]
                              </div>
                              <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface/90">
                                <span className="text-ivory flex items-center gap-1.5 font-medium">
                                  <Cpu className="w-3.5 h-3.5 text-acid" />
                                  Citation Synthesis Brief
                                </span>
                                <span className="text-acid text-[10px]">Verified RAG</span>
                              </div>
                            </>
                          )}

                          {project.slug === "campusiq" && (
                            <>
                              <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                                <span className="text-ivory-muted flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5 text-acid" />
                                  Department Event Streams
                                </span>
                                <span className="text-acid text-[10px]">WebSockets</span>
                              </div>
                              <div className="flex justify-center text-ivory-dim text-[10px]">
                                ↓ [Pub/Sub Message Bus]
                              </div>
                              <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface/90">
                                <span className="text-ivory flex items-center gap-1.5 font-medium">
                                  <Cpu className="w-3.5 h-3.5 text-acid" />
                                  Realtime Operations Hub
                                </span>
                                <span className="text-acid text-[10px]">Cluster Node</span>
                              </div>
                            </>
                          )}

                          {project.slug === "triage-ai" && (
                            <>
                              <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                                <span className="text-ivory-muted flex items-center gap-1.5">
                                  <Terminal className="w-3.5 h-3.5 text-acid" />
                                  Incident Queue Stream
                                </span>
                                <span className="text-acid text-[10px]">Zero-Shot</span>
                              </div>
                              <div className="flex justify-center text-ivory-dim text-[10px]">
                                ↓ [Embedding Classification]
                              </div>
                              <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface/90">
                                <span className="text-ivory flex items-center gap-1.5 font-medium">
                                  <Cpu className="w-3.5 h-3.5 text-acid" />
                                  Deterministic Routing
                                </span>
                                <span className="text-acid text-[10px]">Audit Log</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Footer telemetry */}
                      <div className="flex justify-between items-center font-mono text-[10px] text-ivory-dim border-t border-obsidian-border pt-2 z-10">
                        <span>LATENCY // ZERO_LAG</span>
                        <span className="text-acid">STATUS: LIVE</span>
                      </div>
                    </div>

                    {/* Action link */}
                    <div className="mt-4 flex justify-end">
                      <Link
                        href={`/work/${project.slug}`}
                        className="font-mono text-xs text-ivory-muted hover:text-acid flex items-center gap-1 transition-colors uppercase tracking-wider"
                      >
                        <span>Case Study Architecture</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </MotionWrapper>
            );
          })}
        </div>

        {/* Portfolio Integrity Notice */}
        <div className="mt-12 p-4 border border-obsidian-border bg-obsidian-surface font-mono text-xs text-ivory-dim flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-acid inline-block" />
            <span className="text-ivory-muted">
              ARCHITECTURAL INTEGRITY NOTICE:
            </span>
            <span>
              All projects reflect actual engineering implementations and verified codebases.
            </span>
          </div>
          <span className="text-acid">OFFSCRIPT STUDIO 2026</span>
        </div>
      </div>
    </section>
  );
}

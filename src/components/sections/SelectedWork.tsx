"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PROJECTS, Project } from "@/content/projects";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
import {
  ArrowUpRight,
  Terminal,
  Layers,
  Cpu,
  ShieldCheck,
  GitBranch,
  Database,
  Zap,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SelectedWork() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register GSAP ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!isDesktop || prefersReducedMotion) {
      return;
    }

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const getScrollAmount = () => {
        return track.scrollWidth - window.innerWidth + 96;
      };

      const scrollTween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 0.8,
          start: "top top",
          end: () => `+=${getScrollAmount()}`,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const index = Math.min(
              Math.floor(self.progress * PROJECTS.length),
              PROJECTS.length - 1
            );
            setActiveProjectIndex(index);
          },
        },
      });

      return () => {
        scrollTween.kill();
      };
    }, sectionRef);

    // Refresh triggers on window resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative w-full bg-obsidian border-b border-obsidian-border overflow-hidden select-none"
    >
      {/* Top Section Header & Horizontal Exhibition Ribbon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-obsidian-border">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-1.5 h-1.5 bg-acid inline-block" />
            <span className="font-mono text-xs uppercase tracking-wider text-acid font-medium">
              Portfolio Exhibition
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-ivory">
            SELECTED SYSTEMS.
          </h2>
          <p className="mt-2 text-base sm:text-lg text-ivory-muted font-sans font-light max-w-xl">
            Verified software architectures, autonomous agents, and production platforms.
          </p>
        </div>

        {/* Dynamic Exhibition Counter & Navigation */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3 font-mono text-xs text-ivory-dim">
            <span className="text-acid font-bold">
              {String(activeProjectIndex + 1).padStart(2, "0")}
            </span>
            <span>/</span>
            <span>{String(PROJECTS.length).padStart(2, "0")}</span>
            <span className="ml-2 text-ivory-dim text-[11px] uppercase tracking-wider">
              {PROJECTS[activeProjectIndex].title}
            </span>
          </div>

          <Button href="/work" variant="outline" size="sm" withArrow>
            VIEW ALL REPOSITORIES
          </Button>
        </div>
      </div>

      {/* Horizontal Track Wrapper */}
      <div className="py-12 lg:py-16 overflow-x-auto lg:overflow-visible no-scrollbar">
        <div
          ref={trackRef}
          className="flex gap-8 lg:gap-12 px-4 sm:px-6 lg:px-12 w-max items-stretch snap-x snap-mandatory lg:snap-none"
        >
          {PROJECTS.map((project, index) => {
            const isFeatured = index === 0;

            return (
              <div
                key={project.slug}
                className={cn(
                  "snap-center shrink-0 flex flex-col justify-between p-6 sm:p-10 lg:p-12 border border-obsidian-border bg-obsidian-surface hover:border-ivory/40 transition-colors duration-300 relative group",
                  "w-[85vw] max-w-[760px] sm:w-[80vw] sm:max-w-[820px] lg:w-[68vw] lg:max-w-[960px] min-h-[520px] sm:min-h-[560px]"
                )}
              >
                {/* Header Metadata */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-obsidian-border font-mono text-xs">
                    <span className="text-acid font-medium uppercase tracking-wider">
                      {project.category}
                    </span>
                    <Tag variant="acid" size="sm">
                      {project.status}
                    </Tag>
                  </div>

                  {/* Main Grid: Content Left, Architectural Topology Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-start">
                    {/* Left Details */}
                    <div className="lg:col-span-7 space-y-4">
                      <div>
                        <Link href={`/work/${project.slug}`} className="group/link block">
                          <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ivory group-hover/link:text-acid transition-colors">
                            {project.title}
                          </h3>
                        </Link>
                        <p className="font-mono text-xs text-acid tracking-wide uppercase mt-1">
                          {project.tagline}
                        </p>
                      </div>

                      <p className="font-sans text-sm sm:text-base text-ivory-muted/90 leading-relaxed font-light">
                        {project.description}
                      </p>

                      {/* Architecture Summary Box */}
                      <div className="p-4 bg-obsidian border border-obsidian-border">
                        <span className="font-mono text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                          Core Architectural Mechanism
                        </span>
                        <p className="font-mono text-xs text-ivory-muted">
                          {project.architectureSummary}
                        </p>
                      </div>

                      {/* Tech Stack Tags */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.technologies.slice(0, 5).map((tech) => (
                          <Tag key={tech} variant="default" size="sm">
                            {tech}
                          </Tag>
                        ))}
                      </div>
                    </div>

                    {/* Right: Distinctive Topological Visual */}
                    <div className="lg:col-span-5 flex flex-col justify-center">
                      <div className="w-full h-56 sm:h-64 lg:h-72 border border-obsidian-border bg-obsidian relative overflow-hidden flex flex-col justify-between p-4 group-hover:border-acid/30 transition-colors">
                        <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

                        <div className="flex justify-between items-center font-mono text-[10px] text-ivory-dim border-b border-obsidian-border pb-2 z-10">
                          <span className="text-ivory font-medium uppercase">
                            {project.slug}
                          </span>
                          <span className="text-acid">VERIFIED TOPOLOGY</span>
                        </div>

                        {/* Visual Schematic Diagram */}
                        <div className="relative z-10 flex-1 flex items-center justify-center py-2">
                          <div className="w-full max-w-xs space-y-2 font-mono text-[11px]">
                            {project.slug === "myco-pr-intelligence" && (
                              <>
                                <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                                  <span className="text-ivory-muted flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-acid" />
                                    PR Diff Ingestion
                                  </span>
                                  <span className="text-acid text-[10px]">GitHub API</span>
                                </div>
                                <div className="text-center text-ivory-dim text-[10px]">
                                  ↓ [Tree-sitter AST Parse]
                                </div>
                                <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface/90">
                                  <span className="text-ivory flex items-center gap-1.5 font-medium">
                                    <Cpu className="w-3.5 h-3.5 text-acid" />
                                    Breaking Contract Matrix
                                  </span>
                                  <span className="text-acid text-[10px]">AST Engine</span>
                                </div>
                              </>
                            )}

                            {project.slug === "zenithflow" && (
                              <>
                                <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                                  <span className="text-ivory-muted flex items-center gap-1.5">
                                    <Terminal className="w-3.5 h-3.5 text-acid" />
                                    Workflow Bus
                                  </span>
                                  <span className="text-acid text-[10px]">Event Queue</span>
                                </div>
                                <div className="text-center text-ivory-dim text-[10px]">
                                  ↓ [Reactive State Machine]
                                </div>
                                <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface/90">
                                  <span className="text-ivory flex items-center gap-1.5 font-medium">
                                    <Layers className="w-3.5 h-3.5 text-acid" />
                                    DAG Execution Engine
                                  </span>
                                  <span className="text-acid text-[10px]">Sub-50ms</span>
                                </div>
                              </>
                            )}

                            {project.slug === "vesta-ai" && (
                              <>
                                <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                                  <span className="text-ivory-muted flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-acid" />
                                    Knowledge Ingestion
                                  </span>
                                  <span className="text-acid text-[10px]">Chunked AST</span>
                                </div>
                                <div className="text-center text-ivory-dim text-[10px]">
                                  ↓ [Multi-Agent Graph RAG]
                                </div>
                                <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface/90">
                                  <span className="text-ivory flex items-center gap-1.5 font-medium">
                                    <Cpu className="w-3.5 h-3.5 text-acid" />
                                    Citation Synthesis
                                  </span>
                                  <span className="text-acid text-[10px]">Ground Truth</span>
                                </div>
                              </>
                            )}

                            {project.slug === "campusiq" && (
                              <>
                                <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                                  <span className="text-ivory-muted flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-acid" />
                                    Slot Reservation Request
                                  </span>
                                  <span className="text-acid text-[10px]">Atomic $inc</span>
                                </div>
                                <div className="text-center text-ivory-dim text-[10px]">
                                  ↓ [MongoDB Client Session]
                                </div>
                                <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface/90">
                                  <span className="text-ivory flex items-center gap-1.5 font-medium">
                                    <Database className="w-3.5 h-3.5 text-acid" />
                                    Zero Double-Booking Lock
                                  </span>
                                  <span className="text-acid text-[10px]">ACID Guard</span>
                                </div>
                              </>
                            )}

                            {project.slug === "triageai" && (
                              <>
                                <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                                  <span className="text-ivory-muted flex items-center gap-1.5">
                                    <Terminal className="w-3.5 h-3.5 text-acid" />
                                    Synthetic Patient Intake
                                  </span>
                                  <span className="text-acid text-[10px]">FHIR JSON</span>
                                </div>
                                <div className="text-center text-ivory-dim text-[10px]">
                                  ↓ [Deterministic Protocol Tree]
                                </div>
                                <div className="flex items-center justify-between p-2 border border-acid/40 bg-obsidian-surface/90">
                                  <span className="text-ivory flex items-center gap-1.5 font-medium">
                                    <Cpu className="w-3.5 h-3.5 text-acid" />
                                    Clinical Routing Queue
                                  </span>
                                  <span className="text-acid text-[10px]">P1–P4 Priority</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-obsidian-border font-mono text-[10px] text-ivory-dim flex justify-between">
                          <span>SYSTEM ARTIFACT</span>
                          <span className="text-ivory">INSPECTED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="mt-8 pt-6 border-t border-obsidian-border flex items-center justify-between">
                  <Button
                    href={`/work/${project.slug}`}
                    variant="primary"
                    size="md"
                    withArrow
                  >
                    VIEW ARCHITECTURE CASE STUDY
                  </Button>

                  <span className="font-mono text-xs text-ivory-dim">
                    {String(index + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Final Exhibition Archive Card */}
          <div className="snap-center shrink-0 w-[75vw] max-w-[420px] flex flex-col justify-between p-8 sm:p-12 border border-obsidian-border bg-obsidian-surface/60 hover:border-acid/40 transition-colors">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-acid block mb-4">
                Full Repository Index
              </span>
              <h3 className="font-display text-3xl font-bold text-ivory tracking-tight mb-4">
                Explore All Architectural Artifacts
              </h3>
              <p className="font-sans text-sm text-ivory-muted leading-relaxed font-light mb-6">
                Filter by practice discipline, view technical implementation status matrices, and review verified system architectures.
              </p>
            </div>

            <Button href="/work" variant="outline" size="md" withArrow className="w-full">
              BROWSE ALL WORK
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

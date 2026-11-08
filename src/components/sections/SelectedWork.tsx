"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { PROJECTS, Project } from "@/content/projects";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
import {
  GitBranch,
  Workflow,
  Sparkles,
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Stage =
  | { type: "project"; project: Project; stageNumber: number }
  | {
      type: "interlude";
      id: string;
      title: string;
      subtitle: string;
      quote: string;
      pillars: string[];
      stageNumber: number;
    }
  | { type: "conclusion"; stageNumber: number };

const EXHIBITION_STAGES: Stage[] = [
  // 1. Myco PR Intelligence — dark
  { type: "project", project: PROJECTS[0], stageNumber: 1 },
  // 2. Full Ivory Editorial Interlude 1
  {
    type: "interlude",
    id: "interlude-1",
    title: "THE DISCIPLINE OF DEPTH.",
    subtitle: "Architecture Grounded in Verifiable Truth",
    quote:
      "We reject superficial AI wrappers and disposable marketing boilerplate. Every system we build is grounded in deterministic schema contracts, observable latency boundaries, and verifiable test harnesses.",
    pillars: [
      "Deterministic AST Parsing",
      "Strict Schema Contracts",
      "Zero-Hallucination Retrieval",
    ],
    stageNumber: 2,
  },
  // 3. ZenithFlow — dark
  { type: "project", project: PROJECTS[1], stageNumber: 3 },
  // 4. Full Ivory Editorial Interlude 2
  {
    type: "interlude",
    id: "interlude-2",
    title: "BUILT FOR PRODUCTION STRESS.",
    subtitle: "Concurrency, Resilience & Zero-Leak Architecture",
    quote:
      "Concurrency, state isolation, and graceful failure handling are not afterthoughts. From sub-50ms event-driven DAG execution to atomic database operations, our software is designed to survive hostile network conditions.",
    pillars: [
      "ACID Session Guards",
      "Atomic Concurrency Locks",
      "Sub-50ms Event Pipelines",
    ],
    stageNumber: 4,
  },
  // 5. Vesta AI — dark
  { type: "project", project: PROJECTS[2], stageNumber: 5 },
  // 6. Full Ivory Editorial Interlude 3
  {
    type: "interlude",
    id: "interlude-3",
    title: "CITATION-BACKED INTELLIGENCE.",
    subtitle: "Verifiable Ground-Truth In Intelligent Systems",
    quote:
      "An enterprise AI system is only as valuable as its verifiability. We engineer extraction graphs that ground every model assertion against source-document coordinates, cryptographic diffs, and transparent audit trails.",
    pillars: [
      "Ground-Truth Citations",
      "Hybrid BM25 + Vector Search",
      "Audit-Log Reproducibility",
    ],
    stageNumber: 6,
  },
  // 7. CampusIQ — dark
  { type: "project", project: PROJECTS[3], stageNumber: 7 },
  // 8. Full Ivory Editorial Interlude 4
  {
    type: "interlude",
    id: "interlude-4",
    title: "SOFTWARE AS A DURABLE ASSET.",
    subtitle: "Disciplined Engineering & Long-Term Viability",
    quote:
      "We do not build throwaway prototypes. We write strict TypeScript, design scalable data models, and document operational runbooks so engineering teams inherit clean, maintainable systems they can run for years.",
    pillars: [
      "Strict TypeScript Boundaries",
      "Self-Documenting Schemas",
      "Turnkey CI/CD Pipelines",
    ],
    stageNumber: 8,
  },
  // 9. TriageAI — dark
  { type: "project", project: PROJECTS[4], stageNumber: 9 },
  // 10. Full Ivory Exhibition Conclusion
  { type: "conclusion", stageNumber: 10 },
];

export default function SelectedWork() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const applyStageGeometry = useCallback(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) {
      // Reset inline styles for mobile touch flow
      track.style.width = "";
      stageRefs.current.forEach((el) => {
        if (el) el.style.width = "";
      });
      return;
    }

    // Measure exact visible container width (excluding scrollbars)
    const exactWidth = section.clientWidth;
    const totalStages = EXHIBITION_STAGES.length;

    track.style.width = `${exactWidth * totalStages}px`;
    stageRefs.current.forEach((el) => {
      if (el) {
        el.style.width = `${exactWidth}px`;
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

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

    // Apply exact geometry immediately
    applyStageGeometry();

    const totalStages = EXHIBITION_STAGES.length;

    const ctx = gsap.context(() => {
      const getScrollDistance = () => (totalStages - 1) * section.clientWidth;

      const scrollTween = gsap.to(track, {
        x: () => -(totalStages - 1) * section.clientWidth,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: true,
          start: "top top",
          end: () => `+=${getScrollDistance()}`,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const index = Math.min(
              Math.round(self.progress * (totalStages - 1)),
              totalStages - 1
            );
            setActiveStageIndex(index);
          },
        },
      });

      return () => {
        scrollTween.kill();
      };
    }, sectionRef);

    const handleResize = () => {
      applyStageGeometry();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, [applyStageGeometry]);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative w-full bg-obsidian border-b border-obsidian-border overflow-hidden select-none lg:h-screen lg:max-h-[1020px] lg:min-h-[720px]"
    >
      {/* Main Horizontal Exhibition Track */}
      <div
        ref={trackRef}
        className="flex flex-nowrap h-full items-stretch snap-x snap-mandatory lg:snap-none overflow-x-auto lg:overflow-visible no-scrollbar"
      >
        {EXHIBITION_STAGES.map((stage, idx) => {
          const isActive = activeStageIndex === idx;

          // ==========================================
          // 1. INDIVIDUAL PROJECT STAGE (DARK OBSIDIAN)
          // ==========================================
          if (stage.type === "project") {
            const project = stage.project;
            const isInverted = idx % 4 === 2; // Alternating layout variety for Vesta AI & TriageAI

            return (
              <div
                key={project.slug}
                ref={(el) => {
                  stageRefs.current[idx] = el;
                }}
                className="w-screen lg:w-auto shrink-0 h-full flex flex-col justify-between bg-obsidian text-ivory border-r border-obsidian-border snap-center"
              >
                {/* Stage Header Ribbon */}
                <div className="w-full border-b border-obsidian-border bg-obsidian px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-acid inline-block" />
                    <span className="font-mono text-xs uppercase tracking-wider text-ivory font-medium">
                      Portfolio Exhibition
                    </span>
                    <span className="hidden sm:inline-block text-ivory-dim font-mono text-xs border-l border-obsidian-border pl-3">
                      {project.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-acid font-bold">
                        {String(stage.stageNumber).padStart(2, "0")}
                      </span>
                      <span className="text-ivory-dim">/</span>
                      <span className="text-ivory-dim">
                        {String(EXHIBITION_STAGES.length).padStart(2, "0")}
                      </span>
                      <span className="hidden md:inline-block text-ivory font-medium tracking-wide uppercase border-l border-obsidian-border pl-3">
                        {project.title}
                      </span>
                    </div>

                    <Button href="/work" variant="outline" size="sm" withArrow>
                      ALL REPOSITORIES
                    </Button>
                  </div>
                </div>

                {/* Centered Project Composition Visual Stage */}
                <div className="flex-1 w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-6 flex items-center justify-center">
                  <div
                    className={cn(
                      "w-full border bg-obsidian-surface p-6 sm:p-10 lg:p-12 transition-all duration-300 relative flex flex-col justify-between shadow-2xl",
                      isActive
                        ? "border-ivory/40 ring-1 ring-ivory/20"
                        : "border-obsidian-border"
                    )}
                  >
                    {/* Upper Ribbon */}
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-obsidian-border font-mono text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 bg-acid" />
                          <span className="text-acid font-semibold uppercase tracking-wider">
                            {project.category}
                          </span>
                        </div>
                        <Tag variant="acid" size="sm">
                          {project.status}
                        </Tag>
                      </div>

                      {/* Main Composition Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 items-center">
                        {!isInverted ? (
                          // Standard Layout: Text Left, Architecture Right
                          <>
                            <div className="lg:col-span-7 space-y-4">
                              <div>
                                <Link
                                  href={`/work/${project.slug}`}
                                  className="group/link block"
                                >
                                  <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-ivory group-hover/link:text-acid transition-colors">
                                    {project.title}
                                  </h3>
                                </Link>
                                <p className="font-mono text-xs sm:text-sm text-acid tracking-wide uppercase mt-1.5">
                                  {project.tagline}
                                </p>
                              </div>

                              <p className="font-sans text-sm sm:text-base text-ivory-muted/90 leading-relaxed font-light">
                                {project.description}
                              </p>

                              {/* Architectural Mechanism */}
                              <div className="p-4 bg-obsidian border border-obsidian-border">
                                <span className="font-mono text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                                  Core Architectural Mechanism
                                </span>
                                <p className="font-mono text-xs text-ivory-muted">
                                  {project.architectureSummary}
                                </p>
                              </div>

                              {/* Tech Stack */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {project.technologies.slice(0, 5).map((tech) => (
                                  <Tag key={tech} variant="default" size="sm">
                                    {tech}
                                  </Tag>
                                ))}
                              </div>
                            </div>

                            <div className="lg:col-span-5 flex flex-col justify-center">
                              {renderProjectVisual(project)}
                            </div>
                          </>
                        ) : (
                          // Inverted Layout: Architecture Left, Text Right
                          <>
                            <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
                              {renderProjectVisual(project)}
                            </div>

                            <div className="lg:col-span-7 space-y-4 order-1 lg:order-2">
                              <div>
                                <Link
                                  href={`/work/${project.slug}`}
                                  className="group/link block"
                                >
                                  <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight text-ivory group-hover/link:text-acid transition-colors">
                                    {project.title}
                                  </h3>
                                </Link>
                                <p className="font-mono text-xs sm:text-sm text-acid tracking-wide uppercase mt-1.5">
                                  {project.tagline}
                                </p>
                              </div>

                              <p className="font-sans text-sm sm:text-base text-ivory-muted/90 leading-relaxed font-light">
                                {project.description}
                              </p>

                              {/* Architectural Mechanism */}
                              <div className="p-4 bg-obsidian border border-obsidian-border">
                                <span className="font-mono text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                                  Core Architectural Mechanism
                                </span>
                                <p className="font-mono text-xs text-ivory-muted">
                                  {project.architectureSummary}
                                </p>
                              </div>

                              {/* Tech Stack */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {project.technologies.slice(0, 5).map((tech) => (
                                  <Tag key={tech} variant="default" size="sm">
                                    {tech}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
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
                        STAGE {String(stage.stageNumber).padStart(2, "0")} /{" "}
                        {String(EXHIBITION_STAGES.length).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Stage Progress Ribbon */}
                <div className="w-full border-t border-obsidian-border px-4 sm:px-8 lg:px-12 h-14 flex items-center justify-between font-mono text-xs text-ivory-dim shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-acid uppercase font-semibold">SCROLL TO ADVANCE</span>
                    <span className="hidden sm:inline-block text-ivory-dim">
                      Horizontal stages pinned to scroll progress
                    </span>
                  </div>

                  {/* Indicator Dots */}
                  <div className="flex items-center gap-1.5">
                    {EXHIBITION_STAGES.map((s, dotIdx) => (
                      <span
                        key={dotIdx}
                        className={cn(
                          "transition-all duration-300",
                          activeStageIndex === dotIdx
                            ? "w-6 h-1.5 bg-acid"
                            : "w-1.5 h-1.5 bg-obsidian-border"
                        )}
                      />
                    ))}
                  </div>

                  <div>
                    <span className="text-ivory font-medium">STAGE {stage.stageNumber} OF 10</span>
                  </div>
                </div>
              </div>
            );
          }

          // ==========================================
          // 2. FULL IVORY EDITORIAL INTERLUDE STAGE
          // ==========================================
          if (stage.type === "interlude") {
            return (
              <div
                key={stage.id}
                ref={(el) => {
                  stageRefs.current[idx] = el;
                }}
                className="w-screen lg:w-auto shrink-0 h-full flex flex-col justify-between bg-ivory text-obsidian border-r border-obsidian/10 snap-center"
              >
                {/* Stage Header Ribbon */}
                <div className="w-full border-b border-obsidian/15 bg-ivory px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-acid border border-obsidian/40 inline-block" />
                    <span className="font-mono text-xs uppercase tracking-wider text-obsidian font-bold">
                      Gallery Interlude
                    </span>
                    <span className="hidden sm:inline-block text-obsidian/60 font-mono text-xs border-l border-obsidian/15 pl-3">
                      Studio Editorial
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-obsidian font-bold">
                        {String(stage.stageNumber).padStart(2, "0")}
                      </span>
                      <span className="text-obsidian/40">/</span>
                      <span className="text-obsidian/40">
                        {String(EXHIBITION_STAGES.length).padStart(2, "0")}
                      </span>
                      <span className="hidden md:inline-block text-obsidian font-medium tracking-wide uppercase border-l border-obsidian/15 pl-3">
                        {stage.title}
                      </span>
                    </div>

                    <Button
                      href="/services"
                      variant="outline"
                      size="sm"
                      withArrow
                      className="border-obsidian/30 text-obsidian hover:bg-obsidian hover:text-ivory"
                    >
                      EXPLORE PRACTICE
                    </Button>
                  </div>
                </div>

                {/* Centered Editorial Surface with Generous Whitespace */}
                <div className="flex-1 w-full max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-8 flex flex-col justify-center space-y-8">
                  <div className="space-y-4">
                    <p className="font-mono text-xs sm:text-sm text-obsidian/60 uppercase tracking-widest font-medium">
                      {stage.subtitle}
                    </p>

                    <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-obsidian leading-[0.98]">
                      {stage.title}
                    </h2>
                  </div>

                  <blockquote className="font-sans text-lg sm:text-xl lg:text-2xl text-obsidian/85 leading-relaxed font-light max-w-3xl pt-2">
                    “{stage.quote}”
                  </blockquote>

                  {/* Three Minimal Pillar Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    {stage.pillars.map((pillar) => (
                      <div
                        key={pillar}
                        className="p-4 bg-ivory-pure border border-obsidian/15 flex items-center gap-3 shadow-sm"
                      >
                        <span className="w-1.5 h-1.5 bg-acid border border-obsidian/30 shrink-0" />
                        <span className="font-mono text-xs text-obsidian font-semibold tracking-wide">
                          {pillar}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Stage Progress Ribbon */}
                <div className="w-full border-t border-obsidian/15 px-4 sm:px-8 lg:px-12 h-14 flex items-center justify-between font-mono text-xs text-obsidian/60 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-obsidian font-semibold uppercase">EDITORIAL TRANSITION</span>
                    <span className="hidden sm:inline-block text-obsidian/50">
                      Philosophy &amp; architectural standards
                    </span>
                  </div>

                  {/* Indicator Dots */}
                  <div className="flex items-center gap-1.5">
                    {EXHIBITION_STAGES.map((s, dotIdx) => (
                      <span
                        key={dotIdx}
                        className={cn(
                          "transition-all duration-300",
                          activeStageIndex === dotIdx
                            ? "w-6 h-1.5 bg-obsidian"
                            : "w-1.5 h-1.5 bg-obsidian/20"
                        )}
                      />
                    ))}
                  </div>

                  <div>
                    <span className="text-obsidian font-medium">STAGE {stage.stageNumber} OF 10</span>
                  </div>
                </div>
              </div>
            );
          }

          // ==========================================
          // 3. FULL IVORY FINAL CONCLUSION STAGE
          // ==========================================
          return (
            <div
              key="stage-conclusion"
              ref={(el) => {
                stageRefs.current[idx] = el;
              }}
              className="w-screen lg:w-auto shrink-0 h-full flex flex-col justify-between bg-ivory text-obsidian border-r border-obsidian/10 snap-center"
            >
              {/* Stage Header Ribbon */}
              <div className="w-full border-b border-obsidian/15 bg-ivory px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-acid border border-obsidian/40 inline-block" />
                  <span className="font-mono text-xs uppercase tracking-wider text-obsidian font-bold">
                    Exhibition Conclusion
                  </span>
                  <span className="hidden sm:inline-block text-obsidian/60 font-mono text-xs border-l border-obsidian/15 pl-3">
                    Complete Archive
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-obsidian font-bold">10</span>
                    <span className="text-obsidian/40">/</span>
                    <span className="text-obsidian/40">10</span>
                    <span className="hidden md:inline-block text-obsidian font-medium tracking-wide uppercase border-l border-obsidian/15 pl-3">
                      Architectural Index
                    </span>
                  </div>
                </div>
              </div>

              {/* Centered Call to Action Surface */}
              <div className="flex-1 w-full max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-8 flex flex-col justify-center space-y-8">
                <div className="space-y-4">
                  <p className="font-mono text-xs sm:text-sm text-obsidian/60 uppercase tracking-widest font-medium">
                    Verified Codebases &amp; Implementation Matrices
                  </p>

                  <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-obsidian leading-[0.98]">
                    EXPLORE THE COMPLETE ARCHITECTURAL INDEX.
                  </h2>
                </div>

                <p className="font-sans text-lg sm:text-xl text-obsidian/85 leading-relaxed font-light max-w-2xl">
                  Every system in our portfolio is backed by authentic engineering artifacts, reproducible test suites, and strict boundary audits. Discover all verified repositories or commission a bespoke engagement.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Button
                    href="/work"
                    variant="primary"
                    size="lg"
                    withArrow
                    className="bg-obsidian text-ivory hover:bg-obsidian/90"
                  >
                    BROWSE ALL REPOSITORIES
                  </Button>

                  <Button
                    href="/contact"
                    variant="outline"
                    size="lg"
                    withArrow
                    className="border-obsidian/40 text-obsidian hover:bg-obsidian hover:text-ivory"
                  >
                    START A PROJECT
                  </Button>
                </div>
              </div>

              {/* Bottom Stage Progress Ribbon */}
              <div className="w-full border-t border-obsidian/15 px-4 sm:px-8 lg:px-12 h-14 flex items-center justify-between font-mono text-xs text-obsidian/60 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-obsidian font-semibold uppercase">EXHIBITION ARCHIVE</span>
                  <span className="hidden sm:inline-block text-obsidian/50">
                    Scroll down to explore Technical Practices
                  </span>
                </div>

                {/* Indicator Dots */}
                <div className="flex items-center gap-1.5">
                  {EXHIBITION_STAGES.map((s, dotIdx) => (
                    <span
                      key={dotIdx}
                      className={cn(
                        "transition-all duration-300",
                        activeStageIndex === dotIdx
                          ? "w-6 h-1.5 bg-obsidian"
                          : "w-1.5 h-1.5 bg-obsidian/20"
                      )}
                    />
                  ))}
                </div>

                <div>
                  <span className="text-obsidian font-medium">STAGE 10 OF 10</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// --- Helper: Distinctive Project Visual Architecture Schematics ---
function renderProjectVisual(project: Project) {
  return (
    <div className="w-full h-56 sm:h-64 lg:h-72 border border-obsidian-border bg-obsidian relative overflow-hidden flex flex-col justify-between p-4 transition-colors">
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center font-mono text-[10px] text-ivory-dim border-b border-obsidian-border pb-2 z-10">
        <span className="text-ivory font-medium uppercase">
          {project.title}
        </span>
        <span className="text-acid uppercase">ARCHITECTURE SPEC</span>
      </div>

      {/* Schematic Diagram */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-2">
        <div className="w-full max-w-xs space-y-2 font-mono text-[11px]">
          {project.slug === "myco-pr-intelligence" && (
            <>
              <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                <span className="text-ivory flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-acid" />
                  GitHub PR Diff Ingestion
                </span>
                <span className="text-ivory-dim text-[10px]">Tree-sitter AST</span>
              </div>
              <div className="flex justify-center text-ivory-dim text-[10px]">
                ↓ [Deterministic Rule Engine]
              </div>
              <div className="flex items-center justify-between p-2 border border-acid/50 bg-acid/5">
                <span className="text-ivory flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-acid" />
                  Breaking Contract Matrix
                </span>
                <span className="text-acid text-[10px] font-bold">0-100 Impact</span>
              </div>
            </>
          )}

          {project.slug === "zenithflow" && (
            <>
              <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                <span className="text-ivory flex items-center gap-1.5">
                  <Workflow className="w-3.5 h-3.5 text-acid" />
                  DAG Trigger Event
                </span>
                <span className="text-ivory-dim text-[10px]">Async FastStream</span>
              </div>
              <div className="flex justify-center text-ivory-dim text-[10px]">
                ↓ [Topological Dependency Sort]
              </div>
              <div className="flex items-center justify-between p-2 border border-acid/50 bg-acid/5">
                <span className="text-ivory flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-acid" />
                  Reactive Concurrency Queue
                </span>
                <span className="text-acid text-[10px] font-bold">&lt; 50ms State</span>
              </div>
            </>
          )}

          {project.slug === "vesta-ai" && (
            <>
              <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                <span className="text-ivory flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-acid" />
                  Enterprise Corpus Ingestion
                </span>
                <span className="text-ivory-dim text-[10px]">pgvector</span>
              </div>
              <div className="flex justify-center text-ivory-dim text-[10px]">
                ↓ [Hybrid BM25 + Dense RAG]
              </div>
              <div className="flex items-center justify-between p-2 border border-acid/50 bg-acid/5">
                <span className="text-ivory flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-acid" />
                  Ground-Truth Citation Synthesis
                </span>
                <span className="text-acid text-[10px] font-bold">Deterministic</span>
              </div>
            </>
          )}

          {project.slug === "campusiq" && (
            <>
              <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                <span className="text-ivory flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-acid" />
                  Role-Based JWT Ingress
                </span>
                <span className="text-ivory-dim text-[10px]">Auth Guard</span>
              </div>
              <div className="flex justify-center text-ivory-dim text-[10px]">
                ↓ [Atomic Concurrency Lock]
              </div>
              <div className="flex items-center justify-between p-2 border border-acid/50 bg-acid/5">
                <span className="text-ivory flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-acid" />
                  ACID PostgreSQL Reservation
                </span>
                <span className="text-acid text-[10px] font-bold">Zero Conflicts</span>
              </div>
            </>
          )}

          {(project.slug === "triage-ai" || project.slug === "triageai") && (
            <>
              <div className="flex items-center justify-between p-2 border border-obsidian-border bg-obsidian-surface/90">
                <span className="text-ivory flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-acid" />
                  FHIR-Compliant Intake Stream
                </span>
                <span className="text-ivory-dim text-[10px]">Strict Schema</span>
              </div>
              <div className="flex justify-center text-ivory-dim text-[10px]">
                ↓ [Deterministic Rule Scoring]
              </div>
              <div className="flex items-center justify-between p-2 border border-acid/50 bg-acid/5">
                <span className="text-ivory flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-acid" />
                  Clinician Verification Guard
                </span>
                <span className="text-acid text-[10px] font-bold">ESI Tier 1-5</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center font-mono text-[9px] text-ivory-dim border-t border-obsidian-border pt-2 z-10">
        <span>ARCHITECTURAL VERIFICATION</span>
        <span className="text-ivory">INSPECTED</span>
      </div>
    </div>
  );
}

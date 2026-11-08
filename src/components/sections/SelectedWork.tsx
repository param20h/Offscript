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
  BookOpen,
  Workflow,
  Sparkles,
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
  | { type: "archive"; stageNumber: number };

const EXHIBITION_STAGES: Stage[] = [
  // 1. Myco PR Intelligence
  { type: "project", project: PROJECTS[0], stageNumber: 1 },
  // 2. ZenithFlow
  { type: "project", project: PROJECTS[1], stageNumber: 2 },
  // 3. Warm Ivory Interlude 1
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
      "Zero-Hallucination RAG",
    ],
    stageNumber: 3,
  },
  // 4. Vesta AI
  { type: "project", project: PROJECTS[2], stageNumber: 4 },
  // 5. CampusIQ
  { type: "project", project: PROJECTS[3], stageNumber: 5 },
  // 6. Warm Ivory Interlude 2
  {
    type: "interlude",
    id: "interlude-2",
    title: "ENGINEERED FOR RESILIENCE.",
    subtitle: "Concurrency, Scalability & Zero-Leak Architecture",
    quote:
      "From sub-50ms reactive DAG state machines to concurrency-safe atomic database reservations, our platforms are engineered to endure real-world production stress without degradation.",
    pillars: [
      "ACID Session Guards",
      "Atomic Concurrency Locks",
      "Sub-50ms Event Pipelines",
    ],
    stageNumber: 6,
  },
  // 7. TriageAI
  { type: "project", project: PROJECTS[4], stageNumber: 7 },
  // 8. Full Exhibition Archive & Case Study Transition
  { type: "archive", stageNumber: 8 },
];

export default function SelectedWork() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

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

    const totalStages = EXHIBITION_STAGES.length;

    const ctx = gsap.context(() => {
      // Dynamic getter calculating exact pixel translation: (totalStages - 1) * viewport width
      const getTotalScrollDistance = () => (totalStages - 1) * window.innerWidth;

      const scrollTween = gsap.to(track, {
        x: () => -getTotalScrollDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1, // responsive 1-to-1 scrub
          start: "top top",
          end: () => `+=${getTotalScrollDistance() * 0.85}`,
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
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, []);

  const currentStage = EXHIBITION_STAGES[activeStageIndex];
  const stageTitle =
    currentStage.type === "project"
      ? currentStage.project.title
      : currentStage.type === "interlude"
      ? currentStage.title
      : "Full Repository Archive";

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative w-full bg-obsidian border-b border-obsidian-border overflow-hidden select-none lg:h-screen lg:max-h-[1020px] lg:min-h-[720px] flex flex-col justify-between"
    >
      {/* 1. Persistent Exhibition Header (Desktop Fixed Stage Bar) */}
      <div className="w-full border-b border-obsidian-border bg-obsidian/95 backdrop-blur-md z-30 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-acid inline-block" />
            <span className="font-mono text-xs uppercase tracking-wider text-ivory font-medium">
              Portfolio Exhibition
            </span>
            <span className="hidden sm:inline-block text-ivory-dim font-mono text-xs border-l border-obsidian-border pl-3">
              Centered Systems &amp; Case Studies
            </span>
          </div>

          {/* Dynamic Stage Counter & Live Title */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 font-mono text-xs">
              <span className="text-acid font-bold">
                {String(activeStageIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-ivory-dim">/</span>
              <span className="text-ivory-dim">
                {String(EXHIBITION_STAGES.length).padStart(2, "0")}
              </span>
              <span className="text-ivory font-medium tracking-wide uppercase border-l border-obsidian-border pl-3">
                {stageTitle}
              </span>
            </div>

            <Button href="/work" variant="outline" size="sm" withArrow>
              VIEW ALL WORK
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Main Horizontal Exhibition Track */}
      <div className="flex-1 w-full overflow-x-auto lg:overflow-hidden no-scrollbar flex items-center">
        <div
          ref={trackRef}
          className="flex flex-nowrap h-full items-stretch snap-x snap-mandatory lg:snap-none"
        >
          {EXHIBITION_STAGES.map((stage, idx) => {
            const isActive = activeStageIndex === idx;

            // --- Case A: Individual Project Stage ---
            if (stage.type === "project") {
              const project = stage.project;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={project.slug}
                  className="w-[92vw] sm:w-[88vw] lg:w-screen shrink-0 h-full flex items-center justify-center px-4 sm:px-8 lg:px-12 xl:px-20 snap-center py-8 lg:py-6"
                >
                  <div
                    className={cn(
                      "w-full max-w-5xl xl:max-w-6xl mx-auto border bg-obsidian-surface p-6 sm:p-10 lg:p-12 transition-all duration-500 relative flex flex-col justify-between shadow-2xl",
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

                      {/* Main Presentation Layout: Balanced Composition */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-8 items-center">
                        {/* If even index: Text Left, Visual Right */}
                        {isEven ? (
                          <>
                            {/* Left Column: Editorial Details */}
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
                                  System Architecture
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

                            {/* Right Column: Project Visual Architecture */}
                            <div className="lg:col-span-5 flex flex-col justify-center">
                              {renderProjectVisual(project)}
                            </div>
                          </>
                        ) : (
                          // If odd index: Visual Left, Text Right (Inverted Layout for Composition Variety!)
                          <>
                            {/* Left Column: Project Visual Architecture */}
                            <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
                              {renderProjectVisual(project)}
                            </div>

                            {/* Right Column: Editorial Details */}
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
                                  System Architecture
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
              );
            }

            // --- Case B: Warm Ivory Gallery Interlude Stage ---
            if (stage.type === "interlude") {
              return (
                <div
                  key={stage.id}
                  className="w-[92vw] sm:w-[88vw] lg:w-screen shrink-0 h-full flex items-center justify-center px-4 sm:px-8 lg:px-12 xl:px-20 snap-center py-8 lg:py-6"
                >
                  <div
                    className={cn(
                      "w-full max-w-4xl xl:max-w-5xl mx-auto border bg-ivory text-obsidian p-8 sm:p-12 lg:p-16 transition-all duration-500 relative flex flex-col justify-between shadow-2xl",
                      isActive
                        ? "border-obsidian/30 ring-1 ring-obsidian/20"
                        : "border-obsidian/15"
                    )}
                  >
                    <div>
                      {/* Interlude Top Ribbon */}
                      <div className="flex items-center justify-between pb-6 border-b border-obsidian/15 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-acid border border-obsidian/40" />
                          <span className="text-obsidian font-bold uppercase tracking-wider">
                            Gallery Interlude
                          </span>
                        </div>
                        <span className="text-obsidian/60 uppercase tracking-widest text-[11px]">
                          OFFSCRIPT STUDIO
                        </span>
                      </div>

                      {/* Main Interlude Statement */}
                      <div className="pt-8 space-y-6">
                        <p className="font-mono text-xs text-obsidian/60 uppercase tracking-wider">
                          {stage.subtitle}
                        </p>

                        <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-obsidian leading-[1.1]">
                          {stage.title}
                        </h3>

                        <blockquote className="font-sans text-base sm:text-lg lg:text-xl text-obsidian/85 leading-relaxed font-light pt-2 max-w-3xl">
                          “{stage.quote}”
                        </blockquote>
                      </div>

                      {/* Three Pillar Cards on Warm Ivory */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10">
                        {stage.pillars.map((pillar) => (
                          <div
                            key={pillar}
                            className="p-4 bg-ivory-pure border border-obsidian/10 flex items-center gap-3"
                          >
                            <span className="w-1.5 h-1.5 bg-acid border border-obsidian/30 shrink-0" />
                            <span className="font-mono text-xs text-obsidian font-semibold tracking-wide">
                              {pillar}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Stage Progress */}
                    <div className="mt-10 pt-6 border-t border-obsidian/15 flex items-center justify-between text-obsidian/60 font-mono text-xs">
                      <span>EDITORIAL TRANSITION</span>
                      <span>
                        STAGE {String(stage.stageNumber).padStart(2, "0")} /{" "}
                        {String(EXHIBITION_STAGES.length).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            // --- Case C: Final Exhibition Archive Stage (Unpinning Transition) ---
            if (stage.type === "archive") {
              return (
                <div
                  key="archive-stage"
                  className="w-[92vw] sm:w-[88vw] lg:w-screen shrink-0 h-full flex items-center justify-center px-4 sm:px-8 lg:px-12 xl:px-20 snap-center py-8 lg:py-6"
                >
                  <div
                    className={cn(
                      "w-full max-w-4xl xl:max-w-5xl mx-auto border bg-ivory text-obsidian p-8 sm:p-12 lg:p-16 transition-all duration-500 relative flex flex-col justify-between shadow-2xl",
                      isActive
                        ? "border-obsidian/30 ring-1 ring-obsidian/20"
                        : "border-obsidian/15"
                    )}
                  >
                    <div>
                      {/* Top Ribbon */}
                      <div className="flex items-center justify-between pb-6 border-b border-obsidian/15 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-acid border border-obsidian/40" />
                          <span className="text-obsidian font-bold uppercase tracking-wider">
                            Exhibition Conclusion
                          </span>
                        </div>
                        <span className="text-obsidian/60 uppercase tracking-widest text-[11px]">
                          Complete Archive
                        </span>
                      </div>

                      {/* Main Content */}
                      <div className="pt-8 space-y-6">
                        <span className="font-mono text-xs text-obsidian/60 uppercase tracking-wider block">
                          Verified Codebases &amp; Implementation Matrices
                        </span>
                        <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-obsidian leading-[1.08]">
                          EXPLORE THE COMPLETE ARCHITECTURAL INDEX.
                        </h3>
                        <p className="font-sans text-base sm:text-lg text-obsidian/80 max-w-2xl leading-relaxed font-light">
                          Every system in our portfolio is backed by authentic engineering artifacts, reproducible test suites, and strict boundary audits. Discover all verified repositories or commission a bespoke engagement.
                        </p>
                      </div>

                      {/* Action Links */}
                      <div className="flex flex-wrap items-center gap-4 pt-8">
                        <Button
                          href="/work"
                          variant="primary"
                          size="lg"
                          withArrow
                          className="bg-obsidian text-ivory hover:bg-obsidian-surface"
                        >
                          BROWSE ALL REPOSITORIES
                        </Button>
                        <Button
                          href="/contact"
                          variant="outline"
                          size="lg"
                          withArrow
                          className="border-obsidian text-obsidian hover:bg-obsidian hover:text-ivory"
                        >
                          COMMISSION AN ARCHITECTURE
                        </Button>
                      </div>
                    </div>

                    {/* Bottom Progress */}
                    <div className="mt-10 pt-6 border-t border-obsidian/15 flex items-center justify-between text-obsidian/60 font-mono text-xs">
                      <span>NEXT: TECHNICAL DISCIPLINES ↓</span>
                      <span>
                        STAGE {String(stage.stageNumber).padStart(2, "0")} /{" "}
                        {String(EXHIBITION_STAGES.length).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* 3. Bottom Exhibition Navigation Progress Line (Desktop) */}
      <div className="w-full border-t border-obsidian-border bg-obsidian py-3 px-8 hidden lg:flex items-center justify-between font-mono text-xs text-ivory-dim z-20 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-acid font-bold">SCROLL INTERACTION:</span>
          <span>Horizontal stages pinned to scroll progress</span>
        </div>

        {/* Progress dots indicating stages */}
        <div className="flex items-center gap-2">
          {EXHIBITION_STAGES.map((s, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1.5 transition-all duration-300",
                activeStageIndex === idx
                  ? "w-8 bg-acid"
                  : "w-2 bg-obsidian-border"
              )}
            />
          ))}
        </div>

        <div>
          <span>CONTINUE VERTICAL SCROLL TO RESUME ↓</span>
        </div>
      </div>
    </section>
  );
}

// --- Helper: Distinctive Project Visual Architecture Schematics ---
function renderProjectVisual(project: Project) {
  return (
    <div className="w-full h-64 sm:h-72 lg:h-80 border border-obsidian-border bg-obsidian relative overflow-hidden flex flex-col justify-between p-5 group-hover:border-acid/30 transition-colors">
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

      {/* Header bar */}
      <div className="flex justify-between items-center font-mono text-[10px] text-ivory-dim border-b border-obsidian-border pb-2.5 z-10">
        <span className="text-ivory font-medium uppercase tracking-wider">
          {project.slug}
        </span>
        <span className="text-acid font-semibold">VERIFIED ARCHITECTURE</span>
      </div>

      {/* Project-Specific Schematic Diagrams */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-2">
        <div className="w-full max-w-sm space-y-2.5 font-mono text-[11px]">
          {project.slug === "myco-pr-intelligence" && (
            <>
              <div className="flex items-center justify-between p-2.5 border border-obsidian-border bg-obsidian-surface/90">
                <span className="text-ivory-muted flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-acid" />
                  GitHub PR Diff Ingestion
                </span>
                <span className="text-acid text-[10px]">Tree-sitter AST</span>
              </div>
              <div className="text-center text-ivory-dim text-[10px]">
                ↓ [Deterministic Rule Engine]
              </div>
              <div className="flex items-center justify-between p-2.5 border border-acid/40 bg-obsidian-surface/90">
                <span className="text-ivory flex items-center gap-2 font-medium">
                  <Cpu className="w-3.5 h-3.5 text-acid" />
                  Breaking Contract Matrix
                </span>
                <span className="text-acid text-[10px]">0–100 Impact</span>
              </div>
            </>
          )}

          {project.slug === "zenithflow" && (
            <>
              <div className="flex items-center justify-between p-2.5 border border-obsidian-border bg-obsidian-surface/90">
                <span className="text-ivory-muted flex items-center gap-2">
                  <Workflow className="w-3.5 h-3.5 text-acid" />
                  Event Stream Ingestion
                </span>
                <span className="text-acid text-[10px]">Asynchronous</span>
              </div>
              <div className="text-center text-ivory-dim text-[10px]">
                ↓ [Reactive DAG Pipeline]
              </div>
              <div className="flex items-center justify-between p-2.5 border border-acid/40 bg-obsidian-surface/90">
                <span className="text-ivory flex items-center gap-2 font-medium">
                  <Cpu className="w-3.5 h-3.5 text-acid" />
                  State Machine Workers
                </span>
                <span className="text-acid text-[10px]">Sub-50ms</span>
              </div>
            </>
          )}

          {project.slug === "vesta-ai" && (
            <>
              <div className="flex items-center justify-between p-2.5 border border-obsidian-border bg-obsidian-surface/90">
                <span className="text-ivory-muted flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-acid" />
                  Enterprise Corpus Ingestion
                </span>
                <span className="text-acid text-[10px]">pgvector</span>
              </div>
              <div className="text-center text-ivory-dim text-[10px]">
                ↓ [Hybrid BM25 + Dense RAG]
              </div>
              <div className="flex items-center justify-between p-2.5 border border-acid/40 bg-obsidian-surface/90">
                <span className="text-ivory flex items-center gap-2 font-medium">
                  <Cpu className="w-3.5 h-3.5 text-acid" />
                  Ground-Truth Citation Synthesis
                </span>
                <span className="text-acid text-[10px]">Deterministic</span>
              </div>
            </>
          )}

          {project.slug === "campusiq" && (
            <>
              <div className="flex items-center justify-between p-2.5 border border-obsidian-border bg-obsidian-surface/90">
                <span className="text-ivory-muted flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-acid" />
                  Seat Reservation Request
                </span>
                <span className="text-acid text-[10px]">MongoDB Session</span>
              </div>
              <div className="text-center text-ivory-dim text-[10px]">
                ↓ [Atomic $inc with $lt Guard]
              </div>
              <div className="flex items-center justify-between p-2.5 border border-acid/40 bg-obsidian-surface/90">
                <span className="text-ivory flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-acid" />
                  Zero Double-Booking Lock
                </span>
                <span className="text-acid text-[10px]">ACID Verified</span>
              </div>
            </>
          )}

          {project.slug === "triageai" && (
            <>
              <div className="flex items-center justify-between p-2.5 border border-obsidian-border bg-obsidian-surface/90">
                <span className="text-ivory-muted flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-acid" />
                  Clinical Protocol Intake
                </span>
                <span className="text-acid text-[10px]">FHIR Schemas</span>
              </div>
              <div className="text-center text-ivory-dim text-[10px]">
                ↓ [Deterministic Priority Decision Tree]
              </div>
              <div className="flex items-center justify-between p-2.5 border border-acid/40 bg-obsidian-surface/90">
                <span className="text-ivory flex items-center gap-2 font-medium">
                  <Cpu className="w-3.5 h-3.5 text-acid" />
                  Routing Queue Dispatch
                </span>
                <span className="text-acid text-[10px]">P1–P4 Matrix</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-obsidian-border font-mono text-[10px] text-ivory-dim flex justify-between">
        <span>TOPOLOGICAL SPECIFICATION</span>
        <span className="text-ivory">INSPECTED</span>
      </div>
    </div>
  );
}

import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { PROJECTS, Project } from "@/content/projects";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import {
  ArrowLeft,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  Layers,
  Cpu,
  Database,
  Zap,
  ArrowUpRight,
  ExternalLink,
  Code2,
  Clock,
  Sparkles,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PROJECTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  const url = `${SITE_CONFIG.url}/work/${project.slug}`;

  return {
    title: `${project.title} — System Architecture Case Study`,
    description: project.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
      title: `${project.title} — OFFSCRIPT Studio Architecture Case Study`,
      description: project.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — OFFSCRIPT Studio`,
      description: project.description,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="w-full py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back to Work Archive Link */}
      <div className="mb-10">
        <Link
          href="/work"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ivory-dim hover:text-acid transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Work Archive</span>
        </Link>
      </div>

      {/* Case Study Hero Dossier Header */}
      <div className="border border-obsidian-border bg-obsidian-surface p-8 sm:p-12 mb-12 relative overflow-hidden">
        {/* Subtle Grid Accent */}
        <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-obsidian-border font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-acid font-bold">
                ARCHITECTURAL DOSSIER //
              </span>
              <span className="text-ivory font-medium">{project.slug.toUpperCase()}</span>
              <span className="text-ivory-dim">// {project.category.toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-2">
              <Tag variant="acid" size="sm">
                {project.status}
              </Tag>
            </div>
          </div>

          <div className="pt-8">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ivory uppercase">
              {project.title}
            </h1>
            <p className="mt-3 font-mono text-sm sm:text-base text-acid uppercase tracking-wide">
              {project.tagline}
            </p>
            <p className="mt-6 font-sans text-base sm:text-lg text-ivory-muted max-w-3xl leading-relaxed font-light">
              {project.description}
            </p>
          </div>

          {/* Quick Specifications Metadata Grid */}
          <div className="mt-10 pt-6 border-t border-obsidian-border grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-xs">
            <div>
              <span className="text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                Discipline
              </span>
              <span className="text-ivory font-medium">{project.category}</span>
            </div>
            <div>
              <span className="text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                Lifecycle State
              </span>
              <span className="text-acid font-medium">{project.status}</span>
            </div>
            <div>
              <span className="text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                Verification
              </span>
              <span className="text-ivory font-medium">{project.verificationBadge}</span>
            </div>
            <div>
              <span className="text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                Repository Access
              </span>
              <span className="text-ivory-muted">Verified Codebase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Case Study Editorial Layout */}
      <div className="space-y-16">
        {/* Section: Overview & Context */}
        <section className="p-8 sm:p-10 border border-obsidian-border bg-obsidian">
          <div className="flex items-center gap-2 font-mono text-xs text-acid uppercase tracking-widest mb-4">
            <Terminal className="w-4 h-4" />
            <span>System Overview &amp; Context</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ivory tracking-tight mb-4">
            The Context
          </h2>
          <p className="font-sans text-base sm:text-lg text-ivory-muted/90 leading-relaxed font-light">
            {project.overview}
          </p>
        </section>

        {/* Section: Problem Statement vs Engineering Approach */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem Card */}
          <div className="p-8 border border-obsidian-border bg-obsidian-surface flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-red-400 uppercase tracking-widest mb-4">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>The Problem</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-ivory tracking-tight mb-4">
                Core Constraints &amp; Failure Modes
              </h3>
              <p className="font-sans text-sm sm:text-base text-ivory-muted leading-relaxed font-light">
                {project.problem}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-obsidian-border font-mono text-[10px] text-ivory-dim uppercase">
              STATUS: IDENTIFIED ARCHITECTURAL BOTTLENECK
            </div>
          </div>

          {/* Approach Card */}
          <div className="p-8 border border-acid/40 bg-obsidian-surface flex flex-col justify-between relative">
            <div className="absolute top-2 right-2 w-2 h-2 bg-acid" />
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-acid uppercase tracking-widest mb-4">
                <CheckCircle2 className="w-4 h-4 text-acid" />
                <span>Engineering Approach</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-ivory tracking-tight mb-4">
                Architectural Solution
              </h3>
              <p className="font-sans text-sm sm:text-base text-ivory-muted leading-relaxed font-light">
                {project.approach}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-obsidian-border font-mono text-[10px] text-acid uppercase">
              STATUS: DETERMINISTIC IMPLEMENTATION
            </div>
          </div>
        </section>

        {/* Section: Verification Matrix (Implemented vs Prototype Boundary vs Planned) */}
        <section className="p-8 sm:p-10 border border-obsidian-border bg-obsidian-surface">
          <div className="flex items-center gap-2 font-mono text-xs text-acid uppercase tracking-widest mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Implementation Audit Matrix</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ivory tracking-tight mb-2">
            Verified Scope &amp; Lifecycle Boundaries
          </h2>
          <p className="font-sans text-sm text-ivory-muted mb-8 font-light">
            Strict truth in engineering: we clearly separate what is functional in code, what is bounded by prototype scope, and what represents future architectural roadmap.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Implemented Functionality */}
            <div className="p-6 border border-acid/30 bg-obsidian">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-obsidian-border font-mono text-xs text-acid">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-bold uppercase tracking-wider">Implemented in Code</span>
              </div>
              <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-ivory leading-relaxed">
                {project.implementedFunctionality.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-acid rounded-none inline-block shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Prototype Boundaries */}
            <div className="p-6 border border-obsidian-border bg-obsidian">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-obsidian-border font-mono text-xs text-ivory-dim">
                <Clock className="w-4 h-4 text-ivory-muted" />
                <span className="font-bold uppercase tracking-wider text-ivory">Prototype Boundary</span>
              </div>
              <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-ivory-muted leading-relaxed">
                {project.prototypeBoundaries.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-ivory-dim rounded-none inline-block shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Planned Increments */}
            <div className="p-6 border border-obsidian-border bg-obsidian">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-obsidian-border font-mono text-xs text-ivory-dim">
                <Sparkles className="w-4 h-4 text-acid/60" />
                <span className="font-bold uppercase tracking-wider text-ivory">Planned Increments</span>
              </div>
              <ul className="space-y-2.5 font-sans text-xs sm:text-sm text-ivory-dim leading-relaxed">
                {project.plannedIncrements.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-acid/40 rounded-none inline-block shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section: Technical Architecture & Key Components */}
        <section className="p-8 sm:p-10 border border-obsidian-border bg-obsidian">
          <div className="flex items-center gap-2 font-mono text-xs text-acid uppercase tracking-widest mb-4">
            <Layers className="w-4 h-4" />
            <span>Technical Architecture</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ivory tracking-tight mb-4">
            System Topology &amp; Component Decomposition
          </h2>

          <div className="p-4 bg-obsidian-surface border border-obsidian-border font-mono text-xs text-ivory-muted mb-8 flex items-start gap-3">
            <Terminal className="w-4 h-4 text-acid shrink-0 mt-0.5" />
            <div>
              <span className="text-ivory font-semibold block mb-1">Architecture Summary:</span>
              <p>{project.architectureSummary}</p>
            </div>
          </div>

          {/* Component Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {project.keyComponents.map((comp) => (
              <div
                key={comp.name}
                className="p-5 border border-obsidian-border bg-obsidian-surface hover:border-ivory/30 transition-colors"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="font-display text-lg font-bold text-ivory">
                    {comp.name}
                  </h4>
                  <Tag variant="acid" size="sm">
                    {comp.tech}
                  </Tag>
                </div>
                <p className="font-sans text-xs sm:text-sm text-ivory-muted/90 leading-relaxed font-light">
                  {comp.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Engineering Decisions & Trade-offs */}
        <section className="p-8 sm:p-10 border border-obsidian-border bg-obsidian-surface">
          <div className="flex items-center gap-2 font-mono text-xs text-acid uppercase tracking-widest mb-4">
            <Cpu className="w-4 h-4" />
            <span>Engineering Decisions &amp; Trade-offs</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ivory tracking-tight mb-6">
            Critical Architectural Choices
          </h2>

          <div className="space-y-6">
            {project.engineeringDecisions.map((dec) => (
              <div
                key={dec.title}
                className="p-6 border border-obsidian-border bg-obsidian space-y-3"
              >
                <h3 className="font-display text-lg font-bold text-ivory">
                  {dec.title}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-sans text-sm">
                  <div className="p-3 bg-obsidian-surface border border-obsidian-border/80">
                    <span className="font-mono text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                      Rationale &amp; Trade-off
                    </span>
                    <p className="text-ivory-muted leading-relaxed font-light">
                      {dec.rationale}
                    </p>
                  </div>

                  <div className="p-3 bg-obsidian-surface border border-acid/30">
                    <span className="font-mono text-[10px] text-acid uppercase tracking-wider block mb-1">
                      Engineering Outcome
                    </span>
                    <p className="text-ivory leading-relaxed font-light">
                      {dec.outcome}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Full Technology Stack */}
        <section className="p-8 border border-obsidian-border bg-obsidian">
          <h3 className="font-mono text-xs text-ivory-dim uppercase tracking-wider mb-4">
            Complete Technology Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((t) => (
              <Tag key={t} variant="default" size="md">
                {t}
              </Tag>
            ))}
          </div>
        </section>

        {/* Section: Provenance & Next Engagement CTA */}
        <section className="p-8 sm:p-10 border border-obsidian-border bg-obsidian-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 font-mono text-xs text-acid uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-acid" />
              <span>AUTHENTICATED OFFSCRIPT ARTIFACT</span>
            </div>
            <p className="font-sans text-sm text-ivory-muted leading-relaxed font-light">
              Interested in deploying a similar architecture or commissioning a custom digital engineering engagement based on this system pattern?
            </p>
          </div>

          <Button href="/contact" variant="primary" size="md" withArrow>
            INQUIRE ABOUT THIS PATTERN
          </Button>
        </section>
      </div>
    </article>
  );
}

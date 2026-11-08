import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PROJECTS, Project } from "@/content/projects";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import { ArrowLeft, Terminal, CheckCircle2, ShieldCheck } from "lucide-react";

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

  return {
    title: `${project.title} — System Architecture Case Study`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="w-full py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back to archive link */}
      <div className="mb-10">
        <Link
          href="/work"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ivory-dim hover:text-acid transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Work Archive</span>
        </Link>
      </div>

      {/* Header Bar */}
      <div className="border border-obsidian-border bg-obsidian-surface p-8 sm:p-12 mb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-obsidian-border font-mono text-xs">
          <span className="text-acid font-bold">
            ARCHITECTURAL DOSSIER // {project.slug.toUpperCase()}
          </span>
          <Tag variant="acid" size="sm">
            {project.status}
          </Tag>
        </div>

        <div className="pt-8">
          <span className="font-mono text-xs text-ivory-dim uppercase tracking-widest block mb-2">
            {project.category}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ivory uppercase">
            {project.title}
          </h1>
          <p className="mt-4 font-mono text-sm sm:text-base text-acid uppercase tracking-wide">
            {project.tagline}
          </p>
        </div>
      </div>

      {/* Main Body */}
      <div className="space-y-12">
        {/* Abstract */}
        <section className="p-8 border border-obsidian-border bg-obsidian">
          <h2 className="font-mono text-xs text-acid uppercase tracking-widest mb-4">
            // 01. System Overview
          </h2>
          <p className="font-sans text-base sm:text-lg text-ivory-muted leading-relaxed font-light">
            {project.description}
          </p>
        </section>

        {/* Architecture Specifications */}
        <section className="p-8 border border-obsidian-border bg-obsidian-surface">
          <h2 className="font-mono text-xs text-acid uppercase tracking-widest mb-4">
            // 02. Architecture & Pipeline
          </h2>
          <div className="p-4 bg-obsidian border border-obsidian-border font-mono text-xs text-ivory-muted mb-6 flex items-start gap-3">
            <Terminal className="w-4 h-4 text-acid shrink-0 mt-0.5" />
            <div>
              <span className="text-ivory block font-semibold mb-1">Topology:</span>
              <p>{project.architectureSummary}</p>
            </div>
          </div>

          <h3 className="font-mono text-xs text-ivory-dim uppercase tracking-wider mb-3">
            Technology Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((t) => (
              <Tag key={t} variant="default" size="md">
                {t}
              </Tag>
            ))}
          </div>
        </section>

        {/* Engineering Integrity */}
        <section className="p-6 border border-obsidian-border bg-obsidian flex items-center justify-between font-mono text-xs text-ivory-dim">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-acid" />
            <span>AUTHENTICATED REPOSITORY ARTIFACT — OFFSCRIPT STUDIO</span>
          </div>
          <Button href="/contact" variant="acid" size="sm" withArrow>
            ENGAGE ON THIS PATTERN
          </Button>
        </section>
      </div>
    </article>
  );
}

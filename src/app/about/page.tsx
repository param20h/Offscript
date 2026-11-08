import React from "react";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import MotionWrapper from "@/components/motion/MotionWrapper";
import {
  Code2,
  Compass,
  Cpu,
  Layers,
  Terminal,
  CheckCircle2,
  GitBranch,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Studio — Philosophy, Engineering Principles & Values",
  description:
    "OFFSCRIPT is an independent digital engineering studio dedicated to craftsmanship, technical depth, and uncompromised execution.",
};

const DESIGN_PRINCIPLES = [
  {
    number: "01",
    title: "Editorial Precision",
    description:
      "We design with oversized grotesk typography, disciplined whitespace, asymmetric grids, and sharp hairline boundaries. We reject rounded generic SaaS templates and decorative noise.",
  },
  {
    number: "02",
    title: "Substance Precedes Aesthetics",
    description:
      "Visual polish cannot rescue a sluggish or buggy platform. Every interface we build is backed by clean schema contracts, sub-second latency, and rigorous error boundaries.",
  },
  {
    number: "03",
    title: "Purposeful Motion",
    description:
      "Every transition, hover interaction, and 3D visual must communicate state, hierarchy, or brand identity. We strictly respect reduced-motion settings and never hijack scroll mechanics.",
  },
  {
    number: "04",
    title: "Verifiable Truth",
    description:
      "We never fabricate metrics, awards, client lists, or case-study outcomes. Our reputation is built solely on verifiable code, demonstrable architecture, and measurable impact.",
  },
];

const ENGINEERING_STACK = [
  { category: "Web Runtimes & Frameworks", tech: ["Next.js (App Router)", "React", "TypeScript Strict Mode", "Node.js"] },
  { category: "Styling & Tokens", tech: ["Tailwind CSS v4", "CSS Custom Properties", "PostCSS"] },
  { category: "Intelligent Systems & RAG", tech: ["Python", "FastAPI", "LangChain / LangGraph", "pgvector", "Tree-sitter AST"] },
  { category: "Creative Computing & 3D", tech: ["Three.js", "WebGL", "Motion for React", "GSAP ScrollTrigger"] },
  { category: "Data Layers & State", tech: ["PostgreSQL", "MongoDB Native Driver", "Redis", "SQLite", "IndexedDB"] },
  { category: "Infrastructure & Edge", tech: ["Vercel Edge Network", "Docker", "GitHub Actions CI/CD", "AWS"] },
];

export default function AboutPage() {
  return (
    <div className="w-full py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Studio Dossier Header */}
      <SectionHeader
        index="// STUDIO PROFILE"
        badge="STUDIO DOSSIER"
        title="BUILT DIFFERENT. ENGINEERED PROPERLY."
        subtitle="An independent digital engineering studio operating at the intersection of technical depth and art direction."
        description="We partner directly with founders and technical leaders to design, engineer, and deploy high-impact web flagships, autonomous AI systems, and custom software architectures."
      />

      {/* Main Philosophy & Manifesto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16 items-start">
        {/* Left Narrative */}
        <div className="lg:col-span-7 space-y-8 font-sans text-base sm:text-lg text-ivory-muted leading-relaxed font-light">
          <p className="text-xl sm:text-2xl text-ivory font-display font-medium tracking-tight leading-snug">
            The web is saturated with disposable templates, generic AI wrappers, and hollow marketing superlatives.
          </p>

          <p>
            OFFSCRIPT was created as an antidote. We operate as an independent studio: lean, highly technical, and intentionally unbureaucratic. You will never be handed off to an account manager or a junior delegator. Every project is scoped, designed, and coded by senior creative engineers who care deeply about the craft.
          </p>

          <p>
            Our work spans the full spectrum of modern digital engineering: from sub-second keyboard-first productivity interfaces to multi-agent LLM systems with ground-truth citation verification. We do not cut corners on type safety, accessibility, or core web vitals.
          </p>

          <blockquote className="p-6 border-l-2 border-acid bg-obsidian-surface font-mono text-xs sm:text-sm text-ivory leading-relaxed">
            “We measure our work by whether it challenges expectations, solves tangible architectural bottlenecks, and creates an experience that endures.”
          </blockquote>
        </div>

        {/* Right Studio Identity Dossier */}
        <div className="lg:col-span-5 p-8 border border-obsidian-border bg-obsidian-surface space-y-6">
          <h3 className="font-mono text-xs text-acid uppercase tracking-widest pb-3 border-b border-obsidian-border flex items-center justify-between">
            <span>Studio Identity Codex</span>
            <span>// 2026</span>
          </h3>

          <div className="space-y-4 font-mono text-xs text-ivory-muted">
            <div className="flex justify-between border-b border-obsidian-border/60 pb-2">
              <span className="text-ivory-dim">STUDIO MODEL</span>
              <span className="text-ivory">Independent Engineering</span>
            </div>
            <div className="flex justify-between border-b border-obsidian-border/60 pb-2">
              <span className="text-ivory-dim">OPERATING VOICE</span>
              <span className="text-ivory">Precise, Honest, Understated</span>
            </div>
            <div className="flex justify-between border-b border-obsidian-border/60 pb-2">
              <span className="text-ivory-dim">CONTRACT RIGOR</span>
              <span className="text-acid">TypeScript Strict // Verified RAG</span>
            </div>
            <div className="flex justify-between border-b border-obsidian-border/60 pb-2">
              <span className="text-ivory-dim">PUBLIC CONTACT</span>
              <a href={`mailto:${SITE_CONFIG.email}`} className="text-acid hover:underline">
                {SITE_CONFIG.email}
              </a>
            </div>
          </div>

          <div className="p-4 bg-obsidian border border-obsidian-border font-mono text-xs text-ivory-dim">
            <span className="text-ivory block font-semibold mb-1 uppercase tracking-wider">
              No Fabricated Proof Policy
            </span>
            <p className="leading-relaxed font-sans text-xs text-ivory-muted font-light">
              We never invent fake customer testimonials, stock executive photos, artificial revenue numbers, or fabricated case-study metrics. We let verified codebases, architecture diagrams, and demonstrable products speak for themselves.
            </p>
          </div>

          <div className="pt-2">
            <Button href="/contact" variant="primary" size="md" withArrow className="w-full">
              START A CONVERSATION
            </Button>
          </div>
        </div>
      </div>

      {/* Design & Engineering Principles */}
      <div className="mt-24 pt-16 border-t border-obsidian-border">
        <div className="mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-acid block mb-2">
            // OPERATING FOUNDATIONS
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ivory tracking-tight">
            Design &amp; Engineering Principles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {DESIGN_PRINCIPLES.map((principle) => (
            <MotionWrapper
              key={principle.number}
              className="p-8 border border-obsidian-border bg-obsidian-surface hover:border-ivory/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-xs font-bold text-acid">
                  [{principle.number}]
                </span>
                <h3 className="font-display text-xl font-bold text-ivory tracking-tight">
                  {principle.title}
                </h3>
              </div>
              <p className="font-sans text-sm text-ivory-muted/90 leading-relaxed font-light">
                {principle.description}
              </p>
            </MotionWrapper>
          ))}
        </div>
      </div>

      {/* Verified Engineering Technology Stack */}
      <div className="mt-24 pt-16 border-t border-obsidian-border">
        <div className="mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-acid block mb-2">
            // TECHNICAL ARSENAL
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ivory tracking-tight">
            Verified Technology Stack
          </h2>
          <p className="mt-2 font-sans text-sm text-ivory-muted font-light">
            We select tools based on computational efficiency, contract safety, and long-term maintainability—not fleeting hype cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ENGINEERING_STACK.map((group) => (
            <div
              key={group.category}
              className="p-6 border border-obsidian-border bg-obsidian-surface flex flex-col justify-between"
            >
              <h3 className="font-mono text-xs text-acid uppercase tracking-wider mb-4 pb-2 border-b border-obsidian-border">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.tech.map((t) => (
                  <Tag key={t} variant="default" size="sm">
                    {t}
                  </Tag>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

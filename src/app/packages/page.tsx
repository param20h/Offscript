import React from "react";
import type { Metadata } from "next";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import MotionWrapper from "@/components/motion/MotionWrapper";
import { Check, ShieldAlert, Plus, Clock, Users, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Packages — Scope & Engagement Models",
  description:
    "Transparently scoped digital engineering models: Launch, Scale, Intelligence, and Custom Engineering.",
};

const PACKAGES = [
  {
    id: "launch",
    name: "Launch",
    tagline: "High-impact digital flagship & foundational architecture.",
    pricingPlaceholder: "Scope-Based Quotation",
    timeline: "2 to 4 Weeks",
    targetCustomer:
      "Founders, creative studios, and early-stage ventures requiring an unignorable digital presence that differentiates them from day one.",
    scopeDescription:
      "Bespoke visual identity implementation, responsive Next.js frontend, micro-interactions, SEO metadata, and edge deployment.",
    deliverables: [
      "Custom Next.js App Router codebase",
      "Tailwind CSS v4 design token architecture",
      "Interactive micro-interactions (Motion for React)",
      "Accessible responsive layout (320px to 4K)",
      "Zero-downtime Vercel edge deployment configuration",
      "Lighthouse 95+ Core Web Vitals optimization",
      "Canonical SEO metadata, sitemap & robots setup",
    ],
    optionalAddons: [
      "Custom 3D / WebGL interactive hero visualizer",
      "Transactional email integration (Resend)",
      "Technical copywriting & editorial art direction",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "Custom product web app & interactive customer systems.",
    pricingPlaceholder: "Scope-Based Quotation",
    timeline: "4 to 8 Weeks",
    targetCustomer:
      "Growing startups and businesses requiring customer dashboards, interactive SaaS interfaces, or complex authenticated portals.",
    scopeDescription:
      "Full-stack web application development, database design, API endpoints, authentication, and stateful frontend workflows.",
    deliverables: [
      "Everything included in the Launch package",
      "Full-stack Next.js API & serverless route architecture",
      "PostgreSQL or MongoDB schema design & migration suite",
      "Authentication & role-based access control (RBAC)",
      "Advanced GSAP scroll choreography or WebGL elements",
      "Optimistic reactive state management",
      "Automated CI/CD test pipeline & GitHub Actions",
    ],
    optionalAddons: [
      "Real-time WebSocket telemetry & notification broker",
      "Stripe payment & subscription billing integration",
      "Advanced caching layer with Redis",
    ],
  },
  {
    id: "intelligence",
    name: "Intelligence",
    tagline: "Autonomous AI agents, verified RAG & deterministic workflows.",
    pricingPlaceholder: "Scope-Based Quotation",
    timeline: "4 to 10 Weeks",
    targetCustomer:
      "Companies seeking to eliminate operational friction with autonomous AI pipelines, verifiable document analysis, or automated triage.",
    scopeDescription:
      "End-to-end multi-agent system design, vector embedding search, ground-truth citation verification, and deterministic guardrails.",
    deliverables: [
      "Custom multi-agent state graph orchestrator",
      "Vector database pipeline & document chunking architecture",
      "Citation verification engine (zero hallucination enforcement)",
      "Deterministic evaluation harness & benchmark test suite",
      "Structured output parsers with JSON schema enforcement",
      "LLM latency, token cost & observability logging",
      "Production deployment with automated failover handling",
    ],
    optionalAddons: [
      "Domain-specific fine-tuning & prompt evaluation",
      "Real-time Slack / Discord / WhatsApp bot integration",
      "Custom Tree-sitter or AST static code analyzer",
    ],
  },
  {
    id: "custom",
    name: "Custom Engineering",
    tagline: "Bespoke SaaS platforms, platform architecture & technical leadership.",
    pricingPlaceholder: "Sprint-Based or Retainer Discussion",
    timeline: "Sprint-Based / Ongoing",
    targetCustomer:
      "Established engineering teams and funded startups needing senior architecture leadership, performance refactoring, or bespoke platforms.",
    scopeDescription:
      "Collaborative technical partnership spanning system architecture, distributed microservices, technical debt resolution, and rapid execution.",
    deliverables: [
      "Dedicated senior digital engineering architecture",
      "Distributed microservices & asynchronous message queues",
      "Third-party enterprise integrations & webhook middleware",
      "Code quality audits & architectural due diligence",
      "Weekly synchronous planning & daily asynchronous commits",
      "Full source code ownership, tests & knowledge transfer",
    ],
    optionalAddons: [
      "On-call infrastructure support SLA",
      "Legacy system migration & zero-downtime database cutover",
      "Developer tooling & custom CLI tooling",
    ],
  },
];

export default function PackagesPage() {
  return (
    <div className="w-full py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        index="// ENGAGEMENT MODELS"
        badge="TRANSPARENT SCOPING"
        title="ENGINEERING PACKAGES."
        subtitle="Predictable delivery models tailored to architectural complexity and commercial velocity."
        description="All pricing is scoped directly to verified requirements. We do not invent arbitrary pricing tiers or cut corners on engineering standards. Every engagement is executed with senior technical rigor."
      />

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {PACKAGES.map((pkg, idx) => (
          <MotionWrapper
            key={pkg.id}
            delay={idx * 0.08}
            className="p-8 sm:p-10 border border-obsidian-border bg-obsidian-surface flex flex-col justify-between hover:border-ivory/40 transition-colors group relative"
          >
            <div>
              {/* Top Bar */}
              <div className="flex justify-between items-center pb-4 border-b border-obsidian-border font-mono text-xs">
                <span className="text-acid font-bold">PACKAGE // 0{idx + 1}</span>
                <span className="text-ivory-dim flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-acid" />
                  {pkg.timeline}
                </span>
              </div>

              {/* Package Header */}
              <div className="pt-6">
                <h2 className="font-display text-3xl font-bold text-ivory tracking-tight">
                  {pkg.name}
                </h2>
                <p className="font-mono text-xs text-acid uppercase tracking-wide mt-1 mb-4">
                  {pkg.tagline}
                </p>

                {/* Investment Box */}
                <div className="p-4 bg-obsidian border border-obsidian-border mb-6">
                  <span className="font-mono text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                    Investment Structure
                  </span>
                  <p className="font-mono text-sm text-ivory font-semibold flex items-center justify-between">
                    <span>{pkg.pricingPlaceholder}</span>
                    <span className="text-[10px] text-acid font-normal">CONFIRMED POST-DISCOVERY</span>
                  </p>
                </div>

                {/* Target Customer */}
                <div className="mb-6">
                  <span className="font-mono text-[10px] text-ivory-dim uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-acid" />
                    Ideal For
                  </span>
                  <p className="font-sans text-sm text-ivory-muted/90 leading-relaxed font-light">
                    {pkg.targetCustomer}
                  </p>
                </div>
              </div>

              {/* Deliverables Checklist */}
              <div className="pt-6 border-t border-obsidian-border">
                <h3 className="font-mono text-xs text-ivory-dim uppercase tracking-wider mb-4">
                  Included Architectural Scope
                </h3>
                <ul className="space-y-2.5">
                  {pkg.deliverables.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 font-sans text-sm text-ivory">
                      <span className="w-4 h-4 bg-acid/10 border border-acid/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-acid" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Optional Add-Ons */}
              {pkg.optionalAddons.length > 0 && (
                <div className="mt-6 pt-6 border-t border-obsidian-border/60">
                  <h4 className="font-mono text-[11px] text-ivory-dim uppercase tracking-wider mb-3">
                    Optional Add-Ons
                  </h4>
                  <ul className="space-y-1.5 font-mono text-xs text-ivory-muted">
                    {pkg.optionalAddons.map((addon) => (
                      <li key={addon} className="flex items-center gap-2">
                        <Plus className="w-3 h-3 text-acid shrink-0" />
                        <span>{addon}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action CTA */}
            <div className="mt-8 pt-6 border-t border-obsidian-border">
              <Button
                href={`/contact?package=${encodeURIComponent(pkg.name)}`}
                variant="primary"
                size="md"
                withArrow
                className="w-full text-center"
              >
                REQUEST {pkg.name.toUpperCase()} SCOPE
              </Button>
            </div>
          </MotionWrapper>
        ))}
      </div>

      {/* Scope Integrity & Estimate Policy */}
      <div className="mt-12 p-8 border border-obsidian-border bg-obsidian font-mono text-xs text-ivory-dim flex items-start gap-4">
        <ShieldAlert className="w-5 h-5 text-acid shrink-0 mt-0.5" />
        <div className="space-y-2">
          <span className="text-ivory block font-semibold uppercase tracking-wider">
            OFFSCRIPT Scope &amp; Estimation Policy
          </span>
          <p className="leading-relaxed text-ivory-muted font-sans text-xs sm:text-sm font-light">
            Timelines and engagement models represent architectural estimates established during technical discovery. Third-party infrastructure costs (OpenAI/Anthropic API usage, Vercel team tiers, AWS hosting, domain registrations) are billed directly to client accounts without studio markups. Custom projects are quoted on fixed-sprint deliverables.
          </p>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import type { Metadata } from "next";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import MotionWrapper from "@/components/motion/MotionWrapper";
import { Check, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Packages — Scope & Engagement Models",
  description:
    "Transparently scoped engineering engagements: Launch, Scale, Intelligence, and Custom Engineering.",
};

const PACKAGES = [
  {
    id: "launch",
    name: "Launch",
    tagline: "High-impact flagship site & brand infrastructure.",
    pricingNote: "Custom Quote Based on Scope",
    duration: "Estimated 2–4 Weeks",
    idealFor: "Early-stage founders, emerging ventures, and studios requiring an unignorable digital flagship.",
    features: [
      "Custom Next.js App Router architecture",
      "Bespoke typography, color system & token setup",
      "Motion for React choreographed micro-interactions",
      "Full responsive layout (320px to 4K)",
      "Transactional email & scheduling integration",
      "Zero-downtime Vercel edge deployment",
      "Accessibility & Core Web Vitals optimization",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    tagline: "Custom product web app & interactive systems.",
    pricingNote: "Custom Quote Based on Scope",
    duration: "Estimated 4–8 Weeks",
    idealFor: "Growing businesses requiring dynamic web applications, interactive dashboards, or customer portals.",
    features: [
      "All features in Launch",
      "Full-stack API & serverless route architecture",
      "Database schema design (PostgreSQL / Supabase)",
      "Authentication & role-based access control",
      "Advanced GSAP scroll choreographies or WebGL elements",
      "Comprehensive TypeScript contract enforcement",
      "Automated CI/CD testing pipeline",
    ],
  },
  {
    id: "intelligence",
    name: "Intelligence",
    tagline: "Autonomous AI agents, verified RAG & workflows.",
    pricingNote: "Custom Quote Based on Scope",
    duration: "Estimated 4–10 Weeks",
    idealFor: "Companies integrating verifiable LLM pipelines, autonomous agents, and intelligent data extraction.",
    features: [
      "Custom multi-agent orchestration graph",
      "Vector database setup & verified citation RAG",
      "Deterministic guardrails & evaluation harness",
      "Structured output parsers & tool calling",
      "Latency & cost optimization benchmarks",
      "Telemetry & agent observability dashboards",
      "Comprehensive failure-mode recovery handlers",
    ],
  },
  {
    id: "custom",
    name: "Custom Engineering",
    tagline: "Bespoke SaaS platforms & enterprise integrations.",
    pricingNote: "Retainer or Fixed Sprint Sprints",
    duration: "Ongoing / Sprint-Based",
    idealFor: "Enterprise teams and funded startups needing senior engineering leadership and execution.",
    features: [
      "Dedicated senior digital engineering architecture",
      "Distributed microservices & asynchronous message queues",
      "Complex third-party enterprise integrations",
      "Performance refactoring & technical debt resolution",
      "Weekly synchronous planning & daily asynchronous commits",
      "Full source code ownership & documentation transfer",
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
        subtitle="Predictable delivery models tailored to technical complexity and business velocity."
        description="All pricing is scoped directly to verified requirements. We do not invent arbitrary pricing tiers or cut corners on engineering standards."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {PACKAGES.map((pkg, idx) => (
          <MotionWrapper
            key={pkg.id}
            delay={idx * 0.08}
            className="p-8 border border-obsidian-border bg-obsidian-surface flex flex-col justify-between hover:border-ivory/40 transition-colors"
          >
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-obsidian-border font-mono text-xs">
                <span className="text-acid font-bold">PACKAGE // 0{idx + 1}</span>
                <span className="text-ivory-dim">{pkg.duration}</span>
              </div>

              <div className="pt-6">
                <h2 className="font-display text-3xl font-bold text-ivory tracking-tight">
                  {pkg.name}
                </h2>
                <p className="font-mono text-xs text-acid uppercase tracking-wide mt-1 mb-4">
                  {pkg.tagline}
                </p>
                <div className="p-3 bg-obsidian border border-obsidian-border mb-6">
                  <span className="font-mono text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                    Investment
                  </span>
                  <p className="font-mono text-sm text-ivory font-semibold">
                    {pkg.pricingNote}
                  </p>
                </div>
                <p className="font-sans text-sm text-ivory-muted/90 mb-6 leading-relaxed">
                  {pkg.idealFor}
                </p>
              </div>

              <div className="pt-6 border-t border-obsidian-border">
                <h3 className="font-mono text-xs text-ivory-dim uppercase tracking-wider mb-4">
                  Included Engineering
                </h3>
                <ul className="space-y-2.5">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 font-sans text-sm text-ivory">
                      <span className="w-4 h-4 bg-acid/10 border border-acid/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-acid" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-obsidian-border">
              <Button href="/contact" variant="primary" size="md" withArrow className="w-full">
                REQUEST A {pkg.name.toUpperCase()} QUOTE
              </Button>
            </div>
          </MotionWrapper>
        ))}
      </div>

      {/* Package Disclaimer Notice */}
      <div className="mt-12 p-6 border border-obsidian-border bg-obsidian font-mono text-xs text-ivory-dim flex items-start gap-4">
        <ShieldAlert className="w-5 h-5 text-acid shrink-0 mt-0.5" />
        <div>
          <span className="text-ivory block font-semibold mb-1">
            OFFSCRIPT SCOPE & ESTIMATE POLICY
          </span>
          <p className="leading-relaxed">
            Timelines and scopes represent architectural estimates. Revisions, third-party API / hosting costs (e.g. OpenAI, AWS, Vercel), and custom domain registrations are billed directly to client accounts without studio markups.
          </p>
        </div>
      </div>
    </div>
  );
}

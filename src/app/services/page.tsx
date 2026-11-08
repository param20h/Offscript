import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { SERVICES } from "@/content/services";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import MotionWrapper from "@/components/motion/MotionWrapper";
import { Check, ArrowUpRight, Clock, Compass, Layers, Terminal } from "lucide-react";

export const metadata: Metadata = {
  title: "Services — Digital Engineering Practices & Disciplines",
  description:
    "Comprehensive engineering practices spanning intelligent AI systems, web development, cloud backends, and creative engineering.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/services`,
  },
  openGraph: {
    title: "Services — Digital Engineering Practices | OFFSCRIPT",
    description:
      "Comprehensive engineering practices spanning intelligent AI systems, web development, cloud backends, and creative engineering.",
    url: `${SITE_CONFIG.url}/services`,
  },
};

export default function ServicesPage() {
  return (
    <div className="w-full py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        badge="ENGINEERING PRACTICES"
        title="TECHNICAL DISCIPLINES."
        subtitle="End-to-end capabilities designed for founders and engineering teams who demand precision."
        description="Every practice is anchored in strict TypeScript, verifiable test suites, and transparent technical architecture. We operate without junior delegators or bloated management layers."
      />

      {/* Services Grid Stream */}
      <div className="space-y-16 mt-16">
        {SERVICES.map((service) => (
          <MotionWrapper
            key={service.id}
            id={service.id}
            className="p-8 sm:p-12 border border-obsidian-border bg-obsidian-surface scroll-mt-28 relative overflow-hidden group hover:border-ivory/30 transition-colors"
          >
            {/* Subtle Grid Accent */}
            <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />

            <div className="relative z-10">
              {/* Header Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-obsidian-border font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-acid font-bold tracking-wider">
                    DISCIPLINE
                  </span>
                  <span className="text-ivory font-medium">{service.id.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2 text-ivory-dim">
                  <Clock className="w-3.5 h-3.5 text-acid" />
                  <span>{service.deliveryTimeline}</span>
                </div>
              </div>

              {/* Service Details */}
              <div className="pt-8">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-ivory tracking-tight">
                  {service.title}
                </h2>
                <p className="font-mono text-sm text-acid uppercase tracking-wide mt-1.5 mb-4">
                  {service.tagline}
                </p>
                <p className="font-sans text-base sm:text-lg text-ivory-muted/90 max-w-4xl leading-relaxed font-light mb-8">
                  {service.description}
                </p>
              </div>

              {/* Scope & Capabilities Split Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-obsidian-border">
                {/* Left: Capabilities Checklist */}
                <div className="lg:col-span-6 space-y-6">
                  <div>
                    <h3 className="font-mono text-xs text-ivory-dim uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-acid" />
                      <span>Core Capabilities</span>
                    </h3>
                    <ul className="space-y-2.5">
                      {service.capabilities.map((cap) => (
                        <li key={cap} className="flex items-start gap-3 font-sans text-sm text-ivory">
                          <span className="w-4 h-4 bg-acid/10 border border-acid/40 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-acid" />
                          </span>
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Typical Scope */}
                  <div className="p-4 bg-obsidian border border-obsidian-border">
                    <span className="font-mono text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                      Typical Scope of Engagement
                    </span>
                    <p className="font-sans text-xs sm:text-sm text-ivory-muted leading-relaxed font-light">
                      {service.typicalScope}
                    </p>
                  </div>
                </div>

                {/* Right: Deliverables & Relevant Projects */}
                <div className="lg:col-span-6 space-y-6">
                  <div>
                    <h3 className="font-mono text-xs text-ivory-dim uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-acid" />
                      <span>Tangible Deliverables</span>
                    </h3>
                    <ul className="space-y-2 font-mono text-xs text-ivory-muted">
                      {service.deliverables.map((del) => (
                        <li key={del} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-acid inline-block" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Relevant Project References */}
                  {service.relevantProjects.length > 0 && (
                    <div className="p-4 bg-obsidian border border-obsidian-border">
                      <span className="font-mono text-[10px] text-ivory-dim uppercase tracking-wider block mb-2">
                        Verified Reference Architecture
                      </span>
                      <div className="space-y-2">
                        {service.relevantProjects.map((p) => (
                          <Link
                            key={p.slug}
                            href={`/work/${p.slug}`}
                            className="flex items-center justify-between text-xs font-mono text-ivory hover:text-acid transition-colors group/proj"
                          >
                            <span className="font-medium underline underline-offset-4 decoration-acid/30">
                              {p.title}
                            </span>
                            <span className="text-[10px] text-ivory-dim flex items-center gap-1">
                              <span>{p.category}</span>
                              <ArrowUpRight className="w-3 h-3 group-hover/proj:translate-x-0.5 group-hover/proj:-translate-y-0.5 transition-transform" />
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technologies */}
                  <div>
                    <h3 className="font-mono text-xs text-ivory-dim uppercase tracking-wider mb-2.5">
                      Technology Stack Focus
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {service.techFocus.map((tech) => (
                        <Tag key={tech} variant="default" size="sm">
                          {tech}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-8 pt-6 border-t border-obsidian-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <span className="font-mono text-xs text-ivory-dim">
                  SCOPES ADAPTED TO TARGET TIMELINES &amp; ARCHITECTURAL SPECIFICATIONS
                </span>
                <Button
                  href={`/contact?service=${encodeURIComponent(service.title)}`}
                  variant="acid"
                  size="sm"
                  withArrow
                >
                  DISCUSS {service.title.toUpperCase()} ENGAGEMENT
                </Button>
              </div>
            </div>
          </MotionWrapper>
        ))}
      </div>
    </div>
  );
}

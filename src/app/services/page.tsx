import React from "react";
import type { Metadata } from "next";
import { SERVICES } from "@/content/services";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import MotionWrapper from "@/components/motion/MotionWrapper";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Services — Digital Engineering Practices",
  description:
    "Comprehensive engineering disciplines spanning intelligent AI systems, web platforms, and cloud infrastructure.",
};

export default function ServicesPage() {
  return (
    <div className="w-full py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        index="// SERVICES INDEX"
        badge="DISCIPLINE BREAKDOWN"
        title="ENGINEERING PRACTICES."
        subtitle="End-to-end capabilities designed for founders and engineering teams who demand precision."
        description="Every practice is anchored in strict TypeScript, verifiable test suites, and transparent technical architecture."
      />

      <div className="space-y-16 mt-16">
        {SERVICES.map((service) => (
          <div
            key={service.id}
            id={service.id}
            className="p-8 sm:p-12 border border-obsidian-border bg-obsidian-surface scroll-mt-28"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-obsidian-border font-mono text-xs">
              <span className="text-acid font-bold">
                DISCIPLINE // {service.number}
              </span>
              <span className="text-ivory-dim">// {service.id.toUpperCase()}</span>
            </div>

            <div className="pt-8">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ivory tracking-tight">
                {service.title}
              </h2>
              <p className="font-mono text-sm text-acid uppercase tracking-wide mt-1 mb-4">
                {service.tagline}
              </p>
              <p className="font-sans text-base sm:text-lg text-ivory-muted/90 max-w-3xl leading-relaxed font-light mb-8">
                {service.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-obsidian-border">
              <div>
                <h3 className="font-mono text-xs text-ivory-dim uppercase tracking-wider mb-4">
                  Core Capabilities
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

              <div>
                <h3 className="font-mono text-xs text-ivory-dim uppercase tracking-wider mb-4">
                  Tangible Deliverables
                </h3>
                <ul className="space-y-2 font-mono text-xs text-ivory-muted mb-6">
                  {service.deliverables.map((del) => (
                    <li key={del} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-acid inline-block" />
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="font-mono text-xs text-ivory-dim uppercase tracking-wider mb-3">
                  Technologies
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

            <div className="mt-8 pt-6 border-t border-obsidian-border flex justify-end">
              <Button href="/contact" variant="acid" size="sm" withArrow>
                DISCUSS {service.title.toUpperCase()} SCOPE
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

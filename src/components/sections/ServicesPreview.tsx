"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SERVICES, ServiceItem } from "@/content/services";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import MotionWrapper from "@/components/motion/MotionWrapper";
import { ArrowUpRight, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ServicesPreview() {
  const [selectedService, setSelectedService] = useState<ServiceItem>(SERVICES[0]);

  return (
    <section id="services" className="relative w-full py-24 sm:py-32 bg-obsidian-surface border-b border-obsidian-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          badge="ENGINEERING SERVICES"
          title="TECHNICAL PRACTICES."
          subtitle="Specialized capabilities spanning intelligent systems, cloud backends, and creative engineering."
          description="We work with founders and enterprise engineering teams across six core disciplines. Every engagement delivers production-grade architecture, comprehensive tests, and zero-compromise execution."
          align="split"
        >
          <Button href="/services" variant="outline" size="sm" withArrow>
            VIEW DETAILED SPECS
          </Button>
        </SectionHeader>

        {/* Distinctive Split Editorial Capability Directory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-12 items-start">
          {/* Left Column: Interactive Capability Index (Editorial List) */}
          <div className="lg:col-span-5 divide-y divide-obsidian-border border-y border-obsidian-border">
            {SERVICES.map((service) => {
              const isSelected = selectedService.id === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedService(service)}
                  className={cn(
                    "w-full text-left py-5 px-4 transition-all duration-200 flex items-center justify-between group focus-visible:outline-none focus-visible:bg-obsidian-subtle cursor-pointer",
                    isSelected
                      ? "bg-obsidian text-acid border-l-2 border-l-acid pl-5"
                      : "hover:bg-obsidian/50 text-ivory hover:text-ivory-pure"
                  )}
                  aria-pressed={isSelected}
                >
                  <span className="font-display text-lg sm:text-xl font-bold tracking-tight">
                    {service.title}
                  </span>

                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isSelected
                        ? "text-acid translate-x-1"
                        : "text-ivory-dim group-hover:text-ivory"
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Capability Dossier */}
          <div className="lg:col-span-7">
            <MotionWrapper
              key={selectedService.id}
              className="p-6 sm:p-10 border border-obsidian-border bg-obsidian relative"
            >
              {/* Architectural grid overlay */}
              <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

              <div className="relative z-10">
                {/* Dossier Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-obsidian-border font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-acid font-bold">
                      DISCIPLINE //
                    </span>
                    <span className="text-ivory">{selectedService.id.toUpperCase()}</span>
                  </div>
                  <Tag variant="acid" size="sm">
                    CAPABILITY ACTIVE
                  </Tag>
                </div>

                {/* Service Title & Tagline */}
                <div className="pt-6">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-ivory tracking-tight">
                    {selectedService.title}
                  </h3>
                  <p className="font-mono text-xs text-acid tracking-wide mt-1 uppercase">
                    {selectedService.tagline}
                  </p>
                  <p className="mt-4 font-sans text-sm sm:text-base text-ivory-muted/90 leading-relaxed font-light">
                    {selectedService.description}
                  </p>
                </div>

                {/* Capabilities Checklist */}
                <div className="mt-8 pt-6 border-t border-obsidian-border">
                  <h4 className="font-mono text-xs text-ivory-dim uppercase tracking-wider mb-4">
                    Core Technical Scope
                  </h4>
                  <ul className="space-y-2.5">
                    {selectedService.capabilities.map((cap) => (
                      <li
                        key={cap}
                        className="flex items-start gap-3 font-sans text-sm text-ivory"
                      >
                        <span className="w-4 h-4 rounded-none bg-acid/10 border border-acid/40 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-acid" />
                        </span>
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deliverables & Technology Focus */}
                <div className="mt-8 pt-6 border-t border-obsidian-border grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-mono text-[11px] text-ivory-dim uppercase tracking-wider mb-3">
                      Expected Deliverables
                    </h4>
                    <ul className="space-y-1 font-mono text-xs text-ivory-muted">
                      {selectedService.deliverables.map((del) => (
                        <li key={del} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-acid inline-block" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-mono text-[11px] text-ivory-dim uppercase tracking-wider mb-3">
                      Technology Focus
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedService.techFocus.map((tech) => (
                        <Tag key={tech} variant="default" size="sm">
                          {tech}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer link to detailed service spec */}
                <div className="mt-8 pt-6 border-t border-obsidian-border flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ivory-dim">
                    SCOPE CUSTOMIZABLE PER ENGAGEMENT
                  </span>
                  <Link
                    href={`/services#${selectedService.id}`}
                    className="font-mono text-xs text-acid hover:text-white flex items-center gap-1.5 transition-colors uppercase tracking-wider font-semibold"
                  >
                    <span>Full Service Architecture</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </MotionWrapper>
          </div>
        </div>
      </div>
    </section>
  );
}

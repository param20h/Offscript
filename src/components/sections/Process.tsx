"use client";

import React from "react";
import { PROCESS_STEPS } from "@/lib/constants";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import MotionWrapper from "@/components/motion/MotionWrapper";

export default function Process() {
  return (
    <section className="relative w-full py-24 sm:py-32 bg-obsidian border-b border-obsidian-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          index="// 04. METHODOLOGY"
          badge="EXECUTION SYSTEM"
          title="ENGINEERING PROCESS."
          subtitle="A deterministic, 5-stage lifecycle from architectural discovery to continuous evolution."
          description="We eliminate ambiguity through transparent technical milestones, verified deliverable checklists, and daily asynchronous commits."
          align="split"
        />

        {/* Timeline / Sequential Engineering Stepper */}
        <div className="mt-12 space-y-6">
          {PROCESS_STEPS.map((step, idx) => (
            <MotionWrapper
              key={step.step}
              delay={idx * 0.08}
              className="group p-6 sm:p-8 border border-obsidian-border bg-obsidian-surface hover:border-ivory/40 transition-all duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Step Indicator & Title */}
                <div className="md:col-span-4 flex items-start gap-4">
                  <span className="font-display text-4xl sm:text-5xl font-bold text-acid group-hover:scale-105 transition-transform">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl font-bold text-ivory tracking-tight group-hover:text-acid transition-colors">
                      {step.title}
                    </h3>
                    <p className="font-mono text-xs text-ivory-dim tracking-wider uppercase mt-1">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                {/* Step Description */}
                <div className="md:col-span-5">
                  <p className="font-sans text-sm sm:text-base text-ivory-muted/90 leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>

                {/* Step Deliverables */}
                <div className="md:col-span-3">
                  <div className="p-3 border border-obsidian-border/80 bg-obsidian">
                    <span className="font-mono text-[10px] text-ivory-dim uppercase tracking-widest block mb-2">
                      Key Deliverables
                    </span>
                    <ul className="space-y-1 font-mono text-xs text-ivory">
                      {step.deliverables.map((item) => (
                        <li key={item} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-acid inline-block" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </MotionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}

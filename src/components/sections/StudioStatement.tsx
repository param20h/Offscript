"use client";

import React from "react";
import MotionWrapper from "@/components/motion/MotionWrapper";
import { SITE_CONFIG } from "@/lib/constants";

export default function StudioStatement() {
  const tenets = [
    {
      title: "Substance Over Noise",
      description:
        "We reject empty buzzwords, template libraries, and superficial polish. We build bespoke software architectures designed to solve concrete operational and business bottlenecks.",
    },
    {
      title: "Architecture Before Aesthetics",
      description:
        "Exceptional design falls apart without technical rigor. We engineer sub-second response times, strictly-typed schemas, and resilient failure recovery from line one.",
    },
    {
      title: "Authentic Intelligence",
      description:
        "AI is not a marketing veneer. We implement verifiable RAG systems, structured multi-agent loops, and deterministic domain classifiers that deliver predictable utility.",
    },
  ];

  return (
    <section className="relative w-full py-24 sm:py-32 lg:py-40 bg-obsidian-surface border-b border-obsidian-border overflow-hidden">
      {/* Background Architectural Watermark */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] font-display text-[26vw] font-black leading-none text-ivory">
        STUDIO
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header Metadata */}
        <MotionWrapper className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-acid">
              PHILOSOPHY
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ivory-dim border-l border-obsidian-border pl-3">
              EDITORIAL MANIFESTO
            </span>
          </div>
        </MotionWrapper>

        {/* Oversized Editorial Quote */}
        <MotionWrapper delay={0.1} className="max-w-5xl">
          <blockquote className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-ivory leading-[1.15]">
            “Technology should do{" "}
            <span className="text-acid underline decoration-acid/30 decoration-2 underline-offset-8">
              more than function
            </span>
            . It should{" "}
            <span className="text-ivory-pure">challenge expectations</span>, solve{" "}
            <span className="text-ivory-pure">meaningful problems</span> and create{" "}
            <span className="text-acid">experiences worth remembering</span>.”
          </blockquote>
        </MotionWrapper>

        {/* Supporting Editorial Attribution */}
        <MotionWrapper delay={0.2} className="mt-8 flex items-center gap-4">
          <div className="w-12 h-[1px] bg-acid" />
          <p className="font-mono text-xs sm:text-sm text-ivory-muted uppercase tracking-wider">
            OFFSCRIPT STUDIO CREATIVE CODEX // 2026
          </p>
        </MotionWrapper>

        {/* 3-Column Studio Tenets Grid */}
        <div className="mt-20 lg:mt-28 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-12 border-t border-obsidian-border">
          {tenets.map((tenet, idx) => (
            <MotionWrapper
              key={tenet.title}
              delay={0.15 + idx * 0.1}
              className="flex flex-col justify-between"
            >
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-ivory mb-3 tracking-tight">
                  {tenet.title}
                </h3>
                <p className="font-sans text-sm text-ivory-muted/80 leading-relaxed font-light">
                  {tenet.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-obsidian-border/50 font-mono text-[10px] text-ivory-dim uppercase tracking-widest flex items-center justify-between">
                <span>CORE PRINCIPLE</span>
                <span className="text-acid">VERIFIED</span>
              </div>
            </MotionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}

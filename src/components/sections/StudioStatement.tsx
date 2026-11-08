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
    <section
      id="statement"
      className="relative w-full py-24 sm:py-32 lg:py-36 bg-ivory text-obsidian border-b border-obsidian/15 overflow-hidden"
    >
      {/* Background Architectural Watermark */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.035] font-display text-[26vw] font-black leading-none text-obsidian">
        STUDIO
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <MotionWrapper className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-acid border border-obsidian/30 inline-block" />
            <span className="font-mono text-xs uppercase tracking-widest text-obsidian/70 font-semibold">
              Studio Manifesto
            </span>
          </div>
        </MotionWrapper>

        {/* Oversized Editorial Quote */}
        <MotionWrapper delay={0.1} className="max-w-5xl">
          <blockquote className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-obsidian leading-[1.14]">
            “Technology should do{" "}
            <span className="underline decoration-acid decoration-4 underline-offset-8">
              more than function
            </span>
            . It should{" "}
            <span className="text-obsidian font-black">challenge expectations</span>, solve{" "}
            <span className="text-obsidian font-black">meaningful problems</span> and create{" "}
            <span className="text-obsidian underline decoration-obsidian/30 decoration-2 underline-offset-8">
              experiences worth remembering
            </span>
            .”
          </blockquote>
        </MotionWrapper>

        {/* Supporting Editorial Attribution */}
        <MotionWrapper delay={0.2} className="mt-8 flex items-center gap-4">
          <div className="w-12 h-[1px] bg-obsidian/30" />
          <p className="font-mono text-xs sm:text-sm text-obsidian/60 uppercase tracking-wider">
            OFFSCRIPT STUDIO — PHILOSOPHY
          </p>
        </MotionWrapper>

        {/* 3-Column Studio Tenets Grid */}
        <div className="mt-16 lg:mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-12 border-t border-obsidian/15">
          {tenets.map((tenet, idx) => (
            <MotionWrapper
              key={tenet.title}
              delay={0.15 + idx * 0.1}
              className="flex flex-col justify-between p-6 sm:p-8 bg-ivory-pure border border-obsidian/10 shadow-[0_2px_12px_rgba(23,23,23,0.03)]"
            >
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-obsidian mb-3 tracking-tight">
                  {tenet.title}
                </h3>
                <p className="font-sans text-sm sm:text-base text-obsidian/75 leading-relaxed font-light">
                  {tenet.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-obsidian/10 font-mono text-[10px] text-obsidian/50 uppercase tracking-wider flex items-center justify-between">
                <span>Core Practice</span>
                <span className="w-1.5 h-1.5 bg-acid border border-obsidian/30" />
              </div>
            </MotionWrapper>
          ))}
        </div>

        {/* Exhibition Transition Bridge */}
        <div className="mt-16 pt-8 border-t border-obsidian/10 flex items-center justify-between text-xs font-mono text-obsidian/60">
          <span className="uppercase tracking-wider">Engineering Repositories</span>
          <a
            href="#work"
            className="text-obsidian hover:text-obsidian font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <span>Proceed to Project Exhibition</span>
            <span>↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}

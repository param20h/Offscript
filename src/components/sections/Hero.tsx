"use client";

import React from "react";
import dynamic from "next/dynamic";
import { SITE_CONFIG } from "@/lib/constants";
import Button from "@/components/ui/Button";
import CanvasFallback from "@/components/three/CanvasFallback";
import { motion, useReducedMotion, type Variants } from "motion/react";

// Dynamically load the WebGL SignatureCanvas to keep initial load fast and isolate SSR
const SignatureCanvas = dynamic(
  () => import("@/components/three/SignatureCanvas"),
  {
    ssr: false,
    loading: () => <CanvasFallback />,
  }
);

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between pt-4 pb-12 lg:pt-6 lg:pb-16 overflow-hidden border-b border-obsidian-border bg-obsidian">
      {/* Background Subtle Architectural Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

      {/* Top Editorial Ribbon: Meaningful Studio Specifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-6 lg:mb-10">
        <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 border-b border-obsidian-border font-mono text-[10px] sm:text-xs text-ivory-dim uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-acid inline-block" />
            <span className="text-ivory font-medium">{SITE_CONFIG.positioning}</span>
          </div>
          <div className="hidden lg:flex items-center gap-6 text-ivory-dim/80">
            <span>WEB PLATFORMS</span>
            <span className="text-acid/40">//</span>
            <span>INTELLIGENT SYSTEMS</span>
            <span className="text-acid/40">//</span>
            <span>CREATIVE ENGINEERING</span>
          </div>
          <div className="text-acid font-medium">
            <span>BUILT DIFFERENT. ENGINEERED PROPERLY.</span>
          </div>
        </div>
      </div>

      {/* Main Hero Stage: Balanced Split between Headline & 3D Sculpture */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Oversized Typographic Anchor */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col justify-center z-10"
          >
            {/* Studio Marker */}
            <motion.div variants={itemVariants} className="mb-3">
              <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-acid font-medium">
                // CREATIVE ENGINEERING CODEX
              </span>
            </motion.div>

            {/* Oversized Headline with Calibrated Breakpoint Scaling */}
            <motion.h1
              variants={itemVariants}
              className="font-display text-[2.5rem] xs:text-5xl sm:text-6xl md:text-7xl lg:text-[4.25rem] xl:text-[5.25rem] 2xl:text-[5.75rem] font-bold tracking-tight text-ivory leading-[0.93] uppercase"
            >
              <span className="block">{SITE_CONFIG.headline.line1}</span>
              <span className="block text-ivory">{SITE_CONFIG.headline.line2}</span>
              <span className="block text-acid relative inline-block">
                {SITE_CONFIG.headline.line3}
              </span>
            </motion.h1>

            {/* Supporting Statement */}
            <motion.p
              variants={itemVariants}
              className="mt-6 sm:mt-7 font-sans text-base sm:text-lg md:text-xl text-ivory-muted max-w-xl leading-relaxed font-light"
            >
              {SITE_CONFIG.statement}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="mt-8 sm:mt-9 flex flex-wrap items-center gap-4"
            >
              <Button
                href="/work"
                variant="primary"
                size="lg"
                withArrow
                aria-label="Explore our work"
              >
                EXPLORE OUR WORK
              </Button>
              <Button
                href="/contact"
                variant="outline"
                size="lg"
                withArrow
                aria-label="Start a project inquiry"
              >
                START A PROJECT
              </Button>
            </motion.div>

            {/* Studio Execution Standards */}
            <motion.div
              variants={itemVariants}
              className="mt-10 pt-5 border-t border-obsidian-border grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[11px]"
            >
              <div>
                <span className="text-ivory-dim block uppercase tracking-wider mb-1">
                  DISCIPLINE
                </span>
                <span className="text-ivory font-medium">Digital Engineering</span>
              </div>
              <div>
                <span className="text-ivory-dim block uppercase tracking-wider mb-1">
                  PRACTICE
                </span>
                <span className="text-ivory font-medium">Full-Stack &amp; AI Agents</span>
              </div>
              <div>
                <span className="text-ivory-dim block uppercase tracking-wider mb-1">
                  STANDARD
                </span>
                <span className="text-acid font-medium">Production From Day One</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Free-Floating Signature 3D Digital Sculpture */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative w-full h-[380px] sm:h-[460px] lg:h-[540px] flex items-center justify-center"
          >
            {/* Subtle Architectural Alignment Ticks */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-obsidian-border pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-obsidian-border pointer-events-none" />

            {/* Interactive 3D Canvas */}
            <div className="w-full h-full relative">
              <SignatureCanvas />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Architectural Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10 pt-4 border-t border-obsidian-border">
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-ivory-dim gap-4">
          <div className="flex items-center gap-3">
            <span className="text-acid font-bold">00</span>
            <span className="uppercase tracking-widest text-ivory">
              OFFSCRIPT DIGITAL STUDIO
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[11px] uppercase tracking-wider text-ivory-dim">
            <span>NO TEMPLATES</span>
            <span className="text-acid/40">//</span>
            <span>NO DISPOSABLE CODE</span>
            <span className="text-acid/40">//</span>
            <span>VERIFIED ARCHITECTURE</span>
          </div>
          <div>
            <span className="tracking-widest text-acid hover:underline cursor-pointer">
              SCROLL FOR WORK ↓
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

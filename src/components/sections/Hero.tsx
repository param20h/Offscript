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
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between pt-6 pb-16 lg:py-16 overflow-hidden border-b border-obsidian-border bg-obsidian">
      {/* Background Subtle Coordinate Lattice */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

      {/* Top Coordinate Ribbon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-8 lg:mb-12">
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-obsidian-border/80 font-mono text-[10px] sm:text-xs text-ivory-dim uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-acid inline-block" />
            <span className="text-ivory">{SITE_CONFIG.positioning}</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <span>LOCATION: DIGITAL // GLOBAL</span>
            <span className="text-acid">STATUS: Q2/Q3 2026 ENGAGEMENTS</span>
          </div>
          <div>
            <span>SYSTEM_ID: OFFSCRIPT_OS_v0</span>
          </div>
        </div>
      </div>

      {/* Main Hero Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Oversized Editorial Typography & CTAs */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Tagline / Subtitle */}
            <motion.div variants={itemVariants} className="mb-4">
              <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-acid">
                // {SITE_CONFIG.tagline}
              </span>
            </motion.div>

            {/* Oversized Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[5.5rem] font-bold tracking-tight text-ivory leading-[0.92] uppercase"
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
              className="mt-6 sm:mt-8 font-sans text-base sm:text-lg md:text-xl text-ivory-muted max-w-xl leading-relaxed font-light"
            >
              {SITE_CONFIG.statement}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-5"
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

            {/* Architectural Key Specs */}
            <motion.div
              variants={itemVariants}
              className="mt-12 pt-6 border-t border-obsidian-border grid grid-cols-3 gap-4 font-mono text-[11px]"
            >
              <div>
                <span className="text-ivory-dim block uppercase tracking-wider mb-1">
                  DISCIPLINE
                </span>
                <span className="text-ivory font-medium">Digital Engineering</span>
              </div>
              <div>
                <span className="text-ivory-dim block uppercase tracking-wider mb-1">
                  STACK
                </span>
                <span className="text-ivory font-medium">Next.js // AI // WebGL</span>
              </div>
              <div>
                <span className="text-ivory-dim block uppercase tracking-wider mb-1">
                  STANDARDS
                </span>
                <span className="text-acid font-medium">Production-Grade</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Signature 3D / Wireframe Instrument */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative w-full h-[400px] sm:h-[480px] lg:h-[540px] flex items-center justify-center"
          >
            <div className="w-full h-full relative">
              <SignatureCanvas />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Ticker / Precision Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12 pt-4 border-t border-obsidian-border/60">
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-ivory-dim gap-4">
          <div className="flex items-center gap-3">
            <span className="text-acid font-bold">00</span>
            <span className="uppercase tracking-widest text-ivory">
              INTRODUCING OFFSCRIPT STUDIO
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-wider">
            <span>NO TEMPLATES</span>
            <span>//</span>
            <span>NO FABRICATED METRICS</span>
            <span>//</span>
            <span>ENGINEERED ARCHITECTURE</span>
          </div>
          <div>
            <span className="tracking-widest">SCROLL FOR WORK ↓</span>
          </div>
        </div>
      </div>
    </section>
  );
}

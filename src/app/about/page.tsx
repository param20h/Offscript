import React from "react";
import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import MotionWrapper from "@/components/motion/MotionWrapper";
import { Code2, Compass, Shield, Terminal } from "lucide-react";

export const metadata: Metadata = {
  title: "Studio — Philosophy & Engineering Standard",
  description:
    "OFFSCRIPT is an independent digital engineering studio dedicated to craftsmanship, technical depth, and uncompromised execution.",
};

export default function AboutPage() {
  return (
    <div className="w-full py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        index="// STUDIO PHILOSOPHY"
        badge="STUDIO DOSSIER"
        title="BUILT DIFFERENT. ENGINEERED PROPERLY."
        subtitle="We design, engineer and launch digital products, intelligent systems and experiences built to make an impact."
        description="OFFSCRIPT is an independent digital engineering studio. We operate without bureaucratic layers or junior delegators—working directly with founders and product owners on ambitious technical initiatives."
      />

      {/* Narrative Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16 items-start">
        <div className="lg:col-span-7 space-y-8 font-sans text-base sm:text-lg text-ivory-muted/90 leading-relaxed font-light">
          <p>
            Modern software development has become flooded with generic templates, disposable codebases, and exaggerated marketing claims.
          </p>
          <p>
            OFFSCRIPT was formed to offer the opposite: high-craft digital engineering that respects both design aesthetics and computational rigor. When we build an application, we engineer it to withstand real traffic, scale gracefully, and feel distinctively memorable to anyone who interacts with it.
          </p>
          <p>
            From low-latency keyboard-first interfaces to multi-agent LLM systems with deterministic evaluation pipelines, our work is defined by precision, curiosity, and uncompromising attention to detail.
          </p>
        </div>

        <div className="lg:col-span-5 p-8 border border-obsidian-border bg-obsidian-surface space-y-6">
          <h3 className="font-mono text-xs text-acid uppercase tracking-widest pb-3 border-b border-obsidian-border">
            Studio Operating Principles
          </h3>

          <div className="space-y-4 font-mono text-xs text-ivory-muted">
            <div className="flex items-start gap-3">
              <span className="text-acid font-bold">01.</span>
              <div>
                <span className="text-ivory font-semibold block">Craft Is Non-Negotiable</span>
                <span>Every interaction state, focus outline, and network retry is deliberate.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-acid font-bold">02.</span>
              <div>
                <span className="text-ivory font-semibold block">No Manufactured Proof</span>
                <span>We rely strictly on demonstrable code and verifiable technical artifacts.</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-acid font-bold">03.</span>
              <div>
                <span className="text-ivory font-semibold block">Production From Day One</span>
                <span>No throwaway prototypes. Everything is engineered on clean foundations.</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-obsidian-border">
            <Button href="/contact" variant="primary" size="md" withArrow className="w-full">
              START A CONVERSATION
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

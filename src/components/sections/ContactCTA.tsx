"use client";

import React, { useState, useRef } from "react";
import { SITE_CONFIG } from "@/lib/constants";
import Button from "@/components/ui/Button";
import MotionWrapper from "@/components/motion/MotionWrapper";
import CalendlyModal from "@/components/ui/CalendlyModal";
import { trackEvent } from "@/lib/analytics";
import { Mail, Calendar } from "lucide-react";

export default function ContactCTA() {
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <section className="relative w-full py-24 sm:py-32 lg:py-40 bg-obsidian-surface border-b border-obsidian-border overflow-hidden">
        {/* Subtle Coordinate Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="p-8 sm:p-12 lg:p-16 border border-obsidian-border bg-obsidian relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
              {/* Left Headline */}
              <MotionWrapper delay={0.1} className="lg:col-span-8">
                <span className="font-mono text-xs uppercase tracking-wider text-acid block mb-4">
                  Start An Engagement
                </span>
                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ivory uppercase leading-[0.95]">
                  <span className="block">HAVE AN IDEA?</span>
                  <span className="block text-acid">LET&apos;S MAKE IT REAL.</span>
                </h2>

                <p className="mt-6 font-sans text-base sm:text-lg md:text-xl text-ivory-muted max-w-xl font-light leading-relaxed">
                  Tell us what you&apos;re imagining. We&apos;ll help turn it into something tangible.
                </p>
              </MotionWrapper>

              {/* Right Action Stack */}
              <MotionWrapper delay={0.2} className="lg:col-span-4 flex flex-col gap-4">
                <Button
                  href="/contact"
                  variant="primary"
                  size="lg"
                  withArrow
                  className="w-full text-center"
                >
                  START A PROJECT
                </Button>

                <Button
                  ref={calendarButtonRef}
                  type="button"
                  onClick={() => {
                    trackEvent("discovery_call_clicked", { source: "contact_cta_section" });
                    setIsCalendlyOpen(true);
                  }}
                  variant="outline"
                  size="lg"
                  className="w-full text-center cursor-pointer"
                >
                  <Calendar className="w-4 h-4 mr-2 text-acid" />
                  BOOK A DISCOVERY CALL
                </Button>
              </MotionWrapper>
            </div>

            {/* Bottom Direct Inquiries */}
            <div className="mt-12 pt-8 border-t border-obsidian-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs text-ivory-dim">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-acid" />
                <span>Email:</span>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  onClick={() => trackEvent("email_contact_clicked", { location: "contact_cta_section" })}
                  className="text-ivory hover:text-acid underline underline-offset-4 decoration-acid/40 transition-colors"
                >
                  {SITE_CONFIG.email}
                </a>
              </div>

              <div className="text-ivory-dim text-xs">
                Response within 24 business hours
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* On-Demand Calendly Modal */}
      <CalendlyModal
        isOpen={isCalendlyOpen}
        onClose={() => setIsCalendlyOpen(false)}
        triggerRef={calendarButtonRef}
      />
    </>
  );
}

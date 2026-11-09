"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { SITE_CONFIG, FOOTER_LINKS } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import { ArrowUpRight } from "lucide-react";

/**
 * Interactive architectural watermark banner.
 * Tracks local cursor coordinates and reveals an Acid Lime spotlight glow
 * exclusively under the cursor position without illuminating the entire wordmark.
 */
function SpotlightWordmark() {
  const containerRef = useRef<HTMLDivElement>(null);

  const updateCoordinates = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty("--cursor-x", `${x}px`);
    containerRef.current.style.setProperty("--cursor-y", `${y}px`);
    containerRef.current.style.setProperty("--glow-opacity", "1");
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    containerRef.current.style.setProperty("--glow-opacity", "0");
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={updateCoordinates}
      onMouseEnter={updateCoordinates}
      onMouseLeave={handleMouseLeave}
      className="relative pt-12 pb-6 border-t border-obsidian-border/40 overflow-hidden select-none cursor-default group"
      aria-label="OFFSCRIPT Architectural Watermark"
    >
      {/* 1. Ambient localized cursor aura (subtle halo directly under cursor) */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none rounded-full blur-3xl transition-opacity duration-300"
        style={{
          width: "280px",
          height: "280px",
          left: "calc(var(--cursor-x, -9999px) - 140px)",
          top: "calc(var(--cursor-y, -9999px) - 140px)",
          background:
            "radial-gradient(circle, rgba(214, 255, 53, 0.22) 0%, rgba(214, 255, 53, 0) 70%)",
          opacity: "var(--glow-opacity, 0)",
        }}
      />

      {/* 2. Base Muted Watermark Layer (Always visible, dark architectural bedrock) */}
      <span className="block font-display text-[14vw] font-black tracking-tighter leading-none text-obsidian-border/30 text-center whitespace-nowrap">
        OFFSCRIPT
      </span>

      {/* 3. Localized Spotlight Glow Layer (Clipped via radial-gradient mask to cursor coordinates) */}
      <span
        aria-hidden="true"
        className="absolute inset-0 pt-12 pb-6 flex items-center justify-center font-display text-[14vw] font-black tracking-tighter leading-none text-acid text-center whitespace-nowrap pointer-events-none drop-shadow-[0_0_35px_rgba(214,255,53,0.55)] transition-opacity duration-200"
        style={{
          maskImage:
            "radial-gradient(circle 200px at var(--cursor-x, -9999px) var(--cursor-y, -9999px), black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle 200px at var(--cursor-x, -9999px) var(--cursor-y, -9999px), black 0%, transparent 75%)",
          opacity: "var(--glow-opacity, 0)",
        }}
      >
        OFFSCRIPT
      </span>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-obsidian border-t border-obsidian-border mt-auto">
      {/* Upper Footer: Studio Identity, Navigation & Specifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <Link
                href="/"
                className="inline-block mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid"
                aria-label="OFFSCRIPT Studio Homepage"
              >
                <Image
                  src="/logos/Website — Horizontal (Dark).svg"
                  alt="OFFSCRIPT Studio"
                  width={178}
                  height={36}
                  className="h-8 sm:h-9 w-auto object-contain transition-opacity hover:opacity-90"
                />
              </Link>
              <p className="font-mono text-xs uppercase tracking-widest text-acid mb-3">
                {SITE_CONFIG.positioning}
              </p>
              <p className="font-sans text-sm text-ivory-muted/90 max-w-sm leading-relaxed">
                {SITE_CONFIG.tagline} We design and engineer production software, intelligent agent workflows, and distinct digital flagships.
              </p>
            </div>

            <div className="pt-2">
              <span className="font-mono text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                Direct Inquiries
              </span>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                onClick={() => trackEvent("email_contact_clicked", { location: "footer" })}
                className="font-mono text-sm sm:text-base text-ivory hover:text-acid transition-colors inline-flex items-center gap-1 group"
              >
                <span>{SITE_CONFIG.email}</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-3">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-ivory-dim mb-6 pb-2 border-b border-obsidian-border">
              Directory
            </h3>
            <ul className="space-y-3 font-mono text-xs tracking-wider uppercase">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ivory-muted hover:text-acid transition-colors flex items-center justify-between group py-0.5"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio Specifications Column */}
          <div className="md:col-span-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-ivory-dim mb-6 pb-2 border-b border-obsidian-border">
              Studio Practice
            </h3>
            <div className="space-y-4 font-mono text-xs text-ivory-muted">
              <div>
                <span className="text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                  Mandate
                </span>
                <p className="text-acid flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-acid rounded-none inline-block shrink-0" />
                  <span>Independent Engineering &amp; Architecture</span>
                </p>
              </div>

              <div>
                <span className="text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                  Operating Standard
                </span>
                <p className="text-ivory-muted/90">
                  Strict TypeScript, edge infrastructure, and verifiable architecture.
                </p>
              </div>

              <div>
                <span className="text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                  Response Window
                </span>
                <p className="text-ivory-muted/90">
                  Within 24 business hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Oversized Studio Wordmark with Localized Cursor Spotlight Glow */}
      <SpotlightWordmark />

      {/* Lower Footer: Colophon & Legal */}
      <div className="border-t border-obsidian-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-ivory-dim">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} OFFSCRIPT Studio. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link
              href="/privacy"
              className="hover:text-acid transition-colors underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-acid transition-colors underline-offset-4 hover:underline"
            >
              Terms of Engagement
            </Link>
            <span className="hidden sm:inline text-obsidian-border">|</span>
            <span className="hidden sm:inline">Built different. Engineered properly.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

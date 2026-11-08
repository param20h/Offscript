import React from "react";
import Link from "next/link";
import { SITE_CONFIG, FOOTER_LINKS } from "@/lib/constants";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-obsidian border-t border-obsidian-border mt-auto">
      {/* Upper Footer: Studio Identity & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ivory">
                  OFFSCRIPT
                </span>
                <span className="font-mono text-xs text-acid font-semibold">
                  ®
                </span>
              </div>
              <p className="font-mono text-xs uppercase tracking-widest text-acid mb-3">
                {SITE_CONFIG.positioning}
              </p>
              <p className="font-sans text-sm text-ivory-muted/90 max-w-sm leading-relaxed mb-6">
                {SITE_CONFIG.tagline}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] text-ivory-dim uppercase tracking-wider block">
                Direct Inquiries
              </span>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="font-mono text-sm text-ivory hover:text-acid transition-colors inline-flex items-center gap-1 group"
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
              {FOOTER_LINKS.map((link, idx) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ivory-muted hover:text-acid transition-colors flex items-center justify-between group py-1"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio Specifications Column */}
          <div className="md:col-span-4">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-ivory-dim mb-6 pb-2 border-b border-obsidian-border">
              Studio Coordinates
            </h3>
            <div className="space-y-4 font-mono text-xs text-ivory-muted">
              <div>
                <span className="text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                  Studio Mandate
                </span>
                <p className="text-acid flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-acid rounded-none" />
                  Independent Engineering &amp; Architecture
                </p>
              </div>

              <div>
                <span className="text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                  Operating Standard
                </span>
                <p className="text-ivory-muted/80">
                  Strict TypeScript // Edge Architecture // Measurable Impact
                </p>
              </div>

              <div>
                <span className="text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                  Response Window
                </span>
                <p className="text-ivory-muted/80">
                  Within 24 business hours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Oversized Subtle Studio Wordmark */}
        <div className="pt-16 pb-8 border-b border-obsidian-border/60 overflow-hidden select-none">
          <span className="block font-display text-[14vw] font-black tracking-tighter leading-none text-obsidian-border/50 hover:text-obsidian-border/80 transition-colors whitespace-nowrap text-center">
            OFFSCRIPT
          </span>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-ivory-dim">
          <p>© {SITE_CONFIG.year} {SITE_CONFIG.legalName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-ivory-dim/60">
              BUILT DIFFERENT. ENGINEERED PROPERLY.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

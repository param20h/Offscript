"use client";

import React from "react";
import Link from "next/link";
import { SITE_CONFIG, FOOTER_LINKS } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-obsidian border-t border-obsidian-border mt-auto">
      {/* Upper Footer: Studio Identity & Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Brand Column */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-baseline gap-1.5 mb-3">
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
              <p className="font-sans text-sm text-ivory-muted/90 max-w-md leading-relaxed">
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
          <div className="md:col-span-5">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-ivory-dim mb-6 pb-2 border-b border-obsidian-border">
              Directory
            </h3>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-6 font-mono text-xs tracking-wider uppercase">
              {FOOTER_LINKS.map((link) => (
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
        </div>
      </div>

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

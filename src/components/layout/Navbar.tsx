"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SITE_CONFIG, NAV_LINKS } from "@/lib/constants";
import Button from "@/components/ui/Button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-md",
          isScrolled
            ? "bg-obsidian/90 border-b border-obsidian-border/80 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
            : "bg-obsidian/50 border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link
            href="/"
            className="group flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid"
            aria-label={`${SITE_CONFIG.name} Homepage`}
          >
            <Image
              src="/logos/Website — Horizontal (Dark).svg"
              alt="OFFSCRIPT Studio"
              width={178}
              height={36}
              priority
              className="h-8 md:h-9 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
            />
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav
            className="hidden md:flex items-center gap-8 lg:gap-10"
            aria-label="Main Navigation"
          >
            {NAV_LINKS.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative font-mono text-xs uppercase tracking-wider transition-colors duration-200 py-1",
                    isActive
                      ? "text-acid font-medium"
                      : "text-ivory-muted hover:text-ivory"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-acid" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              href="/contact"
              variant="acid"
              size="sm"
              withArrow
              aria-label="Start a project inquiry"
            >
              START A PROJECT
            </Button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-ivory hover:text-acid transition-colors border border-obsidian-border bg-obsidian-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-acid" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-20 z-40 bg-obsidian/95 backdrop-blur-xl md:hidden border-t border-obsidian-border flex flex-col justify-between p-6 sm:p-8 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex flex-col gap-6 pt-4">
            <span className="font-mono text-xs uppercase tracking-wider text-ivory-dim">
              Menu
            </span>
            <nav className="flex flex-col gap-4" aria-label="Mobile Navigation">
              {NAV_LINKS.map((link, idx) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between py-3 border-b border-obsidian-border font-display text-2xl font-bold tracking-tight transition-colors",
                      isActive ? "text-acid" : "text-ivory hover:text-acid"
                    )}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-col gap-4 pb-8">
            <Button
              href="/contact"
              variant="primary"
              size="md"
              withArrow
              className="w-full text-center"
            >
              START A PROJECT
            </Button>
            <div className="flex justify-between items-center text-xs font-mono text-ivory-dim pt-4 border-t border-obsidian-border">
              <span>{SITE_CONFIG.email}</span>
              <span className="text-acid">{SITE_CONFIG.tagline}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

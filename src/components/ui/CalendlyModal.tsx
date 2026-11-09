"use client";

import React, { useEffect, useRef, useState } from "react";
import { SITE_CONFIG } from "@/lib/constants";
import { X, ExternalLink, Calendar, Loader2, Mail, AlertCircle } from "lucide-react";

interface CalendlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
  url?: string;
}

/**
 * Validates whether the configured URL is a safe HTTPS Calendly URL.
 */
function getValidCalendlyUrl(rawUrl?: string): string | null {
  if (!rawUrl || rawUrl.trim().length === 0) {
    return null;
  }

  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "https:") return null;
    if (!parsed.hostname.endsWith("calendly.com")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export default function CalendlyModal({ isOpen, onClose, triggerRef, url }: CalendlyModalProps) {
  const [iframeLoading, setIframeLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const calendlyUrl = getValidCalendlyUrl(url);

  // Escape key handler and focus management
  useEffect(() => {
    if (!isOpen) return;

    // Lock background scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on mount
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
      // Return focus to trigger if provided
      if (triggerRef?.current) {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose, triggerRef]);

  // Reset loading state when opened
  useEffect(() => {
    if (isOpen) {
      setIframeLoading(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build themed Calendly URL with matching Obsidian / Ivory / Acid Lime colors
  let embedUrl = "";
  if (calendlyUrl) {
    try {
      const urlObj = new URL(calendlyUrl);
      urlObj.searchParams.set("background_color", "171717");
      urlObj.searchParams.set("text_color", "f0ede5");
      urlObj.searchParams.set("primary_color", "d6ff35");
      urlObj.searchParams.set("hide_landing_page_details", "1");
      urlObj.searchParams.set("hide_gdpr_banner", "1");
      embedUrl = urlObj.toString();
    } catch {
      embedUrl = calendlyUrl;
    }
  }

  const mailtoFallback = `mailto:${SITE_CONFIG.email}?subject=Discovery%20Consultation%20Request%20—%20OFFSCRIPT&body=Hi%20OFFSCRIPT%20Team%2C%0A%0AWe%20would%20like%20to%20schedule%20a%2030-minute%20discovery%20consultation.%0A%0ACompany%3A%20%0AProject%20Overview%3A%20%0APreferred%20Timezone%2FDates%3A%20`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-obsidian/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendly-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-obsidian-surface border border-obsidian-border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-obsidian-border bg-obsidian font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-acid inline-block" />
            <h2 id="calendly-modal-title" className="text-ivory font-medium uppercase tracking-wider">
              Discovery Consultation — 30 Minutes
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {calendlyUrl && (
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-ivory-dim hover:text-acid transition-colors text-[11px] uppercase tracking-wider"
              >
                <span>Open in Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="p-1.5 text-ivory-dim hover:text-acid hover:bg-obsidian-surface border border-transparent hover:border-obsidian-border transition-colors cursor-pointer"
              aria-label="Close discovery modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="relative flex-1 min-h-[460px] sm:min-h-[580px] bg-obsidian overflow-hidden flex flex-col justify-center">
          {calendlyUrl ? (
            <>
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-obsidian text-ivory-muted z-10">
                  <Loader2 className="w-6 h-6 animate-spin text-acid" />
                  <span className="font-mono text-xs uppercase tracking-wider text-ivory-dim">
                    Connecting to scheduling calendar...
                  </span>
                </div>
              )}

              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                title="Schedule a Discovery Consultation with OFFSCRIPT Studio"
                className="w-full h-full flex-1 min-h-[480px] sm:min-h-[600px] border-none"
                onLoad={() => setIframeLoading(false)}
              />
            </>
          ) : (
            /* Truth in engineering: Fallback when Calendly is not yet configured */
            <div className="p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6">
              <div className="w-12 h-12 bg-acid/10 border border-acid/40 text-acid flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold text-ivory">
                  Direct Discovery Scheduling
                </h3>
                <p className="font-sans text-sm text-ivory-muted leading-relaxed font-light">
                  Automated calendar booking is currently being provisioned. We schedule 30-minute discovery consultations directly via official studio email with guaranteed response within 24 business hours.
                </p>
              </div>

              <div className="p-4 bg-obsidian-surface border border-obsidian-border font-mono text-xs text-left space-y-2 text-ivory-dim">
                <div className="flex items-center gap-2 text-acid uppercase text-[11px] font-semibold tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Consultation Scope</span>
                </div>
                <p className="text-ivory-muted text-[11px] leading-relaxed">
                  We review architectural feasibility, timeline constraints, budget alignment, and technology selection before committing to any commercial engagement.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={mailtoFallback}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-acid text-obsidian font-mono text-xs font-bold uppercase tracking-wider hover:bg-ivory transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Request Call via Email</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-obsidian-border text-ivory font-mono text-xs uppercase tracking-wider hover:border-acid transition-colors cursor-pointer"
                >
                  Return to Site
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Info */}
        <div className="px-6 py-3 border-t border-obsidian-border bg-obsidian font-mono text-[10px] text-ivory-dim flex flex-wrap items-center justify-between gap-2">
          <span>Timezone: IST (UTC +5:30) &bull; Studio: OFFSCRIPT Digital Studio</span>
          <span>Response Guaranteed &lt; 24h</span>
        </div>
      </div>
    </div>
  );
}

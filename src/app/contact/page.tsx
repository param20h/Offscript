"use client";

import React, { useState, useRef } from "react";
import { SITE_CONFIG } from "@/lib/constants";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import CalendlyModal from "@/components/ui/CalendlyModal";
import { trackEvent } from "@/lib/analytics";
import {
  Mail,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

type SubmissionState =
  | { status: "idle" }
  | { status: "delivered"; message: string }
  | { status: "persisted"; message: string }
  | {
      status: "unpersisted_fallback";
      message: string;
      mailtoUrl: string;
      fallbackEmail: string;
    };

const ENGAGEMENT_PACKAGES = [
  { value: "Launch", label: "Launch — Digital Flagship & Architecture (2 to 4 Weeks)" },
  { value: "Scale", label: "Scale — Custom Product App & Systems (4 to 8 Weeks)" },
  { value: "Intelligence", label: "Intelligence — Autonomous AI Agents & Workflows (4 to 10 Weeks)" },
  { value: "Custom Engineering", label: "Custom Engineering — Bespoke Platforms & Architecture" },
  { value: "Custom / Discovery", label: "Custom Scope — To Be Defined in Technical Discovery" },
] as const;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "Web Development",
    packageModel: "Launch",
    timeline: "2 to 4 Weeks",
    description: "",
  });

  const [honeypot, setHoneypot] = useState("");
  const mountTimeRef = useRef<number>(Date.now());
  const hasFiredStartedRef = useRef(false);
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const scheduleTriggerRef = useRef<HTMLButtonElement>(null);

  const handleFormStart = () => {
    if (!hasFiredStartedRef.current) {
      hasFiredStartedRef.current = true;
      trackEvent("contact_form_started", { entryPoint: "contact_page" });
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionState>({ status: "idle" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Track submission attempt (Zero PII: only category and package)
    trackEvent("contact_form_submitted", {
      projectType: formData.projectType,
      packageModel: formData.packageModel,
    });

    const durationMs = Date.now() - mountTimeRef.current;

    try {
      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          packageModel: formData.packageModel,
          budgetRange: formData.packageModel,
          currency: "USD",
          durationMs,
          company_website_hp: honeypot,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 200) {
        trackEvent("contact_form_persisted", {
          notificationAccepted: true,
        });
        setSubmissionResult({
          status: "delivered",
          message:
            data.message || "Your inquiry has been successfully recorded and dispatched to the studio.",
        });
        return;
      }

      if (res.status === 202) {
        // Persisted in database; email delivery pending domain verification or provider retry
        trackEvent("contact_form_persisted", {
          notificationAccepted: false,
        });
        setSubmissionResult({
          status: "persisted",
          message:
            data.message ||
            "Your project brief has been securely stored in our studio intake database. We will review it shortly.",
        });
        return;
      }

      if (res.status === 400 || res.status === 429) {
        trackEvent("contact_form_failed", {
          errorCategory: res.status === 429 ? "rate_limit" : "validation",
        });
        setErrorMessage(
          data.error || "The submission could not be validated. Please check the highlighted fields."
        );
        return;
      }

      if (res.status === 500 || res.status === 503) {
        trackEvent("contact_form_failed", {
          errorCategory: "storage_unavailable",
        });
        // Truth in engineering: database write failed or database unconfigured; offer direct mailto fallback
        setSubmissionResult({
          status: "unpersisted_fallback",
          message:
            data.error ||
            "Inquiry storage is currently unavailable. Please transmit your brief directly via email.",
          mailtoUrl: data.mailtoUrl || `mailto:${SITE_CONFIG.email}`,
          fallbackEmail: data.fallbackEmail || SITE_CONFIG.email,
        });
        return;
      }

      trackEvent("contact_form_failed", {
        errorCategory: "storage_unavailable",
      });
      throw new Error(data.error || "An unexpected error occurred while transmitting your inquiry.");
    } catch (err: unknown) {
      trackEvent("contact_form_failed", {
        errorCategory: "network_exception",
      });
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected network error occurred. Please contact us directly via email.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmissionResult({ status: "idle" });
    setFormData({
      name: "",
      email: "",
      company: "",
      projectType: "Web Development",
      packageModel: "Launch",
      timeline: "2 to 4 Weeks",
      description: "",
    });
    setHoneypot("");
    mountTimeRef.current = Date.now();
  };

  return (
    <div className="w-full py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        badge="DIRECT ACCESS"
        title="START AN ENGAGEMENT."
        subtitle="Tell us what you're imagining. We'll help turn it into tangible digital architecture."
        description="Whether you require an unignorable digital flagship, an autonomous AI pipeline, or full-stack platform engineering, our team reviews each inquiry directly."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12 items-start">
        {/* Left Column: Direct Inquiries & Consultation */}
        <div className="lg:col-span-5 space-y-8">
          {/* Direct Studio Email Card */}
          <div className="p-8 border border-obsidian-border bg-obsidian-surface space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-acid block">
              Direct Inquiries
            </span>
            <div>
              <span className="font-mono text-[10px] text-ivory-dim uppercase tracking-wider block mb-1">
                Official Studio Email
              </span>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                onClick={() => trackEvent("email_contact_clicked", { location: "contact_page" })}
                className="font-mono text-base sm:text-lg text-ivory hover:text-acid underline underline-offset-4 decoration-acid/40 transition-colors inline-flex items-center gap-1.5"
              >
                <span>{SITE_CONFIG.email}</span>
                <ArrowUpRight className="w-4 h-4 text-acid" />
              </a>
            </div>

            <div className="pt-4 border-t border-obsidian-border font-mono text-xs text-ivory-muted space-y-3">
              <div className="flex justify-between">
                <span className="text-ivory-dim">STUDIO TIMEZONE</span>
                <span className="text-ivory">IST (UTC +5:30)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ivory-dim">STUDIO SCOPE</span>
                <span className="text-ivory font-medium">Bespoke Engineering</span>
              </div>
            </div>
          </div>

          {/* Discovery Call Card */}
          <div id="schedule" className="p-8 border border-obsidian-border bg-obsidian space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs text-acid uppercase tracking-widest">
              <Calendar className="w-4 h-4" />
              <span>Discovery Consultation</span>
            </div>
            <h3 className="font-display text-xl font-bold text-ivory">
              Need to brainstorm or align on architectural scope?
            </h3>
            <p className="font-sans text-sm text-ivory-muted leading-relaxed font-light">
              We host 30-minute discovery consultations to evaluate technical architecture, timeline feasibility, and scope boundaries before any engagement commences.
            </p>
            <div className="pt-2">
              <Button
                ref={scheduleTriggerRef}
                type="button"
                onClick={() => {
                  trackEvent("discovery_call_clicked", { source: "contact_page" });
                  setIsCalendlyOpen(true);
                }}
                variant="outline"
                size="md"
                withArrow
                className="w-full cursor-pointer"
              >
                SCHEDULE DISCOVERY CALL
              </Button>
            </div>
            <p className="font-mono text-[10px] text-ivory-dim text-center">
              Direct calendar reservation with fallback to studio email.
            </p>
          </div>
        </div>

        {/* Right Column: Full-Stack Project Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-12 border border-obsidian-border bg-obsidian-surface">
            {/* Condition 1: Direct Transactional Delivery Success (200 OK) */}
            {submissionResult.status === "delivered" && (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 bg-acid/10 border border-acid text-acid flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-ivory">
                  Inquiry Dispatched &amp; Delivered.
                </h3>
                <p className="font-sans text-sm text-ivory-muted max-w-md mx-auto leading-relaxed font-light">
                  Thank you, <span className="text-ivory font-medium">{formData.name}</span>. {submissionResult.message} We will follow up directly from{" "}
                  <span className="text-acid font-mono">{SITE_CONFIG.email}</span>.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="font-mono text-xs text-acid hover:underline cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            )}

            {/* Condition 2: Securely Persisted in Database (202 Accepted) */}
            {submissionResult.status === "persisted" && (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 bg-acid/10 border border-acid text-acid flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-ivory">
                  Brief Securely Recorded.
                </h3>
                <p className="font-sans text-sm text-ivory-muted max-w-md mx-auto leading-relaxed font-light">
                  Thank you, <span className="text-ivory font-medium">{formData.name}</span>. {submissionResult.message}
                </p>
                <p className="font-sans text-xs text-ivory-dim max-w-md mx-auto leading-relaxed">
                  Our engineering team reviews incoming briefs daily and will follow up directly at{" "}
                  <span className="text-ivory font-mono">{formData.email}</span>.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="font-mono text-xs text-acid hover:underline cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            )}

            {/* Condition 3: Database Write Failed / Service Unavailable (Truthful Mailto Fallback) */}
            {submissionResult.status === "unpersisted_fallback" && (
              <div className="py-6 space-y-6">
                <div className="p-5 bg-acid/5 border border-acid/40 space-y-3">
                  <div className="flex items-center gap-2 text-acid font-mono text-xs font-semibold uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 shrink-0 text-acid" />
                    <span>Direct Email Dispatch Recommended</span>
                  </div>
                  <p className="font-sans text-xs text-ivory-muted leading-relaxed">
                    {submissionResult.message} Please transmit your pre-formatted brief via your email client to ensure guaranteed direct delivery to our team:
                  </p>
                  <div className="pt-2">
                    <a
                      href={submissionResult.mailtoUrl}
                      onClick={() => trackEvent("email_contact_clicked", { location: "contact_page" })}
                      className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-acid text-obsidian font-mono text-xs font-bold uppercase tracking-wider hover:bg-ivory transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Send Pre-Filled Email ({submissionResult.fallbackEmail})</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="p-5 border border-obsidian-border bg-obsidian font-mono text-xs space-y-2 text-ivory-dim">
                  <div className="text-[10px] uppercase tracking-wider text-ivory-muted border-b border-obsidian-border pb-1">
                    Your Brief Summary
                  </div>
                  <div><span className="text-ivory-dim">Name:</span> <span className="text-ivory">{formData.name}</span></div>
                  <div><span className="text-ivory-dim">Email:</span> <span className="text-ivory">{formData.email}</span></div>
                  <div><span className="text-ivory-dim">Discipline:</span> <span className="text-ivory">{formData.projectType}</span></div>
                  <div><span className="text-ivory-dim">Package:</span> <span className="text-acid">{formData.packageModel}</span></div>
                  <div><span className="text-ivory-dim">Timeline:</span> <span className="text-ivory">{formData.timeline}</span></div>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setSubmissionResult({ status: "idle" })}
                    className="font-mono text-xs text-ivory-dim hover:text-acid hover:underline cursor-pointer"
                  >
                    ← Edit or Submit Another Brief
                  </button>
                </div>
              </div>
            )}

            {/* Condition 4: Default Active Form */}
            {submissionResult.status === "idle" && (
              <form onSubmit={handleSubmit} onFocusCapture={handleFormStart} className="space-y-6">
                {/* Anti-spam honeypot trap — visually concealed and excluded from keyboard/screen-reader navigation */}
                <div className="hidden absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="company_website_hp">Leave this field blank</label>
                  <input
                    type="text"
                    id="company_website_hp"
                    name="company_website_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="pb-4 border-b border-obsidian-border font-mono text-xs text-ivory-dim flex justify-between items-center">
                  <span className="uppercase tracking-wider">Project Brief &amp; Requirements</span>
                  <span className="text-acid">* Required Fields</span>
                </div>

                {errorMessage && (
                  <div className="p-4 bg-red-950/40 border border-red-500/50 text-red-200 text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block font-mono text-xs text-ivory uppercase tracking-wider mb-2"
                    >
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-3 bg-obsidian border border-obsidian-border text-ivory text-sm font-sans focus:outline-none focus:border-acid transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block font-mono text-xs text-ivory uppercase tracking-wider mb-2"
                    >
                      Your Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@company.com"
                      className="w-full px-4 py-3 bg-obsidian border border-obsidian-border text-ivory text-sm font-sans focus:outline-none focus:border-acid transition-colors"
                    />
                  </div>
                </div>

                {/* Company & Discipline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="company"
                      className="block font-mono text-xs text-ivory uppercase tracking-wider mb-2"
                    >
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Acme Corp / Studio"
                      className="w-full px-4 py-3 bg-obsidian border border-obsidian-border text-ivory text-sm font-sans focus:outline-none focus:border-acid transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="projectType"
                      className="block font-mono text-xs text-ivory uppercase tracking-wider mb-2"
                    >
                      Project Discipline
                    </label>
                    <select
                      id="projectType"
                      value={formData.projectType}
                      onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      className="w-full px-4 py-3 bg-obsidian border border-obsidian-border text-ivory text-sm font-sans focus:outline-none focus:border-acid transition-colors"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="AI & Intelligent Systems">AI & Intelligent Systems</option>
                      <option value="Backend & Cloud Engineering">Backend & Cloud Engineering</option>
                      <option value="Creative Development">Creative Development</option>
                      <option value="Automation & Integrations">Automation & Integrations</option>
                      <option value="Product Engineering">Product Engineering</option>
                    </select>
                  </div>
                </div>

                {/* Package & Timeline Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="packageModel"
                      className="block font-mono text-xs text-ivory uppercase tracking-wider mb-2"
                    >
                      Engagement Package *
                    </label>
                    <select
                      id="packageModel"
                      value={formData.packageModel}
                      onChange={(e) => setFormData({ ...formData, packageModel: e.target.value })}
                      className="w-full px-4 py-3 bg-obsidian border border-obsidian-border text-ivory text-sm font-sans focus:outline-none focus:border-acid transition-colors cursor-pointer"
                    >
                      {ENGAGEMENT_PACKAGES.map((pkg) => (
                        <option key={pkg.value} value={pkg.value}>
                          {pkg.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="timeline"
                      className="block font-mono text-xs text-ivory uppercase tracking-wider mb-2"
                    >
                      Target Timeline *
                    </label>
                    <select
                      id="timeline"
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      className="w-full px-4 py-3 bg-obsidian border border-obsidian-border text-ivory text-sm font-sans focus:outline-none focus:border-acid transition-colors cursor-pointer"
                      aria-label="Target Timeline"
                    >
                      <option value="2 to 4 Weeks">2 to 4 Weeks (Fast-track)</option>
                      <option value="4 to 8 Weeks">4 to 8 Weeks (Standard)</option>
                      <option value="8 to 12 Weeks">8 to 12 Weeks (Comprehensive)</option>
                      <option value="Ongoing / Retainer">Ongoing Sprint Retainer</option>
                    </select>
                  </div>
                </div>

                {/* Project Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block font-mono text-xs text-ivory uppercase tracking-wider mb-2"
                  >
                    Project Brief &amp; Goals *
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your technical requirements, goals, existing stack, and any reference material..."
                    className="w-full px-4 py-3 bg-obsidian border border-obsidian-border text-ivory text-sm font-sans focus:outline-none focus:border-acid transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  withArrow
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-obsidian" />
                      <span>VALIDATING INQUIRY...</span>
                    </span>
                  ) : (
                    <span>TRANSMIT PROJECT BRIEF</span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* On-Demand Calendly Modal */}
      <CalendlyModal
        isOpen={isCalendlyOpen}
        onClose={() => setIsCalendlyOpen(false)}
        triggerRef={scheduleTriggerRef}
      />
    </div>
  );
}

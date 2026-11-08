"use client";

import React, { useState } from "react";
import { SITE_CONFIG } from "@/lib/constants";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import {
  Mail,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  AlertCircle,
  Loader2,
  SendHorizontal,
  ExternalLink,
} from "lucide-react";

type SubmissionState =
  | { status: "idle" }
  | { status: "delivered"; message: string }
  | {
      status: "fallback_recorded";
      message: string;
      mailtoUrl: string;
      fallbackEmail: string;
    };

const BUDGET_OPTIONS = {
  USD: [
    { value: "Under $10k", label: "Under $10,000 (Launch / Scoped Prototype)" },
    { value: "$10k–$25k", label: "$10,000 – $25,000 (Production Application / MVP)" },
    { value: "$25k–$50k", label: "$25,000 – $50,000 (Full-Scale Platform / Custom AI)" },
    { value: "$50k+", label: "$50,000+ (Enterprise Architecture)" },
    { value: "To Be Scoped", label: "To Be Scoped in Discovery" },
  ],
  INR: [
    { value: "Under ₹8L", label: "Under ₹8,00,000 (Launch / Scoped Prototype)" },
    { value: "₹8L–₹20L", label: "₹8,00,000 – ₹20,00,000 (Production Application / MVP)" },
    { value: "₹20L–₹40L", label: "₹20,00,000 – ₹40,00,000 (Full-Scale Platform / Custom AI)" },
    { value: "₹40L+", label: "₹40,00,000+ (Enterprise Architecture)" },
    { value: "To Be Scoped", label: "To Be Scoped in Discovery" },
  ],
};

export default function ContactPage() {
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "Web Development",
    budgetRange: "Under $10k",
    timeline: "2 to 4 Weeks",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionState>({ status: "idle" });

  const handleCurrencyChange = (newCurrency: "USD" | "INR") => {
    setCurrency(newCurrency);
    // Reset to the first budget option for the new currency
    setFormData((prev) => ({
      ...prev,
      budgetRange: BUDGET_OPTIONS[newCurrency][0].value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          currency,
        }),
      });

      const data = await res.json();

      if (res.status === 503) {
        // Truth in engineering: server logged inquiry, but automated SMTP/Resend is not yet verified
        setSubmissionResult({
          status: "fallback_recorded",
          message: data.error,
          mailtoUrl: data.mailtoUrl,
          fallbackEmail: data.fallbackEmail || SITE_CONFIG.email,
        });
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit project inquiry.");
      }

      setSubmissionResult({
        status: "delivered",
        message: data.message || "Your inquiry has been successfully delivered to the studio.",
      });
    } catch (err: any) {
      setErrorMessage(
        err.message || "An unexpected network error occurred. Please contact us directly via email."
      );
    } finally {
      setIsSubmitting(false);
    }
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
                href={`mailto:${SITE_CONFIG.email}?subject=Discovery%20Call%20Request%20—%20OFFSCRIPT`}
                variant="outline"
                size="md"
                withArrow
                className="w-full"
              >
                REQUEST CONSULTATION
              </Button>
            </div>
            <p className="font-mono text-[10px] text-ivory-dim text-center">
              Direct scheduling via email while automated calendar integration is provisioned.
            </p>
          </div>
        </div>

        {/* Right Column: Full-Stack Project Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-12 border border-obsidian-border bg-obsidian-surface">
            {/* Condition 1: Direct Transactional Delivery Success */}
            {submissionResult.status === "delivered" && (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 bg-acid/10 border border-acid text-acid flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-ivory">
                  Inquiry Dispatched &amp; Delivered.
                </h3>
                <p className="font-sans text-sm text-ivory-muted max-w-md mx-auto leading-relaxed font-light">
                  Thank you, <span className="text-ivory font-medium">{formData.name}</span>. Your project brief has been received. We will follow up directly from{" "}
                  <span className="text-acid font-mono">{SITE_CONFIG.email}</span>.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmissionResult({ status: "idle" });
                      setFormData({
                        name: "",
                        email: "",
                        company: "",
                        projectType: "Web Development",
                        budgetRange: BUDGET_OPTIONS[currency][0].value,
                        timeline: "2 to 4 Weeks",
                        description: "",
                      });
                    }}
                    className="font-mono text-xs text-acid hover:underline cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            )}

            {/* Condition 2: Server Fallback Logged (Honest Technical State) */}
            {submissionResult.status === "fallback_recorded" && (
              <div className="py-6 space-y-6">
                <div className="p-5 bg-acid/5 border border-acid/40 space-y-3">
                  <div className="flex items-center gap-2 text-acid font-mono text-xs font-semibold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Inquiry Preserved on Studio Server</span>
                  </div>
                  <p className="font-sans text-xs text-ivory-muted leading-relaxed">
                    Your brief has been validated and stored in our server intake queue. However, because automated external email dispatch awaits sending-domain verification, please also send your pre-formatted brief via email to ensure zero-friction direct delivery:
                  </p>
                  <div className="pt-2">
                    <a
                      href={submissionResult.mailtoUrl}
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
                    Logged Brief Summary
                  </div>
                  <div><span className="text-ivory-dim">Name:</span> <span className="text-ivory">{formData.name}</span></div>
                  <div><span className="text-ivory-dim">Email:</span> <span className="text-ivory">{formData.email}</span></div>
                  <div><span className="text-ivory-dim">Discipline:</span> <span className="text-ivory">{formData.projectType}</span></div>
                  <div><span className="text-ivory-dim">Budget:</span> <span className="text-acid">{currency} {formData.budgetRange}</span></div>
                  <div><span className="text-ivory-dim">Timeline:</span> <span className="text-ivory">{formData.timeline}</span></div>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmissionResult({ status: "idle" });
                    }}
                    className="font-mono text-xs text-ivory-dim hover:text-acid hover:underline cursor-pointer"
                  >
                    ← Edit or Submit Another Brief
                  </button>
                </div>
              </div>
            )}

            {/* Condition 3: Default Active Form */}
            {submissionResult.status === "idle" && (
              <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* Currency & Budget Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="budgetRange"
                      className="block font-mono text-xs text-ivory uppercase tracking-wider"
                    >
                      Budget Framework
                    </label>
                    {/* Explicit Currency Toggle */}
                    <div className="flex items-center gap-1 bg-obsidian border border-obsidian-border p-0.5">
                      <button
                        type="button"
                        onClick={() => handleCurrencyChange("USD")}
                        className={`px-2.5 py-1 font-mono text-xs transition-colors cursor-pointer ${
                          currency === "USD"
                            ? "bg-acid text-obsidian font-bold"
                            : "text-ivory-dim hover:text-ivory"
                        }`}
                      >
                        USD ($)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCurrencyChange("INR")}
                        className={`px-2.5 py-1 font-mono text-xs transition-colors cursor-pointer ${
                          currency === "INR"
                            ? "bg-acid text-obsidian font-bold"
                            : "text-ivory-dim hover:text-ivory"
                        }`}
                      >
                        INR (₹)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <select
                        id="budgetRange"
                        value={formData.budgetRange}
                        onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                        className="w-full px-4 py-3 bg-obsidian border border-obsidian-border text-ivory text-sm font-sans focus:outline-none focus:border-acid transition-colors"
                      >
                        {BUDGET_OPTIONS[currency].map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        id="timeline"
                        value={formData.timeline}
                        onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                        className="w-full px-4 py-3 bg-obsidian border border-obsidian-border text-ivory text-sm font-sans focus:outline-none focus:border-acid transition-colors"
                        aria-label="Target Timeline"
                      >
                        <option value="2 to 4 Weeks">2 to 4 Weeks (Fast-track)</option>
                        <option value="4 to 8 Weeks">4 to 8 Weeks (Standard)</option>
                        <option value="8 to 12 Weeks">8 to 12 Weeks (Comprehensive)</option>
                        <option value="Ongoing / Retainer">Ongoing Sprint Retainer</option>
                      </select>
                    </div>
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
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { SITE_CONFIG } from "@/lib/constants";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
import { Mail, Calendar, CheckCircle2, ArrowUpRight } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    serviceType: "Web Development",
    timeline: "2–4 Weeks",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Front-end capture for Phase 0; server-side delivery hooked in Phase 4
    setSubmitted(true);
  };

  return (
    <div className="w-full py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        index="// CONTACT & INQUIRIES"
        badge="DIRECT ACCESS"
        title="START A PROJECT."
        subtitle="Tell us what you're imagining. We'll help turn it into something tangible."
        description="Whether you require an unignorable digital flagship, an autonomous AI pipeline, or full-stack product engineering, we respond within 24 business hours."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12 items-start">
        {/* Left Column: Direct Info & Booking Link */}
        <div className="lg:col-span-5 space-y-8">
          <div className="p-8 border border-obsidian-border bg-obsidian-surface space-y-6">
            <span className="font-mono text-xs uppercase tracking-widest text-acid block">
              // Direct Inquiries
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
                <span>IST (UTC +5:30)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ivory-dim">RESPONSE TIME</span>
                <span className="text-acid">&lt; 24 Business Hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ivory-dim">CURRENT STATUS</span>
                <span className="text-acid">OPEN FOR Q2/Q3 2026</span>
              </div>
            </div>
          </div>

          {/* Discovery Call Card */}
          <div id="schedule" className="p-8 border border-obsidian-border bg-obsidian space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs text-acid uppercase tracking-widest">
              <Calendar className="w-4 h-4" />
              <span>Schedule A Call</span>
            </div>
            <h3 className="font-display text-xl font-bold text-ivory">
              Need to brainstorm or align on scope?
            </h3>
            <p className="font-sans text-sm text-ivory-muted leading-relaxed font-light">
              We host 30-minute discovery calls to evaluate technical architecture, timeline feasibilities, and scope alignment.
            </p>
            <div className="pt-2">
              <Button
                href={`mailto:${SITE_CONFIG.email}?subject=Discovery%20Call%20Request%20—%20OFFSCRIPT`}
                variant="outline"
                size="md"
                withArrow
                className="w-full"
              >
                REQUEST DISCOVERY CALL
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Project Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="p-8 sm:p-12 border border-obsidian-border bg-obsidian-surface">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 bg-acid/10 border border-acid text-acid flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-2xl font-bold text-ivory">
                  Inquiry Transmitted.
                </h3>
                <p className="font-sans text-sm text-ivory-muted max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. We have received your project details and will reply from{" "}
                  <span className="text-acid font-mono">{SITE_CONFIG.email}</span> within 24 business hours.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="font-mono text-xs text-acid hover:underline"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="pb-4 border-b border-obsidian-border font-mono text-xs text-ivory-dim flex justify-between items-center">
                  <span>INQUIRY FORM // INITIAL BRIEF</span>
                  <span className="text-acid">* REQUIRED FIELDS</span>
                </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="serviceType"
                      className="block font-mono text-xs text-ivory uppercase tracking-wider mb-2"
                    >
                      Discipline Focus
                    </label>
                    <select
                      id="serviceType"
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
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

                  <div>
                    <label
                      htmlFor="timeline"
                      className="block font-mono text-xs text-ivory uppercase tracking-wider mb-2"
                    >
                      Target Timeline
                    </label>
                    <select
                      id="timeline"
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      className="w-full px-4 py-3 bg-obsidian border border-obsidian-border text-ivory text-sm font-sans focus:outline-none focus:border-acid transition-colors"
                    >
                      <option value="2–4 Weeks">2–4 Weeks (Fast-track)</option>
                      <option value="4–8 Weeks">4–8 Weeks (Standard)</option>
                      <option value="2–3 Months">2–3 Months (Comprehensive)</option>
                      <option value="Flexible">Flexible / Ongoing</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block font-mono text-xs text-ivory uppercase tracking-wider mb-2"
                  >
                    Project Brief & Goals *
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your technical requirements, goals, and any reference material..."
                    className="w-full px-4 py-3 bg-obsidian border border-obsidian-border text-ivory text-sm font-sans focus:outline-none focus:border-acid transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  withArrow
                  className="w-full"
                >
                  TRANSMIT PROJECT BRIEF
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

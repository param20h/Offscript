import type { Metadata } from "next";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import { SITE_CONFIG } from "@/lib/constants";
import { ArrowLeft, Shield, Lock, Server, Mail, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How OFFSCRIPT Studio collects, processes, and protects project inquiries, contact data, and technical specifications.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="w-full py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Navigation */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-ivory-dim hover:text-acid transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>RETURN TO STUDIO</span>
        </Link>
      </div>

      <SectionHeader
        badge="LEGAL & DATA GOVERNANCE"
        title="PRIVACY POLICY."
        subtitle="Transparent data handling, strict storage boundaries, and engineering integrity."
        description="This policy outlines how OFFSCRIPT Studio collects, processes, and safeguards information submitted through our digital flagship and client intake pipelines."
      />

      {/* Policy Effective Banner */}
      <div className="mt-8 p-4 bg-obsidian-surface border border-obsidian-border font-mono text-xs text-ivory-dim flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-acid inline-block" />
          <span>EFFECTIVE DATE: NOVEMBER 2026</span>
        </div>
        <div>
          <span>ENTITY: OFFSCRIPT STUDIO (INDEPENDENT DIGITAL ENGINEERING)</span>
        </div>
      </div>

      {/* Main Content Articles */}
      <div className="mt-12 space-y-12 font-sans text-sm sm:text-base text-ivory-muted leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">01.</span>
            <span>Information We Collect</span>
          </h2>
          <p>
            When you initiate a project inquiry or request a discovery consultation with OFFSCRIPT Studio, we collect only the information necessary to evaluate your engineering requirements and communicate with you:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-light">
            <li>
              <strong className="text-ivory font-medium">Contact Details:</strong> Your full name, work email address, and optional company or organization name.
            </li>
            <li>
              <strong className="text-ivory font-medium">Project Specifications:</strong> Selected engineering discipline (Web Development, AI Systems, Platform Engineering, etc.), budget framework, target delivery timeline, and technical project brief.
            </li>
            <li>
              <strong className="text-ivory font-medium">Scheduling Telemetry:</strong> Preferred dates, meeting objectives, and appointment metadata if scheduling a discovery consultation.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">02.</span>
            <span>Purpose &amp; Use of Information</span>
          </h2>
          <p>
            We process client inquiry data strictly for legitimate business and engineering purposes:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-light">
            <li>Assessing architectural feasibility and timeline viability for prospective software projects.</li>
            <li>Formulating tailored technical proposals, statements of work (SOW), and scope estimates.</li>
            <li>Direct correspondence from our engineering team via our official email (<span className="font-mono text-acid">{SITE_CONFIG.email}</span>).</li>
            <li>Coordinating and conducting 30-minute discovery calls.</li>
          </ul>
          <p className="text-ivory font-medium">
            We do not sell, rent, monetize, or disclose your contact details or project briefs to third-party data brokers or marketing affiliates.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">03.</span>
            <span>Infrastructure &amp; Storage Architecture</span>
          </h2>
          <p>
            We treat incoming briefs as confidential technical documents. Our intake pipeline implements defense-in-depth storage controls:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-5 border border-obsidian-border bg-obsidian-surface space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-acid">
                <Database className="w-4 h-4" />
                <span className="uppercase">Database Storage</span>
              </div>
              <p className="font-sans text-xs text-ivory-dim leading-relaxed">
                Inquiries are persisted in a managed PostgreSQL database powered by Supabase. Row Level Security (RLS) is strictly enabled with zero public access. All writes execute through private server-only route handlers using cryptographic service-role tokens.
              </p>
            </div>

            <div className="p-5 border border-obsidian-border bg-obsidian-surface space-y-2">
              <div className="flex items-center gap-2 font-mono text-xs text-acid">
                <Mail className="w-4 h-4" />
                <span className="uppercase">Notification Dispatch</span>
              </div>
              <p className="font-sans text-xs text-ivory-dim leading-relaxed">
                Internal team notifications are dispatched via Resend transactional email directly to our studio inbox. All user-supplied strings are sanitized against HTML injection prior to email transmission.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">04.</span>
            <span>Spam Protection &amp; Automated Telemetry</span>
          </h2>
          <p>
            To protect our serverless infrastructure against automated denial-of-service and bot spam, we implement privacy-preserving abuse defenses:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-light">
            <li>
              <strong className="text-ivory font-medium">Honeypot Traps:</strong> We inject visually concealed honeypot fields inaccessible to human visitors. Automated bots that fill these fields are rejected immediately.
            </li>
            <li>
              <strong className="text-ivory font-medium">Interaction Timing Heuristics:</strong> Submissions completing in under 3.0 seconds are flagged as non-human script traffic.
            </li>
            <li>
              <strong className="text-ivory font-medium">Hashed Rate Limiting:</strong> Inbound requests are rate-limited to 3 submissions per 15 minutes. To respect user privacy, IP addresses are immediately hashed using one-way SHA-256 cryptographic algorithms. Raw IP addresses are never recorded in our database.
            </li>
            <li>
              <strong className="text-ivory font-medium">Server Infrastructure Logs:</strong> Vercel edge networks record standard ephemeral HTTP request logs (browser user-agent, request status, latency) for diagnostic and security purposes.
            </li>
          </ul>
        </section>

        {/* Section 5: Analytics & Privacy-Preserving Telemetry */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">05.</span>
            <span>Analytics, Cookieless Telemetry &amp; Conversion Measurement</span>
          </h2>
          <p>
            To understand visitor engagement and measure inquiry conversion without compromising user privacy, OFFSCRIPT Studio integrates privacy-preserving, first-party telemetry powered by Vercel Analytics:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-light">
            <li>
              <strong className="text-ivory font-medium">Strictly Cookieless:</strong> Vercel Analytics operates without persistent tracking cookies, local storage tracking identifiers, or cross-site fingerprinting. Visitors are not identified or tracked across distinct websites or devices.
            </li>
            <li>
              <strong className="text-ivory font-medium">Conversion Events Tracked:</strong> We measure discrete structural interaction events: project case-study views (<code className="text-acid font-mono text-xs">project_viewed</code>), discovery call modal openings (<code className="text-acid font-mono text-xs">discovery_call_clicked</code>), direct studio email clicks (<code className="text-acid font-mono text-xs">email_contact_clicked</code>), inquiry form initialization (<code className="text-acid font-mono text-xs">contact_form_started</code>), inquiry dispatch (<code className="text-acid font-mono text-xs">contact_form_submitted</code>), persistence status (<code className="text-acid font-mono text-xs">contact_form_persisted</code>), and error states (<code className="text-acid font-mono text-xs">contact_form_failed</code>).
            </li>
            <li>
              <strong className="text-ivory font-medium">Explicit Exclusion of Personally Identifiable Information (PII):</strong> Event payloads record only high-level categorical parameters (e.g. engineering discipline, currency, error category, notification accepted). We strictly exclude personal names, email addresses, company names, budget amounts, project briefs, and raw IP addresses from all telemetry streams.
            </li>
            <li>
              <strong className="text-ivory font-medium">No Advertising Trackers:</strong> We do not deploy Google Analytics, Meta/Facebook Pixels, LinkedIn Insight Tags, Google Tag Manager, or behavioral advertising tracking networks.
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">06.</span>
            <span>Data Retention &amp; Owner Confirmation</span>
          </h2>
          <p>
            Client inquiries are retained for as long as necessary to review project feasibility, negotiate engagement scope, or satisfy contractual accounting records. If an inquiry does not materialize into an active commercial project, records may be archived or deleted periodically.
          </p>
          <div className="p-4 bg-obsidian-surface border-l-2 border-acid text-xs font-mono text-ivory-dim space-y-1">
            <div className="text-ivory font-semibold uppercase">Pending Owner Policy Confirmation:</div>
            <p>
              Formal statutory data retention windows (e.g. 12-month inquiry purge vs. multi-year tax audit retention) are subject to final studio legal review upon commercial incorporation.
            </p>
          </div>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">07.</span>
            <span>Your Rights &amp; Studio Contact</span>
          </h2>
          <p>
            You have the right to request access to the information you have submitted to us, request correction of any inaccuracies, or ask for the deletion of your inquiry record from our intake database.
          </p>
          <p>
            To exercise these rights, or if you have questions regarding our technical security practices, contact us directly:
          </p>
          <div className="p-5 border border-obsidian-border bg-obsidian font-mono text-xs space-y-2">
            <div><span className="text-ivory-dim">STUDIO CONTACT:</span> <span className="text-ivory">OFFSCRIPT Studio Data Governance</span></div>
            <div><span className="text-ivory-dim">OFFICIAL EMAIL:</span> <a href={`mailto:${SITE_CONFIG.email}`} className="text-acid underline underline-offset-4">{SITE_CONFIG.email}</a></div>
            <div><span className="text-ivory-dim">CANONICAL DOMAIN:</span> <span className="text-ivory">{SITE_CONFIG.url}</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Database(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}

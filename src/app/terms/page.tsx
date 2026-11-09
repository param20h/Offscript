import type { Metadata } from "next";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import { SITE_CONFIG } from "@/lib/constants";
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Engagement",
  description:
    "Terms governing the use of the OFFSCRIPT Studio website, initial project inquiries, and engineering consulting engagements.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/terms`,
  },
};

export default function TermsPage() {
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
        badge="COMMERCIAL FRAMEWORK"
        title="TERMS OF ENGAGEMENT."
        subtitle="Clear boundaries, precise scope definitions, and honest engineering practices."
        description="These terms govern the use of this website and establish the foundational principles governing commercial software engineering engagements with OFFSCRIPT Studio."
      />

      {/* Terms Notice Banner */}
      <div className="mt-8 p-4 bg-obsidian-surface border border-obsidian-border font-mono text-xs text-ivory-dim flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-acid inline-block" />
          <span>VERSION 1.0 &bull; LAST UPDATED: NOVEMBER 2026</span>
        </div>
        <div>
          <span>CANONICAL: {SITE_CONFIG.url}/terms</span>
        </div>
      </div>

      {/* Main Content Articles */}
      <div className="mt-12 space-y-12 font-sans text-sm sm:text-base text-ivory-muted leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">01.</span>
            <span>Website Use &amp; Information Accuracy</span>
          </h2>
          <p>
            This website is owned and operated by OFFSCRIPT Studio. All architectural diagrams, project descriptions, interactive visualizations, and technical case studies are published for informational and portfolio review purposes.
          </p>
          <p>
            While we take rigorous measures to verify technical accuracy, software case studies reflect specific point-in-time architectures and commercial constraints. The content on this website does not constitute a unilateral binding contract or unconditional guarantee of identical results for future clients.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">02.</span>
            <span>Services &amp; Project Proposals</span>
          </h2>
          <p>
            The capabilities outlined on our <Link href="/services" className="text-ivory underline hover:text-acid">Services</Link> and <Link href="/packages" className="text-ivory underline hover:text-acid">Packages</Link> pages represent standard studio disciplines (Web Platforms, Intelligent Systems, Platform Engineering, Cloud Infrastructure).
          </p>
          <p>
            Submitting an inquiry through our intake form or scheduling a 30-minute discovery consultation does not establish a formal agency-client relationship. A commercial engagement commences exclusively upon the mutual execution of a formal Master Services Agreement (MSA) or Statement of Work (SOW).
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">03.</span>
            <span>Scope, Deliverables &amp; Technical Boundaries</span>
          </h2>
          <p>
            Every software development, AI agent pipeline, or platform build is executed against a mutually agreed Statement of Work. Each SOW explicitly details:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-light">
            <li>Concrete architectural deliverables, repository handoffs, and deployment targets.</li>
            <li>Acceptance criteria, test coverage targets, and verification procedures.</li>
            <li>Explicit exclusions (e.g. ongoing cloud infrastructure fees, third-party model inference costs, domain hosting renewals).</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">04.</span>
            <span>Pricing, Fees &amp; Payment Milestones</span>
          </h2>
          <p>
            OFFSCRIPT Studio does not publish speculative or fabricated pricing. Financial terms are negotiated transparently during technical discovery and finalized in your specific contract:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-light">
            <li>Fixed-scope projects are typically structured around milestone payments (e.g., Discovery &amp; Architecture deposit, Beta implementation, Final production deployment).</li>
            <li>Sprint-based engineering retainers are billed on agreed bi-weekly or monthly cycles.</li>
            <li>Third-party subscription costs (Vercel hosting, Supabase database, Resend email, OpenAI/Anthropic/Gemini API credits) remain the direct responsibility of the client.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">05.</span>
            <span>Revisions &amp; Scope Adjustments</span>
          </h2>
          <p>
            Engineering precision requires disciplined scope control. Each project includes agreed verification cycles to confirm deliverables match acceptance criteria.
          </p>
          <p>
            Substantial architectural pivots, addition of unplanned third-party integrations, or material changes to verified specifications are handled through documented change requests (Change Orders) with adjusted timelines and fee schedules before implementation.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">06.</span>
            <span>Client Responsibilities &amp; Dependencies</span>
          </h2>
          <p>
            Timely engineering execution relies on collaborative coordination. Clients are responsible for:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-light">
            <li>Providing required brand assets, copy, API credentials, and staging environments according to agreed schedules.</li>
            <li>Designating a technical or product point of contact for sprint sign-offs and architectural alignment.</li>
            <li>Reviewing milestone deliverables within the review windows specified in the contract.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">07.</span>
            <span>Intellectual Property Rights</span>
          </h2>
          <p>
            Upon full settlement of all contractual invoices, all custom code, application architecture, proprietary database schemas, and creative assets engineered specifically for the client transfer to the client as "work made for hire" or via full IP assignment as detailed in the agreement.
          </p>
          <p>
            OFFSCRIPT Studio retains rights to pre-existing libraries, general architectural patterns, open-source utilities, and foundational boilerplate used across studio operations, granting the client a perpetual, royalty-free license to use those components within their application.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">08.</span>
            <span>Third-Party Services &amp; Platform Dependencies</span>
          </h2>
          <p>
            Modern software engineering interfaces with third-party cloud infrastructure (e.g., Supabase, Vercel, AWS, Stripe, Razorpay, LLM providers). While OFFSCRIPT builds with resilient fallback handling, we do not operate and cannot warrant the zero-downtime uptime or API availability of external third-party platforms.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">09.</span>
            <span>Limitation of Liability</span>
          </h2>
          <p>
            To the maximum extent permitted by applicable law, OFFSCRIPT Studio shall not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of profits, revenue, data, or business interruption arising from the use of this website or the deployment of custom software, beyond the amounts actually paid by the client under the governing agreement.
          </p>
        </section>

        {/* Section 10 */}
        <section className="space-y-4">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-ivory flex items-center gap-2">
            <span className="text-acid font-mono text-sm">10.</span>
            <span>Studio Inquiries &amp; Legal Notices</span>
          </h2>
          <p>
            For questions regarding these Terms of Engagement, or to request a bespoke Master Services Agreement for your organization, reach out directly:
          </p>
          <div className="p-5 border border-obsidian-border bg-obsidian font-mono text-xs space-y-2">
            <div><span className="text-ivory-dim">STUDIO COUNSEL:</span> <span className="text-ivory">OFFSCRIPT Studio Commercial Operations</span></div>
            <div><span className="text-ivory-dim">OFFICIAL EMAIL:</span> <a href={`mailto:${SITE_CONFIG.email}`} className="text-acid underline underline-offset-4">{SITE_CONFIG.email}</a></div>
            <div><span className="text-ivory-dim">CANONICAL DOMAIN:</span> <span className="text-ivory">{SITE_CONFIG.url}</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}

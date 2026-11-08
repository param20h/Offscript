# OFFSCRIPT Studio — Agent Engineering & Design Contract

## Mission
Build a premium, distinctive digital engineering agency website for OFFSCRIPT Studio. It must feel art-directed, technically excellent, and credible—not like a generic AI-generated SaaS landing page.

## Locked brand information
- Brand: OFFSCRIPT Studio
- Primary domain: https://offscript.param20h.me
- Only public contact email: offscript@param20h.me
- Positioning: Digital engineering studio offering websites, SaaS, custom software, AI agents, chatbots, RAG, automation, backend/cloud engineering, and creative development.
- Brand line: "Built different. Engineered properly."
- Brand voice: precise, confident, human, specific, understated. No empty superlatives.
- Palette: Obsidian #171717 (dominant ~60%), Warm Ivory #F0EDE5 (~30%), Acid Lime #D6FF35 (selective ~10%). These are compositional targets, not hard pixel quotas.
- Fonts: use a disciplined grotesk display face and a highly readable body face; favor Space Grotesk + Geist/Inter, with mono used sparingly.
- Logo: user will supply the final logo. Use a clean typographic OFFSCRIPT wordmark temporarily, and make logo replacement straightforward. Never generate a fake logo and call it final.

## Absolute anti-slop rules
- No default SaaS hero with gradient blobs, generic glowing orbs, fake glass cards, excessive rounded rectangles, stock team photos, emoji icons, or decorative noise.
- No generic claims ("revolutionize", "cutting-edge", "unlock the power of AI") without specifics.
- No fake client names, testimonials, awards, ratings, metrics, company logos, case-study outcomes, or fabricated screenshots.
- Never label personal/demo projects as commissioned client work.
- Every animation must communicate hierarchy, transition, or brand identity. Avoid gratuitous motion.
- Prioritize editorial typography, strong grids, deliberate whitespace, contrast, unusual but usable composition, and real product imagery.
- Do not copy another studio's website, copyrighted graphics, or trademarked visual identity.

## Preferred technology
- Next.js App Router + React + TypeScript (use versions compatible with the actual installed dependencies).
- Tailwind CSS for tokens and styling; CSS custom properties for the palette.
- Motion for component-level interactions; GSAP + ScrollTrigger only where scroll choreography warrants it.
- Three.js / React Three Fiber only for a justified, performant signature 3D experience; dynamically load and provide a lightweight fallback.
- MDX or typed local data for initial case studies; do not add a CMS or database without a concrete need.
- Next.js route handlers/server-side validation for forms; Zod for schemas.
- Calendly for scheduling, with URL configurable via environment variable.
- Resend or another transactional provider for inquiry notifications, configured with environment variables and a verified sending identity. Do not assume that mailbox hosting or sending-domain verification already exists.
- Vercel deployment.

## Information architecture
- `/` — art-directed homepage
- `/work` — filterable portfolio (only real verified projects)
- `/work/[slug]` — detailed case studies
- `/services` — capabilities and service detail sections
- `/packages` — scope-based packages, clear limitations, no fabricated prices
- `/about` — studio philosophy and honest team/about information
- `/contact` — project inquiry, Calendly scheduling, official email
- `not-found` and essential legal pages (privacy; terms if needed)

## Homepage narrative
1. Strong typographic hero with clear value proposition and two CTAs.
2. Distinctive brand motion/signature visual (not generic decoration).
3. Selected work featuring verified projects and real media.
4. Services/capabilities with concise deliverables.
5. Process: Discover → Design → Engineer → Deploy → Evolve.
6. Packages preview with links to scope details.
7. About/philosophy and honest proof of engineering skill.
8. Contact CTA with Calendly and email paths.

## Portfolio policy
Potential project candidates include ZenithFlow, Vesta AI, TriageAI, CampusIQ, and other projects provided or verified by the owner. Treat names and descriptions as unverified until supplied with evidence. Do not invent live URLs, technologies, impact numbers, images, or launch status. If assets are missing, render a clearly marked intentional placeholder or omit the project. A project is not "client work" without confirmation.

## Package policy
- Launch: business/portfolio site with clearly scoped pages and standard integrations.
- Scale: custom product website or web app with agreed integrations.
- Intelligence: scoped AI assistant/agent, RAG, or workflow system.
- Custom Engineering: bespoke SaaS, platforms, integrations, and longer engagements.
- Prices are TBD until owner approval. Use "Request a quote" or "Starting at — to be confirmed" only when clearly labeled; never invent rupee amounts.
- Timelines are estimates, not guarantees. Describe exclusions, revisions, maintenance, and third-party costs transparently.

## Interaction and motion
- Use restrained micro-interactions, polished hover/focus states, kinetic type, project media previews, and choreographed section transitions.
- Use transform/opacity animations when possible; avoid layout thrashing.
- Respect `prefers-reduced-motion` globally; all information must remain accessible without animation.
- Provide mobile/static fallback for WebGL and video; do not block the hero's text or CTA on 3D loading.
- Never hijack scrolling or trap keyboard navigation. Lenis is optional and must not degrade usability.
- Video must be optimized, muted/autoplay only where appropriate, with poster/fallback and no surprise audio.

## Engineering quality
- TypeScript strict mode. Avoid `any` and unsafe casts.
- Semantic HTML, logical headings, descriptive labels, visible focus rings, keyboard operability, WCAG AA contrast targets.
- Responsive layouts at 320px, 375px, 768px, 1024px, 1440px and wider; no horizontal overflow.
- Use Next.js image/font optimization; prefer AVIF/WebP and properly sized assets.
- Strong SEO metadata, canonical URLs, Open Graph images, sitemap, robots, and appropriate structured data. No misleading schema.
- Server-side validation and sanitization for inquiries, spam prevention/rate limiting, no exposed secrets.
- Privacy-conscious analytics; do not install trackers without purpose and disclosure.
- Environment variables in `.env.example`; never commit real API keys.
- Use reusable components and tokens, but avoid abstraction for abstraction's sake.
- Avoid introducing heavy libraries or backend services without justification.
- Target excellent Core Web Vitals and Lighthouse scores, but report measured results rather than inventing scores.

## Workflow for Antigravity
1. Inspect the existing repository before changing files. Never overwrite user work blindly.
2. State a concise plan and files expected to change.
3. Implement one phase at a time. Do not build all pages and effects in one uncontrolled pass.
4. Verify dependencies and APIs against installed versions; do not assume compatibility.
5. Run lint, typecheck, build, and relevant tests after meaningful changes; report actual results and unresolved errors.
6. Review desktop/mobile layouts, reduced motion, keyboard navigation, and loading states.
7. Summarize changes, files touched, tests run, and next steps. No false "production-ready" claims.
8. Ask the owner when missing information materially affects truthfulness, pricing, booking URL, legal text, logo, or portfolio claims.

## Phase gates
- Phase 0: repository audit, creative direction, sitemap, tokens, asset inventory.
- Phase 1: project scaffold, global layout, typography, navigation, footer, responsive system.
- Phase 2: exceptional homepage with genuine content and purposeful motion.
- Phase 3: portfolio, verified case studies, services, packages, about.
- Phase 4: contact form, verified email delivery, Calendly, spam/security measures.
- Phase 5: signature 3D/motion, video optimization, mobile/reduced-motion fallback.
- Phase 6: accessibility, SEO, performance audits, tests, deployment readiness.

## Definition of done
A phase is complete only when the implemented behavior is functional, responsive, accessible, visually coherent, and tested. A screenshot-like mockup is not a functional website. Do not claim domain, email, or Calendly integrations work until actually verified.

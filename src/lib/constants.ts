export const SITE_CONFIG = {
  name: "OFFSCRIPT Studio",
  legalName: "OFFSCRIPT Studio",
  tagline: "Built different. Engineered properly.",
  statement:
    "We design, engineer and launch digital products, intelligent systems and experiences built to make an impact.",
  headline: {
    line1: "WE MAKE",
    line2: "THE DIGITAL",
    line3: "UNEXPECTED.",
  },
  editorialQuote:
    "Technology should do more than function. It should challenge expectations, solve meaningful problems and create experiences worth remembering.",
  email: "offscript@param20h.me",
  url: "https://offscript.param20h.me",
  positioning: "Independent Digital Engineering Studio",
  year: 2026,
} as const;

export const NAV_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Studio", href: "/about" },
  { label: "Packages", href: "/packages" },
] as const;

export const FOOTER_LINKS = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Studio", href: "/about" },
  { label: "Packages", href: "/packages" },
  { label: "Contact", href: "/contact" },
] as const;

export const PROCESS_STEPS = [
  {
    step: "01",
    title: "Discover",
    subtitle: "Architecture & Problem Framing",
    description:
      "We interrogate the technical constraints, core workflow bottlenecks, and high-leverage opportunities before writing code.",
    deliverables: ["Technical Scope", "System Blueprint", "UX Architecture"],
  },
  {
    step: "02",
    title: "Design",
    subtitle: "Art Direction & Interaction Systems",
    description:
      "We craft high-contrast editorial design systems, motion choreography, and component states designed specifically for your brand.",
    deliverables: ["Visual Identity", "Interactive Prototypes", "Design System"],
  },
  {
    step: "03",
    title: "Engineer",
    subtitle: "Production-Grade Implementation",
    description:
      "We build with strict TypeScript, resilient serverless and container backends, optimized web runtimes, and tested AI agent pipelines.",
    deliverables: ["Full-Stack App", "API Integrations", "Optimized Core Web Vitals"],
  },
  {
    step: "04",
    title: "Deploy",
    subtitle: "Hardening & Zero-Downtime Launch",
    description:
      "Automated CI/CD pipelines, edge caching, observability, and rigorous lighthouse and accessibility verification prior to public release.",
    deliverables: ["Production Infrastructure", "Automated Tests", "Telemetry"],
  },
  {
    step: "05",
    title: "Evolve",
    subtitle: "Intelligent Scaling & Refinement",
    description:
      "Continuous optimization through real-world usage telemetry, latency benchmarking, and iterative model tuning as product usage expands.",
    deliverables: ["Performance Audits", "Feature Iterations", "Reliability Retros"],
  },
] as const;

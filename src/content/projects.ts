export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  tagline: string;
  description: string;
  architectureSummary: string;
  technologies: string[];
  status: string;
  accentColor: string;
  metricsLabel?: string;
  links?: {
    demo?: string;
    github?: string;
  };
}

export const PROJECTS: Project[] = [
  {
    slug: "myco-pr-intelligence",
    title: "Myco PR Intelligence",
    subtitle: "Cross-Repository Software Quality Intelligence",
    category: "Developer Tooling / Static Analysis",
    tagline: "Detecting breaking API contracts across organizational codebases before merge.",
    description:
      "A software quality intelligence platform that analyzes how a single pull request affects an entire engineering ecosystem. Combines Tree-sitter AST parsing, cross-repository dependency graphs, validation evidence, and deterministic risk scoring.",
    architectureSummary:
      "Tree-sitter AST parser, multi-repo provider/consumer graph, FastAPI service, interactive Next.js risk visualization matrix.",
    technologies: ["Tree-sitter AST", "FastAPI", "Python", "Next.js", "GitHub API", "Docker"],
    status: "Verified Prototype",
    accentColor: "#D6FF35",
  },
  {
    slug: "zenithflow",
    title: "ZenithFlow",
    subtitle: "Intelligent Productivity OS",
    category: "Intelligent Systems / Web Application",
    tagline: "Contextual task orchestration and multi-modal workspace intelligence.",
    description:
      "An adaptive workspace OS designed to eliminate context fragmentation. Unifies asynchronous task planning, contextual documentation, and continuous workflow indexing into a single keyboard-first command interface.",
    architectureSummary:
      "Keyboard-first command engine, local-first reactive state store, asynchronous background summarizers, low-latency client transitions.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Motion", "State Architecture"],
    status: "Active System",
    accentColor: "#F0EDE5",
  },
  {
    slug: "vesta-ai",
    title: "Vesta AI",
    subtitle: "Investment Research Agent",
    category: "Financial AI / Multi-Agent Systems",
    tagline: "Autonomous synthesis of SEC filings and earnings call transcripts.",
    description:
      "An autonomous research agent designed to parse structured and unstructured financial disclosures. Synthesizes 10-K/10-Q filings, transcripts, and financial balance sheets into traceable, citation-backed analytical briefs.",
    architectureSummary:
      "Multi-agent extraction graph, semantic vector indexing, citation verification pipeline, deterministic tabular parsing.",
    technologies: ["Python", "FastAPI", "LangChain", "Vector RAG", "Next.js", "TypeScript"],
    status: "Engineering Prototype",
    accentColor: "#D6FF35",
  },
  {
    slug: "campusiq",
    title: "CampusIQ",
    subtitle: "Smart Campus Platform",
    category: "Platform Engineering / Realtime Web",
    tagline: "Unified administrative workflows and real-time student operations.",
    description:
      "Scalable digital infrastructure engineered to coordinate academic operations, classroom scheduling, departmental notifications, and student verification across collegiate organizations.",
    architectureSummary:
      "Role-based access matrix, event-driven notification broker, WebSocket telemetry, high-throughput document management.",
    technologies: ["React", "Node.js", "MongoDB", "WebSockets", "Tailwind CSS"],
    status: "Architectural Platform",
    accentColor: "#F0EDE5",
  },
  {
    slug: "triage-ai",
    title: "TriageAI",
    subtitle: "Support Ticket Intelligence",
    category: "Machine Intelligence / Operations",
    tagline: "Semantic triage and deterministic escalation for technical incident queues.",
    description:
      "Automated issue classification and triage engine. Evaluates incoming support and incident tickets through zero-shot classification, context extraction, and automated routing to domain engineering groups.",
    architectureSummary:
      "Dual-tier classifier (embedding similarity + LLM extraction), routing heuristic engine, audit-trail logging.",
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "LLM Pipelines", "Tailwind CSS"],
    status: "Functional System",
    accentColor: "#D6FF35",
  },
];

export interface RelevantProjectRef {
  title: string;
  slug: string;
  category: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  capabilities: string[];
  deliverables: string[];
  techFocus: string[];
  typicalScope: string;
  deliveryTimeline: string;
  relevantProjects: RelevantProjectRef[];
}

export const SERVICES: ServiceItem[] = [
  {
    id: "web-development",
    number: "01",
    title: "Web Development",
    tagline: "High-performance digital flagships, web apps, and design systems.",
    description:
      "We engineer modern web applications and flagship brand platforms with strict semantic standards, sub-second Core Web Vitals, and resilient reactive architectures. Every build combines editorial art direction with production-grade TypeScript.",
    capabilities: [
      "Next.js App Router Architecture & Turbopack",
      "Design Systems & Token Architectures",
      "Progressive Web Apps & Local-First Stores",
      "Accessibility & WCAG AA Compliance",
      "Edge-Rendered & Server-Component Optimization",
    ],
    deliverables: [
      "Production-Grade Web Application Codebase",
      "Reusable Component & Token System",
      "100% Core Web Vitals & Lighthouse Guarantee",
      "Automated CI/CD Deployment Pipeline",
    ],
    techFocus: ["Next.js", "TypeScript", "Tailwind CSS", "React", "Node.js", "Vercel"],
    typicalScope:
      "Full digital redesigns, bespoke agency/brand flagships, enterprise marketing sites, and high-conversion SaaS web applications.",
    deliveryTimeline: "2 to 6 weeks depending on architectural complexity",
    relevantProjects: [
      { title: "ZenithFlow", slug: "zenithflow", category: "Web Application" },
      { title: "CampusIQ", slug: "campusiq", category: "Full-Stack Web Platform" },
    ],
  },
  {
    id: "ai-intelligent-systems",
    number: "02",
    title: "AI & Intelligent Systems",
    tagline: "Autonomous agents, verified RAG pipelines, and operational intelligence.",
    description:
      "Beyond superficial API wrappers: we engineer robust multi-agent orchestration, verifiable retrieval-augmented generation (RAG) with ground-truth citations, and deterministic domain classifiers that solve high-friction operational workflows.",
    capabilities: [
      "Multi-Agent Workflow Pipelines (LangGraph / State Graphs)",
      "Vector Search & Hierarchical Document RAG",
      "Citation Verification & Hallucination Elimination",
      "Deterministic Guardrails & Evaluation Harnesses",
      "Autonomous Tool-Calling & Structured Extraction",
    ],
    deliverables: [
      "Custom Multi-Agent Orchestration Engine",
      "Vector Embedding & Indexing Pipeline",
      "Deterministic Evaluation & Test Harness",
      "Operational Telemetry & LLM Observability",
    ],
    techFocus: ["Python", "FastAPI", "LangChain / LangGraph", "pgvector", "OpenAI / Claude API"],
    typicalScope:
      "Autonomous research agents, intelligent document analyzers, automated support triage engines, and proprietary internal knowledge copilots.",
    deliveryTimeline: "3 to 8 weeks",
    relevantProjects: [
      { title: "Vesta AI", slug: "vesta-ai", category: "Multi-Agent Financial Research" },
      { title: "TriageAI", slug: "triage-ai", category: "Semantic Incident Classification" },
    ],
  },
  {
    id: "backend-cloud-engineering",
    number: "03",
    title: "Backend & Cloud Engineering",
    tagline: "Fault-tolerant APIs, distributed microservices, and resilient infra.",
    description:
      "High-throughput data layers, asynchronous worker queues, containerized environments, and cloud infrastructure engineered for zero-downtime reliability and enterprise concurrency.",
    capabilities: [
      "RESTful & Event-Driven API Architectures",
      "PostgreSQL & Document Database Schema Design",
      "Asynchronous Background Queues & Webhook Ingestion",
      "Docker Containerization & Multi-Stage Builds",
      "Serverless Edge Computing & Global Caching",
    ],
    deliverables: [
      "Scalable REST/WebSocket Backend Service",
      "Optimized Database Schema & Migration Suite",
      "Automated CI/CD & Testing Matrix",
      "System Telemetry & Health Monitoring",
    ],
    techFocus: ["FastAPI", "Node.js", "PostgreSQL", "Redis", "Docker", "AWS / Vercel"],
    typicalScope:
      "High-traffic backend services, payment and subscription infrastructure, webhook ingestion middleware, and distributed microservices.",
    deliveryTimeline: "4 to 8 weeks",
    relevantProjects: [
      { title: "CampusIQ", slug: "campusiq", category: "High-Throughput Concurrent Engine" },
      { title: "Myco PR Intelligence", slug: "myco-pr-intelligence", category: "FastAPI Static Analysis Service" },
    ],
  },
  {
    id: "creative-development",
    number: "04",
    title: "Creative Development",
    tagline: "Choreographed motion, WebGL experiences, and editorial typography.",
    description:
      "Digital experiences that command attention. We integrate smooth motion dynamics, WebGL shader interactions, and tactile micro-interactions without sacrificing accessibility or mobile performance.",
    capabilities: [
      "Three.js & WebGL Realtime Visuals",
      "GSAP & ScrollTrigger Choreography",
      "Motion for React Interactive Micro-Interactions",
      "Procedural Geometry & Custom Shaders",
      "Full Reduced-Motion Graceful Degradation",
    ],
    deliverables: [
      "Interactive 3D / WebGL Visual Assets",
      "Choreographed Scroll & Entrance Sequences",
      "Mobile-Optimized & Accessible Fallbacks",
      "Performant Canvas Rendering Pipeline",
    ],
    techFocus: ["Three.js", "Motion for React", "GSAP", "GLSL Shaders", "Canvas API"],
    typicalScope:
      "Signature interactive visualizers, art-directed launch experiences, interactive product showcases, and kinetic typographic websites.",
    deliveryTimeline: "2 to 5 weeks",
    relevantProjects: [
      { title: "OFFSCRIPT Studio Engine", slug: "zenithflow", category: "Signature WebGL & Motion" },
    ],
  },
  {
    id: "automation-integrations",
    number: "05",
    title: "Automation & Integrations",
    tagline: "Connecting disconnected systems into continuous operational pipelines.",
    description:
      "We eliminate manual operational friction by bridging SaaS tools, bespoke APIs, enterprise webhooks, and asynchronous batch workers into unified, error-resilient automations.",
    capabilities: [
      "Custom Webhook Ingestion & Event Middleware",
      "Third-Party SaaS Orchestration (CRM, Stripe, GitHub)",
      "Scheduled Data Aggregation & Automated ETL",
      "Resilient Retry Logic & Dead-Letter Queues",
      "Security Hardening & Token Rotation Standards",
    ],
    deliverables: [
      "Integration Middleware Service",
      "Webhook Ingestion & Validation Engine",
      "Error Logging & Alerting Infrastructure",
      "End-to-End Test Suite for Third-Party APIs",
    ],
    techFocus: ["TypeScript", "Python", "Stripe API", "GitHub API", "REST / GraphQL", "Webhooks"],
    typicalScope:
      "Automating code quality checks, multi-app synchronization, financial data aggregation, and CRM/ERP integrations.",
    deliveryTimeline: "2 to 4 weeks",
    relevantProjects: [
      { title: "Myco PR Intelligence", slug: "myco-pr-intelligence", category: "GitHub Webhook & AST Engine" },
      { title: "TriageAI", slug: "triage-ai", category: "Incident Queue Automated Routing" },
    ],
  },
  {
    id: "product-engineering",
    number: "06",
    title: "Product Engineering",
    tagline: "End-to-end product realization from architecture to production launch.",
    description:
      "We partner directly with founders and technical leaders to take ambitious product concepts from architectural discovery through rapid prototyping, MVP development, and enterprise hardening.",
    capabilities: [
      "Full-Stack Product Architecture & Technical Roadmapping",
      "Rapid Prototype to Production Refactoring",
      "State Management & Offline Capability Planning",
      "Telemetry, Analytics & Error Tracking Instrumentation",
      "Code Auditing & Technical Due Diligence",
    ],
    deliverables: [
      "End-to-End Production MVP or Platform",
      "Architectural Documentation & System Blueprint",
      "Knowledge Transfer & Engineering Handover",
      "Comprehensive Automated Test Coverage",
    ],
    techFocus: ["Full-Stack TypeScript", "Next.js", "PostgreSQL", "System Architecture", "Cloud Runtimes"],
    typicalScope:
      "Founding technical partnership for pre-seed/seed startups, new product spin-outs, or comprehensive legacy platform modernizations.",
    deliveryTimeline: "6 to 12 weeks",
    relevantProjects: [
      { title: "ZenithFlow", slug: "zenithflow", category: "End-to-End Workspace OS" },
      { title: "CampusIQ", slug: "campusiq", category: "Enterprise Academic Operations Platform" },
    ],
  },
];

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  capabilities: string[];
  deliverables: string[];
  techFocus: string[];
}

export const SERVICES: ServiceItem[] = [
  {
    id: "web-development",
    number: "01",
    title: "Web Development",
    tagline: "High-performance digital flagships, web apps, and design systems.",
    description:
      "We build modern web applications and flagship brand platforms with strict semantic standards, sub-second Core Web Vitals, and resilient reactive architectures.",
    capabilities: [
      "Next.js App Router Architecture",
      "Design Systems & Token Systems",
      "Progressive Web Apps",
      "Accessibility & WCAG AA Standards",
      "Edge-Rendered Interfaces",
    ],
    deliverables: ["Production Web Application", "Component Library", "Performance Guarantee"],
    techFocus: ["Next.js", "TypeScript", "Tailwind CSS", "React", "Node.js"],
  },
  {
    id: "ai-intelligent-systems",
    number: "02",
    title: "AI & Intelligent Systems",
    tagline: "Autonomous agents, verified RAG pipelines, and operational intelligence.",
    description:
      "Beyond decorative wrappers: we engineer robust multi-agent orchestration, verifiable retrieval-augmented generation (RAG), and deterministic domain classifiers.",
    capabilities: [
      "Multi-Agent Workflow Pipelines",
      "Vector Search & Document RAG",
      "Domain-Specific Fine-Tuning & Prompt Architecture",
      "Deterministic Evaluation & Guardrails",
      "Autonomous Tool-Calling Frameworks",
    ],
    deliverables: ["Custom Agent System", "Vector Pipeline", "Evaluation Harness"],
    techFocus: ["Python", "FastAPI", "LangChain / LlamaIndex", "Vector DBs", "OpenAI / Claude API"],
  },
  {
    id: "backend-cloud-engineering",
    number: "03",
    title: "Backend & Cloud Engineering",
    tagline: "Fault-tolerant APIs, distributed microservices, and resilient infra.",
    description:
      "High-throughput data layers, asynchronous workers, containerized environments, and cloud infrastructure engineered for zero-downtime scalability.",
    capabilities: [
      "RESTful & Event-Driven APIs",
      "PostgreSQL & Document Database Schema Design",
      "Asynchronous Background Queues",
      "Docker Containerization & CI/CD",
      "Serverless Edge Computing",
    ],
    deliverables: ["Scalable Backend Service", "Database Migration Suite", "Automated CI/CD"],
    techFocus: ["FastAPI", "Node.js", "PostgreSQL", "Redis", "Docker", "AWS / Vercel"],
  },
  {
    id: "creative-development",
    number: "04",
    title: "Creative Development",
    tagline: "Choreographed motion, WebGL experiences, and editorial typography.",
    description:
      "Digital experiences that command attention. We integrate smooth motion dynamics, WebGL shader interactions, and tactile micro-interactions without sacrificing usability.",
    capabilities: [
      "GSAP & ScrollTrigger Choreography",
      "Three.js & WebGL Realtime Visuals",
      "Fluid Physics & Interactive Shaders",
      "Micro-Interactions & Audio Feedback",
      "Full Reduced-Motion Graceful Degradation",
    ],
    deliverables: ["Interactive 3D/Motion Suite", "WebGL Canvas Integration", "Accessibility Fallbacks"],
    techFocus: ["Three.js", "Motion for React", "GSAP", "GLSL Shaders", "Canvas API"],
  },
  {
    id: "automation-integrations",
    number: "05",
    title: "Automation & Integrations",
    tagline: "Connecting disconnected systems into continuous operational pipelines.",
    description:
      "We eradicate operational friction by bridging SaaS tools, bespoke APIs, enterprise webhooks, and asynchronous batch workers into unified automations.",
    capabilities: [
      "Custom Webhook & API Middleware",
      "Third-Party SaaS Orchestration",
      "Scheduled Data Aggregation & ETL",
      "CRM & Payment Gateway Pipelines",
      "Security Hardening & Token Rotation",
    ],
    deliverables: ["Integration Middleware", "Webhook Ingestion Engine", "Error Monitoring"],
    techFocus: ["TypeScript", "Python", "Stripe API", "GitHub API", "REST/GraphQL"],
  },
  {
    id: "product-engineering",
    number: "06",
    title: "Product Engineering",
    tagline: "End-to-end product realization from architecture to production launch.",
    description:
      "We partner with founders and engineering leaders to take ambitious product concepts from technical discovery through validation, MVP build, and enterprise hardening.",
    capabilities: [
      "Full-Stack Product Architecture",
      "Rapid Prototype to Production Refactoring",
      "State Management & Offline Capability",
      "Instrumentation & User Telemetry",
      "Code Auditing & Technical Due Diligence",
    ],
    deliverables: ["End-to-End Product", "Technical Documentation", "Knowledge Transfer"],
    techFocus: ["Full-Stack TypeScript", "System Architecture", "Cloud Runtimes"],
  },
];

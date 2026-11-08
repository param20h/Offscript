export interface KeyComponent {
  name: string;
  description: string;
  tech: string;
}

export interface EngineeringDecision {
  title: string;
  rationale: string;
  outcome: string;
}

export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  tagline: string;
  description: string;
  overview: string;
  problem: string;
  approach: string;
  architectureSummary: string;
  keyComponents: KeyComponent[];
  engineeringDecisions: EngineeringDecision[];
  implementedFunctionality: string[];
  prototypeBoundaries: string[];
  plannedIncrements: string[];
  technologies: string[];
  status: string;
  accentColor: string;
  verificationBadge: string;
  metricsLabel?: string;
  githubUrl?: string;
  demoUrl?: string;
}

export const CATEGORIES = [
  "All",
  "Productivity & Wellness Ecosystem",
  "Intelligent Systems",
  "Platform Engineering",
  "Commercial Web Application",
  "Educational Web Platform",
] as const;

export const PROJECTS: Project[] = [
  // 1. ZenithFlow
  {
    slug: "zenithflow",
    title: "ZenithFlow",
    subtitle: "Velocity Planning & Biometric Habit Analytics",
    category: "Productivity & Wellness Ecosystem",
    tagline: "All-in-one productivity and wellness platform combining velocity planning with biometric habit analytics.",
    description:
      "All-in-one productivity and wellness platform designed to combine velocity planning with biometric habit analytics. Built with tenant-isolated PostgreSQL, Row Level Security, and automated Razorpay subscription webhooks.",
    overview:
      "Modern professionals juggle fragmented task managers, habit trackers, and wellness applications, creating cognitive friction and disjointed execution. ZenithFlow unifies sprint-based velocity planning with biometric habit analytics into a single responsive SaaS ecosystem.",
    problem:
      "Synchronizing real-time habit tracking and asynchronous subscription billing requires strict transaction safety. Subscription renewals, cancellations, and tier upgrades must reconcile idempotently with payment provider webhooks without race conditions or access leakage.",
    approach:
      "We engineered a production Next.js application backed by Supabase Auth and tenant-isolated PostgreSQL with Row Level Security (RLS). A secure Razorpay webhook processing pipeline verifies cryptographic signatures, processes subscription lifecycle events idempotently, and updates subscriber tier entitlements in real time.",
    architectureSummary:
      "Next.js application, Supabase Auth session validation, Razorpay subscription webhook listener, tenant-isolated PostgreSQL with Row Level Security (RLS).",
    implementedFunctionality: [
      "Production Next.js application with modular responsive dashboard",
      "Supabase Auth integration for secure user onboarding and session management",
      "Razorpay webhook pipeline with HMAC-SHA256 signature verification",
      "PostgreSQL database with Row Level Security (RLS) guaranteeing tenant isolation",
      "Real-time habit tracking and velocity metric synchronization",
      "Automated subscription tier provisioning and renewal lifecycle handling",
    ],
    prototypeBoundaries: [
      "Production SaaS deployed on Vercel and Supabase cloud infrastructure",
      "Active payment gateway configured for subscription billing",
    ],
    plannedIncrements: [
      "Native mobile companion application using React Native",
      "HealthKit and Google Fit biometric API sync adapters",
      "Team workspace federation for cross-organizational velocity boards",
    ],
    keyComponents: [
      {
        name: "Subscription Webhook Engine",
        description:
          "Verifies Razorpay HMAC signatures, processes recurring billing events idempotently, and provisions tenant tier flags.",
        tech: "Next.js Route Handlers / Razorpay SDK",
      },
      {
        name: "Tenant-Isolated Data Core",
        description:
          "Enforces PostgreSQL Row Level Security policies ensuring strict isolation between user workspaces.",
        tech: "PostgreSQL / Supabase RLS",
      },
      {
        name: "Velocity Analytics Canvas",
        description:
          "Renders real-time habit completion metrics, sprint burn-down rates, and productivity scores.",
        tech: "React / Tailwind CSS / Recharts",
      },
    ],
    engineeringDecisions: [
      {
        title: "Row Level Security Over Application-Layer Filtering",
        rationale:
          "Relying solely on ORM where-clauses for tenant isolation risks catastrophic data leakage if an endpoint omits a filter.",
        outcome:
          "PostgreSQL RLS policies enforce isolation directly at the database engine level across every query.",
      },
      {
        title: "Idempotent Webhook Processing",
        rationale:
          "Payment gateways occasionally retry webhooks on transient network blips, risking double-provisioning or duplicated invoices.",
        outcome:
          "Implemented transactional event deduplication keys to ensure every webhook payload executes exactly once.",
      },
    ],
    technologies: [
      "Next.js",
      "Supabase Auth",
      "Node.js",
      "Razorpay API",
      "PostgreSQL",
      "Tailwind CSS",
    ],
    status: "Production Platform",
    accentColor: "#D6FF35",
    verificationBadge: "Live SaaS Deployed",
    demoUrl: "https://zenithflow.dev/",
  },

  // 2. Vesta AI
  {
    slug: "vesta-ai",
    title: "Vesta AI",
    subtitle: "Investment Research Agent",
    category: "Intelligent Systems",
    tagline: "Autonomous synthesis of SEC filings and earnings call transcripts.",
    description:
      "An autonomous research agent designed to parse structured and unstructured financial disclosures. Synthesizes 10-K/10-Q filings, transcripts, and financial balance sheets into traceable, citation-backed analytical briefs.",
    overview:
      "Financial analysts spend days reading 100+ page SEC filings, financial footnotes, and earnings call transcripts to extract company guidance and risk factor disclosures. Vesta AI was built to automate the extraction and synthesis workflow while adhering to strict compliance standards requiring verifiable citations for every data point.",
    problem:
      "Standard LLM RAG pipelines fail on financial disclosures because balance sheets and cash flow statements lose spatial table structures when chunked into simple text paragraphs. Furthermore, financial analysis cannot tolerate hallucinations: citing an incorrect revenue metric or EPS guidance can have severe commercial consequences.",
    approach:
      "We engineered a dual-stream multi-agent architecture. Tabular statements are extracted deterministically using table parsers to preserve row-column semantics, while textual risk disclosures are embedded into a vector space with document metadata. An evaluator agent checks the synthesizer agent's output, requiring exact line and page citations from the SEC filings before output is released.",
    architectureSummary:
      "Multi-agent extraction graph, semantic vector indexing, citation verification pipeline, deterministic tabular parsing.",
    implementedFunctionality: [
      "Deterministic HTML/XBRL financial table parser preserving row and column coordinates",
      "Vector embedding and retrieval pipeline for textual risk factor disclosures",
      "Multi-agent synthesis graph separating extraction from audit verification",
      "Citation assertion layer rejecting any claim lacking exact filing chunk citations",
    ],
    prototypeBoundaries: [
      "Operates over curated historical 10-K and 10-Q disclosures for targeted evaluation companies",
      "Vector index stored locally for prototype benchmarking",
    ],
    plannedIncrements: [
      "Real-time SEC EDGAR live stream ingestion and filing notification webhooks",
      "Automated cross-statement 3-statement financial model reconciliation",
      "Fine-tuned domain classification models for non-GAAP reconciliation footnotes",
    ],
    keyComponents: [
      {
        name: "Tabular Disclosure Parser",
        description:
          "Preserves hierarchical financial tables, converting SEC HTML/XBRL disclosures into typed tabular data frames.",
        tech: "Python / BeautifulSoup / Pandas",
      },
      {
        name: "Multi-Agent Graph Orchestrator",
        description:
          "Coordinates specialized agents: an Extractor Agent, a Financial Modeling Agent, and an Auditor Agent with stateful checkpointing.",
        tech: "FastAPI / LangGraph / Vector DB",
      },
      {
        name: "Citation Verification Harness",
        description:
          "Deterministic verification engine that validates every extracted claim against SEC EDGAR ground-truth text chunks.",
        tech: "Python / Pydantic / RAG",
      },
    ],
    engineeringDecisions: [
      {
        title: "Table Normalization Before Vectorization",
        rationale:
          "Generic text chunking splits balance sheet rows across chunks, destroying numerical context.",
        outcome:
          "Tables are converted to markdown/JSON structures with column headers preserved on every row entry.",
      },
      {
        title: "Auditor Verification Loop",
        rationale:
          "Single-pass generation occasionally quotes figures from previous quarters or misinterprets guidance ranges.",
        outcome:
          "The secondary Auditor agent cross-checks every synthesized number; unverified statements are flagged and omitted from the final brief.",
      },
    ],
    technologies: [
      "Python",
      "FastAPI",
      "LangChain / LangGraph",
      "Vector RAG",
      "Next.js",
      "TypeScript",
    ],
    status: "Engineering Prototype",
    accentColor: "#D6FF35",
    verificationBadge: "Algorithmic Pipeline Verified",
  },

  // 3. CampusIQ
  {
    slug: "campusiq",
    title: "CampusIQ",
    subtitle: "Smart Campus Event Management & Analytics Platform",
    category: "Platform Engineering",
    tagline: "Event management, classroom scheduling, and student attendance analytics.",
    description:
      "Scalable digital infrastructure engineered to coordinate academic operations, classroom scheduling, departmental notifications, and student verification across collegiate organizations.",
    overview:
      "Colleges and universities struggle with disconnected legacy software: departmental schedules live in separate silos, student registration causes server crashes during peak enrollment, and campus leadership lacks visibility into facility utilization. CampusIQ was architected as a centralized platform for event registration, seat capacity management, and student analytics.",
    problem:
      "During peak event registration windows, hundreds of students submit booking requests simultaneously. Without proper database concurrency controls, race conditions result in overbooked auditorium seats, duplicated registrations, and corrupted capacity records.",
    approach:
      "We designed a transactional MongoDB data layer utilizing atomic conditional updates and MongoDB session transactions. This completely prevents race conditions under high concurrent load without requiring heavy external locks. A real-time aggregation pipeline computes campus attendance metrics with sub-10ms query response times.",
    architectureSummary:
      "Role-based access matrix, event-driven notification broker, WebSocket telemetry, high-throughput document management.",
    implementedFunctionality: [
      "Full-stack Next.js and MongoDB application with TypeScript strict typing",
      "Atomic conditional seat booking preventing overbooking race conditions",
      "MongoDB aggregation pipelines computing department attendance and capacity metrics",
      "Compound indexing strategy optimizing query paths",
      "Role-based access controls for student attendees and campus administrators",
    ],
    prototypeBoundaries: [
      "Engineered and documented as a comprehensive MongoDB lecture project prototype",
      "Single-cluster deployment verified on academic department workloads",
    ],
    plannedIncrements: [
      "Multi-tenant university campus federation and single sign-on (SSO)",
      "High-throughput WebSocket live notification cluster via Redis pub/sub",
      "Automated SMS and push notification broker integration",
    ],
    keyComponents: [
      {
        name: "Atomic Concurrency Controller",
        description:
          "Guarantees that event registrations never exceed auditorium capacities using atomic MongoDB transactions and conditional write filters.",
        tech: "MongoDB Native Driver / Node.js",
      },
      {
        name: "Aggregated Analytics Pipeline",
        description:
          "Computes cross-departmental engagement metrics, capacity utilization, and attendance trends using compound indexes.",
        tech: "MongoDB Aggregation / Recharts",
      },
      {
        name: "Role-Based Access Matrix",
        description:
          "Secures student records and administrative permissions across university faculties with granular token-based authorization.",
        tech: "Next.js / JWT Auth / TypeScript",
      },
    ],
    engineeringDecisions: [
      {
        title: "Atomic Updates Over Application-Level Locks",
        rationale:
          "Application-level locking introduces latency bottlenecks and fails when scaling to multiple server instances.",
        outcome:
          "Leveraging MongoDB atomic document-level operations guarantees 100% capacity integrity with zero lock contention.",
      },
      {
        title: "Compound Indexing Optimization",
        rationale:
          "Departmental filtering across thousands of historical events was causing full collection scans.",
        outcome:
          "Engineered targeted compound indexes reducing query latency to single-digit milliseconds.",
      },
    ],
    technologies: [
      "React",
      "Next.js",
      "Node.js",
      "MongoDB Native Driver",
      "WebSockets",
      "Tailwind CSS",
    ],
    status: "Production Architecture",
    accentColor: "#F0EDE5",
    verificationBadge: "Document Architecture Verified",
  },

  // 4. Auto Care On Wheels
  {
    slug: "auto-care-on-wheels",
    title: "Auto Care On Wheels",
    subtitle: "Mobile Mechanic Scheduling & Service Dispatch System",
    category: "Commercial Web Application",
    tagline: "Automated car service booking, scheduling confirmations, and dispatch management.",
    description:
      "A complete full-stack car service booking platform deployed for a real commercial mechanic business. The platform automates customer scheduling, booking confirmations, and administrative service dispatch.",
    overview:
      "Operating a mobile automotive mechanic service requires coordinating customer locations, vehicle specifications, technician availability, and service packages. Auto Care On Wheels was commissioned to transition an established automotive repair business from manual phone and paper bookings to a modern, automated online dispatch platform.",
    problem:
      "Manual booking via phone calls created severe scheduling bottlenecks during peak driving hours: double-booked time slots, missed inquiries, lack of structured vehicle detail collection, and delayed customer confirmations. Administrative staff spent hours daily manually re-typing job orders into calendars.",
    approach:
      "We engineered a full-stack booking system pairing a customer-facing appointment scheduling interface with an administrative dispatch portal. The client interface dynamically queries mechanic availability, enforces slot validation, and collects vehicle details (make, model, year, service type). Bookings are processed through an Express API and committed via Prisma ORM to MySQL, triggering automated confirmation alerts and administrative dashboard updates.",
    architectureSummary:
      "Customer Interface → Appointment Availability → Booking API → Prisma ORM → MySQL, with an administrative dispatch layer.",
    implementedFunctionality: [
      "Full-stack web application built with React 18 and Vite for fast client rendering",
      "Interactive calendar booking with dynamic date and time availability querying",
      "Express.js REST API handling booking validation, scheduling constraints, and status updates",
      "Prisma ORM schema modeling customers, appointments, service tiers, and vehicle data",
      "MySQL database managing appointment persistence and scheduling transactions",
      "Administrative control portal for viewing, confirming, and dispatching incoming jobs",
      "Automated booking notification workflow dispatched upon reservation confirmation",
      "Live production deployment and DNS configuration on Hostinger infrastructure",
    ],
    prototypeBoundaries: [
      "Commercial production deployment live in the Australian market (autocareonwheels.com.au)",
      "Single-business operational tenancy configured for current mechanic fleet",
    ],
    plannedIncrements: [
      "SMS gateway integration for two-way customer arrival reminders",
      "Technician mobile progressive web app (PWA) with real-time GPS route dispatch",
      "Integrated automated invoicing with Stripe / Square terminal reconciliation",
    ],
    keyComponents: [
      {
        name: "Customer Scheduling Canvas",
        description:
          "Interactive booking workflow allowing vehicle owners to select services, inspect time slot availability, and submit service reservations.",
        tech: "React 18 / Vite / Tailwind CSS",
      },
      {
        name: "Booking & Availability API",
        description:
          "Validates incoming appointment requests, verifies technician slot availability, and commits reservations with transaction locks.",
        tech: "Node.js / Express.js / CORS",
      },
      {
        name: "Prisma & MySQL Persistence Layer",
        description:
          "Strict relational database modeling customers, vehicle specs, service logs, and dispatch states.",
        tech: "Prisma ORM / MySQL",
      },
      {
        name: "Administrative Dispatch Portal",
        description:
          "Secured management dashboard for the commercial business owner to review, reschedule, and dispatch service technicians.",
        tech: "React / REST API / Hostinger",
      },
    ],
    engineeringDecisions: [
      {
        title: "Prisma ORM for Strict Data Integrity",
        rationale:
          "Booking systems require strict relational guarantees between customers, vehicles, and appointment times to prevent orphaned records.",
        outcome:
          "Prisma's typed schema enforces foreign key constraints and eliminates type drift between the backend API and database migrations.",
      },
      {
        title: "Vite + React 18 for Instant Mobile Loading",
        rationale:
          "Automotive service inquiries predominantly originate on mobile devices by stranded drivers or roadside owners.",
        outcome:
          "Sub-second initial client bundles with Vite deliver immediate interactivity even on mobile cellular connections.",
      },
    ],
    technologies: [
      "React 18",
      "Vite",
      "Node.js",
      "Express.js",
      "Prisma ORM",
      "MySQL",
      "Tailwind CSS",
    ],
    status: "Production Platform",
    accentColor: "#D6FF35",
    verificationBadge: "Live Commercial Deployment",
    demoUrl: "https://autocareonwheels.com.au",
  },

  // 5. Star Computer Center
  {
    slug: "star-computer-center",
    title: "Star Computer Center",
    subtitle: "Vocational Training Portal & Student Inquiry System",
    category: "Educational Web Platform",
    tagline: "Interactive course catalogs, student admission inquiries, and responsive syllabus viewing.",
    description:
      "A digital web portal for an educational training center, featuring interactive course catalogs, student admission inquiries, and responsive syllabus viewing.",
    overview:
      "Educational institutions offering computer and vocational training must communicate curriculum details, certificate accreditation, and batch timings to prospective students. Star Computer Center commissioned a modern digital presence to replace legacy printed brochures with an interactive, mobile-optimized course catalog and direct admission inquiry system.",
    problem:
      "Reliance on physical brochures and walk-in inquiries restricted the institution's reach. Prospective students could not inspect updated syllabi, check upcoming batch schedules, or submit enrollment questions outside of physical administrative office hours.",
    approach:
      "We designed a high-performance web portal built on React, Tailwind CSS, and a Node.js / Express backend. The platform provides structured course catalog navigation, collapsible syllabus modules, fee structure overviews, and an instant inquiry form. Inquiries are validated server-side, recorded with course references, and routed to admissions coordinators for immediate follow-up.",
    architectureSummary:
      "Student Interface → Course Catalog → Inquiry Submission → Backend API, with a syllabus/content delivery layer.",
    implementedFunctionality: [
      "Responsive institutional web portal with mobile-first navigation and clean typography",
      "Interactive course catalog categorizing foundational, professional, and diploma programs",
      "Structured syllabus viewing modules detailing weekly topics, practical labs, and certifications",
      "Direct student inquiry submission form with client and server-side validation",
      "Node.js / Express REST backend processing incoming admission inquiries",
      "High-performance mobile UX achieving fast load times across low-bandwidth connections",
    ],
    prototypeBoundaries: [
      "Institutional web application deployed on client-managed infrastructure",
      "Admissions inquiries routed directly to administration records",
    ],
    plannedIncrements: [
      "Student portal for downloading digital certificates and exam schedules",
      "Automated WhatsApp notification bot for enrollment status confirmations",
      "Integrated fee payment gateway for online course registration",
    ],
    keyComponents: [
      {
        name: "Course Discovery & Syllabus Viewer",
        description:
          "Interactive catalog presenting curriculum overviews, prerequisites, lab schedules, and certification badges.",
        tech: "React / Tailwind CSS",
      },
      {
        name: "Admissions Inquiry Engine",
        description:
          "Structured form handling prospective student inquiries with course-specific interest routing and input sanitization.",
        tech: "Node.js / Express.js",
      },
      {
        name: "Syllabus Content Layer",
        description:
          "Structured content layer organizing curriculum data into easily readable weekly modules and learning outcomes.",
        tech: "JSON Schema / Modular React Components",
      },
    ],
    engineeringDecisions: [
      {
        title: "Component-Driven Curriculum Architecture",
        rationale:
          "Course offerings change periodically; hardcoding syllabi into pages makes updates cumbersome and error-prone.",
        outcome:
          "Curriculum data is structured into modular schema-driven components, enabling seamless updates to course topics without redesigning views.",
      },
      {
        title: "Mobile-First Accessibility & Light Footprint",
        rationale:
          "The majority of prospective vocational students access the web portal via budget smartphones on mobile data.",
        outcome:
          "Achieved an ultra-light client bundle with zero unnecessary dependencies, guaranteeing fast load times across 3G/4G networks.",
      },
    ],
    technologies: ["React", "Tailwind CSS", "Node.js", "Express.js", "JavaScript"],
    status: "Production Platform",
    accentColor: "#F0EDE5",
    verificationBadge: "Institutional System Deployed",
  },
];

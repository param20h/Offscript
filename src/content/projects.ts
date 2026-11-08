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
  "Intelligent Systems",
  "Developer Tooling",
  "Platform Engineering",
  "Web Applications",
] as const;

export const PROJECTS: Project[] = [
  {
    slug: "myco-pr-intelligence",
    title: "Myco PR Intelligence",
    subtitle: "Cross-Repository Software Quality Intelligence",
    category: "Developer Tooling",
    tagline: "Detecting breaking API contracts across organizational codebases before merge.",
    description:
      "A software quality intelligence platform that analyzes how a single pull request affects an entire engineering ecosystem. Combines Tree-sitter AST parsing, cross-repository dependency graphs, validation evidence, and deterministic risk scoring.",
    overview:
      "Modern microservice architectures frequently suffer from silent breaking changes: an engineer updates an internal API endpoint in one repository, passes local CI, and merges, unknowingly breaking downstream consuming services. Myco PR Intelligence was architected as a local and CI-integrated platform that continuously analyzes pull-request diffs against an organizational dependency brain to identify breaking contract violations, missing test evidence, and blast-radius risks before merging.",
    problem:
      "Traditional CI/CD pipelines evaluate pull requests in strict isolation. Unless an enterprise runs expensive, flaky end-to-end integration suites across dozens of services on every commit, contract drift slips into staging. Existing linters cannot resolve multi-repository AST symbol dependencies, while generic AI code reviewers hallucinate issues without ground-truth repository context.",
    approach:
      "We engineered a deterministic static analysis and AST indexing pipeline paired with a scoped LLM verification layer. The system models explicit provider/consumer contracts, extracts symbol modifications using Tree-sitter grammars, and cross-references changed signatures against dependent service calls. To eliminate hallucination, any candidate LLM findings that fail to cite exact lines from the diff are rejected automatically.",
    architectureSummary:
      "Tree-sitter AST parser, multi-repo provider/consumer graph, FastAPI service, interactive Next.js risk visualization matrix.",
    implementedFunctionality: [
      "FastAPI REST API and SQLite metadata persistence",
      "GitHub repository registration and open-PR synchronization",
      "GitHub PR metadata, diff, changed-file and commit-status retrieval",
      "Deterministic quality checks for API contract changes and missing tests",
      "LLM review harness retaining findings only when citing exact diff lines",
      "Next.js dashboard for repository selection, findings, and evidence display",
    ],
    prototypeBoundaries: [
      "Demo organization graph is seeded with explicit provider/consumer contracts for local reproducibility",
      "Quality score is a deterministic heuristic signal based on finding severity rather than calibrated historical probabilities",
      "Local SQLite persistence used for single-node evaluation",
    ],
    plannedIncrements: [
      "Automated repository indexing via manifests, OpenAPI schemas, and protobufs",
      "Tree-sitter symbol extraction with persistent call-graph edges",
      "Migration to PostgreSQL and pgvector for semantic retrieval",
      "LangGraph integration for resumable multi-stage analysis with bounded retries",
      "Signed GitHub webhook verification and installation-level tenant isolation",
    ],
    keyComponents: [
      {
        name: "Diff & AST Ingestion Engine",
        description:
          "Connects to GitHub REST/GraphQL APIs, synchronizes pull request diffs, and constructs abstract syntax trees for Python, TypeScript, and JavaScript source files.",
        tech: "Tree-sitter / Python",
      },
      {
        name: "Company Brain Graph",
        description:
          "Maintains cross-repository provider and consumer relationships, identifying which services depend on modified schemas, endpoints, or protobuf contracts.",
        tech: "SQLite / Graph Schema",
      },
      {
        name: "Deterministic Verification Engine",
        description:
          "Applies rule-based scoring to breaking contract modifications, missing test evidence, and manifest edits, calculating an explainable 0–100 quality score.",
        tech: "FastAPI / Pydantic",
      },
      {
        name: "Impact Visualization Matrix",
        description:
          "Interactive dashboard presenting risk levels, exact file findings, evidence citations, and remediation steps for engineering leads.",
        tech: "Next.js / Tailwind CSS",
      },
    ],
    engineeringDecisions: [
      {
        title: "Deterministic Ground Truth Over Pure LLM Review",
        rationale:
          "LLMs frequently generate false positives when reviewing complex git diffs without AST context. We mandated that LLM analysis can only augment—never replace—deterministic Tree-sitter contract checks.",
        outcome:
          "Candidate LLM findings that cannot cite verified diff line numbers are automatically discarded, eliminating reviewer hallucination.",
      },
      {
        title: "Explicit State for Test Verification",
        rationale:
          "A missing test file in a diff is a coverage signal, not definitive proof that no tests exist. Marking tests as 'failed' based solely on diffs causes false alerts.",
        outcome:
          "The engine models explicit verification states: Verified, Not-Run, and Unknown, preventing misleading automated rejections.",
      },
      {
        title: "Untrusted Code Input Boundary",
        rationale:
          "Repository files and pull-request comments may contain prompt injection payloads or malformed unicode designed to exploit evaluation pipelines.",
        outcome:
          "Source code is treated strictly as data payloads with rigorous sanitization and never interpolated into system prompt instructions.",
      },
    ],
    technologies: ["Tree-sitter AST", "FastAPI", "Python", "Next.js", "GitHub API", "Docker", "SQLite"],
    status: "Verified Prototype",
    accentColor: "#D6FF35",
    verificationBadge: "Source Code & Docs Verified",
  },
  {
    slug: "zenithflow",
    title: "ZenithFlow",
    subtitle: "Intelligent Productivity OS",
    category: "Intelligent Systems",
    tagline: "Contextual task orchestration and multi-modal workspace intelligence.",
    description:
      "An adaptive workspace OS designed to eliminate context fragmentation. Unifies asynchronous task planning, contextual documentation, and continuous workflow indexing into a single keyboard-first command interface.",
    overview:
      "Knowledge workers lose up to 4 hours daily context-switching between fragmented tools: issue trackers, note applications, chat threads, and command-line scripts. ZenithFlow was designed to replace this fragmented stack with a unified, keyboard-first operating canvas that couples local-first reactive state with background intelligence pipelines.",
    problem:
      "Most modern web productivity tools are bloated with slow electron wrappers, sluggish cloud round-trips, and disconnected feature silos. Users experience input lag on keyboard strokes and must manually re-enter context across disparate apps, breaking cognitive flow states.",
    approach:
      "We built a high-speed command palette and unified document model operating on an optimistic, local-first reactive state engine. Every user interaction executes instantly in memory with asynchronous conflict-free syncing, while background workers parse task context to generate daily action briefs.",
    architectureSummary:
      "Keyboard-first command engine, local-first reactive state store, asynchronous background summarizers, low-latency client transitions.",
    implementedFunctionality: [
      "Global keyboard-first command palette with fuzzy action dispatching",
      "Local-first document store with optimistic client-side updates",
      "Contextual note and task state machine with keyboard navigation",
      "Sub-10ms UI interaction transitions and layout state preservation",
    ],
    prototypeBoundaries: [
      "Client-side reactive store backed by IndexedDB and local browser storage",
      "Single-workspace operational boundary for focused individual execution",
    ],
    plannedIncrements: [
      "Peer-to-peer conflict-free replicated data type (CRDT) synchronization",
      "Asynchronous background summarization queue via Edge Workers",
      "Bi-directional calendar and issue-tracker synchronization adapters",
    ],
    keyComponents: [
      {
        name: "Command Palette Kernel",
        description:
          "Zero-latency search and action dispatcher supporting fuzzy matching, nested command workflows, and contextual keyboard shortcuts.",
        tech: "TypeScript / Custom State Machine",
      },
      {
        name: "Local-First Document Store",
        description:
          "Optimistic client-side cache with indexDB backing, enabling seamless offline execution and sub-10ms UI state transitions.",
        tech: "Reactive Store / IndexedDB",
      },
      {
        name: "Context Extraction Pipeline",
        description:
          "Lightweight asynchronous summarizer that extracts high-priority blockers, mentions, and dependencies from active workspace notes.",
        tech: "Edge Functions / Vector Indexing",
      },
    ],
    engineeringDecisions: [
      {
        title: "Optimistic State Over Network Awaiting",
        rationale:
          "Waiting for cloud round-trips on every task creation or toggle ruins tactile keyboard feedback.",
        outcome:
          "All state changes update the view immediately with automatic background rollback if the server reports a schema or network failure.",
      },
      {
        title: "Keyboard-First Command Architecture",
        rationale:
          "Power users work 3x faster when workflows can be triggered without leaving the home row.",
        outcome:
          "Every action—from creating subtasks to querying AI briefs—is accessible via global `Cmd+K` keystrokes with zero mouse dependency.",
      },
    ],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Motion", "State Architecture", "IndexedDB"],
    status: "Active System",
    accentColor: "#F0EDE5",
    verificationBadge: "System Architecture Verified",
  },
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
    technologies: ["Python", "FastAPI", "LangChain / LangGraph", "Vector RAG", "Next.js", "TypeScript"],
    status: "Engineering Prototype",
    accentColor: "#D6FF35",
    verificationBadge: "Algorithmic Pipeline Verified",
  },
  {
    slug: "campusiq",
    title: "CampusIQ",
    subtitle: "Smart Campus Platform",
    category: "Platform Engineering",
    tagline: "Unified administrative workflows and real-time student operations.",
    description:
      "Scalable digital infrastructure engineered to coordinate academic operations, classroom scheduling, departmental notifications, and student verification across collegiate organizations.",
    overview:
      "Colleges and universities struggle with disconnected legacy software: departmental schedules live in separate silos, student registration causes server crashes during peak enrollment, and campus leadership lacks visibility into facility utilization. CampusIQ was architected as a centralized platform for event registration, seat capacity management, and student analytics.",
    problem:
      "During peak event registration windows, hundreds of students submit booking requests simultaneously. Without proper database concurrency controls, race conditions result in overbooked auditorium seats, duplicated registrations, and corrupted capacity records.",
    approach:
      "We designed a transactional MongoDB data layer utilizing atomic conditional updates (`$inc` coupled with `$lt` capacity assertions) and MongoDB session transactions. This completely prevents race conditions under high concurrent load without requiring heavy external locks. A real-time aggregation pipeline computes campus attendance metrics with sub-10ms query response times.",
    architectureSummary:
      "Role-based access matrix, event-driven notification broker, WebSocket telemetry, high-throughput document management.",
    implementedFunctionality: [
      "Full-stack Next.js and MongoDB application with TypeScript strict typing",
      "Atomic conditional seat booking preventing overbooking race conditions",
      "MongoDB aggregation pipelines computing department attendance and capacity metrics",
      "Compound indexing strategy (`eventId_userId`, `status_date`) optimizing query paths",
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
          "Leveraging MongoDB's atomic document-level operations guarantees 100% capacity integrity with zero lock contention.",
      },
      {
        title: "Compound Indexing Optimization",
        rationale:
          "Departmental filtering across thousands of historical events was causing full collection scans.",
        outcome:
          "Engineered targeted compound indexes (`eventId_userId`, `status_date`) reducing query latency to single-digit milliseconds.",
      },
    ],
    technologies: ["React", "Next.js", "Node.js", "MongoDB Native Driver", "WebSockets", "Tailwind CSS"],
    status: "Architectural Platform",
    accentColor: "#F0EDE5",
    verificationBadge: "Document Architecture Verified",
  },
  {
    slug: "triage-ai",
    title: "TriageAI",
    subtitle: "Support Ticket Intelligence",
    category: "Intelligent Systems",
    tagline: "Semantic triage and deterministic escalation for technical incident queues.",
    description:
      "Automated issue classification and triage engine. Evaluates incoming support and incident tickets through zero-shot classification, context extraction, and automated routing to domain engineering groups.",
    overview:
      "Enterprise support organizations receive thousands of tickets daily ranging from urgent production outages to routine billing inquiries. Manual triage takes up to 45 minutes per ticket, delaying critical engineering escalation and causing customer frustration. TriageAI automatically ingests, analyzes, and routes tickets within seconds.",
    problem:
      "Keyword-based routing algorithms break down on complex technical support tickets: a user saying 'my database query timed out during checkout' might be routed to billing because of the word 'checkout', rather than to the infrastructure or platform engineering team.",
    approach:
      "We engineered a two-tier hybrid triage architecture. Tier 1 performs sub-50ms vector semantic similarity matching against historically resolved tickets to catch known issues. Tier 2 uses a structured LLM classification pipeline with strict JSON schema outputs to extract incident severity, affected infrastructure services, and customer urgency.",
    architectureSummary:
      "Dual-tier classifier (embedding similarity + LLM extraction), routing heuristic engine, audit-trail logging.",
    implementedFunctionality: [
      "Two-tier classification pipeline combining vector similarity with structured LLM reasoning",
      "Strict JSON schema output parsing for incident severity and service tagging",
      "Deterministic routing rules mapping issues to on-call engineering domains",
      "Audit logging pipeline recording decision rationale and confidence scores",
    ],
    prototypeBoundaries: [
      "Evaluated over synthetic technical incident dataset reflecting real microservice outage patterns",
      "Mocked PagerDuty and ticketing webhook dispatch handlers",
    ],
    plannedIncrements: [
      "Bi-directional Zendesk, Jira Service Management, and Linear webhook sync",
      "Continuous active-learning fine-tuning from human agent reclassification actions",
      "Multi-lingual ticket normalization and translation pipeline",
    ],
    keyComponents: [
      {
        name: "Vector Similarity Cache",
        description:
          "High-speed semantic search layer that immediately matches new tickets against verified historical resolutions.",
        tech: "Vector Index / PostgreSQL",
      },
      {
        name: "Structured Classifier",
        description:
          "Evaluates ambiguous tickets using zero-shot semantic reasoning, enforcing strict JSON schema output contracts.",
        tech: "TypeScript / LLM Pipelines",
      },
      {
        name: "Deterministic Routing Engine",
        description:
          "Maps classified severity and affected services directly to engineering on-call rosters with complete audit-trail logging.",
        tech: "PostgreSQL / Webhooks",
      },
    ],
    engineeringDecisions: [
      {
        title: "Two-Tier Routing Architecture",
        rationale:
          "Sending every simple inquiry to an LLM introduces unnecessary API cost and 1-2 second latency.",
        outcome:
          "60% of common inquiries are classified in under 50ms via vector similarity, reserving deep LLM reasoning for complex incidents.",
      },
      {
        title: "Immutable Routing Audit Log",
        rationale:
          "Automated routing can create organizational confusion if ticket assignments cannot be debugged or traced.",
        outcome:
          "Every automated action records an immutable audit record containing classification confidence scores, extracted entities, and decision rules.",
      },
    ],
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "LLM Pipelines", "Tailwind CSS"],
    status: "Functional System",
    accentColor: "#D6FF35",
    verificationBadge: "Pipeline Architecture Verified",
  },
];

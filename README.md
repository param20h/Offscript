# OFFSCRIPT Studio

> Built different. Engineered properly.

Digital engineering studio crafting bespoke web applications, SaaS platforms, autonomous AI systems, vector knowledge pipelines, and cloud architecture.

- **Production Domain:** [https://offscript.param20h.me](https://offscript.param20h.me)
- **Official Inquiries:** [offscript@param20h.me](mailto:offscript@param20h.me)

---

## Capabilities

- **Custom SaaS & Web Engineering:** High-performance web applications built on Next.js App Router, TypeScript, and React 19 with strict accessibility and performance standards.
- **Autonomous AI & RAG Knowledge:** Multi-agent workflows, semantic vector retrieval (pgvector), structured tool calling, and bespoke conversational interfaces.
- **Backend & Cloud Architecture:** Resilient APIs, serverless infrastructure, distributed rate limiting, and PostgreSQL relational schemas.
- **Creative Development:** Art-directed typography, disciplined motion choreography, and high-contrast editorial aesthetic.

---

## Technical Architecture

```text
├── src/
│   ├── app/
│   │   ├── (public)/          # Editorial marketing site, work directory, case studies
│   │   ├── client/[token]/    # Isolated Warm Ivory client engagement portal
│   │   ├── proposal/[token]/  # Read-only secure proposal viewer
│   │   ├── private/           # Administrative studio operations platform
│   │   │   ├── inquiries/     # Lead qualification & intake management
│   │   │   ├── clients/       # CRM directory & portal token administration
│   │   │   ├── proposals/     # Commercial scope builder & PDF dispatch
│   │   │   ├── invoices/      # Tax billing, payment ledger, and reconciliation
│   │   │   ├── projects/      # Delivery tracking, milestones, and progress engine
│   │   │   └── analytics/     # Business intelligence & sanitized CSV exports
│   │   └── api/               # Server-only route handlers (CSRF-defended)
│   ├── components/            # Design system tokens & modular UI views
│   └── lib/                   # Server-only config, DB client, crypto auth, and pricing
```

---

## Core Technologies

- **Framework:** [Next.js](https://nextjs.org/) (App Router) + [React](https://react.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **Rate Limiting:** [Upstash Redis](https://upstash.com/) (Sliding window)
- **Transactional Email:** [Resend](https://resend.com/)
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) (Custom vector layouts)

---

## Security & Privacy Standards

- **Server-Only Configuration:** Zero `NEXT_PUBLIC_` environment variables in application code. All API keys, database credentials, and secrets remain strictly server-isolated.
- **Authentication:** Scrypt password hashing with high-entropy salt and HMAC-signed session cookies.
- **CSRF Defense:** Mandatory Origin and Sec-Fetch-Site verification on all mutating requests.
- **Formula Injection Mitigation:** All CSV exports are sanitized against spreadsheet formula injection (CVE-2014-3524).
- **Data Protection:** Client access tokens use 256 bits of entropy and are stored exclusively as SHA-256 hashes with 30-day lifecycles.

---

## Local Development

### Prerequisites

- Node.js 20+
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/param20h/Offscript.git
cd Offscript

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Production Build & Verification

```bash
# Strict TypeScript check
npx tsc --noEmit

# Linting
npm run lint

# Production build
npm run build
```

---

## License

Copyright © 2026 OFFSCRIPT Studio. All rights reserved.

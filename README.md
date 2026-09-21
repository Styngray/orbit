# Orbit

A full-stack project management application for teams that want a focused workspace for boards, tasks, and delivery workflows.

Orbit is a portfolio project built with Next.js, Supabase, Stripe, Resend, and the Vercel AI SDK. It explores the product and engineering work behind a modern SaaS application: onboarding, workspace membership, Kanban interactions, billing, feature limits, and AI-assisted task workflows.

## What it includes

- Team onboarding, workspaces, member roles, and profile settings
- Boards, Kanban task management, labels, drag-and-drop interactions, and task details
- Stripe checkout, billing portal, webhook synchronization, plan limits, and feature gates
- AI-assisted task descriptions, task breakdowns, board summaries, and streamed responses
- Supabase-backed data and authentication flows
- Email-ready integration points through Resend

## Technology

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Data and auth:** Supabase, `@supabase/ssr`
- **Billing:** Stripe
- **AI:** Vercel AI SDK and OpenRouter provider support
- **UI and interaction:** Radix UI, dnd-kit, React Hook Form, Zod
- **Testing:** Playwright end-to-end test setup

## Run locally

### Prerequisites

- Node.js 20+
- A Supabase project
- Stripe and email provider credentials for billing/email flows
- An AI provider key for AI-assisted features

### Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` after the development server starts.

The application expects environment variables for Supabase, Stripe, email, and AI-provider configuration. Keep real credentials in `.env.local`; never commit them.

## Verification

The production build completes successfully with TypeScript checks and generated application routes.

```bash
npm run build
```

## Project status

Orbit is a working portfolio build. The repository demonstrates the application architecture and core product flows while continuing to evolve through additional testing, deployment hardening, and polish.

## Notes

This repository is presented as a hands-on engineering project. AI-assisted features are intentionally separated from deterministic application logic so the parts that need predictable behavior can be tested and maintained.

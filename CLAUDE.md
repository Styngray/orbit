# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

```bash
supabase start                  # Start local Supabase (requires Docker)
supabase stop                   # Stop local Supabase
supabase db reset               # Reset DB and rerun migrations
supabase migration new <name>   # Create new migration
```

No test runner is configured yet.

## Stack

- **Next.js 16.2.0** (App Router) — read `node_modules/next/dist/docs/` before writing code; APIs may differ from training data
- **React 19.2.4**
- **Tailwind CSS v4** — configured via `@tailwindcss/postcss` plugin in `postcss.config.mjs`
- **TypeScript** with strict mode; path alias `@/*` maps to the repo root
- **Supabase** (local Docker via `supabase start`) — auth + PostgreSQL database
- **Shadcn UI** — component library; add components with `npx shadcn@latest add <component>`
- **Stripe** — payments; webhook handler at `app/api/stripe/webhook/route.ts`
- **Resend** — transactional email (welcome email, member invites)
- **AI SDK** (`ai` package) — streaming AI responses, gated behind Pro plan

## Architecture

App Router layout under `app/`:
- `layout.tsx` — root layout with Geist font variables and full-height flex body
- `page.tsx` — home page
- `globals.css` — global styles (Tailwind base import)
- `app/(auth)/` — sign-in, sign-up, onboarding routes
- `app/(app)/` — authenticated app routes (workspace, boards, settings)
- `app/api/` — route handlers (Stripe webhook, etc.)

Supporting directories:
- `lib/supabase/` — Supabase client utilities (server, browser, middleware)
- `components/ui/` — Shadcn generated components
- `supabase/migrations/` — DB migration files

Route handlers go in `app/` subdirectories as `route.ts`. Server Components are the default; add `"use client"` only when needed.

**Proxy (formerly Middleware):** `middleware.ts` is deprecated since v16.0.0. Use `proxy.ts` at the project root instead. Export a function named `proxy` (not `middleware`); use the `NextProxy` type from `next/server`. `skipMiddlewareUrlNormalize` is now `skipProxyUrlNormalize` in `next.config.js`.

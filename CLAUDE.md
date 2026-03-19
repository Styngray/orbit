# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16.2.0** (App Router) — read `node_modules/next/dist/docs/` before writing code; APIs may differ from training data
- **React 19.2.4**
- **Tailwind CSS v4** — configured via `@tailwindcss/postcss` plugin in `postcss.config.mjs`
- **TypeScript** with strict mode; path alias `@/*` maps to the repo root

## Architecture

App Router layout under `app/`:
- `layout.tsx` — root layout with Geist font variables and full-height flex body
- `page.tsx` — home page
- `globals.css` — global styles (Tailwind base import)

Route handlers go in `app/` subdirectories as `route.ts`. Server Components are the default; add `"use client"` only when needed.

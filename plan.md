# Orbit — Build Plan

## Milestones

| # | Milestone | Status | Branch |
|---|-----------|--------|--------|
| 1 | Foundation & Auth | ✅ Complete | supabase |
| 2 | Onboarding & Workspaces | ✅ Complete | supabase |
| 3 | Kanban & Tasks | ✅ Complete | milestone/3-kanban |
| 4 | Team & User Management | ✅ Complete | milestone/4-team-mgmt |
| 5 | Payments (Stripe) | ✅ Complete | stripe |
| 6 | AI Features | ✅ Complete | milestone/6-ai |
| 7 | Landing Page & Pricing | 🔲 Not started | landing |

---

## Milestone 1: Foundation & Auth
**Goal:** Working auth, local Supabase, Shadcn + dark mode, welcome email

- [x] Supabase local setup (Docker) — `supabase/config.toml` ready; run `supabase start`
- [x] DB schema: users, teams, team_members, workspaces, boards, tasks
- [x] Shadcn UI + dark mode default, light toggle
- [x] Auth flows: sign-up, sign-in, sign-out, session proxy (`proxy.ts`)
- [x] Welcome email via Resend on sign-up
- [x] Authenticated layout shell (sidebar, header)

---

## Milestone 2: Onboarding & Workspaces
**Goal:** New users can create a team and set up their workspace

- [x] Onboarding wizard (create team → name workspace → invite members)
- [x] Workspace switcher in nav
- [x] Boards CRUD
- [x] Workspace settings page

---

## Milestone 3: Kanban & Tasks
**Goal:** Full kanban board with drag-and-drop task management

- [x] Kanban columns with configurable statuses
- [x] Task cards (title, assignee, priority, labels)
- [x] Drag-and-drop (dnd-kit)
- [x] Task detail modal/panel
- [x] Task creation (quick-add + full form)
- [x] Keyboard shortcuts

---

## Milestone 4: Team & User Management
**Goal:** Teams can manage members and roles

- [x] Invite members by email
- [x] Roles: Owner, Admin, Member
- [x] Member management page
- [x] User profile settings
- [x] Team settings page

---

## Milestone 5: Payments (Stripe)
**Goal:** Gated Lite and Pro subscription tiers

- [x] Define plan limits: Free (1 project, solo), Lite ($9/mo, 10 projects, 3 members), Pro ($19/mo, unlimited + AI)
- [x] Stripe Products + Prices setup (configure via env: `STRIPE_PRICE_LITE`, `STRIPE_PRICE_PRO`)
- [x] Checkout flow (`/api/stripe/checkout` + `startCheckout` server action)
- [x] Billing portal (`/api/stripe/billing-portal` + `openBillingPortal` server action)
- [x] Webhook handler (`/api/stripe/webhook`) — syncs subscription state to DB
- [x] Feature-gate enforcement on `createBoard` and `inviteMember` server actions
- [x] Upgrade prompts at limits (`UpgradeModal`, free-plan invite wall)
- [x] Public pricing page (`/pricing`)
- [x] Dashboard billing page (`/settings/billing`) with usage meters
- [x] Plan badge in sidebar user menu

---

## Milestone 6: AI Features
**Goal:** AI-powered productivity via AI SDK

- [x] AI task description generation
- [x] AI task breakdown (epic → subtasks)
- [x] Board/sprint summaries
- [x] Streaming responses in task panels
- [x] Gate AI features behind Pro plan

---

## Milestone 7: Landing Page & Pricing
**Goal:** Striking public landing page + polished pricing page using Playwright for screenshot capture and design QA

- [x] Dark-mode landing page at `/` (Linear.app aesthetic: dot grid, violet glow, gradient headline)
- [x] Hero section with product screenshot in browser-chrome mockup (`components/landing/hero.tsx`)
- [x] Features grid (4 cards: Kanban, Teams, AI, Speed) (`components/landing/features.tsx`)
- [x] Pricing section with 3-tier cards + link to `/pricing` (`components/landing/pricing-section.tsx`)
- [x] Sticky blurred navbar + minimal footer (`components/landing/navbar.tsx`, `footer.tsx`)
- [x] Redesigned `/pricing` page — dark glass cards, violet accent on Lite tier
- [x] Playwright screenshot script (`tests/take-screenshot.spec.ts`) — captures dashboard to `public/screenshot.png`
- [x] Playwright design QA spec (`tests/landing.spec.ts`) — asserts sections render + saves visual snapshots
- [x] `proxy.ts` updated to allow `/` as public route (unauthenticated access)
- [ ] Run screenshot script to populate `public/screenshot.png` (requires dev server + credentials)

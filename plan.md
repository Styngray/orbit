# Orbit — Build Plan

## Milestones

| # | Milestone | Status | Branch |
|---|-----------|--------|--------|
| 1 | Foundation & Auth | ✅ Complete | supabase |
| 2 | Onboarding & Workspaces | ✅ Complete | supabase |
| 3 | Kanban & Tasks | 🔲 Not started | milestone/3-kanban |
| 4 | Team & User Management | 🔲 Not started | milestone/4-team-mgmt |
| 5 | Payments (Stripe) | 🔲 Not started | milestone/5-payments |
| 6 | AI Features | 🔲 Not started | milestone/6-ai |

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

- [ ] Kanban columns with configurable statuses
- [ ] Task cards (title, assignee, priority, labels)
- [ ] Drag-and-drop (dnd-kit)
- [ ] Task detail modal/panel
- [ ] Task creation (quick-add + full form)
- [ ] Keyboard shortcuts

---

## Milestone 4: Team & User Management
**Goal:** Teams can manage members and roles

- [ ] Invite members by email
- [ ] Roles: Owner, Admin, Member
- [ ] Member management page
- [ ] User profile settings
- [ ] Team settings page

---

## Milestone 5: Payments (Stripe)
**Goal:** Gated Lite and Pro subscription tiers

- [ ] Define Lite vs Pro feature limits
- [ ] Stripe Products + Prices setup
- [ ] Checkout flow
- [ ] Billing portal
- [ ] Webhook handler (`/api/stripe/webhook`)
- [ ] Feature-gate enforcement
- [ ] Upgrade prompts at limits

---

## Milestone 6: AI Features
**Goal:** AI-powered productivity via AI SDK

- [ ] AI task description generation
- [ ] AI task breakdown (epic → subtasks)
- [ ] Board/sprint summaries
- [ ] Streaming responses in task panels
- [ ] Gate AI features behind Pro plan

# RxPro - Prescription Management System

## ⚠️ Known Audit Pitfalls (Read Before Analyzing)

- **Next.js 16 proxy.ts IS correct.** The file is `proxy.ts`, export is `proxy`. NOT dead code. The build output shows `ƒ Proxy (Middleware)` confirming it runs. Do NOT flag it as "middleware not wired."
- **API routes are intentionally excluded from proxy matcher** (`'/((?!api|...).*)'`). This is the standard Next.js 16 pattern — API routes handle their own auth. The API `route.ts` lacking auth is the real problem, not the proxy.
- **`unsafe-inline` in CSP is expected** when using `headers()` in `next.config.ts`. The next-level fix is moving CSP to the proxy with nonces. Don't flag `unsafe-inline` without noting this context.
- **Build output is the source of truth.** Before declaring anything "dead code" or "not running," always check `npm run build` output for the `ƒ` prefixes showing which middleware/proxy functions are registered.
- **Search online/docs first.** Framework conventions change. Next.js 16 renamed middleware → proxy. Before making claims about a framework, check official docs or search for migration guides.
- **Uncertain? Say so.** If you can't verify a claim from build output, docs, or code path, it's safer to say "cannot verify" than to assert something incorrect. False positives erode trust faster than uncertainty.

## Tech Stack
- **Framework:** Next.js 16.2.9 (App Router)
- **Language:** TypeScript (strict)
- **UI:** Tailwind CSS v4.3 + shadcn/ui v4.11 (base-nova style, `@base-ui/react`)
- **State:** TanStack Query v5
- **Database:** better-sqlite3 (local SQLite, file at `data/rxpro.db`)
- **Forms:** react-hook-form + yup (yupResolver)
- **Font:** Rubik via next/font/google
- **Icons:** lucide-react
- **Auth:** Custom cookie-based via next-client-cookies (doctor_id + base64 rx-token)
- **Proxy validation:** `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`, and `export function middleware` → `export function proxy`. This IS the correct convention — do NOT flag it as dead code. Verify with build output: `ƒ Proxy (Middleware)` confirms it runs.)

## Architecture

```
Client Component → src/api/api.ts (POST /api/data {action, ...params})
  → src/app/api/data/route.ts (dispatcher, 44 actions)
    → src/lib/dal.ts (44 typed CRUD functions)
      → src/lib/database.ts (better-sqlite3, 10 tables, seed data)
```

## Routes (all auth-protected via proxy.ts)

| Route | Component | Auth |
|-------|-----------|------|
| `/` | Server redirect (cookie check → /dashboard or /login) | No |
| `/login` | `<Login />` (gradient bg, centered card, admin/password) | No |
| `/dashboard` | 4 stat cards, upcoming appointments, weekly chart, recent activity (live data) | Yes |
| `/setup` | CRUD base configurations | Yes |
| `/favorite-setup` | CRUD favorite setups | Yes |
| `/favorite-medicine` | CRUD favorite medicines | Yes |
| `/instruction` | Tabbed: Instructions + Route Types | Yes |
| `/doctor-info` | Doctor profile editor with header/footer templates | Yes |
| `/patient-info` | Searchable table, expandable details, allergies | Yes |
| `/appointments` | Date filter, status badges (Scheduled/Completed/Cancelled) | Yes |
| `/prescription` | 12-section collapsible form, patient search, template loading, clone, history, print | Yes |

## Data Layer

- **`src/lib/database.ts`** — SQLite init, 10 tables (rx_doctors, rx_doctor_info, rx_patients, rx_appointments, rx_prescriptions, rx_setups, rx_favorite_setups, rx_favorite_medicines, rx_instructions, rx_route_types), auto-creates + seeds on first access
- **`src/lib/dal.ts`** — 44 typed CRUD functions for all resources
- **`src/app/api/data/route.ts`** — POST endpoint dispatching to DAL by action name
- **`src/api/api.ts`** — Client-side functions (same signatures as if using Supabase)
- **`src/hooks/`** — 5 TanStack Query hook files: usePatients, useAppointments, usePrescriptions, useSetup, useDoctorInfo

## Key Files

- `src/lib/database.ts` — SQLite schema + seed data
- `src/lib/dal.ts` — 44 CRUD functions
- `src/app/api/data/route.ts` — POST dispatcher
- `src/api/api.ts` — client-side API
- `src/hooks/` — TanStack Query hooks
- `src/proxy.ts` — auth proxy (replaces middleware.ts)
- `src/app/(main)/` — all authenticated pages
- `src/components/main/dashboard/Dashboard.tsx`
- `src/app/(main)/prescription/components/` — PrescriptionForm.tsx, PrescriptionHistory.tsx, PrintPrescription.tsx

## Auth

- Login: admin / password (rx_doctors table, security_word field)
- Cookies: doctor_id + rx-token (base64 encoded JSON)
- Proxy validates token decodes to matching doctor_id
- Protected routes: all except `/` and `/login`
- Doctor ID in SQLite seed: `d1`

## Design Tokens

- Primary: blue-600 (#2563eb / oklch(0.55 0.2 250))
- Background: slate-50 (oklch(0.97 0.01 240))
- Sidebar: slate-900 (dark theme)
- Cards: white with border-border/50
- Font: Rubik (CSS variable --font-rubik)
- Radius: 0.625rem base

## Agents (OpenCode Kingdom v1.1.0)

- **King Sisyphus** — always-running orchestrator
- **Queen Metis** — wisdom, context, self-improvement
- **Prince of Memory** — state, tasks, decisions
- **Prince of Code** — building, quality enforcement
- **Prince of Git** — commit discipline
- **11 Knight Orders** — specialist executors
- **Territory officials** — rxpro-manager, RxPro-context
- **Kingdom path:** `C:\Users\neo\.config\opencode\kingdom`
- **GitHub:** https://github.com/abdullahmiraz/opencode-kingdom

## Current State (2026-06-25)

- All pages built and connected to real API
- CRUD operations work (create, read, update, delete with confirmation)
- Patient search + autocomplete in prescription form
- Doctor info auto-loads into prescription header
- Template loading from favorite setups
- Clone prescription from history
- Appointment auto-completes when prescription saved
- Proxy.ts replaces middleware.ts (Next.js 16 compat)
- Dashboard shows real data with upcoming appointments
- Favorite medicines integrated into drug autocomplete
- Route types loaded from DB
- Error/success toasts on all mutations
- `npx tsc --noEmit`: 0 errors
- `npm run build`: 0 errors

## Build Commands

```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build (must pass: 0 errors)
npx tsc --noEmit     # TypeScript check (must pass: 0 errors)
```

## Agent Memory System

- `.opencode/agents/rxpro-manager.md` — Project manager agent
- `.opencode/agents/RxPro-context.md` — Full project context (this file)
- `.opencode/memory/tasks.md` — Task tracker (completed + future)
- `.opencode/memory/decisions.md` — Architecture Decision Records
- `.opencode/memory/state.md` — Current project state snapshot

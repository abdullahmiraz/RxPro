# RxPro - Prescription Management System

## Tech Stack
- **Framework:** Next.js 16.2.9 (App Router)
- **Language:** TypeScript (strict)
- **UI:** Tailwind CSS v4.3 + shadcn/ui v4.11 (base-nova style, `@base-ui/react`)
- **State:** TanStack Query (React Query) v5
- **Data:** Local SQLite (better-sqlite3) — swap to Supabase later without changing pages/hooks
- **Forms:** react-hook-form + yup (yupResolver)
- **Font:** Rubik via next/font/google
- **Icons:** lucide-react
- **Auth:** Custom cookie-based (next-client-cookies)

## Routes
| Route | Component | Auth |
|-------|-----------|------|
| `/` | Server redirect (cookie check → /dashboard or /login) | No |
| `/login` | `<Login />` (gradient bg, centered card, admin/password) | No |
| `/dashboard` | `<Dashboard />` (4 stat cards, CSS bar chart, activity table) | Yes |
| `/setup` | CRUD base configurations (TanStack Query hooks) | Yes |
| `/favorite-setup` | CRUD favorite setups | Yes |
| `/favorite-medicine` | CRUD favorite medicines | Yes |
| `/instruction` | Tabbed: Instructions + Route Types | Yes |
| `/doctor-info` | Doctor profile editor (header/footer templates) | Yes |
| `/patient-info` | Searchable table, expandable details, allergies | Yes |
| `/appointments` | Date filter, status badges (Scheduled/Completed/Cancelled) | Yes |
| `/prescription` | 12-section form (full module) + history + print | Yes |

## Architecture
```
Client Component → src/api/api.ts (POST /api/data)
  → src/app/api/data/route.ts (dispatcher)
    → src/lib/dal.ts (server-side CRUD)
      → src/lib/database.ts (better-sqlite3, auto-creates tables + seed data)
```

To swap to Supabase: rewrite `src/lib/dal.ts` to use supabase client + update `src/api/api.ts`. All pages and hooks stay identical.

## Auth
- Login: admin / password (rx_doctors table, security_word field)
- Cookies: doctor_id + rx-token (base64 encoded JSON)
- Proxy: validates token decodes to matching doctor_id
- Doctor ID in SQLite seed: `d1`

## Data Layer Files
- `src/lib/database.ts` — SQLite init, 10 tables, seed data (auto-runs on first access)
- `src/lib/dal.ts` — 44 typed CRUD functions for all resources
- `src/app/api/data/route.ts` — POST endpoint dispatching to DAL
- `src/api/api.ts` — Client-side functions (same signatures as if using Supabase)
- `src/hooks/` — 5 TanStack Query hooks files

## Key Libraries
| Package | Purpose |
|---------|---------|
| @tanstack/react-query | Data fetching with caching |
| react-hook-form + yup | Form management + validation |
| @tanstack/react-table | Table rendering |
| better-sqlite3 | Local SQLite database |
| lucide-react | Icons |
| next-client-cookies | Cookie management |
| @base-ui/react | shadcn/ui component primitives |

## Design Tokens
- Primary: blue-600 (#2563eb / oklch(0.55 0.2 250))
- Background: slate-50 (oklch(0.97 0.01 240))
- Sidebar: slate-900 (dark theme)
- Cards: white with border-border/50
- Font: Rubik (CSS variable --font-rubik)
- Radius: 0.625rem base

## Build Commands
```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Production build (must pass: 0 errors)
npx tsc --noEmit     # TypeScript check (must pass: 0 errors)
```

## Agent Memory System
- `.opencode/agents/rxpro-manager.md` — Project manager agent
- `.opencode/agents/RxPro-context.md` — Full project context
- `.opencode/memory/tasks.md` — Task tracker (completed + future)
- `.opencode/memory/decisions.md` — Architecture Decision Records
- `.opencode/memory/state.md` — Current project state snapshot

**On every new session:**
1. Read `.opencode/memory/state.md` for current project state
2. Read `.opencode/memory/tasks.md` for what to do next
3. Debug: `npm run dev`, login with admin/password
4. Verify: `npx tsc --noEmit` before any changes, `npm run build` after
5. After changes: update `.opencode/memory/state.md` and `.opencode/memory/tasks.md`
6. Commit with meaningful message: `git add -A && git commit -m "message"`

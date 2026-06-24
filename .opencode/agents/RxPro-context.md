# RxPro - Prescription Management System

## Tech Stack
- **Framework:** Next.js 16.2.9 (App Router)
- **Language:** TypeScript (strict)
- **UI:** Tailwind CSS v4.3 + shadcn/ui v4.11 (base-nova style, `@base-ui/react`)
- **State:** TanStack Query
- **Backend:** Supabase
- **Forms:** react-hook-form + yup
- **Tables:** @tanstack/react-table
- **Auth:** Custom cookie-based (next-client-cookies)
- **Build:** npm, PostCSS with @tailwindcss/postcss
- **Font:** Geist via next/font/google (default)

## Project Structure
```
src/
  app/
    (main)/                # Authenticated route group
      dashboard/
      setup/
      favorite-setup/
      favorite-medicine/
      instruction/
      doctor-info/
      patient-info/
      appointments/
      prescription/
      layout.tsx           # Sidebar + content shell
      loading.tsx          # Route-level skeleton
      error.tsx            # Error boundary with retry
    login/
      page.tsx
    layout.tsx             # Root layout (providers, fonts)
    page.tsx               # Root redirect
    not-found.tsx          # Custom 404
    globals.css            # Tailwind v4 + shadcn
  components/
    ui/                    # shadcn/ui components (21 installed)
    shared/                # Sidebar, PageHeader
    main/dashboard/        # Dashboard component
    login/                 # Login component
  lib/
    utils.ts               # cn() helper
    supabase.ts            # Supabase client
    database.types.ts      # DB types
  api/
    api.ts                 # Supabase queries
  hooks/                   # Custom hooks
  types/                   # Shared types
```

## Component Conventions
- All shadcn components use `@base-ui/react` (not Radix)
- Import via `@/components/ui/button`
- Use `cn()` from `@/lib/utils` for class merging
- CSS variables in OKLCH color space
- Tailwind v4 uses `@theme inline` and `@custom-variant`

## Routes
| Route | Description | Page Title |
|-------|-------------|------------|
| `/` | Redirect to `/dashboard` or `/login` | - |
| `/login` | Doctor login form | Login |
| `/dashboard` | Stats, chart, recent activity | Dashboard |
| `/setup` | CRUD base configurations | Setup |
| `/favorite-setup` | CRUD favorite setups | Favorite Setup |
| `/favorite-medicine` | CRUD favorite medicines | Favorite Medicine |
| `/instruction` | CRUD instructions + route types | Instruction |
| `/doctor-info` | Doctor profile editor | Doctor Info |
| `/patient-info` | CRUD patient records | Patient Info |
| `/appointments` | Schedule appointments | Appointments |
| `/prescription` | Create/view prescriptions | Prescription |

## Auth
- Custom cookie-based (no Supabase Auth)
- `rx_doctors` table with plain-text `security_word`
- Login stores `doctor_id` + base64 `rx-token` cookie
- Middleware validates token decodes to match doctor_id
- Protected routes: all except `/` and `/login`

## Design Tokens
- Sidebar: slate-900 bg (dark)
- Content bg: `--background` (light)
- Primary: blue-600 (#2563eb)
- Font: Geist via next/font/google
- Cards: white with border

## Server Actions for mutations (Next.js 16 style)
- Use `"use server"` in action files
- Use `useActionState` for form handling in client components
- Revalidate paths after mutations

## Key Libraries
- `lucide-react` for icons
- `next-client-cookies` for cookie access
- `@tanstack/react-query` for data fetching
- `react-hook-form` + `yup` for forms

## Build Commands
- `npm run dev` — dev server on :3000
- `npm run build` — production build (must pass)
- `tsc --noEmit` — type check (must pass)

## Current Session State (2026-06-24)
### Done
- SQLite layer complete (database.ts, dal.ts, API route, api.ts, hooks)
- Auth works (login → dashboard, middleware validates token)
- Layout complete (sidebar, page header, loading/error/not-found boundaries)
- Dashboard with stats + chart + activity table
- All CRUD page shells exist

### Needs Work
- prescription/components/ directory needs to be created with 4 files
- All CRUD pages need to be connected to TanStack Query hooks
- npm run build needs to be verified

### How to Continue
1. Read .opencode/memory/tasks.md for current task list
2. Read .opencode/memory/state.md for project state
3. Run `npx tsc --noEmit` before committing changes
4. Run `npm run build` to verify production build

### Running
- `npm run dev` starts the dev server at localhost:3000
- Login with admin / password

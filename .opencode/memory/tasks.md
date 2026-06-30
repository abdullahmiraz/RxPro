# RxPro - Task Tracker
**Last Updated:** 2026-06-30 (session 9: routine sync)

## Completed
- [x] **2026-06-25 (session 6):** PDF export — created `/prescription/[id]/print` route with auto-print trigger, 0 npm deps
- [x] **2026-06-25 (session 6):** `src/lib/prescription-transform.ts` — DAL record to PrescriptionFormData converter
- [x] **2026-06-25 (session 6):** "Download PDF" button in PrescriptionHistory view dialog — opens print route in new tab
- [x] **2026-06-25 (session 6):** Fixed oh-my-openagent model — all agents/categories changed from `opencode-go/deepseek-v4-flash` to `deepseek-v4-flash-free` (no prefix)
- [x] **2026-06-25 (session 6):** Updated AGENTS.md model references to `deepseek-v4-flash-free`
- [x] **2026-06-25 (session 6):** Fixed PrescriptionHistory dialog footer — raw `<div>` → `<DialogFooter>` per codebase convention
- [x] **Bug fix 2026-06-25:** Patient Info expand crash — `fetchPatients()` missing `parseJson()` for allergies field
- [x] **2026-06-25 (session 2):** Added seed data for `rx_doctor_info` — fixes TanStack Query `undefined` warning
- [x] **2026-06-25 (session 2):** Fixed hardcoded `"d1"` in PrescriptionForm — now reads from `doctor_id` cookie
- [x] **2026-06-25 (session 2):** Migrated `middleware.ts` → `proxy.ts` (Next.js 16 deprecation)
- [x] **2026-06-25 (session 2):** Fixed missing `key` prop on fragment in PatientInfo page TableBody
- [x] **2026-06-25 (session 3):** Dashboard upgrades — Upcoming Appointments card, real recent activity, Total Prescriptions stat
- [x] **2026-06-25 (session 4):** Rewrote docs/user-journey.md with 10 practical daily flows, removed dummy/outdated scenarios
- [x] **2026-06-25 (session 4):** Updated RxPro-context.md with current architecture (SQLite, proxy.ts, Rubik, etc.)
- [x] **2026-06-25 (session 4):** Updated rxpro-manager.md with Playwright testing protocol + kingdom v1.1.0
- [x] **2026-06-25 (session 4):** Playwright-verified all practical flows: dashboard, patient search/select, history, console errors
- [x] **2026-06-25 (session 5):** C6 — doctor_id sourced from session cookie, not client body (route.ts overrides params.data.doctor_id)
- [x] **2026-06-25 (session 5):** H2 — DAL ownership checks on fetchAppointment, fetchPrescription, update*, delete* (appointments + prescriptions)
- [x] **2026-06-25 (session 5):** H4 — Origin/Referer CSRF check on /api/data (ALLOWED_ORIGIN env var, 403 on mismatch)
- [x] **2026-06-25 (session 5):** Backup — /api/backup secured with HMAC auth + origin check (Metis finding)
- [x] **2026-06-25 (session 5):** Queen Metis supervision — identified backup auth gap, coherence check on all 3 layers
- [x] **2026-06-25 (session 5):** L4-L12 polish — age max=150, follow-up min=today, mobile sidebar hamburger, devDeps cleanup, README, .npmrc + audit script, node engine
- [x] **All 44 audit findings resolved** (C1-C6, H1-H13, M1-M16, L1-L12)
- [x] Project scaffold with Next.js 16 + shadcn/ui 4.11 + Tailwind v4
- [x] 21 shadcn/ui components installed (base-nova style, @base-ui/react)
- [x] Core dependencies installed (tanstack-query, react-hook-form, yup, react-table, lucide-react, better-sqlite3)
- [x] SQLite database layer (src/lib/database.ts) - tables created, seed data
- [x] Server-side DAL (src/lib/dal.ts) - all CRUD operations (44 functions)
- [x] REST API endpoint (src/app/api/data/route.ts) - 44 actions via POST
- [x] Client API layer (src/api/api.ts) - all functions POST to /api/data
- [x] TanStack Query hooks (src/hooks/) - usePatients, useAppointments, usePrescriptions, useSetup, useDoctorInfo
- [x] Auth middleware (proxy.ts) - cookie-based token validation
- [x] Root layout with providers (CookiesProvider + QueryClientProvider + TooltipProvider + Rubik font)
- [x] Collapsible sidebar (9 nav items, slate-900, user profile + logout)
- [x] PageHeader component with optional actions slot
- [x] Route-level loading skeleton + error boundary with retry + not-found
- [x] Login page (gradient bg, centered card, password toggle, yup validation, cookie auth, mounted guard)
- [x] Dashboard (4 stat cards, CSS bar chart, recent activity table, loading/empty states)
- [x] Setup page (CRUD table with dialog forms, connected to API via useSetup hooks)
- [x] FavoriteSetup page (CRUD with structured section editor, connected to API)
- [x] FavoriteMedicine page (CRUD with dialog, connected to API)
- [x] Instruction page (tabbed UI with Instructions + Route Types, connected to API hooks)
- [x] DoctorInfo page (profile editor with header/footer templates, connected to API)
- [x] PatientInfo page (searchable table, expandable details, allergies, connected to API)
- [x] Appointments page (date filter, status badges, connected to API)
- [x] Prescription module FULL (12-section collapsible form, useFieldArray, react-hook-form + yup)
- [x] PrescriptionHistory (table + view dialog, loading skeleton, empty state, Download PDF button)
- [x] PrintPrescription (compact print layout, window.print(), 12 sections)
- [x] PDF export (dedicated /prescription/[id]/print route, auto-print trigger)
- [x] RxPro theme (Rubik font, blue-600 primary, slate-50 background)
- [x] prefers-reduced-motion support, scrollbar styling, print CSS classes
- [x] Persistent manager agent + memory system (.opencode/memory/)
- [x] tsc --noEmit: zero errors
- [x] npm run build: zero errors (17 routes, Proxy registered)
- [x] Git repository with 8+ meaningful commits
- [x] User journey documentation (docs/user-journey.md - 323 lines, 8 flows, 20 gaps)
- [x] Context checker agent + meta-cognition + self-review skills
- [x] **Phase 1**: Dashboard real data, URL params, patient search, edit button, delete confirmations, error toasts
- [x] **Phase 2**: Appointment auto-update, favorite medicines integration, Create Rx button on patient rows
- [x] **Phase 3**: Route types from DB, clone/duplicate prescription
- [x] **Production audit**: All 44 findings (C1-C6, H1-H13, M1-M16, L1-L12) resolved
- [x] **PDF export**: Print route + download button (Phase 1 feature)
- [x] **Model config**: Unified to deepseek-v4-flash-free (was mixture of minimax-m3, deepseek-v4-flash, mimo-v2.5 with wrong prefix)
- [x] **2026-06-25 (session 8):** Undone route restructure — moved prescription back from `(rx)` to `(app)` group
- [x] **2026-06-25 (session 8):** Fixed import path in `prescription-transform.ts` — `(rx)` → `(app)`
- [x] **2026-06-25 (session 8):** Deleted `(rx)` route group
- [x] **2026-06-25 (session 8):** Verified `tsc --noEmit` + `npm run build` pass (0 errors)
- [x] **2026-06-25 (session 8):** Playwright-verified sidebar visible on /prescription
- [x] **2026-06-25 (session 8):** Updated memory files — project closed

## Project: CLOSED

## Archived Tasks
- [ ] Fix `normalizeArray` in prescription-transform.ts — silently drops non-array data when `parseJson` returns string (deferred — project closed)

## Future Enhancements — Archived
- [ ] Guided first-time setup wizard
- [ ] Drug interaction checking in prescription form
- [ ] Pharmacy/dispense module
- [ ] Supabase migration (swap SQLite → Supabase)
- [ ] Doctor-specific data isolation
- [ ] Appointment reminders
- [ ] Per-doctor RLS policies

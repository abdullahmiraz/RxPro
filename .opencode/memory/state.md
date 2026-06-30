# RxPro - Project State Snapshot
**Last Updated:** 2026-06-30 (session 9: routine sync)

## 👑 Kingdom Status
- **Linked to:** OpenCode Kingdom v1.1.0 (Palace & Territories)
- **Kingdom repo:** https://github.com/abdullahmiraz/opencode-kingdom
- **Kingdom path:** `C:\Users\neo\.config\opencode\kingdom`
- **Agents source:** Palace (king/ + knights/) — territory agents operate from project dirs
- **King:** watches via `AGENTS.md` — Palace issues edicts, territories execute
- **CLI:** `./kingdom init/link/sync/promote/backup/restore/status`

## Build Status
- tsc --noEmit: ✅ PASSES (0 errors)
- npm run build: ✅ PASSES (0 errors, 16 routes, Proxy registered)
- E2E Playwright: ✅ All 9 routes navigated, 0 console errors, all API calls 200 OK

## Model Config (updated session 6)
- **All agents use `deepseek-v4-flash-free`** (no provider prefix — `opencode-go/` was broken)
- Config: `C:\Users\neo\.config\opencode\oh-my-openagent.jsonc`
- Old config used `opencode-go/deepseek-v4-flash` which doesn't exist
- AGENTS.md updated to match

## Security Hardening Complete (44/44 audit findings)
- C1-C6: ✅ Session-enforced doctor_id, DAL ownership checks, CSRF, backups secured
- H1-H13: ✅ All high-severity findings resolved
- M1-M16: ✅ All medium-severity findings resolved
- L1-L12: ✅ All low-severity polish (age max=150, follow-up min=today, mobile sidebar, shadcn/supabase devDeps, etc.)

## Phase 1 Feature Complete
- ✅ **PDF export** — dedicated print route at `/prescription/[id]/print` with auto-print trigger, "Download PDF" button in PrescriptionHistory view dialog (opens in new tab, browser print-to-PDF). Zero npm deps added.
- ✅ **JSON editor** — Favorite setup already had structured section editor (6 sections with add/remove items), not a raw textarea.

## File Count
- **Pages:** 12 (login, dashboard, setup, favorite-setup, favorite-medicine, instruction, doctor-info, patient-info, appointments, prescription, prescription/[id]/print, not-found)
- **Shared components:** Sidebar, PageHeader, Dashboard
- **shadcn/ui components:** 21 (button, card, table, dialog, input, label, select, separator, tooltip, dropdown-menu, badge, tabs, checkbox, switch, popover, command, sheet, breadcrumb, progress, pagination, textarea)
- **Data layer:** database.ts, dal.ts, route.ts, api.ts
- **Hooks:** 5 (usePatients, useAppointments, usePrescriptions, useSetup, useDoctorInfo) — useFavoriteMedicines, useRouteTypes also in useSetup
- **Prescription module:** types.ts, PrescriptionForm.tsx, PrescriptionHistory.tsx, PrintPrescription.tsx, prescription-transform.ts
- **Skills:** meta-cognition (PLAN→DECOMPOSE→EXECUTE→VERIFY), self-review (quality checklist)
- **Agent files:** 18 (5 royal + 11 knights + 2 project-specific from kingdom)
- **Plugin config:** oh-my-openagent + 3 @capybearista plugins

## Auth
- Login creds: admin / password (bcrypt-hashed, 12 rounds)
- Doctor ID: d1 (seeded in SQLite)
- Security word: password
- Login: POST /api/login (server-side) sets httpOnly+secure+SameSite cookies via next/headers
- API: HMAC-SHA256 signed tokens verified via crypto.timingSafeEqual
- Session enforcement: route.ts reads doctor_id from cookie token, overrides client body
- Rate limiting: 10 attempts/IP/60s sliding window on login
- CSRF: Origin/Referer validation on /api/data + /api/backup
- All single-record DAL operations verify doctor_id ownership

## Data Storage
- **Engine:** better-sqlite3 (local SQLite)
- **DB Path:** data/rxpro.db
- **Tables:** 10 tables (rx_doctors, rx_patients, rx_appointments, rx_prescriptions, rx_setups, rx_favorite_setups, rx_favorite_medicines, rx_instructions, rx_route_types, rx_doctor_info)
- **Seed data:** 1 doctor (admin) + doctor_info, 5 patients, 5 appointments, 3 setups, 2 favorite setups, 5 favorite medicines, 4 instructions, 5 route types

## API Architecture
Client → src/api/api.ts (POST /api/data) → src/app/api/data/route.ts → src/lib/dal.ts → src/lib/database.ts (better-sqlite3)

## Everything Implemented
- [x] Project scaffold (Next.js 16, Tailwind v4, shadcn/ui v4.11)
- [x] SQLite data layer + DAL (44 functions) + API route (44 actions)
- [x] Client API + TanStack Query hooks
- [x] Auth (login page + cookie middleware)
- [x] Layout (sidebar + page header + loading/error/not-found)
- [x] Dashboard (real API stats, real chart, real activity from API, Upcoming Appointments section with direct Create Rx links)
- [x] All CRUD pages connected to real API (Setup, FavoriteSetup, FavoriteMedicine, Instruction)
- [x] Doctor Info page (API-connected, auto-loads into prescription header)
- [x] Patient Info page (API-connected, search, expandable details, allergies, Create Rx button)
- [x] Appointments page (API-connected, date filter, auto-updates to completed)
- [x] Prescription module (12-section form, patient search, template loading, URL params, clone/edit, history with print/PDF download)
- [x] PDF export (/prescription/[id]/print route, auto-print trigger, Download PDF button)
- [x] All 44 audit findings resolved (C1-C6, H1-H13, M1-M16, L1-L12)
- [x] All gaps resolved (Phase 1+2+3): 20 gaps from user journey audit
- [x] Model config unified to deepseek-v4-flash-free (no more opencode-go/ prefix)

## Bug Fixes
- **2026-06-25 (session 6):** oh-my-openagent model config used non-existent `opencode-go/` prefix — changed to `deepseek-v4-flash-free` (no prefix) across all agents/categories. Background agents were entering fallback death spiral with wrong models.
- **2026-06-25 (session 6):** PrescriptionHistory dialog footer used raw `<div>` instead of `<DialogFooter>` — replaced per codebase convention.
- **2026-06-25:** Patient Info page expand chevron → blank page. `fetchPatients()` returned `allergies` as raw JSON string; expandable detail row called `.map()` on it. Added `parseJson()` in `fetchPatients()` (was already in `fetchPatient()`). Root cause: DAL inconsistency between list and single-get.
- **2026-06-25 (session 2):** Console error `Query data cannot be undefined` for `["doctorInfo","d1"]` — missing seed data in `rx_doctor_info` table. Added seed data for doctor `d1` with clinic name, address, templates.
- **2026-06-25 (session 2):** PrescriptionForm hardcoded `"d1"` — changed to read `doctor_id` from cookies (with `"d1"` fallback) so multi-doctor auth works.
- **2026-06-25 (session 2):** `src/middleware.ts` renamed to `proxy.ts` — Next.js 16 deprecated `middleware` in favor of `proxy`.
- **2026-06-25 (session 2):** Patient Info page missing `key` prop on `<></>` fragment in `TableBody` — fixed by using `<Fragment key={p.id}>`.
- **2026-06-25 (session 3):** Dashboard: Replaced hardcoded `recentActivity` with real data from appointments API; added "Upcoming Appointments" card with 5 scheduled appointments + "Create Rx" links. Stat card "Last 7 Days" → "Total Prescriptions".
- **2026-06-25 (session 4):** Rewrote `docs/user-journey.md` with 10 practical daily flows (not theoretical scenarios). Updated `RxPro-context.md` and `rxpro-manager.md` agents. Verified all flows with Playwright: dashboard live data, patient search+select, history empty state. Zero console errors.
- **2026-06-25 (session 5):** C6+H2+H4 security hardening. Route.ts now injects authenticated doctorId into all DAL calls (C6). Added doctor_id ownership checks to appointments & prescriptions DAL ops (H2). Added Origin/Referer CSRF protection (H4). Secured `/api/backup` with HMAC auth + origin check (Metis finding). All verified with 2 deep agents + Queen Metis supervision. 34/44 audit findings resolved.
- **2026-06-25 (session 7):** Old seed data stored plain-text `password` instead of bcrypt hash. Added inline migration in `seedData()` that detects non-bcrypt passwords (not starting with `$2`) and upgrades them on startup. New DB deletes get properly hashed seed via `hashPassword()`.
- **2026-06-25 (session 7):** Dead migration v1 (`ALTER TABLE rx_patients ADD COLUMN doctor_id`) removed from `database.ts` — column already created by `createTables()`. Old try/catch wrapper was flawed (silently swallowed real SQL errors). Oracle-reviewed, removed entirely.
- **2026-06-25 (session 8):** Route restructure undone — prescription moved back from `(rx)` to `(app)` group. Sidebar restored to /prescription page. `(rx)` group deleted. Print CSS retained: sidebar hidden during print via `print-hide` class in `(app)/layout.tsx` + `@media print` rule in `globals.css`. CSP `'unsafe-inline'` in `style-src` is ignored by browser when nonce is present (Next.js DevTools inline style CSP errors are dev-only, non-blocking).
- **2026-06-25 (session 8):** Project closed per user request. All 5 pending todos completed.

## Project Status: CLOSED
The RxPro project has been closed by the user. All planned features, security hardening, bug fixes, and print improvements are complete.

## Future Enhancements (Post-Phase 1) — Archived
1. Guided first-time setup wizard
2. Drug interaction checking
3. Pharmacy/dispense module
4. Supabase migration
5. Doctor-specific data isolation
6. Appointment reminders

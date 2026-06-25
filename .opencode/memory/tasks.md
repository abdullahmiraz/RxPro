# RxPro - Task Tracker
**Last Updated:** 2026-06-25

## Completed
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
- [x] Project scaffold with Next.js 16 + shadcn/ui 4.11 + Tailwind v4
- [x] 21 shadcn/ui components installed (base-nova style, @base-ui/react)
- [x] Core dependencies installed (tanstack-query, react-hook-form, yup, react-table, lucide-react, better-sqlite3)
- [x] SQLite database layer (src/lib/database.ts) - tables created, seed data
- [x] Server-side DAL (src/lib/dal.ts) - all CRUD operations (44 functions)
- [x] REST API endpoint (src/app/api/data/route.ts) - 44 actions via POST
- [x] Client API layer (src/api/api.ts) - all functions POST to /api/data
- [x] TanStack Query hooks (src/hooks/) - usePatients, useAppointments, usePrescriptions, useSetup, useDoctorInfo
- [x] Auth middleware (src/middleware.ts) - cookie-based token validation
- [x] Root layout with providers (CookiesProvider + QueryClientProvider + TooltipProvider + Rubik font)
- [x] Collapsible sidebar (9 nav items, slate-900, user profile + logout)
- [x] PageHeader component with optional actions slot
- [x] Route-level loading skeleton + error boundary with retry + not-found
- [x] Login page (gradient bg, centered card, password toggle, yup validation, cookie auth, mounted guard)
- [x] Dashboard (4 stat cards, CSS bar chart, recent activity table, loading/empty states)
- [x] Setup page (CRUD table with dialog forms, connected to API via useSetup hooks)
- [x] FavoriteSetup page (CRUD with dialog, connected to API via useFavoriteSetups hooks)
- [x] FavoriteMedicine page (CRUD with dialog, connected to API via useFavoriteMedicines hooks)
- [x] Instruction page (tabbed UI with Instructions + Route Types, connected to API hooks)
- [x] DoctorInfo page (profile editor with header/footer templates, connected to API)
- [x] PatientInfo page (searchable table, expandable details, allergies, connected to API)
- [x] Appointments page (date filter, status badges, connected to API)
- [x] Prescription module FULL (12-section collapsible form, useFieldArray, react-hook-form + yup)
- [x] PrescriptionHistory (table + view dialog, loading skeleton, empty state)
- [x] PrintPrescription (compact print layout, window.print(), 12 sections)
- [x] RxPro theme (Rubik font, blue-600 primary, slate-50 background)
- [x] prefers-reduced-motion support, scrollbar styling, print CSS classes
- [x] Persistent manager agent + memory system (.opencode/memory/)
- [x] tsc --noEmit: zero errors
- [x] npm run build: zero errors (6.5s compile, 15 pages generated)
- [x] Git repository with 7 meaningful commits
- [x] User journey documentation (docs/user-journey.md - 323 lines, 8 flows, 20 gaps)
- [x] Context checker agent + meta-cognition + self-review skills
- [x] **Phase 1**: Dashboard real data, URL params, patient search, edit button, delete confirmations, error toasts
- [x] **Phase 2**: Appointment auto-update, favorite medicines integration, Create Rx button on patient rows
- [x] **Phase 3**: Route types from DB, clone/duplicate prescription

## In Progress
(none - all Phase 1-3 gaps resolved)

## Future Enhancements
- [ ] Guided first-time setup wizard
- [ ] Structured JSON editor for favorite setup templates
- [ ] Drug interaction checking in prescription form
- [ ] Pharmacy/dispense module
- [ ] Supabase migration (swap SQLite → Supabase)
- [ ] PDF export of prescriptions
- [ ] Doctor-specific data isolation
- [ ] Appointment reminders
- [ ] Per-doctor RLS policies

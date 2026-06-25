# RxPro - Project State Snapshot
**Last Updated:** 2026-06-25 (afternoon session)

## Build Status
- tsc --noEmit: ✅ PASSES (0 errors)
- npm run build: ✅ PASSES (3.5s compile, 0 errors)

## File Count
- **Pages:** 11 (login, dashboard, setup, favorite-setup, favorite-medicine, instruction, doctor-info, patient-info, appointments, prescription, not-found)
- **Shared components:** Sidebar, PageHeader, Dashboard
- **shadcn/ui components:** 21 (button, card, table, dialog, input, label, select, separator, tooltip, dropdown-menu, badge, tabs, checkbox, switch, popover, command, sheet, breadcrumb, progress, pagination, textarea)
- **Data layer:** database.ts, dal.ts, route.ts, api.ts
- **Hooks:** 5 (usePatients, useAppointments, usePrescriptions, useSetup, useDoctorInfo) — useFavoriteMedicines, useRouteTypes also in useSetup
- **Prescription module:** types.ts, PrescriptionForm.tsx (999→1045 lines), PrescriptionHistory.tsx, PrintPrescription.tsx
- **Skills:** meta-cognition (PLAN→DECOMPOSE→EXECUTE→VERIFY), self-review (quality checklist)
- **Agent files:** 6 (rxpro-manager, RxPro-context, context-checker, memory/tasks, memory/decisions, memory/state)
- **Plugin config:** opencode-skillful, opencode-goal-plugin, oh-my-opencode, + 3 @capybearista plugins

## Auth
- Login creds: admin / password
- Doctor ID: d1 (seeded in SQLite)
- Security word: password
- Middleware validates base64 token with doctor_id match
- Storage: cookies (doctor_id, rx-token)

## Data Storage
- **Engine:** better-sqlite3 (local SQLite)
- **DB Path:** data/rxpro.db
- **Tables:** 10 tables (rx_doctors, rx_patients, rx_appointments, rx_prescriptions, rx_setups, rx_favorite_setups, rx_favorite_medicines, rx_instructions, rx_route_types, rx_doctor_info)
- **Seed data:** 1 doctor (admin), 5 patients, 5 appointments, 3 setups, 2 favorite setups, 5 favorite medicines, 4 instructions, 5 route types

## API Architecture
Client → src/api/api.ts (POST /api/data) → src/app/api/data/route.ts → src/lib/dal.ts → src/lib/database.ts (better-sqlite3)

## Everything Implemented
- [x] Project scaffold (Next.js 16, Tailwind v4, shadcn/ui v4.11)
- [x] SQLite data layer + DAL (44 functions) + API route (44 actions)
- [x] Client API + TanStack Query hooks
- [x] Auth (login page + cookie middleware)
- [x] Layout (sidebar + page header + loading/error/not-found)
- [x] Dashboard (real API stats, real chart, real activity)
- [x] All CRUD pages connected to real API (Setup, FavoriteSetup, FavoriteMedicine, Instruction)
- [x] Doctor Info page (API-connected, auto-loads into prescription header)
- [x] Patient Info page (API-connected, search, expandable details, allergies, Create Rx button)
- [x] Appointments page (API-connected, date filter, auto-updates to completed)
- [x] Prescription module (12-section form, patient search, template loading, URL params, clone/edit, history with print/print)
- [x] All gaps resolved (Phase 1+2+3): 20 gaps from user journey audit

## Bug Fixes
- **2026-06-25:** Patient Info page expand chevron → blank page. `fetchPatients()` returned `allergies` as raw JSON string; expandable detail row called `.map()` on it. Added `parseJson()` in `fetchPatients()` (was already in `fetchPatient()`). Root cause: DAL inconsistency between list and single-get.

## Future Enhancements (Low Priority)
1. Guided first-time setup wizard
2. Structured JSON editor for favorite setup templates
3. Drug interaction checking
4. Pharmacy/dispense module
5. Supabase migration
6. PDF export
7. Doctor-specific data isolation
8. Appointment reminders

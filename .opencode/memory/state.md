# RxPro - Project State Snapshot
**Last Updated:** 2026-06-24

## Build Status
- tsc --noEmit: ✅ PASSES (0 errors)
- npm run build: ✅ PASSES (6.5s compile, 0 errors)

## File Count
- **Pages:** 11 (login, dashboard, setup, favorite-setup, favorite-medicine, instruction, doctor-info, patient-info, appointments, prescription, not-found)
- **Shared components:** Sidebar, PageHeader, Dashboard
- **shadcn/ui components:** 21 (button, card, table, dialog, input, label, select, separator, tooltip, dropdown-menu, badge, tabs, checkbox, switch, popover, command, sheet, breadcrumb, progress, pagination, textarea)
- **Data layer:** database.ts, dal.ts, route.ts, api.ts
- **Hooks:** 5 (usePatients, useAppointments, usePrescriptions, useSetup, useDoctorInfo)
- **Prescription module:** types.ts, PrescriptionForm.tsx, PrescriptionHistory.tsx, PrintPrescription.tsx
- **Config:** components.json, opencode.json, openext.config.ts, postcss.config.mjs, tsconfig.json
- **Agent files:** 4 (rxpro-manager, RxPro-context, memory/tasks, memory/decisions, memory/state)

## Auth
- Login creds: admin / password
- Doctor ID: d1 (seeded in SQLite)
- Security word: password
- Middleware validates base64 token with doctor_id match
- Storage: cookies (doctor_id, rx-token)

## Data Storage
- **Engine:** better-sqlite3 (local SQLite)
- **DB Path:** data/rxpro.db
- **Tables:** rx_doctors, rx_patients, rx_appointments, rx_prescriptions, rx_setups, rx_favorite_setups, rx_favorite_medicines, rx_instructions, rx_route_types, rx_doctor_info
- **Seed data:** 1 doctor (admin), 5 patients, 5 appointments, 3 setups, 2 favorite setups, 5 favorite medicines, 4 instructions, 5 route types

## API Architecture
Client → src/api/api.ts (POST /api/data) → src/app/api/data/route.ts → src/lib/dal.ts → src/lib/database.ts (better-sqlite3)

## Everything Implemented
- [x] Project scaffold (Next.js 16, Tailwind v4, shadcn/ui v4.11)
- [x] SQLite data layer (database.ts + dal.ts + API route)
- [x] Client API layer (api.ts) + TanStack Query hooks
- [x] Auth (login page + cookie middleware)
- [x] Layout (sidebar + page header + loading/error/not-found)
- [x] Dashboard (stats + chart + activity table)
- [x] CRUD pages (setup, favorite-setup, favorite-medicine, instruction) - all API-connected
- [x] Doctor Info page (API-connected)
- [x] Patient Info page (API-connected, with allergies + search)
- [x] Appointments page (API-connected, with date filter)
- [x] Prescription module (12-section form, history, print)
- [x] RxPro theme (Rubik font, blue-600, slate-50)
- [x] Agent memory system (manager agent + task tracker + decision log)

## Next Up for Future Sessions
1. Add drug interaction checking to prescription form
2. Add search/filter to prescription history
3. Add pagination to tables
4. Add medication history view on patient details
5. Add appointment → prescription flow (pass appointment_id)
6. Add pharmacy/dispense module
7. Swap SQLite → Supabase (only dal.ts + api.ts need changes)
8. Add proper error handling with toast notifications
9. Add data export (PDF of prescriptions)
10. Add doctor-specific data isolation

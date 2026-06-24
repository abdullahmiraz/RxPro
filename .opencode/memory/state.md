# RxPro - Project State Snapshot
**Last Updated:** 2026-06-24

## Build Status
- tsc --noEmit: ✅ PASSES (0 errors)
- npm run build: ❌ NOT YET RUN

## File Count
- Total pages: 11 (login, dashboard, setup, favorite-setup, favorite-medicine, instruction, doctor-info, patient-info, appointments, prescription, not-found)
- Component files: ~25 (sidebar, page-header, dashboard, login, 21 shadcn/ui components)
- Data layer: database.ts, dal.ts, route.ts, api.ts, 5 hook files
- Config files: components.json, opencode.json, tsconfig.json, next.config.ts, postcss.config.mjs

## Auth
- Login creds: admin / password
- Doctor ID: d1 (seeded in SQLite)
- Middleware validates base64 token

## Critical Notes
- prescription/components/ directory is MISSING - needs PrescriptionForm.tsx, PrescriptionHistory.tsx, PrintPrescription.tsx, types.ts
- All CRUD pages use LOCAL STATE instead of TanStack Query hooks - needs refactoring
- DoctorInfo, PatientInfo, Appointments have some API usage mixed with local state

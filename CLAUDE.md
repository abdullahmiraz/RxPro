@AGENTS.md

## Session 2026-06-25 — Port 3000 & Patient Info Fix

### What was done
1. **Killed port 3005**, started dev server on **port 3000**
2. **Fixed patient-info expand crash** — `fetchPatients()` in `src/lib/dal.ts:49` returned `allergies` as a raw JSON string from SQLite. The expandable row called `.map()` on it → blank page. Added `parseJson()` parsing to match `fetchPatient`.

### Status
- Dev server: http://localhost:3000
- Only uncommitted change: `src/lib/dal.ts`

# RxPro - Task Tracker
**Last Updated:** 2026-06-24

## Completed
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
- [x] Git repository with 2 meaningful commits

## In Progress
(none - all tasks complete)

## Future Enhancements
- [ ] Drug interaction checking in prescription form
- [ ] Search/filter for prescription history
- [ ] Pagination for all tables
- [ ] Medication history view in patient details
- [ ] Appointment → prescription flow (pass appointment_id)
- [ ] Pharmacy/dispense module
- [ ] Supabase migration (swap SQLite → Supabase)
- [ ] Toast notifications for error handling
- [ ] PDF export of prescriptions
- [ ] Doctor-specific data isolation
- [ ] Per-doctor RLS policies
- [ ] Appointment reminders
- [ ] Prescription templates from favorite setups

### Identified Gaps (from User Journey Audit)
- [GAP] Dashboard shows demo data instead of real SQLite counts (Dashboard.tsx:24-41)
- [GAP] Prescription form doesn't read URL params (appointment_id, patient_id) (PrescriptionForm.tsx:539)
- [GAP] No edit prescription flow (PrescriptionHistory.tsx:178-187 — view only)
- [GAP] No delete confirmation dialogs on CRUD pages (all: Setup, FavoriteSetup, FavoriteMedicine, Instruction, Appointments, PatientInfo)
- [GAP] Appointment status doesn't auto-update when prescription created (AppointmentsPage.tsx:149-161)
- [GAP] Doctor info doesn't auto-load on prescription header (PrescriptionForm.tsx:721-780)
- [GAP] Patient allergies/medication history displayed as raw JSON string in prescription dialog (PrescriptionHistory.tsx:273-300)
- [GAP] Patient ID is free-text input with no searchable patient selector (PrescriptionForm.tsx:789-803)
- [GAP] Silent mutation error handling (all CRUD pages — catch blocks have no toast/feedback)
- [GAP] Favorite medicines not integrated into prescription drug autocomplete (hardcoded DRUG_OPTIONS at PrescriptionForm.tsx:63-74)
- [GAP] Route types hardcoded in form instead of loaded from DB (PrescriptionForm.tsx:76-84)
- [GAP] No print/reprint button in prescription history view dialog
- [GAP] No "Create Prescription" button on patient info rows
- [GAP] No clone/duplicate from previous prescription

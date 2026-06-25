# RxPro - Practical User Journeys

**Persona:** Dr. Sarah Chen — GP at a small private clinic, 15-25 patients/day

---

## System Overview

| Module | Purpose | Operations |
|--------|---------|------------|
| Login | Cookie auth (`doctor_id` + `rx-token`) | Login / logout |
| Dashboard | Stats, upcoming appointments, activity | Read-only (live data) |
| Appointments | Schedule & manage visits | Full CRUD, links to prescription |
| Patient Info | Patient registry with allergies | Full CRUD, expandable detail |
| Doctor Info | Doctor profile, header/footer templates | Upsert |
| Prescription | 12-section form, print, history | Create / View / Clone / Reprint |
| Setup | Generic configs | Full CRUD |
| Favorite Setup | Named templates for prescription | Full CRUD |
| Favorite Medicine | Drug catalog | Full CRUD (integrated in Rx form) |
| Instruction | Instructions + route types | Full CRUD |

**Auth:** `admin` / `password` (base64 cookie token, proxy validation)  
**DB:** SQLite via POST `/api/data` → DAL → better-sqlite3  
**Data flow:** Client component → `api.ts` → API route → `dal.ts` → SQLite

---

## Flow 1: First-Time Setup

```
/login → /dashboard (sees "Getting Started" banner)
       → /doctor-info → fill profile
       → /setup → add base configs
       → /favorite-setup → create prescription templates
       → /favorite-medicine → add commonly prescribed drugs
       → /patient-info → add first patients
```

**Key behaviors:**
- Dashboard shows "Getting Started" banner with quick links until doctor info is filled
- Doctor info auto-populates prescription header once saved
- Favorite medicines appear in prescription drug autocomplete
- Favorite setups can be loaded into new prescriptions via template dropdown

**Previously broken, now fixed:**
- ✅ Doctor info auto-populates prescription header (seed data + cookie)
- ✅ Favorite medicines integrated into prescription drug autocomplete
- ✅ Route types loaded from DB (not hardcoded)

---

## Flow 2: Morning Rounds — Check Schedule

```
/login → /dashboard
       → view 4 stat cards (patients visited, future appts, prescriptions, total Rx)
       → view "Upcoming Appointments" card (next scheduled with Create Rx links)
       → view weekly chart + recent activity
       → optionally → /appointments for full schedule
```

**What the doctor sees:**
- **Patients Visited:** count of patients in DB
- **Future Appointments:** count of scheduled appointments
- **Medicines Prescribed:** count of prescriptions
- **Total Prescriptions:** running total
- **Upcoming Appointments:** up to 5 scheduled appts with patient name, time, reason, and a direct "Create Rx" link
- **Recent Activity:** last 5 appointments (scheduled/completed/cancelled) from live data
- **Weekly chart:** bar chart (currently demo data — static)

**Practical scenarios that work:**
- Doctor can click "Create Rx" directly from dashboard → pre-selected patient + appointment
- Doctor can click "View All" → navigate to full appointments page
- Doctor sees real counts, not demo data

---

## Flow 3: Patient Consultation — New Prescription

```
/login → /prescription → New Prescription tab
       → Header Data auto-filled from doctor info
       → Search patient by name → select from dropdown → patient ID auto-filled
       → Expand sections as needed:
         Complaints → enter symptoms + duration
         Comorbidity → add existing conditions
         Examination → record vitals
         Diagnosis → enter findings
         Medications → pick from favorite medicines autocomplete
         Investigation → order tests
         Advice → give instructions
         Follow Up → schedule return
       → Save Prescription → toast success → auto-resets form
       → Preview → see formatted layout
       → Print → window.print() (or save PDF)
```

**Key behaviors:**
- Patient search shows matching names as you type — click to select, shows ID/details
- Header data pre-filled from doctor_profile (clinic name, address, license)
- Favorite medicines appear in the drug dropdown
- Template can be loaded first if a favorite setup matches the condition
- All 12 sections are collapsible — only complaints is open by default
- Saving auto-updates linked appointment status to "completed"

**Error handling:**
- Missing required fields → yup validation blocks submission
- Save failure → toast error with message
- Network issue → mutation hangs, form stays intact

---

## Flow 4: Appointment-Driven Prescription

```
/login → /appointments
       → see today's/week's schedule in table
       → filter by date using date picker
       → click "Create Rx" (FileText icon) on a Scheduled appointment
       → redirected to /prescription?patient_id=X&appointment_id=Y
       → patient auto-selected, appointment linked
       → fill form → save → appointment auto-updates to "completed"
       → go back to /appointments → status shows "completed"
```

**What's automated:**
- ✅ URL params `patient_id` and `appointment_id` are read and applied
- ✅ Patient is auto-selected from the patient list
- ✅ Saving prescription triggers `updateAppointment({ status: "completed" })`
- ✅ No manual status change needed

---

## Flow 5: Follow-Up Visit — Clone Previous Prescription

```
/login → /prescription → History tab
       → search by patient name in search bar
       → find previous prescription in paginated list
       → click "Clone" (Copy icon)
       → redirected to /prescription?clone_id=X
       → all previous data loaded into form (header, complaints, meds, etc.)
       → doctor modifies: updates complaints, changes dosage, adds new meds
       → Save → new prescription created (original unchanged)
       → Preview → Print → give to patient
```

**Why this matters:** A returning patient doesn't need to retype everything. Clone the last visit, update what changed, save as new. The old prescription stays in history for reference.

**Behavior:**
- Clone button on every history row
- Full form populated from stored JSON data
- Doctor can change anything before saving
- Original prescription remains untouched in history

---

## Flow 6: Reprint a Lost Prescription

```
/login → /prescription → History tab
       → search by patient name
       → find the prescription
       → click "View" (Eye icon) → dialog shows all details
       → click "Print" inside dialog → window.print() with formatted layout
      *(optional)* → clone → modify → re-save if changes needed
```

**Two paths to reprint:**
1. **View → Print** — opens print dialog with the exact formatted prescription
2. **Clone → modify → Save → Print** — if the patient needs a different dosage/medication

---

## Flow 7: Update Patient Info → New Prescription

```
/login → /patient-info
       → search for returning patient
       → click expand chevron → view current details, allergies, medication history
       → click Edit (Pencil) → update phone, address, or allergies
       → navigate to /prescription
       → search and select patient → create prescription with current info
```

**Why this matters:** Patients change phone numbers, addresses, or develop new allergies between visits. Doctor updates before prescribing.

---

## Flow 8: Quick Template Prescription

```
/login → /prescription → New Prescription tab
       → in "Load Template" section, select a Favorite Setup from dropdown
       → click "Apply Template"
       → template data populates: complaints, examination, diagnosis, meds, advice
       → doctor tweaks as needed (adds details, adjusts dosages)
       → select patient → save
```

**Use case:** Common conditions (hypertension, diabetes, UTI) have pre-made templates. Doctor loads, customizes, and saves in under a minute.

---

## Flow 9: Manage Reference Data

```
/setup           → add/edit/delete base configurations
/favorite-setup  → create/edit/delete prescription templates (with JSON data)
/favorite-medicine → add/edit/delete drug catalog entries
/instruction     → manage instructions + route types via tabs
```

**CRUD behavior on all pages:**
- Table view with all records
- "Add" button opens dialog form
- Edit (Pencil) opens pre-filled dialog
- Delete shows confirmation dialog ("Delete X? This cannot be undone.")
- Success toast on create/update/delete
- Error toast on failure

---

## Flow 10: End of Day — Review & Wrap

```
/login → /dashboard
       → check "Patients Visited" count for the day
       → check "Future Appointments" for tomorrow
       → review recent activity for any missed actions
       → /appointments → verify all today's appts are "completed" or "cancelled"
       → logout
```

---

## Data Flow Architecture

```
┌──────────────┐    POST /api/data    ┌──────────────┐    DAL call    ┌───────────┐
│  Client       │ ──────────────────→ │  API Route     │ ────────────→ │  DAL      │
│  (React SPA)  │ ←────────────────── │  dispatcher    │ ←──────────── │  (44 fn)  │
└──────────────┘    JSON response     └──────────────┘               └─────┬─────┘
                                                                           │
                                                                    ┌──────▼──────┐
                                                                    │  SQLite DB  │
                                                                    │  10 tables  │
                                                                    └─────────────┘
```

**Client → API:** `api.ts` calls `POST /api/data` with `{ action, ...params }`  
**API → DAL:** `route.ts` switches on action, calls DAL function  
**DAL → SQLite:** Prepared statements on `better-sqlite3` instance

---

## Data Relationships

```
Doctor (rx_doctors)
  ├── Doctor Info (rx_doctor_info) — 1:1
  ├── Patients (rx_patients)
  ├── Appointments (rx_appointments) — linked to patient via patient_id
  ├── Prescriptions (rx_prescriptions) — linked to patient, doctor
  ├── Setups (rx_setups)
  ├── Favorite Setups (rx_favorite_setups)
  ├── Favorite Medicines (rx_favorite_medicines)
  ├── Instructions (rx_instructions)
  └── Route Types (rx_route_types)
```

---

## Known Gaps (As of 2026-06-25)

| # | Gap | Location | Priority |
|---|-----|----------|----------|
| 1 | Weekly chart uses demo data, not real stats | Dashboard.tsx | Low |
| 2 | No guided first-time setup wizard | — | Low |
| 3 | Structured JSON editor for favorite setup templates | FavoriteSetupPage | Low |
| 4 | Drug interaction checking in prescription form | PrescriptionForm | Low |
| 5 | Pharmacy/dispense module | — | Future |
| 6 | Supabase migration | — | Future |
| 7 | Doctor-specific data isolation | — | Future |
| 8 | Appointment reminders | — | Future |

### Resolved Gaps (from earlier audit)

| # | Gap | Fix |
|---|-----|-----|
| ✅ | Dashboard showed demo data | Replaced with real API counts + Upcoming Appointments card |
| ✅ | Prescription form ignored URL params | Reads `patient_id`, `appointment_id`, `clone_id` from URL |
| ✅ | Patient ID was free-text field | Replaced with searchable patient selector + autocomplete |
| ✅ | No edit prescription flow | Clone feature allows modification → re-save |
| ✅ | No delete confirmation | Confirmation dialog on all CRUD pages |
| ✅ | Silent mutation errors | Toast on success + error for all mutations |
| ✅ | JSON strings in history dialog | Dialog shows formatted data |
| ✅ | Appointment status not auto-updated | Auto-sets to "completed" on prescription save |
| ✅ | Doctor info not auto-loaded in prescription | Header auto-populated from DB |
| ✅ | Favorite medicines not in form | Drug autocomplete uses favorite medicines |
| ✅ | Route types hardcoded | Loaded from route_types table via API |
| ✅ | No print from history | Print button in view dialog |
| ✅ | No clone from previous | Clone button navigates to form with pre-filled data |
| ✅ | No Create Rx button on patient row | FileText icon added |
| ✅ | No error toasts on CRUD failures | All pages have success/error toasts |
| ✅ | middleware.ts deprecated | Migrated to proxy.ts |
| ✅ | Missing key prop in PatientInfo TableBody | Fixed with `<Fragment key={p.id}>` |

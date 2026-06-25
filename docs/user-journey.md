# RxPro - User Journey & Flow Documentation

## User Persona
**Dr. Sarah Chen** - General Practitioner at a small private clinic
- Sees 15-25 patients daily
- Needs fast prescription generation between consultations
- Manages appointments via printed schedule
- Requires patient history for follow-up visits
- Values quick setup and minimal typing

## System Overview

RxPro is a single-doctor prescription management system with 9 core modules:

| Module | Purpose | CRUD | 
|--------|---------|------|
| Login | Cookie-based auth with `doctor_id` + `rx-token` | Login only |
| Dashboard | Overview stats, weekly chart, recent activity | Read-only (demo data) |
| Appointments | Schedule and manage patient visits | Full CRUD + navigate to prescription |
| Patient Info | Patient registry with allergies and history | Full CRUD + expandable details |
| Doctor Info | Doctor profile with prescription header/footer | Upsert |
| Prescription | 12-section collapsible form, print, history | Create + View only (no edit) |
| Setup | Generic configurations | Full CRUD |
| Favorite Setup | Named templates loaded into prescription form | Full CRUD |
| Favorite Medicine | Frequently prescribed drugs reference | Full CRUD (unused in form) |
| Instruction | Standard instructions and route types | Full CRUD |

**Auth:** `admin` / `password` (plain-text `security_word` check, base64 token)
**Database:** SQLite via custom REST endpoint (`/api/data`)
**Data pattern:** Client → `fetch()` POST → Next.js API Route → DAL → SQLite

---

## Flow 1: First-Time Setup

```
/login → /doctor-info → /setup → /favorite-setup → /favorite-medicine → /patient-info
```

**Steps:**
1. Navigate to `/` → redirects to `/login`
2. Enter doctor name `admin` and password `password` → POST `/api/data` action `fetchDoctorByCredentials`
3. Cookie `doctor_id` + `rx-token` set → redirect to `/dashboard`
4. Dashboard shows demo stats (128 patients, 24 appointments, 356 medicines, +12%)
5. Click Sidebar → **Doctor Info** → fill in name, email, phone, qualifications, license, clinic, address, header/footer
6. Click **Setup** → add setup configs (generic name/type/description entries)
7. Click **Favorite Setup** → create saved prescription templates
8. Click **Favorite Medicine** → add commonly prescribed drugs with dosage, route, instructions
9. Click **Patient Info** → add first patients manually

**Status:** ✅ Core flow works. Setup/Doctor Info/Favorite pages all connected to API.

**Gaps:**
- ❌ Doctor info doesn't auto-populate prescription form header
- ❌ Favorite medicines not integrated into prescription form (form has hardcoded DRUG_OPTIONS list)
- ❌ No guided first-time wizard/onboarding

---

## Flow 2: Daily Workflow - Appointment-Driven

```
/login → /dashboard → /appointments → /prescription?appointment_id=X&patient_id=Y → Fill form → Save → Print → Complete appointment
```

**Steps:**
1. Login → redirect to `/dashboard`
2. Dashboard shows demo stats (not real counts)
3. Click Sidebar → **Appointments** → views scheduled appointments in table
4. Filter by date using date picker
5. Click the prescription icon (FileText) on a **Scheduled** appointment row
6. Navigates to `/prescription?appointment_id=<id>&patient_id=<id>`
7. Fill in the 12-section collapsible prescription form (Complaints → Comorbidity → Examination → On Examination → Diagnosis → Medications → Investigation → On Investigation → Advice → Follow Up)
8. Click **Save Prescription** → POST to API → toast "Prescription saved successfully" → form resets
9. Click **Preview** → switches to PrintPrescription view
10. Click **Print** → `window.print()`
11. Switch to **History** tab → see the saved prescription
12. Go back to Appointments → manually update status to "Completed" via edit dialog

**Status:** ✅ Path works for create + print. URL params passed from appointments.

**Gaps:**
- ❌ Prescription form doesn't read URL params (`appointment_id`, `patient_id` are passed but ignored)
- ❌ Appointment status doesn't auto-update when prescription is created
- ❌ Patient ID is a free-text field (should be a searchable patient selector)
- ❌ Dashboard shows demo data, not real counts from DB
- ❌ No 1-click "Complete Appointment" from prescription success callback
- ❌ Doctor info doesn't auto-fill prescription header

---

## Flow 3: Daily Workflow - Patient-Driven

```
/login → /patient-info → Search → View History → New Prescription → Print
```

**Steps:**
1. Login → `/dashboard`
2. Click Sidebar → **Patient Info**
3. Type patient name in search bar → `useMemo` filter narrows results
4. Click expand chevron → view expandable row with contact details, allergies, medication history
5. Click **Pencil** icon → edit patient details in dialog
6. Navigate to **Prescription** via sidebar (no direct link from patient page)
7. Type the Patient ID manually into the free-text field
8. Fill prescription, save, print

**Status:** ✅ Patient CRUD works. Search, expand, edit all functional.

**Gaps:**
- ❌ No button on patient row to "Create Prescription" (must manually navigate + type ID)
- ❌ Patient ID is typed manually - risk of error, no validation that patient exists
- ❌ Patient allergies/medication history not displayed on prescription form
- ❌ Medication history in patient info just shows list strings from DB - not structured

---

## Flow 4: Daily Workflow - Quick Prescription

```
/login → /prescription → Load Template → Select Patient → Fill Sections → Save → Print
```

**Steps:**
1. Click Sidebar → **Prescription**
2. Default tab is "New Prescription"
3. **Load Template** section at top - select a Favorite Setup from dropdown and click "Apply Template"
4. Template populates Complaints, Examination, Investigation, Diagnosis, Advice, Medications with string arrays from JSON
5. Type Patient ID
6. Expand sections one by one - fill remaining details
7. For medications: use `<datalist>` suggestions from hardcoded DRUG_OPTIONS
8. Click **Save Prescription** → saved to DB, toast confirmation
9. Click **Preview** → see formatted prescription, click Print

**Status:** ✅ Template loading works. All 12 sections functional.

**Gaps:**
- ❌ Template only loads string data - dosage, duration, route, frequency must be re-entered
- ❌ DRUG_OPTIONS is hardcoded (10 drugs) - not using favorite medicines from DB
- ❌ No drug autocomplete from favorite medicines API
- ❌ Patient must be selected by typing ID - no patient lookup/selector
- ❌ No validation that patient_id exists in patients table
- ❌ Favorite medicines route types hardcoded in form (ROUTE_OPTIONS) - not from route types API

---

## Flow 5: Follow-Up Visit

```
Patient returns → /patient-info → Search → View History → /prescription → Reference Previous → Create New
```

**Steps:**
1. Patient returns for follow-up
2. Search for patient in **Patient Info**
3. Expand to view medication history (plain strings from DB)
4. Navigate to **Prescription History** tab
5. Search by patient name → find previous prescription
6. Click **Eye icon** → Dialog shows: Patient, Patient ID, Date, Status, Complaints (string), Diagnosis (string), Medications (string)
7. Close dialog → switch to **New Prescription** tab
8. Re-type all data manually (no "Clone from Previous" feature)
9. Save and print

**Status:** ✅ View history works. Dialog shows basic info.

**Gaps:**
- ❌ Prescription detail dialog shows JSON strings for complaints/diagnosis/medications (not formatted)
- ❌ No "Clone Previous Prescription" feature
- ❌ No "Edit" button on prescription history records (view-only)
- ❌ No reference to previous prescription data on new form
- ❌ No ability to reprint a saved prescription directly from history

---

## Flow 6: Managing Reference Data

```
Setup Management:
→ /setup → Add/Edit/Delete configurations (name, type, description)

Favorite Setups (Prescription Templates):
→ /favorite-setup → Add/Edit/Delete templates (name, description, notes/JSON data)

Favorite Medicines (Drug Catalog):
→ /favorite-medicine → Add/Edit/Delete medicines (name, genericName, dosage, instructions, routeType)

Instructions & Route Types:
→ /instruction → Tabs: Instructions / Route Types → Add/Edit/Delete
```

**Status:** ✅ All four pages follow the same CRUD pattern with Table + Dialog form. All connected to API hooks. All have loading skeletons and empty states.

**Gaps:**
- ❌ No delete confirmation dialog on any reference data page
- ❌ Favorite medicines not consumed by prescription form
- ❌ Route types from DB not consumed by prescription form (hardcoded ROUTE_OPTIONS)
- ❌ No error toasts on mutation failures (all `catch { // mutation error }`)
- ❌ Notes field in favorite-setup is free text, not structured template JSON editor

---

## Flow 7: Review & Reprint

```
/prescription → History tab → Search → View → (cannot reprint directly)
```

**Steps:**
1. Click **Prescription** → **History** tab
2. Search by patient name
3. Paginated list with Date, Patient Name, Patient ID, Status badge
4. Click **Eye icon** → Dialog shows basic details
5. No way to see full formatted prescription from history
6. No way to reprint
7. No way to edit

**Status:** ❌ Basic view exists but no reprint or edit capability.

**Gaps:**
- ❌ No "Print" button on history view dialog
- ❌ No "Edit" button on history records
- ❌ No direct navigation from history record to prescription form with data pre-filled

---

## Flow 8: Error Recovery

**What happens when something goes wrong:**

| Scenario | Current Behavior | Gap |
|----------|-----------------|-----|
| Invalid login | Error message in red banner above form | ✅ Works |
| API fetch fails | Query retries (TanStack Query default) | ✅ Works |
| Create/update fails | `catch { // mutation error }` - silent failure | ❌ No toast/feedback |
| Delete fails | `mutation error` silently caught | ❌ No user feedback |
| Network down during save | Mutation never completes, form stays | ❌ No timeout feedback |
| Invalid patient ID | Form saves successfully (no validation) | ❌ No check patient exists |
| Prescription history empty | Shows empty state with "Create first prescription" | ✅ Works |
| Favorites empty | Shows "No templates available" | ✅ Works |

---

## Data Relationships

```
Doctor (rx_doctors)
  ├── Appointments (appointments) ← doctor_id FK
  ├── Patients (patients) ← no explicit FK (patient_id is free text)
  ├── Prescriptions (prescriptions) ← doctor_id FK, patient_id free text
  ├── Doctor Info (doctor_info) ← doctor_id FK (1:1)
  ├── Setups (setups) ← doctor_id FK (doctor_id column assumed)
  ├── Favorite Setups (favorite_setups) ← doctor_id FK
  ├── Favorite Medicines (favorite_medicines) ← doctor_id FK
  ├── Instructions (instructions) ← doctor_id FK
  └── Route Types (route_types) ← doctor_id FK
```

**Key Observation:** `patient_id` is a **free-text string** in both appointments and prescriptions - there is no formal foreign key relationship between prescriptions and patients. This means:
- Patient names can be inconsistent across prescriptions
- No enforcement that a prescription references a valid patient
- Patient info page and prescription form operate on independent IDs

---

## Missing Features & Gaps Summary

### Critical Gaps
| # | Gap | Location | Impact |
|---|-----|----------|--------|
| 1 | Dashboard shows demo data | `Dashboard.tsx:24-41` | Useless for real clinic |
| 2 | Prescription form ignores URL params | `PrescriptionForm.tsx:539-543` | Appointment → Prescription flow broken |
| 3 | No edit prescription flow | `PrescriptionHistory.tsx:178-187` | Cannot correct mistakes |
| 4 | No delete confirmation | All CRUD pages | Accidental data loss |
| 5 | Patient ID is free text | `PrescriptionForm.tsx:789-803` | Errors, duplicates, no validation |
| 6 | Silent mutation errors | All form submit handlers | User not notified of failures |
| 7 | JSON strings in history dialog | `PrescriptionHistory.tsx:273-300` | Unreadable data |
| 8 | Appointment status not auto-updated | `AppointmentsPage.tsx` | Manual step required |

### Moderate Gaps
| # | Gap | Location | Impact |
|---|-----|----------|--------|
| 9 | Doctor info not auto-loaded in prescription | `PrescriptionForm.tsx` | Redundant typing every time |
| 10 | Favorite medicines not used in form | `PrescriptionForm.tsx:63-74` | Duplicate reference data |
| 11 | No patient selector component | `PrescriptionForm.tsx:789` | UX friction, errors |
| 12 | No print from history | `PrescriptionHistory.tsx:224-305` | Cannot reprint |
| 13 | No clone from previous prescription | Full stack | Cannot use past work |
| 14 | Route types hardcoded, not from DB | `PrescriptionForm.tsx:76-84` | Maintenance burden |
| 15 | Appointment table has no patient_id column | `AppointmentsPage.tsx:210-261` | Broken link to patient |

### Minor Gaps
| # | Gap | Location | Impact |
|---|-----|----------|--------|
| 16 | No "Create Prescription" button on patient row | `PatientInfoPage.tsx` | Extra navigation step |
| 17 | No guided first-time setup | - | New users confused |
| 18 | Template editor is free text, not structured | `FavoriteSetupPage.tsx` | Error-prone JSON entry |
| 19 | No error toasts on CRUD failures | All pages | Unnoticed failures |
| 20 | Favorite setups name mismatched with form sections | Schema vs UI | Confusing template mapping |

---

## Action Items

### Phase 1: Fix Broken Flows (High Priority)
1. Read URL params (`appointment_id`, `patient_id`) in PrescriptionForm
2. Replace hardcoded dashboard stats with real DB counts
3. Add patient selector (search/autocomplete) to prescription form
4. Add edit button to prescription history (with `updatePrescription` hook already exists)
5. Add delete confirmation dialog to ALL CRUD pages
6. Show error toasts on mutation failures

### Phase 2: UX Improvements (Medium Priority)
7. Auto-load doctor info into prescription header
8. Auto-update appointment status to "Completed" on prescription save
9. Integrate favorite medicines into prescription drug autocomplete
10. Format JSON data in prescription history dialog
11. Add "Print" button to prescription history dialog
12. Add "Create Prescription" button to patient info rows

### Phase 3: Polish (Low Priority)
13. Load route types from DB instead of hardcoding
14. Add clone/duplicate prescription feature
15. Add guided first-time setup wizard
16. Structured JSON editor for favorite setup templates

# RxPro — Production-Readiness Audit

**Date:** 2026-06-25 14:30 UTC
**Method:** 5 parallel deep agents (auth, data layer, API, frontend, architecture/ops)
**Model:** `opencode-go/glm-5.1` (deep agents)

---

## Executive Summary

RxPro is feature-complete but has **critical security vulnerabilities** that must be resolved before production deployment. The auth proxy (`src/proxy.ts`) IS working (Next.js 16 renamed middleware to proxy — `ƒ Proxy (Middleware)` in build output confirms it). However, the proxy intentionally excludes `/api/*` routes per its `matcher`, and the API route handler has **zero authentication** of its own.

**Total findings:** 44 across all categories

---

## 🔴 Critical (Fix Immediately)

### C1 — API route has zero authentication (NOT the proxy — proxy works)
- **File:** `src/app/api/data/route.ts:46-61`
- **Note:** `src/proxy.ts` IS correctly named for Next.js 16 (middleware → proxy rename). Build output shows `ƒ Proxy (Middleware)` confirming it runs. ⚠️ This is a **false positive correction** from the original audit.
- **Issue:** The proxy's matcher (`'/((?!api|_next/static|...).*)'`) intentionally excludes `/api/*` — this is the standard Next.js 16 pattern (API routes handle their own auth). But `route.ts` does **zero** auth checks.
- **Risk:** Full unauthenticated CRUD on all patient data, prescriptions, doctor credentials. Anyone can POST any action to `/api/data`.

### C2 — Plain-text passwords
- **File:** `src/lib/database.ts:34,159`, `src/lib/dal.ts:46`
- **Issue:** `security_word` stored and compared as plain text. Seed inserts `'password'`.
- **Risk:** DB compromise exposes all credentials instantly.

### C3 — Base64 token is forgeable
- **File:** `src/components/login/Login.tsx:62-64`
- **Issue:** `btoa(JSON.stringify({doctor_id, name}))` — encoding, not signing. Anyone can forge.
- **Risk:** Full account takeover by crafting a token.

### C4 — API route has zero authentication
- **File:** `src/app/api/data/route.ts:46-61`
- **Issue:** No cookie/token validation. Anyone can POST any action. Proxy matcher excludes `/api/*`.
- **Risk:** Full unauthenticated CRUD on all patient data, prescriptions, doctor credentials.

### C5 — Cookies set client-side — can't use httpOnly
- **File:** `src/components/login/Login.tsx:65-66`
- **Issue:** Uses `next-client-cookies` (client-side `document.cookie`) which **cannot** set `httpOnly`, `secure`, or `sameSite`. Only `{ path: "/" }` is passed.
- **Risk:** XSS steals cookies directly via `document.cookie`. No `sameSite` leaves CSRF open.
- **Fix (Next.js 16 way):** Use a Server Action or Route Handler with `cookies().set()` from `next/headers`:
  ```ts
  // app/api/login/route.ts
  import { cookies } from 'next/headers'
  const cookieStore = await cookies()
  cookieStore.set({
    name: 'rx-token',
    value: signedToken,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 3600
  })
  ```
  Then the client calls `POST /api/login` instead of setting cookies via JS.

### C6 — `doctor_id` trusted from client, not session
- **File:** `src/app/api/data/route.ts` (all handlers)
- **Issue:** `createAppointment`, `createPrescription`, etc. accept `doctor_id` from request body.
- **Risk:** Cross-doctor data injection. A doctor can impersonate another.

---

## 🟠 High

### H1 — No data isolation on patient CRUD
- **File:** `src/lib/dal.ts:49-120`
- **Issue:** Patient CRUD has no `doctor_id` filter. All doctors see all patients.
- **Risk:** Cross-doctor patient data exposure.

### H2 — No authorization on single-record operations
- **File:** `src/lib/dal.ts:133-283`
- **Issue:** `fetchAppointment(id)`, `fetchPrescription(id)`, updates, deletes — no `doctor_id` check.
- **Risk:** IDOR — enumerate IDs to read any record.

### H3 — No rate limiting
- **File:** `src/app/api/data/route.ts:46`, `src/components/login/Login.tsx`
- **Issue:** No brute-force protection. Login has unlimited attempts.
- **Risk:** Credential stuffing succeeds.

### H4 — No CSRF protection
- **File:** `src/app/api/data/route.ts`
- **Issue:** No origin/referer validation. No CSRF token.
- **Risk:** Cross-site request forgery on state-changing operations.

### H5 — Error messages leak internals
- **File:** `src/app/api/data/route.ts:59`
- **Issue:** Raw `error.message` returned to client (SQLite errors, file paths).
- **Risk:** Information disclosure aids reconnaissance.

### H6 — No migration system
- **File:** `src/lib/database.ts:24-148`
- **Issue:** `CREATE TABLE IF NOT EXISTS` only. No version tracking.
- **Risk:** Can't evolve schema in production without destroying data.

### H7 — No indexes on FK columns
- **File:** `src/lib/database.ts:55-86`
- **Issue:** No `CREATE INDEX` anywhere. Full table scans on all queries.
- **Risk:** O(n) performance. Degrades linearly with data.

### H8 — No transaction wrapping
- **File:** `src/lib/dal.ts` (all multi-step operations)
- **Issue:** No `db.transaction()` used. `seedData` runs ~20 inserts without a transaction.
- **Risk:** Partial writes, inconsistent state.

### H9 — Allergies not persisted
- **File:** `src/app/(main)/patient-info/page.tsx:117-118,209-219`
- **Issue:** Allergies added/removed in in-memory Map only. Never saved to API.
- **Risk:** Clinical data loss on page refresh.

### H9b — CSP uses `unsafe-inline` + `unsafe-eval` (nonce-based approach recommended)
- **File:** `next.config.ts:39`
- **Issue:** Current CSP uses `unsafe-inline` and `unsafe-eval` (in all envs). `unsafe-inline` is expected with `headers()` approach, but `unsafe-eval` should be dev-only.
- **Risk:** Weakens XSS protection. Injected inline scripts execute freely.
- **Fix (Next.js 16 way):** Move CSP generation to `proxy.ts` with per-request nonces:
  ```ts
  // in src/proxy.ts
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')
  requestHeaders.set('x-nonce', nonce)
  response.headers.set('Content-Security-Policy', csp)
  ```
  This removes the need for `unsafe-inline` entirely.

### H10 — No Dockerfile / containerization
- **File:** Project root (missing)
- **Issue:** `better-sqlite3` native addon won't deploy to serverless. No reproducible build.
- **Risk:** Cannot deploy to any standard platform.

### H11 — No backup strategy
- **File:** `src/lib/database.ts` (missing)
- **Issue:** No backup cron, no `.backup()` call.
- **Risk:** Disk failure destroys all patient data.

### H12 — No health check endpoint
- **File:** `src/app/api/` (missing `health/route.ts`)
- **Issue:** No `/api/health` for Docker/LB probes.

### H13 — No logging / error tracking
- **File:** `src/app/api/data/route.ts:58-61`
- **Issue:** `error.message` returned to client. No Sentry/pino.
- **Risk:** Production errors invisible. No HIPAA audit trail.

---

## 🟡 Medium

| # | Issue | File | Details |
|---|-------|------|---------|
| M1 | DB path hardcoded | `database.ts:5` | Not env-configurable |
| M2 | No CI/CD | — | No GitHub Actions |
| M3 | CSP allows unsafe-eval | `next.config.ts:39` | Weakens XSS protection |
| M4 | No session expiration | `Login.tsx:65-66` | Cookies persist indefinitely |
| M5 | Patient search not debounced | `PrescriptionForm.tsx:598-603` | UI jank with 1000+ patients |
| M6 | Clone effect has no cleanup | `PrescriptionForm.tsx:715-749` | Refetch overwrites user edits |
| M7 | Doctor info effect overwrites edits | `PrescriptionForm.tsx:696-703` | Same pattern |
| M8 | Drug/route fallbacks hardcoded | `PrescriptionForm.tsx:562-579` | Ignores loading vs empty |
| M9 | Print CSS class mismatch | `globals.css:133-136` | `.print-hide` vs `.no-print` |
| M10 | QueryClient has no defaults | `Providers.tsx:10` | staleTime=0, retry=3 |
| M11 | No root error boundary | `src/app/` | Login page has no error.tsx |
| M12 | Mutation error handling missing | All hooks | onError never called |
| M13 | No pagination on patient list | `dal.ts:49-56` | Returns all rows |
| M14 | Single global DB connection | `database.ts:7-22` | No graceful shutdown |
| M15 | AllowJs weakens type safety | `tsconfig.json:5` | Unnecessary for TS-only project |
| M16 | .env not documented | — | No .env.example |

---

## 🔵 Low

| # | Issue | File |
|---|-------|------|
| L1 | `scrub()` function defined, never used | `dal.ts:30-37` |
| L2 | `row()`/`rows()` are no-op identity | `dal.ts:12-18` |
| L3 | Hardcoded `admin/password` default | `database.ts:34,159` |
| L4 | SQLite DB in project working tree | `database.ts:5` |
| L5 | Patient age allows 999 | `patient-info/page.tsx:66` |
| L6 | Follow-up date has no min constraint | `PrescriptionForm.tsx:1006-1022` |
| L7 | No horizontal scroll on mobile tables | All table pages |
| L8 | Sidebar not responsive on mobile | `layout.tsx` |
| L9 | `shadcn` in prod dependencies | `package.json:27` |
| L10 | README is default template | `README.md` |
| L11 | `npm audit` not configured | `package.json` |
| L12 | No Node engine constraint | `package.json` |

---

## ✅ Completed Fixes

All pushed to `master` on 2026-06-25:

| Fix | What changed | Status |
|-----|-------------|--------|
| **C4** | Auth check on `/api/data` — HMAC-verified token required on every request | ✅ |
| **C5** | Server-side `/api/login` — httpOnly + secure + sameSite cookies via `next/headers` | ✅ |
| **C2** | Passwords hashed with bcryptjs (12 rounds) in seed data + DAL comparison | ✅ |
| **C3** | Tokens signed with HMAC-SHA256 + `crypto.timingSafeEqual` verification | ✅ |
| **H9b** | CSP moved to `proxy.ts` with per-request nonces, `strict-dynamic`, no `unsafe-inline` | ✅ |
| **H6** | Migration system with `schema_version` tracking + ALTER TABLE support | ✅ |
| **H7** | Indexes on all FK columns (appointments, prescriptions, doctor_info) | ✅ |
| **H12** | `/api/health` endpoint with DB connectivity check | ✅ |
| **H9** | Allergies now persist via `updateMutation` on add/remove | ✅ |
| **H5** | Error messages sanitized — no SQL/stack leaks to client | ✅ |
| **H3** | Rate limiting on login — 10 attempts/IP/60s sliding window | ✅ |
| **H1** | `doctor_id` isolation on patient CRUD (schema + DAL) | ✅ |
| **M1** | DB path configurable via `DATABASE_PATH` env var | ✅ |
| **M10** | QueryClient defaults — staleTime 30s, retry 1, no refetchOnFocus | ✅ |
| **Model** | Deep agents switched from GLM-5.1 → Kimi K2.6 (cheaper) | ✅ |

**Note:** Delete `data/rxpro.db` before restarting to pick up hashed passwords + patient `doctor_id` column.

## 📋 Remaining (Not Started)

| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| H8 | Transaction wrapping | 30m | Data integrity |
| H10 | Dockerfile | 1h | Deployment |
| H11 | Backup strategy | 30m | Disaster recovery |
| H13 | Logging / error tracking | 2h | Observability |
| M2 | CI/CD pipeline | 1h | Automation |
| M4 | Session expiration | 10m | Security |
| M5-M9 | UX improvements | Various | Quality |
| M11-M16 | Minor fixes | Various | Quality |
| L1-L12 | Low priority | Various | Polish |

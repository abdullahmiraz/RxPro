# RxPro - Architecture Decisions

## ADR-001: SQLite Local Storage with Supabase-Compatible API
**Date:** 2026-06-24
**Context:** Need local development without remote Supabase
**Decision:** Use better-sqlite3 for local storage. All API calls route through src/api/api.ts → POST /api/data → src/lib/dal.ts → SQLite. When connecting Supabase, only dal.ts and api.ts need changes - all pages and hooks stay the same.
**Status:** ✅ Implemented

## ADR-002: Custom Cookie Auth (no Supabase Auth)
**Date:** 2026-06-24
**Context:** Original project used custom auth, need to maintain compatibility
**Decision:** Read rx_doctors table directly, compare security_word, set doctor_id + base64 rx-token cookies. Middleware validates token.
**Status:** ✅ Implemented

## ADR-003: shadcn/ui v4.11 base-nova style
**Date:** 2026-06-24
**Context:** Latest shadcn uses @base-ui/react instead of @radix-ui/react-*
**Decision:** Use the default base-nova style with @base-ui/react components. All 21 components installed.
**Status:** ✅ Implemented

## ADR-004: TanStack Query for Data Fetching
**Date:** 2026-06-24
**Context:** Need consistent data fetching with caching and optimistic updates
**Decision:** All data fetching uses TanStack Query hooks from src/hooks/. Query keys follow ['resource', {filters}] pattern. Mutations invalidate related queries on success.
**Status:** ✅ Implemented

## ADR-005: Prescription Form as Multi-Section Field Arrays
**Date:** 2026-06-24
**Context:** Prescription form has 12+ sections, each with dynamic add/remove fields
**Decision:** Use react-hook-form useFieldArray for each dynamic section. Sections are collapsible cards. Data collected into single JSON object for storage.
**Status:** 🔴 Not yet implemented

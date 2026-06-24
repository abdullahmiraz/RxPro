# RxPro - Architecture Decisions

## ADR-001: SQLite Local Storage with Supabase-Compatible API
**Date:** 2026-06-24
**Context:** Need local development without remote Supabase. Future production deployment will use Supabase.
**Decision:** Use better-sqlite3 for local storage. All API calls route through:
  Client → src/api/api.ts (POST /api/data) → src/app/api/data/route.ts → src/lib/dal.ts → SQLite
  When swapping to Supabase: only src/lib/dal.ts + src/api/api.ts need changes. All pages and hooks stay identical.
**Status:** ✅ Implemented

## ADR-002: Custom Cookie Auth (no Supabase Auth)
**Date:** 2026-06-24
**Context:** Original project used custom auth (rx_doctors table, plain-text security_word, base64 tokens)
**Decision:** Maintain compatibility. Read rx_doctors table directly, compare security_word, set doctor_id + base64 rx-token cookies. Middleware validates token decodes to match doctor_id.
**Status:** ✅ Implemented

## ADR-003: shadcn/ui v4.11 base-nova style
**Date:** 2026-06-24
**Context:** Latest shadcn v4 uses @base-ui/react instead of @radix-ui/react-* and Tailwind v4
**Decision:** Use default base-nova style with @base-ui/react. All 21 components installed via CLI. CSS uses Tailwind v4 @theme inline with OKLCH color space.
**Status:** ✅ Implemented

## ADR-004: TanStack Query for Data Fetching
**Date:** 2026-06-24
**Context:** Need consistent client-side data fetching with caching, loading states, and optimistic updates
**Decision:** All data fetching uses TanStack Query hooks from src/hooks/. Query keys follow ['resource', {filters}] pattern. Mutations invalidate related query keys on success. Each resource gets its own hook file.
**Status:** ✅ Implemented

## ADR-005: Prescription Form as Multi-Section Field Arrays
**Date:** 2026-06-24
**Context:** Prescription form has 12+ sections, each with dynamic add/remove fields that must persist state during section toggle
**Decision:** Single react-hook-form instance with useFieldArray for each dynamic section. Sections are collapsible Cards with chevron toggle. Data collected into single JSON object for SQLite storage. Print via window.print() with @media print CSS.
**Status:** ✅ Implemented

## ADR-006: Middleware Naming (Deprecation)
**Date:** 2026-06-24
**Context:** Next.js 16.2.9 deprecates "middleware" file convention in favor of "proxy"
**Decision:** Keep src/middleware.ts for now (still works, just a warning). Rename to proxy.ts when Next.js removes support.
**Status:** ⏳ Pending (non-blocking warning during build)

## ADR-007: Rubik Font via next/font/google
**Date:** 2026-06-24
**Context:** Need consistent medical-professional typography without render-blocking CSS imports
**Decision:** Use next/font/google Rubik (300-800 weight). CSS variable --font-rubik bound to fontFamily.sans in @theme inline. Replaces default Geist fonts.
**Status:** ✅ Implemented

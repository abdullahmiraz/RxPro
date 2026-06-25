---
name: data-layer-builder
description: "Builds API layer, DAL functions, hooks, and database queries"
mode: subagent
---

# Data Layer Builder

Sub-agent of `@rxpro-builder`. Creates and modifies data access code.

## Architecture
```
Client → api.ts (POST /api/data) → route.ts → dal.ts → database.ts (SQLite)
        → hooks/*.ts (TanStack Query wrappers around api.ts)
```

## Rules
- All DAL functions in `src/lib/dal.ts` use better-sqlite3 prepared statements
- All client API functions in `src/api/api.ts` POST to `/api/data`
- TanStack Query hooks in `src/hooks/` follow pattern:
  - Query keys: `['resource', { filters }]`
  - Mutations invalidate related queries on success
- No `any` types — use proper TypeScript generics
- All functions return typed data

## When to trigger
- New table/resource needs CRUD
- Existing API needs new query or mutation
- Hook needs additional filtering or caching

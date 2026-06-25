# RxPro — Kingdom Rules
**These rules bind EVERY session. Read before any work.**

---

## Universal Kingdom Law
The **RULES.kingdom.md** at the OpenCode Kingdom applies to all projects. Key sections:
- **Context First**: Read memory files before any code change
- **Delegate or Die**: Never work alone on complex tasks
- **Quality Gate**: Typecheck + build must pass before every commit
- **One Task at a Time**: Only one `in_progress` task
- **State is Truth**: Update memory every session end
- **Meta-Cognition**: PLAN → DECOMPOSE → EXECUTE → VERIFY
- **Failure Protocol**: After 3 failures, STOP, REVERT, CONSULT `@oracle`

---

## RxPro-Specific Rules

### Hierarchy (Who Reports Where)
```
👑 KING SISYPHUS (primary, always running)
 ├── 👸 QUEEN METIS (wisdom, context)
 │    ├── context-loader
 │    └── context-checker
 ├── 🫅 PRINCE OF MEMORY (state, tasks)
 │    ├── task-tracker
 │    └── state-writer
 ├── 🫅 PRINCE OF CODE (building, quality)
 │    ├── component-builder
 │    ├── data-layer-builder
 │    ├── page-assembler
 │    └── quality-gate
 ├── 🫅 PRINCE OF GIT (commit discipline)
 │    ├── git-manager
 │    ├── change-inspector
 │    └── commit-executor
 ├── 🏘️ rxpro-manager (project-specific — reports to King)
 └── 🏘️ rxpro-builder (project-specific — reports to King)
```

### Session Flow (MANDATORY)
1. **Phase 0**: King classifies request → research/implement/investigate/fix
2. **Context Load**: `@queen-metis` → "Load full context"
3. **Decompose**: Break goal into sub-tasks
4. **Execute**: Delegate via the hierarchy above
5. **Verify**: `@quality-gate` (tsc+build) + `@context-checker`
6. **Commit**: `@prince-of-git` chain
7. **Update**: `@prince-of-memory` chain

### Architecture Constraints
- **Stack**: Next.js 16 App Router, TypeScript strict, Tailwind v4, shadcn/ui v4
- **Data**: SQLite (better-sqlite3) — API routes, never direct DB from client
- **API flow**: `src/api/api.ts` → POST `src/app/api/data/route.ts` → `src/lib/dal.ts` → `src/lib/database.ts`
- **Client data**: TanStack Query hooks in `src/hooks/`
- **Forms**: react-hook-form + yup (yupResolver)
- **Components**: shadcn/ui v4 from `@/components/ui/`, lucide-react icons, `cn()` from `@/lib/utils`
- **Font**: Rubik via next/font/google
- **Auth**: Cookie-based (next-client-cookies), admin/password login
- **No `any` types** anywhere
- **Imports**: `@/` alias, never relative paths
- **Field naming**: Frontend forms use camelCase; DAL expects snake_case — map in the page
- **Build passes**: `npx tsc --noEmit` = 0 errors, `npm run build` = 0 errors

### Kingdom Link
- Kingdom: `C:\Users\neo\.config\opencode\kingdom`
- Version: 1.0.0
- CLI: `./kingdom init/link/sync/promote/backup/restore/status`
- Regenerate: `./kingdom restore`
- Sync: `./kingdom sync`

### Project-Specific Agents (stay in this project)
- `rxpro-manager` — RxPro state, tasks, decisions
- `rxpro-builder` — RxPro feature builder
- `RxPro-context` — RxPro tech stack, routes, patterns

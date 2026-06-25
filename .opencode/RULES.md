# RxPro - Orchestrator Rules
**These rules apply to EVERY agent session. Read before any work.**

## 1. Memory First
Before ANY code changes, read these files in order:
1. `.opencode/memory/tasks.md` — current task list and status
2. `.opencode/memory/state.md` — project state snapshot
3. `.opencode/memory/decisions.md` — architecture decisions that constrain changes

## 2. Manager Agent Invocation
At session start, invoke `@rxpro-manager` to get full context:
- Ask "What is the current project state and what should I work on next?"
- The manager reads all memory files and returns a brief

## 3. Task Discipline
- NEVER skip a task. Complete each task fully before moving to the next.
- If blocked, note the blocker in `.opencode/memory/tasks.md` and move to the next independent task.
- Update `.opencode/memory/tasks.md` after EVERY completed task (mark `[x]`).
- Update `.opencode/memory/state.md` after EVERY session with current build status.

## 4. Quality Gates
Before committing ANY change:
- Run `npx tsc --noEmit` — must pass with ZERO errors
- Run `npm run build` — must pass with ZERO errors
- If either fails, FIX before committing

## 5. Commit Discipline
Every commit must:
- Have a meaningful message describing WHAT changed and WHY
- Group related changes together
- NOT include `.env*`, `data/`, `node_modules/`, `.next/`

## 6. No Task Left Behind
The full task backlog is in `.opencode/memory/tasks.md`. Future enhancements are listed under "Future Enhancements". Each session should:
1. Check if there are uncompleted main tasks
2. If all main tasks are done, pick from Future Enhancements
3. Never lose the list — it's the source of truth

## 7. Architecture Constraints
- SQLite (better-sqlite3) for storage — pages use API routes, never direct DB access
- All client data fetching goes through `src/hooks/` TanStack Query hooks
- No `any` types anywhere
- Imports use `@/` alias never relative paths
- Forms use react-hook-form + yup (yupResolver)
- Components use shadcn/ui v4 from `@/components/ui/`

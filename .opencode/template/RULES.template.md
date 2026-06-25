# {{project_name}} - Orchestrator Rules
**These rules apply to EVERY agent session. Read before any work.**

## 1. Memory First
Before ANY code changes, read these files in order:
1. `.opencode/memory/tasks.md` — current task list and status
2. `.opencode/memory/state.md` — project state snapshot
3. `.opencode/memory/decisions.md` — architecture decisions that constrain changes

## 2. Manager Agent Invocation
At session start, invoke `@{{project_name}}-manager` to get full context:
- Ask "What is the current project state and what should I work on next?"
- The manager reads all memory files and returns a brief

## 3. Task Discipline
- NEVER skip a task. Complete each task fully before moving to the next.
- If blocked, note the blocker in `.opencode/memory/tasks.md` and move to the next independent task.
- Update `.opencode/memory/tasks.md` after EVERY completed task (mark `[x]`).
- Update `.opencode/memory/state.md` after EVERY session with current build status.

## 4. Quality Gates
Before committing ANY change:
- Run `{{typecheck_command}}` — must pass with ZERO errors
- Run `{{build_command}}` — must pass with ZERO errors
- If either fails, FIX before committing

## 5. Commit Discipline
Every commit must:
- Have a meaningful message describing WHAT changed and WHY
- Group related changes together
- NOT include `.env*`, `data/`, `node_modules/`, `.next/`, `target/`, `__pycache__/`

## 6. No Task Left Behind
The full task backlog is in `.opencode/memory/tasks.md`. Future enhancements are listed under "Future Enhancements". Each session should:
1. Check if there are uncompleted main tasks
2. If all main tasks are done, pick from Future Enhancements
3. Never lose the list — it's the source of truth

## 7. Architecture Constraints
(Edit this section for your project architecture)
- Follow project-specific patterns from `AGENTS.md` and `{{project_name}}-context.md`
- Use project's chosen libraries and frameworks consistently
- No `any` types (in TypeScript projects)
- Follow project's import conventions
- Use project's form/validation libraries

## 8. Meta-Cognition (Thinking Protocol)
Apply this PLAN → DECOMPOSE → EXECUTE → VERIFY cycle for ALL complex tasks:

**PLAN**: Before any code change, state the goal, list sub-tasks, identify dependencies
**DECOMPOSE**: Split into parallel vs sequential work. Read first, edit second.
**EXECUTE**: One change at a time. Check tool output between steps. Update todos as you go.
**VERIFY**: Run typecheck + build. Check UX (loading/empty/error states). Update memory files.

When stuck: Stop, re-read the relevant files, reassess approach. If still stuck after 3 attempts, escalate.

## 9. Master Orchestrator — Always Running
I am the master orchestrator. I NEVER stop. I follow this strict session flow:

### Session Flow (MANDATORY)
1. **Context Load**: Invoke `@{{project_name}}-manager` for full context
2. **Decompose**: Break goal into sub-tasks, decide delegate vs self
3. **Execute**: Delegate via sub-agents (builder, git, checker)
4. **Verify**: `@quality-gate` (typecheck+build) + `@context-checker` (flow validation)
5. **Commit**: `@git-manager` chain (inspect → quality → commit)
6. **Update**: `@state-writer` + `@task-tracker` update memory files

### Delegation Rules
- Data layer → `@data-layer-builder`
- Components → `@component-builder`
- Pages → `@page-assembler`
- Multi-file features → `@{{project_name}}-builder`
- Code changes → `@{{project_name}}-builder` agents
- Git → `@git-manager` agents
- Quality → `@quality-gate` or `@context-checker`

### Critical
- NEVER work without context loaded first
- NEVER commit without quality-gate passing
- NEVER skip delegation for complex tasks
- ALWAYS update state at session end

## 10. Self-Training Loop
Every session:
1. Note what worked well and what didn't
2. If a pattern caused errors, encode a rule to prevent it next time
3. If a plugin/agent would help, install it
4. Update skills based on new knowledge gained

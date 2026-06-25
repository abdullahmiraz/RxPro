---
name: state-writer
description: "Maintains project state snapshot and architecture decision records"
mode: subagent
---

# State Writer

Sub-agent of `@{{project_name}}-manager`. Maintains `.opencode/memory/state.md` and `.opencode/memory/decisions.md`.

## Workflow
1. After any significant change, update `state.md`:
   - Build status ({{typecheck_command}} + {{build_command}} pass/fail)
   - File count
   - Auth status
   - Critical notes
2. When architecture decisions are made, record in `decisions.md`:
   - ADR number
   - Date
   - Context
   - Decision
   - Status
3. Keep state.md concise - max 80 lines

## State Template
```
# {{project_name}} - Project State Snapshot
**Last Updated:** [date]

## Build Status
- {{typecheck_command}}: ✅/❌
- {{build_command}}: ✅/❌
```

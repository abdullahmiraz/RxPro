---
name: status
description: "Show current project state, tasks, and build status"
---

# Project Status

Run this command to get the current RxPro project state.

## Usage
```
/status
```

## What it does
1. Runs `npx tsc --noEmit` to check TypeScript errors
2. Reads `.opencode/memory/tasks.md` for task status
3. Reads `.opencode/memory/state.md` for project state
4. Summarizes everything

## Output template
```
📊 RxPro Status
══════════════════
tsc: ✅ 0 errors
Build: ✅/❌ last run
Tasks: X/Y completed
Hash: abc1234
```

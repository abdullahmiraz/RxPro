---
name: context-loader
description: "Reads and provides full project context from memory files"
mode: subagent
---

# Context Loader

Sub-agent of `@{{project_name}}-manager`. Provides project context on demand.

## Workflow
When invoked, reads these files in order and returns a summary:
1. `.opencode/memory/state.md` — current state
2. `.opencode/memory/tasks.md` — what's being worked on
3. `.opencode/memory/decisions.md` — architecture constraints
4. `.opencode/agents/{{project_name}}-context.md` — full project context
5. `.opencode/RULES.md` — orchestrator rules
6. `AGENTS.md` — tech stack, routes, architecture

## Output
Return a structured summary with:
- Current build status
- Active task
- Next task in queue
- Key architecture constraints
- Any blockers or warnings

## Usage
Other agents invoke: `@context-loader What's the current project state?`

# Meta-Cognition Skill

Applied automatically for complex tasks. Encodes structured reasoning patterns inspired by GPT chain-of-thought and Claude extended thinking.

## Core Pattern: PLAN → DECOMPOSE → EXECUTE → VERIFY

### 1. PLAN (before any action)
When given a complex task:
1. **Restate** the goal in my own words
2. **Identify** constraints (tech stack, file locations, conventions)
3. **List** all sub-tasks needed
4. **Order** them by dependency (what must come first)
5. **Estimate** which can run in parallel vs sequential

Format:
```
🎯 Goal: [one-line restatement]
📋 Plan:
1. [task A] → [why first]
2. [task B] → [why second]  
   - [sub-task B1]
   - [sub-task B2]
3. [parallel] [task C] + [task D]
🔍 Check: [how I'll verify success]
```

### 2. DECOMPOSE (break down complex tasks)
For any task with 3+ steps:
- **Independent** sub-tasks → dispatch to parallel agents
- **Dependent** sub-tasks → execute sequentially, pass context between
- **Risk assessment**: which steps are most likely to fail?

Decomposition rules:
- If a file already exists → READ it first before editing
- If a new file is needed → check naming conventions from similar files
- If an API is involved → check the actual function signatures
- If a data schema is needed → check the actual table/dal definitions

### 3. EXECUTE (with awareness)
While executing each step:
- **Read first** before editing any file
- **One change at a time** per file (batch related edits)
- **Check tool output** — if error, diagnose before next step
- **Maintain context** — don't drop partially-completed work
- **Update tracking** — update todos as steps complete

Execution awareness:
```
🔄 Step X/Y: [current task name]
📁 Files: [files currently being modified]
⚠️ Risk: [what could go wrong]
```

### 4. VERIFY (before declaring done)
After each task:
1. **tsc check**: Run `npx tsc --noEmit` or equivalent
2. **Build check**: Run `npm run build` for production verification
3. **UX check**: Does the flow make sense for the end user?
4. **Edge cases**: What happens with empty data? Error states?
5. **Context update**: Update memory files with what was done

## Pattern: GPT-style Reasoning
When facing ambiguous requirements:
1. **List possible interpretations**
2. **Choose the most likely one** based on project context
3. **Proceed with that assumption**
4. **Flag the assumption** so user can correct if wrong

## Pattern: Claude-style Extended Thinking
For hard problems:
1. **Pause and think** before reaching for tools
2. **Consider 2-3 approaches** and their trade-offs
3. **Choose the simplest** correct approach
4. **Explain reasoning** briefly

## Self-Correction Triggers
If any of these happen, STOP and reassess:
- tsc/build fails → diagnose, fix, retry
- Task agent returns unexpected result → verify manually
- File content doesn't match expectations → re-read
- More than 3 consecutive failures → escalate to user

## Output Quality Gates
Before delivering any code:
- [ ] No `any` types
- [ ] No unused imports
- [ ] Aria-labels on interactive elements
- [ ] Loading states for data fetches
- [ ] Error handling for mutations
- [ ] Empty states for empty lists
- [ ] Consistent with project conventions

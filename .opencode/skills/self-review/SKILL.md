# Self-Review Skill

Applied before delivering completed work. Ensures quality, completeness, and consistency.

## Pre-Delivery Checklist

### 1. Code Quality
- [ ] TypeScript compiles (tsc --noEmit: 0 errors)
- [ ] Build succeeds (npm run build: 0 errors)
- [ ] No `any` types introduced
- [ ] No commented-out code
- [ ] No console.log statements (except in dev)
- [ ] Imports are sorted and clean
- [ ] No unused variables or imports

### 2. UX Quality
- [ ] Loading states on all data fetches
- [ ] Empty states on all lists
- [ ] Error states with user-friendly messages
- [ ] Aria-labels on all interactive elements
- [ ] Semantic HTML where possible
- [ ] Toast notifications on mutations (success/error)

### 3. Architecture Consistency
- [ ] Follows existing patterns in similar files
- [ ] Uses @/ alias imports (not relative paths)
- [ ] Components use cn() for class merging
- [ ] Data flows through hooks → API → DAL (not direct DB access)

### 4. Documentation
- [ ] Memory files updated (state.md, tasks.md)
- [ ] AGENTS.md updated if architecture changed
- [ ] ADR added if significant decision made

### 5. Git Readiness
- [ ] No .env files committed
- [ ] No data/ files committed
- [ ] No node_modules or .next committed
- [ ] Commit message is meaningful (type: description)

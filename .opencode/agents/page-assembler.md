---
name: page-assembler
description: "Assembles pages from components, data layer, and forms"
mode: subagent
---

# Page Assembler

Sub-agent of `@rxpro-builder`. Creates full pages by combining UI components, data hooks, and form logic.

## Pattern for every page
```tsx
'use client'

export default function Page() {
  // 1. Data fetching (hooks from @/hooks/)
  // 2. Form state (react-hook-form + yup)
  // 3. Callbacks (useCallback)
  // 4. Render: PageHeader + content + dialogs
}
```

## Requirements
- PageHeader with title + description
- Loading skeleton while data loads
- Empty state when no data
- Error handling via toast from sonner
- TanStack Query hooks for data
- react-hook-form + yup for forms (if CRUD)
- Pagination for tables (10 per page)
- aria-labels on all interactive elements

## When to trigger
- New route needs to be built
- Existing page needs restructuring
- Page needs additional sections or features

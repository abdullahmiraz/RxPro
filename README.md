# RxPro

Prescription management system for clinics. Doctors manage patients, appointments, and 12-section prescriptions with a print-ready layout.

## Tech Stack

- Next.js 16 (App Router) with TypeScript
- Tailwind CSS v4 and shadcn/ui v4 (base-nova, `@base-ui/react`)
- TanStack Query for data fetching
- react-hook-form + yup for forms
- better-sqlite3 for local storage (swappable for Supabase)
- next-client-cookies for authentication

## Prerequisites

- Node.js 22+ (engines field requires `>=18.0.0`)
- npm

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The root path redirects to `/login` if unauthenticated. Sign in with `admin` / `password`.

## Scripts

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Start the dev server           |
| `npm run build`    | Production build               |
| `npm run start`    | Run the production build       |
| `npm run lint`     | Run ESLint                     |
| `npm run audit`    | Run npm audit (high severity)  |
| `npx tsc --noEmit` | TypeScript type check          |

## Architecture

The data flow is `Client Component` to `src/api/api.ts` (POST `/api/data`), dispatched by `src/app/api/data/route.ts` to `src/lib/dal.ts` (server-side CRUD), backed by `src/lib/database.ts` (better-sqlite3 with auto-init and seed data). Swapping the SQLite backend for Supabase is a change to `dal.ts` and `api.ts` only; pages and hooks stay identical.

--- great

# CleanProof

SaaS web app for commercial cleaning quality: checklists, field completion, supervisor review, client reports, and issue tracking.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **PostgreSQL** + Drizzle ORM (migrations in `/drizzle`)
- Session auth (HTTP-only JWT cookie) + bcrypt passwords + reset tokens
- Organisation-scoped queries on every mutation/read

## Required environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (required) |
| `AUTH_SECRET` | ≥32 characters in production |
| `APP_URL` | Public base URL (optional, billing redirects) |
| `ALLOW_DEMO_MODE` | `true` to enable `/demo` + demo seed ( **forbidden** when `NODE_ENV=production`) |
| `TEST_DATABASE_URL` | Optional Postgres for integration tests; defaults to PGlite in-memory |

Copy `.env.example` to `.env.local` for local development.

## Local development

**Recommended (no Docker Postgres):**

```bash
npm install
npm run seed:pglite          # demo org into .data/pglite (idempotent)
npm run verify:pglite-demo     # optional check
npm run dev:pglite             # migrate + Next.js on PGlite
```

**Alternative (Postgres via Docker):**

```bash
docker compose up -d
npm install
npm run db:migrate
ALLOW_DEMO_MODE=true npm run seed -- --demo
npm run dev
```

Demo mode (non-production only): [http://localhost:3000/demo](http://localhost:3000/demo). Demo login: `owner@demo.cleanproof.app` / `demo1234` (and manager/cleaner @demo.cleanproof.app). Client sample report: `/r/demo-client-report-token` (after `seed:pglite`).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run db:generate` | Generate SQL from schema |
| `npm run db:migrate` | Apply migrations |
| `npm run seed -- --demo` | Seed demo organisation (uses `DATABASE_URL` from `.env.local`) |
| `npm run seed:pglite` | Seed demo into `.data/pglite` (same DB as `dev:pglite`) |
| `npm run dev:pglite` | Persistent PGlite + Next.js dev server |
| `npm run verify:pglite-demo` | Verify demo users exist in PGlite |
| `npm run test` | Integration tests (PGlite or `TEST_DATABASE_URL`) |
| `npm run test:e2e` | Playwright browser tests (isolated `.data/pglite-e2e`, port **3099**) |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run build` | Production build |

## Project path

`/Users/usmanfadi/cleanproof`

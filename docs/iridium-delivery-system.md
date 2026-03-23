# Iridium Delivery System (Well-Oiled Machine)

This runbook defines the default process for reliably bootstrapping, validating,
deploying, and rolling back the Iridium app.

## 1) Platform and Promotion Model

- Platform: Railway
- Promotion path: `dev -> staging -> production`
- Release gate (required): `bun run validate` and Playwright E2E

No deploy should skip the gate unless there is an explicit incident override.

## 2) First 15 Minutes: Local Bootstrap Contract

Run these commands from repo root:

```bash
bun install
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d
bun run db:migrate
bun run db:seed
bun run dev
```

Then verify:

- App loads at `http://localhost:5173`
- Health endpoint returns `200` at `http://localhost:5173/healthcheck`
- You can sign in with a seeded account

## 3) Environment Variable Contract

Required in all environments:

| Variable                    | Required | Notes                                  |
| --------------------------- | -------- | -------------------------------------- |
| `DATABASE_URL`              | Yes      | PostgreSQL connection string           |
| `BETTER_AUTH_SECRET`        | Yes      | 32+ chars, unique per environment      |
| `BETTER_AUTH_BASE_URL`      | Yes      | Public app URL for that environment    |
| `VITE_BETTER_AUTH_BASE_URL` | Yes      | Client-side mirror of auth base URL    |
| `ANTHROPIC_API_KEY`         | Yes      | AI features require valid key          |
| `NODE_ENV`                  | Auto     | `development`, `test`, or `production` |

Environment matrix:

| Environment  | Purpose                         | Base URL example             |
| ------------ | ------------------------------- | ---------------------------- |
| `dev`        | Daily integration + internal QA | `https://iridium-dev...`     |
| `staging`    | Pre-production validation       | `https://iridium-staging...` |
| `production` | User-facing release             | `https://iridium...`         |

## 4) Database Lifecycle Contract

- Local schema iteration: `bun run db:migrate`
- Local reset when needed: `bun run db:fresh`
- CI + deployed environments: `bunx --bun prisma migrate deploy`
- Never use reset commands in staging/production

Migration policy:

- Every schema change must ship as a migration
- PRs include migration files and note any data risk
- Deploy applies migrations before serving new app code

## 5) CI Release Gate Contract

GitHub Actions workflow (`.github/workflows/e2e.yml`) is the gate:

1. `validate` job runs `bun run validate`
2. `e2e` job runs only after `validate` succeeds
3. `e2e` applies migrations and runs Playwright

If either job fails, do not promote release.

## 6) Railway Deployment Runbook

Prereqs:

- Railway CLI installed and logged in
- Repo linked to project/service/environment

Deploy to each environment:

```bash
# Dev
railway environment dev
railway up

# Staging
railway environment staging
railway up

# Production (only after staging verification)
railway environment production
railway up
```

## 7) Preflight and Post-Deploy Checklists

Preflight:

- `bun run validate` passes
- `bun run test` passes (Playwright)
- Migration files reviewed
- Environment variables confirmed for target environment

Post-deploy:

- `GET /healthcheck` returns `200`
- Login flow works
- Chat route loads without server errors
- No spike in Railway deploy logs (`error`, `500`, DB/auth failures)

## 8) Rollback Contract

Trigger rollback on:

- Healthcheck fails repeatedly
- Auth/login broken
- Migration causes runtime failures
- Error rate spike after deploy

Rollback steps:

1. Re-deploy previous known-good build in Railway
2. Confirm `healthcheck` and login
3. Capture root cause and follow-up fix ticket before next promotion

## 9) Incident Quick Guide

- Env errors on startup: validate variables first (`DATABASE_URL`,
  `BETTER_AUTH_SECRET`, base URLs, API key)
- DB errors: check migration status and DB connectivity
- Build errors: run `bun run validate` locally and in CI
- Auth errors: verify `BETTER_AUTH_BASE_URL` and secret length/rotation

## 10) Backport Loop to Core Repo (`~/repositories/iridium`)

For every hardening improvement here that should go upstream:

- Create/update a Linear item in the Iridium project
- Include:
    - Problem or risk
    - Fix summary
    - Files changed
    - Backport steps/notes for `~/repositories/iridium`

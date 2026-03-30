# Railway Staging Environment

Guide for creating a persistent staging environment on Railway to demo
features without merging to `main`.

## Why Staging Over PR Environments

- **Persistent** -- stays up as long as you need it (PR environments delete
  when the PR closes or merges)
- **Stable URL** -- give clients a link they can revisit
- **Isolated** -- changes never touch production

## Creating the Environment

1. In the Railway project dashboard, open the **environment dropdown** (top
   nav) and select **Duplicate Environment** from your production environment.
2. Name it `staging` (or `preview`, `demo`, etc.).

Duplicating copies all services, variables, and configuration into the new
environment.

## Connecting a Feature Branch

In the staging environment, update each service:

**Service Settings > Source > Trigger Branch** -- change from `main` to your
feature branch (e.g., `feature/onboarding`).

Railway will auto-deploy whenever you push to that branch.

## Database Setup

You need separate Postgres instances so staging does not touch production data.
Railway should create new database services when duplicating, but verify both
connection strings point to staging databases -- not production.

Required database variables:

| Variable                | Points to                     |
| ----------------------- | ----------------------------- |
| `DATABASE_URL`          | Staging Postgres (app data)   |
| `VOLTAGENT_DATABASE_URL`| Staging Postgres (VoltAgent)  |

## Environment Variables

Update these in the staging environment:

| Variable                | What to change                                              |
| ----------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`          | Staging Postgres connection string                          |
| `VOLTAGENT_DATABASE_URL`| Staging VoltAgent Postgres connection string                |
| `BETTER_AUTH_BASE_URL`  | Staging domain URL (e.g., `https://staging-*.up.railway.app`) |
| `BETTER_AUTH_SECRET`    | Can reuse production value or generate a new one            |
| `ANTHROPIC_API_KEY`     | Can reuse the same key                                      |

## Running Migrations

After the first deploy, run Prisma migrations against the staging database:

```bash
railway link
railway environment staging
railway run bunx --bun prisma migrate deploy
railway run bun run db:seed   # optional: populate test data
```

## Sharing With Clients

Railway auto-provisions a domain for the staging environment. Share that URL
directly. If you need a custom subdomain, add one via **Service Settings >
Networking > Domains**.

## Workflow

1. Push to your feature branch.
2. Railway auto-deploys to staging.
3. Client reviews at the staging URL.
4. When ready, merge the PR to `main` -- production deploys from `main`.
5. Repurpose or delete the staging environment.

## Cleanup

To remove a staging environment: **Project Settings > Environments** and
delete it. All associated services and databases are removed.

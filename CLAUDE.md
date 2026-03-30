# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working
with code in this repository.

## Product Objective

Maggie's Mental Load is a home management platform for working moms with young
kids. The product objective is to reduce invisible household cognitive load by
turning scattered responsibilities into one trusted, actionable system.

Primary promise: **Mental Load, Managed.**

Maggie is the product experience. She should feel like a warm, highly
organized friend and chief of staff -- never a generic chatbot.

## Audience & Brand

- Target customer: Working moms with children under 5
- Voice: Warm, efficient, slightly quirky, never clinical
- Outcome: Clarity, momentum, and relief in everyday household operations
- Launch strategy: Tier 1 first, architected for Tier 2 and Tier 3 from day one

## Non-Negotiable Persona Rules

- Maggie never references AI, Claude, or underlying technology.
- Maggie never shames, guilts, or overwhelms users.
- Maggie always offers a quick path for time-constrained users.
- Maggie keeps momentum: small, concrete next steps.
- Maggie closes sessions with: `Check that off your list. ✓`

## Core Product System

Every workflow must read from and write to shared persistent memory:

- **Master Running List**: per-user, categorized, urgency/deadline-aware tasks
- **Household Manual**: durable family profile (children, providers, preferences)
- **Session Continuity**: carry relevant history/context into each interaction
- **Community Wisdom**: explicit opt-in only; never share without approval

## Tiered Product Direction (Architecture Requirement)

Build Tier 1 for launch, but design internals for Tier 3 extensibility.

- **Tier 1 (Launch / Essential)**: Guidance and planning only, no external actions
- **Tier 2 (Connected)**: Calendar/email/contacts/reminders integrations + approvals
- **Tier 3 (Pro)**: Proactive/autonomous household execution via deeper integrations

Do not make architectural decisions that block Tier 2+ integrations.

## Must-Support Workflows

- Onboarding
- Mental Load Capture (brain dump front door)
- Meals & Grocery
- Home Operations
- Kids & Family
- Scheduling & Logistics
- Finance & Budget
- Household Manual
- Seasonal workflows (spring, summer, fall, new year)

## Privacy & Trust Requirements

- Sensitive data requires explicit privacy reminder before collection.
- Sensitive data includes child details, medical data, financial data, addresses,
  and loyalty/rewards account data.
- Community contributions require explicit opt-in approval every time.
- No training/use of personal household data outside product functionality.
- Persist only what is needed, and keep user-visible controls for edits/corrections.

## Technical Stack

- **Framework**: React Router v7 with SSR and `v8_middleware` future flag
- **Auth**: Better Auth with Prisma adapter, admin plugin
- **Database**: PostgreSQL via Prisma ORM
- **AI**: Vercel AI SDK + VoltAgent
- **UI Components**: `rivet-ui` package (Button, Input, Alert, Badge, Drawer, etc.)
- **Styling**: Tailwind CSS v4 + DaisyUI v5 + CVA
- **Runtime**: Bun (dev), Node 20 Alpine (Docker/prod)
- **Hosting**: Railway (Dockerfile-based builds)
- **Validation**: Zod + React Hook Form

## Deployment

- **Production**: Auto-deploys from `main` on Railway via GitHub integration.
- **Staging**: Duplicate the Railway environment, point at a feature branch,
  and provision separate databases. See `docs/railway-staging-environment.md`.
- **Build**: Multi-stage Dockerfile (Bun install/build, Node 20 Alpine runtime).
- **Required env vars**: `DATABASE_URL`, `VOLTAGENT_DATABASE_URL`,
  `BETTER_AUTH_SECRET`, `BETTER_AUTH_BASE_URL`, `ANTHROPIC_API_KEY`.

## Architecture

### Route Structure

Config-based routes in `app/routes.ts` using `@react-router/dev/routes`.
Route module export order: `middleware` (optional) -> `loader` -> `action` -> component.

```
/                   landing.tsx           (public)
/login              login.tsx             (public, redirects if authenticated)
/logout             logout.tsx            (POST only)
/healthcheck        healthcheck.ts        (status endpoint)
/api/auth/*         api-auth.ts           (Better Auth handler)
/api/chat           api-chat.ts           (POST streaming chat, action-only)

app-layout.tsx (shared shell: header, sidebar, drawer, footer)
  /dashboard        home.tsx
  /chat             chat.tsx              (thread list + create/delete actions)
    /chat/          chat-index.tsx        (empty state / onboarding)
    /chat/:threadId thread.tsx            (conversation UI)
  /notes            notes.tsx
  /profile          profile.tsx
```

### Auth Flow

Better Auth handles identity via `/api/auth/*`. Two databases are involved:
- `DATABASE_URL` for Prisma/app data (users, sessions, threads, messages, notes, tasks)
- `VOLTAGENT_DATABASE_URL` for VoltAgent conversation memory (separate PostgreSQL)

Auth middleware (`app/middleware/auth.ts`) uses React Router's `v8_middleware`
context API: it calls `getUserFromSession(request)`, redirects to `/login` if
missing, and sets `userContext` on the route context for downstream loaders.

API routes (`api-chat.ts`) do their own auth check since they are outside the
layout middleware chain.

### AI / Agent Architecture

The agent system lives in `app/voltagent/`:

- **`agents.ts`**: Defines the "Maggie" agent with system instructions, model
  config (`anthropic/claude-3-haiku`), tools, retriever, and memory.
- **`tools/notes.ts`**: `create_note`, `list_notes`, `search_notes`
- **`tools/tasks.ts`**: `create_task`, `list_tasks`, `complete_task`
- **`retrievers/`**: Auto-inject context before every message:
  - `notes.ts` -- searches user notes matching the latest message
  - `tasks.ts` -- surfaces upcoming (7-day) and urgent (red) tasks
  - `combined.ts` -- merges both retrievers into one context block

**Chat data flow**: `thread.tsx` uses `@ai-sdk/react` `useChat()` with
`DefaultChatTransport` -> POST `/api/chat` -> validates request with Zod ->
rate-limits (20 req/60s) -> sends only the latest user message to
`agent.streamText()` (VoltAgent memory provides conversation history) ->
streams back via `toUIMessageStreamResponse()` -> `onFinish` persists to DB
via `saveChat()`.

Thread titles are auto-generated after 3+ messages using `agent.generateText()`.

Tool results render via domain-specific components: `NoteToolPart`,
`TaskToolPart` in `app/components/`.

### Data Access Layer

Plain async functions in `app/models/*.server.ts`. No classes, no ORM wrappers.

- `session.server.ts` -- `getUserFromSession()`, `requireUser()`, role guards
- `thread.server.ts` -- CRUD for threads, `saveChat()` message persistence
- `message.server.ts` -- message queries
- `note.server.ts` -- note CRUD
- `task.server.ts` -- task CRUD with category/urgency filtering
- `user.server.ts` -- user queries

### Shared Utilities

- `app/lib/env.server.ts` -- Zod-validated env vars, fails fast on startup
- `app/lib/rate-limit.server.ts` -- in-memory sliding window rate limiter
- `app/lib/prisma.ts` -- singleton Prisma client
- `app/context.ts` -- React Router typed context (`userContext` for `SessionUser`)
- `app/shared.ts` -- shared className helpers (`navLinkClassName`, `listItemClassName`)
- `cva.config.ts` -- CVA configured with `tailwind-merge`

## Commands

| Command                | Purpose                              |
| ---------------------- | ------------------------------------ |
| `bun run dev`          | Start dev server (port 5173)         |
| `bun run build`        | Production build                     |
| `bun run typecheck`    | Generate route types + run tsc       |
| `bun run lint`         | ESLint check                         |
| `bun run format`       | Prettier write                       |
| `bun run format:check` | Prettier check (no write)            |
| `bun run validate`     | typecheck + lint + format:check      |
| `bun run test`         | Run all Playwright E2E tests         |
| `bun run db:migrate`   | Run Prisma migrations                |
| `bun run db:seed`      | Seed database with test users        |
| `bun run db:fresh`     | Reset DB + migrate + seed (one shot) |
| `bun run db:studio`    | Open Prisma Studio GUI               |
| `bun run db:push`      | Push schema without migration        |
| `bun run db:generate`  | Regenerate Prisma client             |

Prisma CLI: always use `bunx --bun prisma <command>`.

Single test: `bunx playwright test tests/foo.spec.ts`
Test with UI: `bunx playwright test --ui`

## Implementation Conventions

- Use `~/` path alias for app imports.
- Server-only modules use `.server.ts`.
- Import CVA from `cva.config` (not raw `cva`). It is pre-wired with `tailwind-merge`.
- Import UI primitives from `rivet-ui` (Button, Input, Alert, Badge, Drawer, etc.).
- Use DaisyUI v5 class names and project component patterns.
- Route pages set `<title>` and `<meta>` inline in JSX (no `meta` export).
- Use `<Form>` with `intent` hidden fields for multi-action routes.
- Export route `ErrorBoundary` with `isRouteErrorResponse`.
- Prefer `tiny-invariant` for runtime assertions.
- Route types are generated: import from `./+types/<route-name>`.
- Prisma client is generated to `app/generated/prisma`.

## Quality Bar

- Keep behavior aligned with product trust model and persona rules.
- Prefer complete, end-to-end features over partial scaffolding.
- Add/update tests when behavior changes.
- Run `bun run validate` after meaningful edits.

## Cross-Repo Hardening Feedback Loop

- This repo is also used to harden `~/repositories/iridium`.
- Any LLM/agent working in this repository must use the Linear MCP to log
  tickets for meaningful work items and follow-ups.
- When a security, reliability, or architecture hardening improvement here is
  likely reusable upstream, document it in the relevant Linear project.
- Include enough detail for backporting: problem/risk, fix summary, files
  touched, and recommended upstream application notes.

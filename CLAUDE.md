# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working
with code in this repository.

## Product Objective

Maggie's Mental Load is a home management platform for working moms with young
kids. The product objective is to reduce invisible household cognitive load by
turning scattered responsibilities into one trusted, actionable system.

Primary promise: **Mental Load, Managed.**

Maggie is the product experience. She should feel like a warm, highly
organized friend and chief of staff — never a generic chatbot.

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
- **Styling**: Tailwind CSS v4 + DaisyUI v5 + CVA
- **Runtime**: Bun (dev), Node 20 Alpine (Docker/prod)
- **Validation**: Zod + React Hook Form

## Architecture Guidelines

### Routing

Config-based routes in `app/routes.ts` using `@react-router/dev/routes`.
Route module order: `middleware` (optional) -> `loader` -> `action` -> component.

### Data Access

Use plain async functions in `app/models/*.server.ts`.
No classes and no ORM wrapper abstractions.

### AI Behavior Surface

- Preserve persona integrity in system prompts and route handlers.
- Ensure quick-path variants are available in workflow prompts.
- Persist useful context updates after each workflow/session.

### Integrations Strategy

Keep external providers behind composable boundaries so capabilities can be
enabled per tier without rewriting core workflow logic.

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

## Implementation Conventions

- Use `~/` path alias for app imports.
- Server-only modules use `.server.ts`.
- Use CVA from `cva.config` (not raw `cva`).
- Use DaisyUI v5 class names and project component patterns.
- Route pages set `<title>` and `<meta>` inline in JSX.
- Use `<Form>` with `intent` hidden fields for multi-action routes.
- Export route `ErrorBoundary` with `isRouteErrorResponse`.
- Prefer `tiny-invariant` for runtime assertions.

## Quality Bar

- Keep behavior aligned with product trust model and persona rules.
- Prefer complete, end-to-end features over partial scaffolding.
- Add/update tests when behavior changes.
- Run `bun run validate` after meaningful edits.

## Cross-Repo Hardening Feedback Loop

- This repo is also used to harden `~/repositories/iridium`.
- When a security, reliability, or architecture hardening improvement here is
  likely reusable upstream, document it in the relevant Linear project.
- Include enough detail for backporting: problem/risk, fix summary, files
  touched, and recommended upstream application notes.

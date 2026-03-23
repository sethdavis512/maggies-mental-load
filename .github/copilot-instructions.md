# Maggie's Mental Load — Copilot Project Instructions

## Primary Objective

Build Maggie's Mental Load as a trusted home-management system for working moms.
Every implementation should reduce mental overhead, preserve context across
sessions, and produce clear next actions.

Brand promise: **Mental Load, Managed.**

## Product Intent

- Maggie is a persona, not a generic assistant.
- The experience should feel warm, organized, and practical.
- Favor fast progress for exhausted users: quick path first, depth optional.

## Persona Guardrails (Non-Negotiable)

- Never mention AI/LLM/Claude/system internals in user-facing copy.
- Never shame or guilt users.
- Keep tone encouraging and efficient.
- Avoid making a list feel bigger than necessary.
- End workflow/session completions with: `Check that off your list. ✓`

## Scope Model (Build Direction)

Architect for all tiers now, even when implementing Tier 1 behaviors:

- Tier 1: planning/guidance workflows (no external execution)
- Tier 2: connected actions (calendar, email/messages, reminders, contacts)
- Tier 3: proactive/autonomous operations and broader integrations

Do not hardcode assumptions that block later integrations.

## Core Workflows to Protect

- Mental Load Capture (front door)
- Meals & Grocery
- Home Operations
- Kids & Family
- Scheduling & Logistics
- Finance & Budget
- Household Manual
- Seasonal check-in workflows

## System Memory Requirements

All workflow work should maintain shared continuity:

- Update the Master Running List (tasks, urgency, due dates, category)
- Update the Household Manual (preferences, children, providers, routines)
- Preserve and pass forward useful session context

## Privacy & Community Rules

- Show privacy reminder before sensitive intake (children, medical, financial,
  address, loyalty/rewards details).
- Require explicit opt-in before storing/sharing community wisdom.
- Never expose or repurpose private household data beyond intended features.

## UI/UX Direction

- Mobile-first and low-friction.
- Clean modern layout with warm feel and a bold accent as punctuation.
- Keep interactions short, skimmable, and action-oriented.

## Engineering Standards

- Framework: React Router v7 (config-based routing)
- Data layer: Prisma + PostgreSQL via `app/models/*.server.ts`
- Auth: Better Auth
- AI stack: Vercel AI SDK + VoltAgent
- Styling: Tailwind v4 + DaisyUI v5 + CVA
- Validation: Zod

## Delivery Expectations

- Implement complete flows, not disconnected fragments.
- Keep architecture integration-ready (Tier 2/3 safe by default).
- Preserve persona and trust model in prompts, handlers, and UI copy.
- Add tests or update existing tests when behavior changes.
- Run `bun run validate` after substantial changes.

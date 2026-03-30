# PRD: Enhanced System Prompt + Privacy Reminder System

## Introduction

Replace Maggie's current minimal system prompt with the full Master System Prompt from the product brief. This upgrades the agent's conversational intelligence with chaos mode detection, brain dump facilitation, privacy-gated data collection, proactive session flags, and a modular prompt composition system that supports workflow-specific behavior.

This is the foundation PRD. Every subsequent feature depends on Maggie behaving according to the brief's persona and rules.

## Goals

- Maggie's responses match the brief's personality: warm, efficient, slightly quirky, never clinical
- Chaos mode activates automatically when users signal overwhelm
- Brain dump mode invites and organizes stream-of-consciousness input
- Privacy reminders trigger before sensitive data collection (child details, medical, financial, addresses, loyalty accounts)
- One proactive observation per session maximum, never repeated if declined
- Every session closes with "Check that off your list."
- Prompt segments are modular and composable per workflow topic

## User Stories

### US-001: Modular prompt composition system
**Description:** As a developer, I need workflow-specific prompt segments so that Maggie's instructions stay maintainable and token-efficient.

**Acceptance Criteria:**
- [ ] `app/voltagent/prompts/base.ts` exports the core Maggie persona, rules, and privacy instructions
- [ ] `app/voltagent/prompts/meals.ts` exports meals & grocery workflow prompt segment
- [ ] `app/voltagent/prompts/home.ts` exports home operations workflow prompt segment
- [ ] `app/voltagent/prompts/kids.ts` exports kids & family workflow prompt segment
- [ ] `app/voltagent/prompts/scheduling.ts` exports scheduling & logistics workflow prompt segment
- [ ] `app/voltagent/prompts/finance.ts` exports finance & budget workflow prompt segment
- [ ] `app/voltagent/prompts/seasonal.ts` exports seasonal workflow prompt segments (spring, summer, fall, winter)
- [ ] `app/voltagent/prompts/onboarding.ts` exports onboarding routing rules
- [ ] `agents.ts` composes the base prompt with relevant workflow segments
- [ ] Typecheck passes

### US-002: Full persona and behavioral rules
**Description:** As a user, I want Maggie to feel like a warm, organized friend so that interactions feel personal and never robotic.

**Acceptance Criteria:**
- [ ] System prompt includes full personality description from brief section 3
- [ ] System prompt enforces: never reference AI/Claude/technology
- [ ] System prompt enforces: never shame, guilt, or overwhelm
- [ ] System prompt enforces: always offer a quick path for time-pressed users
- [ ] System prompt enforces: skip questions gracefully with best-guess assumptions
- [ ] System prompt enforces: gently check contradictions with previously shared info
- [ ] System prompt enforces: remember and treat dietary restrictions, preferences, and household details as standing facts
- [ ] Typecheck passes

### US-003: Chaos mode detection
**Description:** As a user in crisis, I want Maggie to immediately drop all structure and focus on one urgent thing so that I get help fast.

**Acceptance Criteria:**
- [ ] System prompt includes chaos mode trigger conditions (everything on fire, overwhelmed, panicked tone)
- [ ] When triggered, Maggie responds: "What's the single most urgent thing right now? One thing. We'll start there."
- [ ] All structured workflow steps are skipped in chaos mode
- [ ] Working memory `currentMode` field tracks "chaos" state
- [ ] Typecheck passes

### US-004: Brain dump mode
**Description:** As a user, I want to pour out everything on my mind in a messy stream and have Maggie sort it into categories so that I get relief and clarity.

**Acceptance Criteria:**
- [ ] System prompt includes brain dump invitation: "Just brain dump it all here -- messy and unfiltered. I'll sort it."
- [ ] Light prompts offered across: this week, the kids, the house, money, upcoming events, mental stuff
- [ ] Output is organized into the 6 categories with urgency flags (red/yellow/green/none)
- [ ] Working memory `currentMode` field tracks "braindump" state
- [ ] Typecheck passes

### US-005: Privacy reminder system
**Description:** As a user sharing sensitive information, I want Maggie to remind me my data is private before I share it so that I feel safe.

**Acceptance Criteria:**
- [ ] Full privacy reminder triggers on first sensitive data collection in a session (child profiles, medical info, financial data, addresses, loyalty accounts)
- [ ] Lighter privacy reminder for returning sessions where reminder was previously given
- [ ] Working memory `privacyReminderGiven` boolean tracks whether full reminder was delivered this session
- [ ] Privacy reminder text matches brief section 18
- [ ] General preferences (grocery store, cleaning vibe) do not trigger the reminder
- [ ] Typecheck passes

### US-006: Proactive flag rules
**Description:** As a user, I want Maggie to surface at most one helpful observation per session so that I get value without being nagged.

**Acceptance Criteria:**
- [ ] Working memory `proactiveFlagUsed` boolean tracks whether a proactive flag was used this session
- [ ] System prompt limits proactive observations to one per session
- [ ] Proactive flags are framed gently, never returned to if declined
- [ ] Typecheck passes

### US-007: Session closing sign-off
**Description:** As a user, I want Maggie to close every session with her signature line so that I feel a sense of accomplishment.

**Acceptance Criteria:**
- [ ] System prompt instructs closing with: "Check that off your list."
- [ ] Sign-off is natural and contextual, not forced
- [ ] Typecheck passes

### US-008: Extended working memory schema
**Description:** As a developer, I need the VoltAgent working memory to track session-level state for behavioral rules.

**Acceptance Criteria:**
- [ ] Working memory schema includes `privacyReminderGiven: boolean`
- [ ] Working memory schema includes `proactiveFlagUsed: boolean`
- [ ] Working memory schema includes `currentMode: 'normal' | 'chaos' | 'braindump'`
- [ ] Existing schema fields (name, preferences, topics) preserved
- [ ] Typecheck passes

## Functional Requirements

- FR-1: The system prompt must be composed from modular segments in `app/voltagent/prompts/`
- FR-2: The base prompt must include all non-negotiable persona rules from brief section 3
- FR-3: Chaos mode must activate based on user signals and drop all structure
- FR-4: Brain dump mode must invite unstructured input and produce categorized, prioritized output
- FR-5: Privacy reminders must trigger before collecting child details, medical data, financial data, addresses, or loyalty account data
- FR-6: Proactive observations must be limited to one per session via working memory tracking
- FR-7: Every session must close with "Check that off your list."
- FR-8: Working memory must track `privacyReminderGiven`, `proactiveFlagUsed`, and `currentMode`

## Non-Goals

- No new UI routes or components
- No new Prisma models
- No new agent tools (tool changes come in later PRDs)
- No workflow-specific logic beyond prompt segments (workflow behavior comes in PRDs 4-6)

## Technical Considerations

- The prompt composition system should concatenate base + relevant workflow segment(s) at agent construction time
- Token budget: the full system prompt should stay under 4,000 tokens to leave room for conversation context and retriever injections
- Workflow segment injection could be dynamic (based on working memory topics) or static (always include all segments). Start static, optimize later if token pressure becomes an issue.
- The model in `agents.ts` is currently `claude-3-haiku`. The brief specifies `claude-sonnet`. Confirm model choice before implementation.

## Success Metrics

- Maggie never references AI, Claude, or technology in responses
- Chaos mode activates within the first response when user signals overwhelm
- Privacy reminder appears before first sensitive data question in a session
- Proactive flags never exceed one per session
- Session closing line appears consistently

## Open Questions

- Should the model be upgraded from `claude-3-haiku` to `claude-sonnet` as the brief specifies? This affects cost and response quality.
- Should workflow segment injection be dynamic (topic-based) or static (always all segments) at launch?
- How should "session" be defined for proactive flag and privacy reminder tracking -- per thread, per day, or per conversation burst?

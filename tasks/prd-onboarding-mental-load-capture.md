# PRD: Onboarding + Mental Load Capture

## Introduction

Create the first-time user experience and the brain dump "front door" workflow. New users are guided through a composed-form wizard that captures their name, family snapshot, and preferred starting point. The wizard routes them into chat with a pre-loaded message. The brain dump workflow (mental load capture) uses the enhanced system prompt to categorize and prioritize everything a user dumps out, creating tasks in bulk.

## Goals

- New users understand what Maggie does and how to start within 60 seconds
- Family basics are captured before the first chat so Maggie has context
- Users who abandon onboarding mid-flow don't lose progress
- Brain dump produces categorized, urgency-flagged tasks in a single batch
- Dashboard adapts based on onboarding status

## User Stories

### US-001: Onboarding wizard route
**Description:** As a new user, I want a guided setup so that Maggie has enough context to help me from the first message.

**Acceptance Criteria:**
- [ ] New route `/onboarding` renders a composed-form wizard
- [ ] Route is accessible only to authenticated users who have not completed onboarding
- [ ] Authenticated users with `onboardedAt` set are redirected to `/chat`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-002: Onboarding Step 1 -- Welcome + name
**Description:** As a new user, I want to tell Maggie my name so that she can address me personally.

**Acceptance Criteria:**
- [ ] Step shows Maggie's welcome message matching brief section 7 tone
- [ ] Name input field with validation (required, max 100 chars)
- [ ] Name is saved to VoltAgent working memory via `onSubmitStep`
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Onboarding Step 2 -- Family snapshot
**Description:** As a new user, I want to share basic family info so that Maggie understands my household.

**Acceptance Criteria:**
- [ ] Fields: number of kids, approximate ages (free text, optional)
- [ ] Light touch: no required fields beyond step 1's name
- [ ] Copy reassures: "Don't worry about getting this perfect -- Maggie learns as you go"
- [ ] Data saved via `onSubmitStep` for abandon recovery
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: Onboarding Step 3 -- Choose your starting point
**Description:** As a new user, I want to pick what to tackle first so that I go straight to what matters.

**Acceptance Criteria:**
- [ ] Options match brief section 7: Brain dump (Option A) or Pick a workflow (Option B)
- [ ] Workflow options: Meals & Grocery, Home Operations, Kids & Family, Scheduling & Logistics, Finance & Budget, Mental Load Capture
- [ ] "Short on time?" option: "Just tell me the one thing that's been sitting on your list the longest"
- [ ] Selection determines the pre-loaded message sent to chat
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: Onboarding Step 4 -- Quick preferences (optional)
**Description:** As a new user, I want to optionally share quick preferences so that Maggie's first suggestions are more relevant.

**Acceptance Criteria:**
- [ ] Step is skippable (enabledWhen or skip button)
- [ ] Fields: preferred grocery store, calendar tool preference
- [ ] Preferences saved to VoltAgent working memory
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-006: Onboarding completion and routing
**Description:** As a new user who finished onboarding, I want to land in chat with my chosen topic pre-loaded so that I start getting help immediately.

**Acceptance Criteria:**
- [ ] On final submit, user's `onboardedAt` timestamp is set
- [ ] User is redirected to `/chat` with a new thread
- [ ] The thread's first user message is pre-populated based on step 3 selection (reuses PRESET_MESSAGES pattern)
- [ ] If brain dump was selected, message triggers brain dump mode
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-007: Onboarding abandon recovery
**Description:** As a user who left onboarding mid-flow, I want to resume where I left off so that I don't have to re-enter information.

**Acceptance Criteria:**
- [ ] `onSubmitStep` saves draft progress (could use localStorage or a server-side draft)
- [ ] Returning to `/onboarding` resumes at the last incomplete step
- [ ] Completed step data is pre-filled
- [ ] Typecheck passes

### US-008: User model onboarding field
**Description:** As a developer, I need to track whether a user has completed onboarding.

**Acceptance Criteria:**
- [ ] `User` model in Prisma schema has `onboardedAt DateTime?` field
- [ ] Migration runs successfully
- [ ] Existing users get `null` (treated as not onboarded, or skip onboarding for existing users)
- [ ] Typecheck passes

### US-009: Bulk task creation tool
**Description:** As a user doing a brain dump, I want Maggie to create all my categorized tasks at once so that the master list is populated efficiently.

**Acceptance Criteria:**
- [ ] New agent tool `bulk_create_tasks` accepts an array of tasks (title, category, urgency, optional deadline)
- [ ] Rate limited: 5 requests/hour per user
- [ ] Maximum 30 tasks per call
- [ ] Each task validated with same rules as existing `create_task`
- [ ] Returns summary of created tasks with count per category
- [ ] Typecheck passes

### US-010: Dynamic dashboard
**Description:** As a returning user, I want the dashboard to show real data instead of static cards so that I see what's relevant today.

**Acceptance Criteria:**
- [ ] New users without `onboardedAt` see onboarding CTA prominently
- [ ] Returning users see: upcoming tasks (next 7 days), recent threads, quick-start presets
- [ ] "Tonight's quick plan" card links to chat with meal-related preset
- [ ] "This week focus" card shows highest-urgency open tasks
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: `/onboarding` route uses composed-form with 3-4 steps and Zod validation
- FR-2: `onSubmitStep` persists draft progress for abandon recovery
- FR-3: Final submission sets `onboardedAt` and routes to chat with pre-loaded message
- FR-4: `bulk_create_tasks` agent tool creates up to 30 categorized tasks in one call
- FR-5: Dashboard renders differently for onboarded vs. non-onboarded users
- FR-6: Onboarding data populates VoltAgent working memory (name, kid count, preferences)

## Non-Goals

- No child profile creation during onboarding (that's PRD 3: Household Manual)
- No workflow-specific intelligence yet (PRDs 4-6)
- No integration with external calendar during onboarding (Tier 2)
- No account settings or profile editing (existing profile page handles this)

## Design Considerations

- Onboarding wizard should match the app's warm, clean aesthetic (kraft/denim/canvas palette)
- Each step should feel lightweight -- 1-3 fields max per step
- Progress indicator showing step position (composed-form provides `stepPosition`)
- Mobile-first: wizard must work well on small screens

## Technical Considerations

- composed-form `<ComposedForm>` wraps the wizard with a single Zod schema split across `<Step>` components
- `onSubmitStep` callback for draft persistence -- consider localStorage for simplicity, server-side if needed for cross-device recovery
- The pre-loaded chat message should use the existing `PRESET_MESSAGES` pattern from `thread.tsx` or similar mechanism
- Routing: middleware should check `onboardedAt` and redirect unonboarded users to `/onboarding`

## Success Metrics

- 80%+ of new users complete onboarding (all 3 required steps)
- Time to first meaningful Maggie interaction under 90 seconds
- Brain dump produces categorized tasks that accurately reflect user input

## Open Questions

- Should existing users (created before this feature) be prompted to complete onboarding, or should they be grandfathered in?
- Should abandon recovery use localStorage or server-side storage?
- Should the onboarding wizard be skippable entirely with a "Skip, I'll figure it out" link?

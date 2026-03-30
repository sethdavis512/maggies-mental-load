# PRD: Finance & Budget + Seasonal Workflows

## Introduction

Build the lower-frequency workflows. Finance covers subscription audits, bill calendars, quarterly budget review meetings, and kids' expense forecasting. Seasonal workflows are triggered 4x/year at season transitions: spring cleaning, summer vacation planning, fall family traditions, and winter new year reset. Finance data needs CRUD pages; seasonal workflows are purely conversational with outputs stored in tasks and the household manual.

## Goals

- Subscription audits surface money users didn't know they were spending
- Bill calendar organizes payments by due date with reminders for manual payments
- Quarterly budget meetings have a ready-made partner agenda
- Seasonal workflows proactively offered at the right time of year
- Seasonal conversations build a richer family profile that improves every future interaction

## User Stories

### US-001: Subscription model and data access
**Description:** As a developer, I need to track user subscriptions for auditing.

**Acceptance Criteria:**
- [ ] `Subscription` model: id, userId, name, cost (Decimal), billingCycle (enum: monthly, quarterly, annual), category (String?), lastAuditedAt (DateTime?), keepStatus (enum: keep, cancel, review, null), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/subscription.server.ts` with: createSubscription, getSubscriptionsByUserId, updateSubscription, deleteSubscription, getSubscriptionsForAudit (unaudited or audited > 90 days ago)
- [ ] Typecheck passes

### US-002: Bill model and data access
**Description:** As a developer, I need to track recurring bills with due dates.

**Acceptance Criteria:**
- [ ] `Bill` model: id, userId, name, amount (Decimal?), dueDay (Int, 1-31), autopay (Boolean, default false), category (String?), notes (String?), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/bill.server.ts` with: createBill, getBillsByUserId (ordered by dueDay), updateBill, deleteBill, getUpcomingBills (due within N days from today)
- [ ] Typecheck passes

### US-003: BudgetGoal model and data access
**Description:** As a developer, I need to track quarterly budget goals.

**Acceptance Criteria:**
- [ ] `BudgetGoal` model: id, userId, category (String), targetAmount (Decimal?), currentAmount (Decimal?), quarter (Int, 1-4), year (Int), notes (String?), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/budget-goal.server.ts` with: createBudgetGoal, getBudgetGoalsByQuarter, updateBudgetGoal, deleteBudgetGoal
- [ ] Typecheck passes

### US-004: SeasonalProfile model and data access
**Description:** As a developer, I need to store seasonal workflow outputs.

**Acceptance Criteria:**
- [ ] `SeasonalProfile` model: id, userId, season (enum: spring, summer, fall, winter), year (Int), completedAt (DateTime?), data (Json), createdAt, updatedAt
- [ ] Unique constraint on (userId, season, year)
- [ ] Migration runs successfully
- [ ] `app/models/seasonal-profile.server.ts` with: upsertSeasonalProfile, getSeasonalProfile, getSeasonalProfileHistory
- [ ] Typecheck passes

### US-005: Resolution model and data access
**Description:** As a developer, I need to store new year resolutions from the winter reset workflow.

**Acceptance Criteria:**
- [ ] `Resolution` model: id, userId, year (Int), category (String -- bad habit, new skill, person to emulate, good deed, place to visit, book, food, improvement), description (String), completedAt (DateTime?), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/resolution.server.ts` with: createResolution, getResolutionsByYear, updateResolution, completeResolution
- [ ] Typecheck passes

### US-006: Finance agent tools
**Description:** As a user, I want Maggie to manage my subscriptions, bills, and budget through conversation.

**Acceptance Criteria:**
- [ ] New tools: `create_subscription`, `list_subscriptions`, `update_subscription` (including audit status)
- [ ] New tools: `create_bill`, `list_bills`, `get_upcoming_bills`
- [ ] New tools: `create_budget_goal`, `list_budget_goals`
- [ ] All tools registered in agents.ts with appropriate rate limits
- [ ] Typecheck passes

### US-007: Seasonal workflow agent tools
**Description:** As a developer, I need agent tools for seasonal profile and resolution storage.

**Acceptance Criteria:**
- [ ] New tools: `save_seasonal_profile`, `get_seasonal_profile`
- [ ] New tools: `create_resolution`, `list_resolutions`
- [ ] Tools registered in agents.ts
- [ ] Typecheck passes

### US-008: Budget reference dashboard
**Description:** As a user, I want to see my subscriptions, bills, and budget goals on a dedicated page.

**Acceptance Criteria:**
- [ ] Route `/budget` shows three sections: subscriptions, bill calendar, budget goals
- [ ] Subscriptions show name, cost, billing cycle, and keep/cancel/review status with color coding
- [ ] Bill calendar shows bills ordered by due day, autopay flagged, manual payments highlighted
- [ ] Budget goals show current vs. target with simple progress indicator
- [ ] Empty states link to chat
- [ ] Added to sidebar navigation
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-009: Subscription audit batch form
**Description:** As a user, I want to quickly review multiple subscriptions and decide keep/cancel for each.

**Acceptance Criteria:**
- [ ] Accessible from `/budget` subscriptions section
- [ ] composed-form with 2 steps per subscription: details review, keep/cancel decision
- [ ] Batch mode: cycles through unaudited subscriptions
- [ ] Updates `keepStatus` and `lastAuditedAt` on each decision
- [ ] Shows running total of potential monthly savings from cancellations
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-010: Quarterly budget meeting agenda builder
**Description:** As a user, I want a structured agenda for my quarterly budget meeting with my partner.

**Acceptance Criteria:**
- [ ] Accessible from `/budget` page
- [ ] composed-form wizard with 4 steps matching brief's agenda: Last Quarter Review (10 min), Upcoming Quarter Planning (15 min), Savings & Goals Check (10 min), Quick Wins (5 min)
- [ ] Each step pre-populates relevant data (subscriptions marked for cancel, upcoming kids expenses from child profiles, bills due)
- [ ] Final output saved as notes and/or tasks
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-011: Finance workflow prompt segment
**Description:** As a developer, I need the finance workflow prompt to guide Maggie through money conversations.

**Acceptance Criteria:**
- [ ] `app/voltagent/prompts/finance.ts` includes: financial snapshot intake (income picture, bill management, subscription habits, savings goals, budget tool preference)
- [ ] Subscription audit flow: surface forgotten subscriptions, calculate potential savings
- [ ] Bill calendar building: organize by due date, flag manual payments
- [ ] Kids' budget forecasting: quarterly expense projection per child based on age and activities
- [ ] Non-judgmental tone: never judges spending, lifestyle, or financial situation
- [ ] Typecheck passes

### US-012: Seasonal workflow prompt segments
**Description:** As a developer, I need seasonal prompts that guide deep family profile conversations.

**Acceptance Criteria:**
- [ ] Spring (in `app/voltagent/prompts/seasonal.ts`): spring cleaning event planning, home details collection, cleaning preferences, partner contribution
- [ ] Summer: vacation planning, travel profile building, car seat guidance, age-appropriate travel tips
- [ ] Fall: holiday season mapping, non-negotiable traditions, stress points, gift philosophy
- [ ] Winter: year reflection, values conversation, eight-part resolution list
- [ ] Each seasonal prompt instructs Maggie to store learned info in Household Manual via tools
- [ ] Typecheck passes

### US-013: Seasonal workflow trigger logic
**Description:** As a user, I want Maggie to proactively offer seasonal workflows at the right time of year.

**Acceptance Criteria:**
- [ ] Agent detects current season based on date (Spring: Mar-May, Summer: Jun-Aug, Fall: Sep-Nov, Winter: Dec-Feb)
- [ ] If no SeasonalProfile exists for current season + year, Maggie offers the seasonal workflow as her one proactive flag
- [ ] If user declines, Maggie proceeds to standard seasonal checklist and does not re-offer
- [ ] Seasonal offer respects the one-proactive-flag-per-session rule (PRD 1)
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Five new Prisma models: Subscription, Bill, BudgetGoal, SeasonalProfile, Resolution
- FR-2: Agent tools for finance CRUD and seasonal profile storage
- FR-3: `/budget` reference dashboard with subscriptions, bills, and goals
- FR-4: Subscription audit batch form (composed-form, 2 steps per subscription)
- FR-5: Quarterly budget meeting agenda builder (composed-form, 4 steps)
- FR-6: Seasonal prompt segments for all 4 seasons
- FR-7: Date-based seasonal workflow trigger logic respecting proactive flag limit
- FR-8: Kids' expense forecasting uses child profile data from PRD 3/5

## Non-Goals

- No payment processing or bill pay integration (Tier 2+)
- No bank account linking or transaction import
- No automated subscription cancellation
- No community wisdom surfacing in seasonal workflows (PRD 7)

## Design Considerations

- Budget page should feel empowering, not stressful: use warm colors, celebrate savings found
- Subscription audit: green for "keep", red for "cancel", yellow for "review"
- Bill calendar: visual monthly calendar layout showing due dates, autopay items less prominent
- Seasonal workflows feel like a friend checking in, not a form to fill out

## Technical Considerations

- Subscription `cost` and Bill `amount` use Decimal type for financial accuracy
- Seasonal trigger: check in the `HouseholdManualRetriever` or a new `SeasonalRetriever` that runs at conversation start
- Resolution `category` matches the brief's eight-part list: bad_habit, new_skill, person_to_emulate, good_deed, place_to_visit, book, food, improvement
- Budget meeting agenda pre-population requires querying subscriptions, bills, budget goals, and child expenses -- consider a `getBudgetMeetingData` composite query

## Success Metrics

- Subscription audit surfaces at least one forgotten subscription for 50%+ of users who complete it
- Seasonal workflows complete rate above 60% when offered proactively
- Budget meeting agenda is usable as a standalone printable document

## Open Questions

- Should the budget page include a simple spending tracker, or is that scope creep for Tier 1?
- Should seasonal profiles be visible to the user, or purely Maggie's internal context?
- How should the resolution list be surfaced throughout the year -- as proactive flags, retriever context, or both?

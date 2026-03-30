# PRD: Kids & Family + Scheduling & Logistics Workflows

## Introduction

Build the two people-centric workflows. Kids & Family covers milestone tracking, activity research, birthday party planning, playdate rotation, and behavior support. Scheduling & Logistics covers weekly planning sessions, appointment management, recurring schedule building, childcare emergency plans, partner coordination, and date night planning. Both depend heavily on the Household Manual (PRD 3) for child profiles and provider data.

## Goals

- Milestones are tracked per child with age-appropriate suggestions and celebrations
- Birthday party planning produces a structured reverse timeline
- Playdate rotation tracks connections and nudges when families fall off the radar
- Weekly planning sessions populate the full week at a glance in under 5 minutes
- Emergency childcare plans are built proactively (before crisis), stored, and accessible
- Date night planning is proactive: Maggie schedules and coordinates

## User Stories

### US-001: Milestone model and data access
**Description:** As a developer, I need to track child milestones with expected and achieved dates.

**Acceptance Criteria:**
- [ ] `Milestone` model: id, childId (relation to Child), type (String), expectedDate (DateTime?), achievedDate (DateTime?), notes (String?), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/milestone.server.ts` with: createMilestone, getMilestonesByChildId, getUpcomingMilestones, completeMilestone, deleteMilestone
- [ ] Typecheck passes

### US-002: Activity model and data access
**Description:** As a developer, I need to track children's activities and programs.

**Acceptance Criteria:**
- [ ] `Activity` model: id, childId (relation to Child), name, location (String?), schedule (String?), cost (String?), season (String?), notes (String?), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/activity.server.ts` with: createActivity, getActivitiesByChildId, updateActivity, deleteActivity
- [ ] Typecheck passes

### US-003: BirthdayParty model and data access
**Description:** As a developer, I need to store birthday party plans with structured planning tasks.

**Acceptance Criteria:**
- [ ] `BirthdayParty` model: id, childId (relation to Child), year (Int), venue (String?), guestCount (Int?), budget (String?), theme (String?), planningTasks (Json?), notes (String?), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/birthday-party.server.ts` with: createBirthdayParty, getBirthdayPartiesByChildId, updateBirthdayParty, deleteBirthdayParty
- [ ] Typecheck passes

### US-004: Playdate model and data access
**Description:** As a developer, I need to track playdate connections and history.

**Acceptance Criteria:**
- [ ] `Playdate` model: id, childId (relation to Child), friendName, lastPlaydateAt (DateTime?), parentContact (String?), notes (String?), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/playdate.server.ts` with: createPlaydate, getPlaydatesByChildId, getStalePlaydates (not seen in N weeks), updatePlaydate, deletePlaydate
- [ ] Typecheck passes

### US-005: EmergencyPlan model and data access
**Description:** As a developer, I need to store the childcare emergency plan.

**Acceptance Criteria:**
- [ ] `EmergencyPlan` model: id, userId, primaryChildcare (String), backup1 (String?), backup2 (String?), sickKidProtocol (Json?), workFlexibility (String?), notes (String?), createdAt, updatedAt
- [ ] Unique constraint on userId (one plan per user)
- [ ] Migration runs successfully
- [ ] `app/models/emergency-plan.server.ts` with: upsertEmergencyPlan, getEmergencyPlan, deleteEmergencyPlan
- [ ] Typecheck passes

### US-006: RecurringSchedule model and data access
**Description:** As a developer, I need to store the family's recurring weekly schedule.

**Acceptance Criteria:**
- [ ] `RecurringSchedule` model: id, userId, dayOfWeek (Int, 0-6), items (Json -- array of time/description objects), createdAt, updatedAt
- [ ] Unique constraint on (userId, dayOfWeek)
- [ ] Migration runs successfully
- [ ] `app/models/recurring-schedule.server.ts` with: upsertScheduleDay, getWeeklySchedule, deleteScheduleDay
- [ ] Typecheck passes

### US-007: Kids & family agent tools
**Description:** As a user, I want Maggie to track milestones, activities, playdates, and birthdays through conversation.

**Acceptance Criteria:**
- [ ] New tools: `create_milestone`, `complete_milestone`, `get_milestones`
- [ ] New tools: `create_activity`, `list_activities`
- [ ] New tools: `create_birthday_party`, `get_birthday_parties`
- [ ] New tools: `create_playdate`, `list_playdates`, `get_stale_playdates`
- [ ] All tools registered in agents.ts with appropriate rate limits
- [ ] Typecheck passes

### US-008: Scheduling agent tools
**Description:** As a user, I want Maggie to manage my weekly schedule, emergency plan, and appointments.

**Acceptance Criteria:**
- [ ] New tools: `upsert_emergency_plan`, `get_emergency_plan`
- [ ] New tools: `upsert_schedule_day`, `get_weekly_schedule`
- [ ] New tool: `draft_outreach_message` -- generates ready-to-send text for appointments, babysitter requests, partner coordination (returns text, Tier 2+ executes)
- [ ] All tools registered in agents.ts
- [ ] Typecheck passes

### US-009: Kids reference page
**Description:** As a user, I want to view my children's profiles with milestone timelines so I can track their development.

**Acceptance Criteria:**
- [ ] Route `/kids` shows child profile cards (pulls from Household Manual child data)
- [ ] Each child card links to a detail view with: milestones (timeline), activities, upcoming birthday, playdates
- [ ] Milestone timeline shows achieved (checked) and upcoming (expected) milestones
- [ ] Empty states link to chat
- [ ] Added to sidebar navigation
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-010: Schedule reference page
**Description:** As a user, I want to view my weekly schedule and emergency plan so I can reference them quickly.

**Acceptance Criteria:**
- [ ] Route `/schedule` shows: weekly recurring schedule (day-by-day), emergency childcare plan
- [ ] Weekly view shows each day with time-slotted items
- [ ] Emergency plan displayed as a card with primary, backup 1, backup 2, sick protocol
- [ ] Empty states link to chat
- [ ] Added to sidebar navigation
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-011: Birthday party planner wizard
**Description:** As a user, I want to plan a birthday party step-by-step from the UI so that nothing gets missed.

**Acceptance Criteria:**
- [ ] Accessible from child detail page on `/kids`
- [ ] composed-form wizard with 4 steps: date & venue, guest list & invitations, budget & theme, planning timeline
- [ ] Final step generates a reverse timeline of planning tasks (creates tasks via action)
- [ ] Saved as BirthdayParty record linked to child
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-012: Emergency childcare plan wizard
**Description:** As a user, I want to build my emergency plan calmly and completely so it's ready when I need it.

**Acceptance Criteria:**
- [ ] Accessible from `/schedule` page
- [ ] composed-form wizard with 4 steps: primary childcare, backup 1 (with contact info), backup 2 (with contact info), sick kid protocol (work flexibility, pediatrician on-call info, medication notes)
- [ ] Each step pulls known providers from Household Manual as suggestions
- [ ] Saved as EmergencyPlan record
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-013: Kids workflow prompt segment
**Description:** As a developer, I need the kids workflow prompt to guide Maggie through child-related conversations.

**Acceptance Criteria:**
- [ ] `app/voltagent/prompts/kids.ts` includes: chaos mode triggers (sick kid, missed appointment, forgotten party, feeding meltdown)
- [ ] Milestone celebration: Maggie stops and genuinely celebrates every milestone achieved
- [ ] Milestone-triggered shopping suggestions (6mo, 12mo, 18mo, 2yr, 3yr per brief)
- [ ] Behavior sidekick: connects dots only when asked, never volunteers
- [ ] Sleep schedule support: AAP-aligned, references frameworks mom trusts
- [ ] Packing list generation based on ages, destination, trip length
- [ ] Typecheck passes

### US-014: Scheduling workflow prompt segment
**Description:** As a developer, I need the scheduling workflow prompt for weekly planning and logistics.

**Acceptance Criteria:**
- [ ] `app/voltagent/prompts/scheduling.ts` includes: chaos mode triggers (double booking, childcare fell through, forgotten appointment)
- [ ] Five-minute weekly planning session structure from brief
- [ ] Personal time protection: flagged every week, non-negotiable
- [ ] Partner coordination: ready-to-send logistics messages
- [ ] Date night planning: proactive scheduling, restaurant research, childcare coordination
- [ ] Schedule overwhelm handling: "Not everything has to happen"
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Six new Prisma models: Milestone, Activity, BirthdayParty, Playdate, EmergencyPlan, RecurringSchedule
- FR-2: Agent tools for all kids and scheduling CRUD operations
- FR-3: `/kids` and `/schedule` reference pages with data from Household Manual and new models
- FR-4: Birthday party wizard (composed-form, 4 steps) generates reverse timeline tasks
- FR-5: Emergency plan wizard (composed-form, 4 steps) pulls provider suggestions from Household Manual
- FR-6: `draft_outreach_message` tool returns Tier 2-ready structured data
- FR-7: Workflow prompts encode chaos mode, milestone celebrations, weekly planning structure, date night planning

## Non-Goals

- No actual calendar integration (Tier 2)
- No actual message sending (Tier 2)
- No school portal integration (Tier 3)
- No community wisdom surfacing (PRD 7)

## Technical Considerations

- Milestone `type` should be a free-text string, not an enum, since milestones vary widely by age and child
- BirthdayParty `planningTasks` JSON stores the reverse timeline: `[{ weeksOut: 8, task: "Book venue", done: false }]`
- EmergencyPlan unique constraint on userId ensures one plan per user (upsert pattern)
- RecurringSchedule `items` JSON: `[{ time: "8:00 AM", description: "School drop-off" }]`
- `draft_outreach_message` tool should include the `actionable` field pattern for Tier 2 readiness
- Playdate `getStalePlaydates` query: where `lastPlaydateAt < NOW() - interval` or `lastPlaydateAt IS NULL`

## Success Metrics

- Milestones are celebrated in conversation when achieved
- Emergency plan accessible within 2 taps during a crisis
- Weekly planning sessions complete in under 5 minutes
- Birthday party reverse timeline covers all planning tasks 6-8 weeks out

## Open Questions

- Should milestone data be pre-seeded with AAP developmental milestones per age, or built up organically through conversation?
- How should "stale playdate" threshold be configured -- fixed (4 weeks) or user-adjustable?
- Should date night planning be a standalone nav item or remain within the scheduling workflow?

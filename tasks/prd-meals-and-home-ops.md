# PRD: Meals & Grocery + Home Operations Workflows

## Introduction

Build the two most tangible, frequently-used workflows. Meals & Grocery handles weekly meal planning, grocery list generation organized by store section, chaos mode for dinner emergencies, and fridge cleanout mode. Home Operations handles cleaner scheduling, maintenance calendars, vendor management, time-based cleaning plans, and "something broke" handling. Both workflows are primarily conversational with read-only reference dashboards.

## Goals

- Users can generate a full weekly meal plan and organized grocery list in one chat session
- Home maintenance items are tracked with due dates and automatic resurfacing
- Cleaning zones track when each area was last cleaned, with priority-based suggestions
- Chaos mode handles "I have nothing in the house" and "something broke" scenarios
- Reference dashboards at `/meals` and `/home-ops` display output from chat sessions

## User Stories

### US-001: MealPlan model and data access
**Description:** As a developer, I need to persist generated meal plans.

**Acceptance Criteria:**
- [ ] `MealPlan` model: id, userId, weekStartDate (DateTime), meals (Json -- array of day/meal objects), notes (String?), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/meal-plan.server.ts` with: createMealPlan, getMealPlansByUserId, getCurrentMealPlan, deleteMealPlan
- [ ] Typecheck passes

### US-002: GroceryList model and data access
**Description:** As a developer, I need to persist generated grocery lists organized by store section.

**Acceptance Criteria:**
- [ ] `GroceryList` model: id, userId, mealPlanId (optional relation), storeName (String?), items (Json -- array of section/item objects), weekStartDate (DateTime), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/grocery-list.server.ts` with: createGroceryList, getGroceryListsByUserId, getCurrentGroceryList, deleteGroceryList
- [ ] Typecheck passes

### US-003: Meal planning agent tools
**Description:** As a user, I want Maggie to create meal plans and grocery lists that persist so I can reference them later.

**Acceptance Criteria:**
- [ ] New tool `create_meal_plan`: accepts weekStartDate, meals array (day, mealType, recipe, notes), optional notes
- [ ] New tool `get_meal_plan`: returns current or specified week's meal plan
- [ ] New tool `create_grocery_list`: accepts store name, items organized by section, optional mealPlanId link
- [ ] New tool `get_grocery_list`: returns current or specified week's grocery list
- [ ] Tools registered in agents.ts
- [ ] Rate limited appropriately
- [ ] Typecheck passes

### US-004: MealPlanToolPart and GroceryListToolPart
**Description:** As a user, I want meal plans and grocery lists to render as rich cards in chat so they're easy to read.

**Acceptance Criteria:**
- [ ] `MealPlanToolPart` component renders meal plan as a daily grid/list with meal names
- [ ] `GroceryListToolPart` component renders grocery list organized by store section with item counts
- [ ] Both follow existing `NoteToolPart`/`TaskToolPart` pattern
- [ ] Loading and completed states
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: Meals reference dashboard
**Description:** As a user, I want to view my current meal plan and grocery list on a dedicated page so I can reference them while shopping or cooking.

**Acceptance Criteria:**
- [ ] Route `/meals` shows current week's meal plan and grocery list
- [ ] Meal plan displayed as daily cards with meal details
- [ ] Grocery list displayed organized by store section with checkable items (client-side only)
- [ ] Empty state links to chat: "Ask Maggie to plan your week"
- [ ] Added to sidebar navigation
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-006: MaintenanceItem model and data access
**Description:** As a developer, I need to track home maintenance items with recurring schedules.

**Acceptance Criteria:**
- [ ] `MaintenanceItem` model: id, userId, title, category (String), intervalMonths (Int?), lastCompletedAt (DateTime?), nextDueAt (DateTime?), notes (String?), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/maintenance-item.server.ts` with: createMaintenanceItem, getMaintenanceItemsByUserId, getUpcomingMaintenance (due within N days), completeMaintenanceItem (sets lastCompletedAt, computes nextDueAt), deleteMaintenanceItem
- [ ] Typecheck passes

### US-007: CleaningZone model and data access
**Description:** As a developer, I need to track cleaning zones with last-cleaned timestamps.

**Acceptance Criteria:**
- [ ] `CleaningZone` model: id, userId, name (String), lastCleanedAt (DateTime?), priority (Int, default 0), notes (String?), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/cleaning-zone.server.ts` with: createCleaningZone, getCleaningZonesByUserId (ordered by lastCleanedAt ascending -- dirtiest first), updateCleaningZone, markCleaned, deleteCleaningZone
- [ ] Typecheck passes

### US-008: Home operations agent tools
**Description:** As a user, I want Maggie to manage my home maintenance and cleaning schedule.

**Acceptance Criteria:**
- [ ] New tool `create_maintenance_item`: accepts title, category, intervalMonths, nextDueAt, notes
- [ ] New tool `list_maintenance_items`: returns all items, with option to filter upcoming-only
- [ ] New tool `complete_maintenance_item`: marks item done, auto-computes next due date
- [ ] New tool `list_cleaning_zones`: returns zones sorted by longest-since-cleaned
- [ ] New tool `update_cleaning_zone`: creates or updates zone, can mark as cleaned
- [ ] Tools registered in agents.ts
- [ ] Typecheck passes

### US-009: MaintenanceToolPart component
**Description:** As a user, I want maintenance items to render as informative cards in chat.

**Acceptance Criteria:**
- [ ] `MaintenanceToolPart` renders maintenance items with title, next due date, and status
- [ ] Cleaning zone results show zone name with "last cleaned" relative time
- [ ] Follows existing tool part pattern
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-010: Home ops reference dashboard
**Description:** As a user, I want to see my maintenance calendar and cleaning status on a dedicated page.

**Acceptance Criteria:**
- [ ] Route `/home-ops` shows two sections: upcoming maintenance and cleaning zones
- [ ] Maintenance items sorted by next due date, overdue items highlighted
- [ ] Cleaning zones sorted by priority (longest since cleaned first)
- [ ] Empty states link to chat
- [ ] Added to sidebar navigation
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-011: Meals workflow prompt segment
**Description:** As a developer, I need the meals workflow prompt to guide Maggie through the brief's session structure.

**Acceptance Criteria:**
- [ ] `app/voltagent/prompts/meals.ts` includes: chaos mode triggers (nothing in the house, don't know what to make, 10 minutes, exhausted tone)
- [ ] Full intake guidance: WHO, DIETARY, HEALTH GOAL, NIGHTS, EFFORT, STORE -- all in one message
- [ ] Household manual cross-reference instruction (confirm existing dietary prefs)
- [ ] Lunch option guidance (leftovers vs. separate)
- [ ] Toddler-specific adjustment flags
- [ ] Fridge cleanout mode: build around what's already in the house
- [ ] Last minute dinner: 20-minute solution with on-hand ingredients
- [ ] Typecheck passes

### US-012: Home ops workflow prompt segment
**Description:** As a developer, I need the home ops workflow prompt to guide Maggie through maintenance and cleaning flows.

**Acceptance Criteria:**
- [ ] `app/voltagent/prompts/home.ts` includes: chaos mode triggers (something broke, house out of control)
- [ ] Time-based cleaning guidance: 10 min / 30 min / 1 hour / full day plans
- [ ] Vendor management: store contacts in Household Manual via provider tools
- [ ] Cleaner scheduling with outreach message drafting
- [ ] Seasonal task awareness (reference seasonal home calendar from brief)
- [ ] "Something broke" handling: urgent vs. non-urgent repair paths
- [ ] "Cleaner cancelled" recovery: two-option plan
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Four new Prisma models: MealPlan, GroceryList, MaintenanceItem, CleaningZone
- FR-2: Agent tools for creating, reading, and completing meal plans, grocery lists, maintenance items, and cleaning zones
- FR-3: Rich tool result components render structured data in chat
- FR-4: `/meals` and `/home-ops` routes provide read-only reference dashboards
- FR-5: Workflow prompt segments encode the brief's session structure and chaos mode triggers
- FR-6: Meals workflow reads dietary preferences and grocery store from Household Manual (PRD 3)
- FR-7: Home ops workflow reads and writes vendor contacts via provider tools (PRD 3)

## Non-Goals

- No integration with grocery delivery services (Tier 3)
- No integration with smart home devices (Tier 3)
- No community wisdom surfacing yet (PRD 7)
- No automatic seasonal task scheduling (PRD 6)

## Technical Considerations

- MealPlan `meals` JSON structure: `[{ day: "Monday", meals: [{ type: "dinner", name: "...", notes: "..." }] }]`
- GroceryList `items` JSON structure: `[{ section: "Produce", items: [{ name: "...", quantity: "...", checked: false }] }]`
- The `/meals` grocery list checkbox state is client-side only (no persistence needed for "checked while shopping")
- MaintenanceItem `completeMaintenanceItem` should auto-compute `nextDueAt` by adding `intervalMonths` to current date
- CleaningZone ordering by `lastCleanedAt ASC NULLS FIRST` ensures never-cleaned zones surface first

## Success Metrics

- Users can generate a full meal plan + grocery list in under 5 minutes of conversation
- Home maintenance items surface as due before they're overdue
- Cleaning zone priority ordering matches intuition (dirtiest areas first)

## Open Questions

- Should the grocery list on `/meals` support persistent checkmarks (server-side) for shared household shopping?
- Should maintenance items have a "snooze" action for items that aren't urgent?
- How detailed should the seasonal home calendar be at launch vs. progressive build-out?

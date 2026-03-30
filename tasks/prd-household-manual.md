# PRD: Household Manual

## Introduction

Build the persistent family profile that every other workflow reads from and writes to. The Household Manual stores child profiles, providers/vendors, family members, preferences, and loyalty programs. Data enters primarily through chat (Maggie auto-stores what users mention) and can be browsed and edited via dedicated UI pages. This is the foundational data layer for PRDs 4-7.

## Goals

- Maggie automatically captures and stores family details mentioned in conversation
- Users can browse and edit everything Maggie knows about their household via `/household` pages
- Child profiles, providers, and preferences are structured Prisma models (not just chat memory)
- A HouseholdManualRetriever injects relevant context before each message so Maggie never asks for something she's already been told
- All data entry and display paths write to the same models

## User Stories

### US-001: Child model and data access layer
**Description:** As a developer, I need a Child model to store child profiles persistently.

**Acceptance Criteria:**
- [ ] `Child` model in Prisma: id, userId, name, birthday (DateTime?), sizingJson (Json?), allergies (String?), interests (String?), pediatrician (String?), notes (String?), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/child.server.ts` with: createChild, getChildrenByUserId, getChildById, updateChild, deleteChild
- [ ] Typecheck passes

### US-002: Provider model and data access layer
**Description:** As a developer, I need a Provider model to store vendor/service provider contacts.

**Acceptance Criteria:**
- [ ] `Provider` model in Prisma: id, userId, name, category (enum: cleaner, pest_control, lawn, babysitter, handyman, hvac, plumber, electrician, pet_services, pediatrician, specialist, other), phone (String?), email (String?), notes (String?), cost (String?), frequency (String?), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/provider.server.ts` with: createProvider, getProvidersByUserId, getProvidersByCategory, updateProvider, deleteProvider, searchProviders
- [ ] Typecheck passes

### US-003: HouseholdPreference model and data access layer
**Description:** As a developer, I need a key-value preference store for household details.

**Acceptance Criteria:**
- [ ] `HouseholdPreference` model in Prisma: id, userId, key (String), value (String), category (enum: dietary, cleaning, travel, financial, calendar, grocery, general), createdAt, updatedAt
- [ ] Unique constraint on (userId, key)
- [ ] Migration runs successfully
- [ ] `app/models/preference.server.ts` with: setPreference (upsert), getPreferencesByUserId, getPreferencesByCategory, getPreference (by key), deletePreference
- [ ] Typecheck passes

### US-004: FamilyMember model and data access layer
**Description:** As a developer, I need a FamilyMember model for non-child household members.

**Acceptance Criteria:**
- [ ] `FamilyMember` model in Prisma: id, userId, name, relationship (String), notes (String?), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/family-member.server.ts` with: createFamilyMember, getFamilyMembersByUserId, updateFamilyMember, deleteFamilyMember
- [ ] Typecheck passes

### US-005: LoyaltyProgram model and data access layer
**Description:** As a developer, I need a LoyaltyProgram model for airline, hotel, and reward program numbers.

**Acceptance Criteria:**
- [ ] `LoyaltyProgram` model in Prisma: id, userId, programName (String), memberNumber (String?), brand (String?), notes (String?), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/loyalty-program.server.ts` with: createLoyaltyProgram, getLoyaltyProgramsByUserId, updateLoyaltyProgram, deleteLoyaltyProgram
- [ ] Typecheck passes

### US-006: Agent tools for child profiles
**Description:** As a user chatting with Maggie, I want her to automatically save child details I mention so that she remembers them.

**Acceptance Criteria:**
- [ ] New tool `upsert_child_profile`: accepts name (required), birthday, sizing, allergies, interests, pediatrician, notes. Creates or updates by matching on userId + name.
- [ ] New tool `get_child_profiles`: returns all children for the user
- [ ] Tools registered in agents.ts
- [ ] Rate limited: 10 requests/hour per user for upsert
- [ ] Typecheck passes

### US-007: Agent tools for providers
**Description:** As a user chatting with Maggie, I want her to save vendor and provider contacts I mention so that she can reference them later.

**Acceptance Criteria:**
- [ ] New tool `upsert_provider`: accepts name (required), category (required), phone, email, notes, cost, frequency. Creates or updates by matching on userId + name + category.
- [ ] New tool `get_providers`: returns all providers for user, optionally filtered by category
- [ ] New tool `search_providers`: searches by name or category
- [ ] Tools registered in agents.ts
- [ ] Rate limited: 10 requests/hour per user for upsert
- [ ] Typecheck passes

### US-008: Agent tools for preferences
**Description:** As a user chatting with Maggie, I want her to remember my preferences so that she never asks for something she's been told.

**Acceptance Criteria:**
- [ ] New tool `set_preference`: accepts key (required), value (required), category (required). Upserts by userId + key.
- [ ] New tool `get_preferences`: returns all preferences for user, optionally filtered by category
- [ ] Tools registered in agents.ts
- [ ] Rate limited: 20 requests/hour per user for set
- [ ] Typecheck passes

### US-009: Agent tools for family members and loyalty programs
**Description:** As a developer, I need agent tools for the remaining household manual models.

**Acceptance Criteria:**
- [ ] New tool `upsert_family_member`: accepts name (required), relationship (required), notes
- [ ] New tool `upsert_loyalty_program`: accepts programName (required), memberNumber, brand, notes
- [ ] Tools registered in agents.ts
- [ ] Typecheck passes

### US-010: HouseholdManualRetriever
**Description:** As a developer, I need a retriever that injects relevant household manual data before each message so Maggie has family context.

**Acceptance Criteria:**
- [ ] New `app/voltagent/retrievers/household-manual.ts` retriever
- [ ] Retriever queries child profiles, providers, and preferences based on conversation topic
- [ ] Uses working memory `topics` array to determine which manual sections are relevant
- [ ] Integrated into `CombinedRetriever` alongside existing notes and tasks retrievers
- [ ] Does not inject the entire manual on every message (selective injection)
- [ ] Typecheck passes

### US-011: Household manual overview page
**Description:** As a user, I want to see everything Maggie knows about my household in one organized place.

**Acceptance Criteria:**
- [ ] New route `/household` shows sections: Family, Providers, Preferences, Loyalty Programs
- [ ] Each section shows a summary count and preview of entries
- [ ] Links to detail pages for each section
- [ ] Empty sections show friendly message linking to chat
- [ ] Added to sidebar navigation
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-012: Child profiles page
**Description:** As a user, I want to view, add, and edit my children's profiles so that I can verify and correct what Maggie knows.

**Acceptance Criteria:**
- [ ] Route `/household/children` lists all child profiles with name, age (computed from birthday), and key details
- [ ] "Add child" button opens a composed-form wizard (4 steps: basics, health, sizing, interests)
- [ ] Each child card has an "Edit" button that opens the same wizard pre-filled
- [ ] Delete with confirmation
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-013: Providers page
**Description:** As a user, I want to browse and manage my vendor/provider directory so that I can find contacts quickly.

**Acceptance Criteria:**
- [ ] Route `/household/providers` lists providers grouped by category
- [ ] "Add provider" button opens a composed-form (2 steps: contact info, service details)
- [ ] Each provider card shows name, category, phone/email, and notes
- [ ] Edit and delete actions
- [ ] Search/filter by category
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-014: Preferences page
**Description:** As a user, I want to see and edit my household preferences so that I can correct Maggie's assumptions.

**Acceptance Criteria:**
- [ ] Route `/household/preferences` shows preferences grouped by category (dietary, cleaning, travel, financial, etc.)
- [ ] Each preference shows key-value pair with inline edit capability
- [ ] "Add preference" allows adding new key-value pairs
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Five new Prisma models: Child, Provider, HouseholdPreference, FamilyMember, LoyaltyProgram
- FR-2: Data access functions in `app/models/*.server.ts` for all models
- FR-3: Agent tools for CRUD operations on all household manual models
- FR-4: HouseholdManualRetriever injects relevant family context before each message
- FR-5: `/household` route tree provides browsing and editing UI
- FR-6: composed-form wizards for child profile creation (4 steps) and provider creation (2 steps)
- FR-7: System prompt instructs Maggie to auto-store family details mentioned in conversation using tools
- FR-8: Maggie never asks for information she has already been told (enforced via retriever + prompt)

## Non-Goals

- No community wisdom features (PRD 7)
- No seasonal profile storage yet (PRD 6)
- No export functionality (brief mentions conversation-driven export, deferred)
- No Household Manual setup as an onboarding path (onboarding is PRD 2)

## Design Considerations

- Child profile wizard should feel warm and non-clinical: "Tell me about your little one" not "Enter child data"
- Provider directory should be scannable: category icons, quick-copy for phone/email
- Preferences page should be simple: key-value pairs with inline editing, not a complex form
- All pages match the existing kraft/denim/canvas palette

## Technical Considerations

- Child `sizingJson` stores structured clothing/shoe sizes as JSON to avoid rigid schema for sizes that vary by age
- Provider `category` enum should be extensible (include `other` option)
- HouseholdPreference uses upsert pattern (unique on userId + key) to prevent duplicates
- HouseholdManualRetriever should prioritize recently updated entries and topic-relevant data to stay within token limits
- composed-form child wizard: `<ComposedForm schema={childSchema}>` with 4 `<Step>` components. Step 2 (health) should trigger privacy reminder display.

## Success Metrics

- Users can find any stored household detail within 2 taps from the sidebar
- 90%+ of data entered through chat is correctly persisted in the database
- Maggie references stored child names, ages, and preferences naturally in conversation

## Open Questions

- Should the Household Manual overview be a sidebar top-level item or nested under a "My Home" section?
- How should conflicting data be handled (e.g., Maggie stores a preference via chat, user edits it on the preferences page)?
- Should there be a "What Maggie knows about you" conversational export command?

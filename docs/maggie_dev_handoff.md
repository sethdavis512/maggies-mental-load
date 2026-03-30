**Maggie\'s Mental Load**

Developer Handoff & Build Order

  ---------------------------

  ---------------------------

Prepared for Morgan\'s developer review

Confidential --- Tier 1 Launch Scope

  -----------------------------------------------------------------------
  **01 Overview & Context**

  -----------------------------------------------------------------------

**What You\'re Building**

Maggie\'s Mental Load is a subscription AI application for working moms.
The core product is a branded AI persona named Maggie --- built on the
Anthropic API (Claude) --- who acts as a home chief of staff. Maggie is
not a chatbot. She is a product. The persona must be seamless: she never
references Claude, AI, or any underlying technology.

This document covers the Tier 1 launch build only. All architectural
decisions must anticipate Tier 2 and Tier 3 integrations --- but nothing
outside Tier 1 scope should be built now.

**Confirmed Tech Stack**

  --------------------- -------------------------------------------------
  **Frontend**          React Router 7 (framework mode)

  **Database**          PostgreSQL

  **AI Engine**         Anthropic API --- claude-sonnet-4-20250514

  **Mobile**            Mobile-first responsive web. Not a native app at
                        launch --- but every UI decision should be made
                        as if the primary user is on an iPhone with one
                        hand free.

  **Hosting**           TBD --- recommend Vercel (frontend) + Railway or
                        Supabase (Postgres)

  **Auth**              TBD --- recommend Clerk or Supabase Auth for fast
                        OAuth setup
  --------------------- -------------------------------------------------

  -----------------------------------------------------------------------
  **02 Architecture Overview**

  -----------------------------------------------------------------------

**The Hive Mind Model**

Every workflow feeds one central system. There are four core persistent
objects that Maggie reads from and writes to on every session:

  ------------------ ----------------------------------------------------
  **Household        Everything Maggie knows about this family.
  Manual**           Preferences, child profiles, vendor contacts, travel
                     profiles, holiday DNA. Builds automatically. Never
                     resets.

  **Master Running   The living task spine. Every item mentioned in any
  List**             workflow is captured here with category, urgency,
                     and deadline. Never resets. Only grows, refines, and
                     checks off.

  **Session          Full conversation history passed on every API call.
  History**          Maggie has no memory between sessions without this.
                     This is her brain.

  **Community DB**   Approved tips from real moms. Gated --- nothing
                     stored or surfaced without explicit user opt-in.
                     Separate from user data entirely.
  ------------------ ----------------------------------------------------

+-----------------------------------------------------------------------+
| **⚠ Critical Architecture Principle**                                 |
|                                                                       |
| Build for Tier 3 from day one. Every structural decision --- database |
| schema, API layer, auth system --- must support future integrations   |
| (Google Calendar, Gmail, Amazon, smart home) without rebuilding the   |
| core. The integration layer should be a switchboard you flip on, not  |
| a new architecture.                                                   |
+-----------------------------------------------------------------------+

**Context Window Strategy**

This is the most important engineering decision in the product. Maggie
has no memory between sessions unless you pass it to her. On every API
call you must include:

- The Master System Prompt (defines Maggie\'s persona and rules ---
  never changes)

- A Household Manual summary for this user (structured JSON digest, not
  raw)

- Relevant Master Running List items for the current workflow

- Full session history for the current conversation

As the Household Manual grows, passing it raw will become expensive and
may hit context limits. The recommended approach is a retrieval layer:

- Store the full Household Manual in Postgres

- On each API call, pull only the sections relevant to the active
  workflow

- Example: Meals workflow pulls dietary prefs, grocery store, kids\'
  food notes --- not the travel profile or loyalty numbers

- Build this retrieval layer from day one. Retrofitting it later is
  painful.

  -----------------------------------------------------------------------
  **03 Database Schema**

  -----------------------------------------------------------------------

**Core Tables**

*All tables should include created_at and updated_at timestamps. Use
UUIDs for primary keys.*

**users**

  -------------------- --------------- -------------------------------------
  **Field**            **Type**        **Notes**

  **id**               uuid PK         

  **email**            text unique     

  **name**             text            Captured naturally in onboarding,
                                       never force-asked

  **grocery_store**    text            

  **calendar_tool**    text            google / apple / none

  **reminder_tool**    text            

  **budget_comfort**   text            casual / mid / splurge

  **cleaning_style**   text            

  **preferences**      jsonb           Overflow bucket for misc prefs Maggie
                                       learns

  **created_at**       timestamptz     
  -------------------- --------------- -------------------------------------

**children**

  --------------------- --------------- -------------------------------------
  **Field**             **Type**        **Notes**

  **id**                uuid PK         

  **user_id**           uuid FK         References users.id

  **name**              text            

  **birthday**          date            Used to calculate age and trigger
                                        milestone reminders

  **clothing_sizes**    jsonb           { shirt: \'2T\', pants: \'18m\',
                                        shoes: \'6\' }

  **allergies**         text\[\]        

  **interests**         text\[\]        

  **pediatrician_id**   uuid FK         References providers.id

  **food_notes**        text            What they won\'t eat, texture issues,
                                        etc.
  --------------------- --------------- -------------------------------------

**providers**

  ------------------ --------------- -------------------------------------
  **Field**          **Type**        **Notes**

  **id**             uuid PK         

  **user_id**        uuid FK         

  **type**           text            cleaner / doctor / contractor /
                                     babysitter / hvac / etc.

  **name**           text            

  **contact**        text            Phone or email

  **frequency**      text            bi-weekly / monthly / as-needed

  **notes**          text            

  **last_used**      date            
  ------------------ --------------- -------------------------------------

**master_list**

  --------------------- --------------- -------------------------------------
  **Field**             **Type**        **Notes**

  **id**                uuid PK         

  **user_id**           uuid FK         

  **category**          text            meals / home / kids / scheduling /
                                        finance / mental

  **item**              text            The task description

  **urgency**           text            red / yellow / green / none

  **deadline**          date            Nullable

  **source_workflow**   text            Which workflow captured this

  **session_count**     int             How many sessions this item has
                                        appeared --- used to surface repeated
                                        items

  **completed_at**      timestamptz     Null until confirmed done

  **created_at**        timestamptz     
  --------------------- --------------- -------------------------------------

**sessions**

  ------------------ --------------- -------------------------------------
  **Field**          **Type**        **Notes**

  **id**             uuid PK         

  **user_id**        uuid FK         

  **workflow**       text            onboarding / mental / meals / home /
                                     kids / scheduling / finance

  **messages**       jsonb           Full message array --- passed to
                                     Anthropic API on resume

  **summary**        text            Short summary Maggie generates at
                                     session close

  **started_at**     timestamptz     

  **completed_at**   timestamptz     
  ------------------ --------------- -------------------------------------

**loyalty_programs**

  ------------------ --------------- -------------------------------------
  **Field**          **Type**        **Notes**

  **id**             uuid PK         

  **user_id**        uuid FK         

  **type**           text            airline / hotel / grocery / other

  **brand**          text            

  **number**         text encrypted  Encrypt at rest

  **notes**          text            
  ------------------ --------------- -------------------------------------

**community_wisdom**

  ------------------ --------------- -------------------------------------
  **Field**          **Type**        **Notes**

  **id**             uuid PK         

  **category**       text            meals / home / kids / etc.

  **tip**            text            The mom\'s experience in her own
                                     words

  **context**        text            Child\'s age, situation, what
                                     specifically worked

  **display_name**   text            Optional --- only if mom chose to
                                     include her name

  **approved_at**    timestamptz     NULL until explicit opt-in

  **tags**           text\[\]        For surfacing: \[\'toddler\',
                                     \'picky-eater\', \'travel\', etc.\]
  ------------------ --------------- -------------------------------------

**seasonal_profiles**

  ------------------ --------------- -------------------------------------
  **Field**          **Type**        **Notes**

  **id**             uuid PK         

  **user_id**        uuid FK         

  **season**         text            spring / summer / fall / winter

  **data**           jsonb           Freeform --- captures whatever the
                                     seasonal workflow collects

  **last_updated**   timestamptz     
  ------------------ --------------- -------------------------------------

  -----------------------------------------------------------------------
  **04 Anthropic API Integration**

  -----------------------------------------------------------------------

**How Every Maggie Session Works**

Maggie has no memory. You give her memory by constructing her context on
every single API call. The session request must include:

  --------------------- -------------------------------------------------
  **system**            Master System Prompt (Maggie\'s full persona and
                        rules --- static, never changes per session)

  **messages**          Full conversation history for this session
                        (stored in sessions.messages, appended on each
                        turn)

  **context injection** Household Manual digest + relevant Master List
                        items injected as a system-level message before
                        the user\'s first message

  **model**             claude-sonnet-4-20250514

  **max_tokens**        1500 for standard turns. 3000 for brain dumps and
                        session summaries.
  --------------------- -------------------------------------------------

**Persona Integrity --- Critical**

+-----------------------------------------------------------------------+
| **⚠ Never Break the Maggie Persona**                                  |
|                                                                       |
| Maggie must never reference Claude, AI, or any underlying technology. |
| This is a product requirement, not a preference. Any break in persona |
| is a product failure. This must be enforced at the system prompt      |
| level and tested rigorously with adversarial inputs.                  |
+-----------------------------------------------------------------------+

Scenarios to test explicitly during QA:

- User directly asks: \'Are you ChatGPT?\' / \'Are you Claude?\' /
  \'What AI are you?\'

- User asks: \'Who made you?\' / \'What company built you?\'

- User asks: \'Are you a real person?\'

- User tries to jailbreak the persona

Recommended system prompt response to all of these: Maggie deflects
warmly and stays in character. She does not confirm or deny. Example:
\'I\'m just Maggie --- your home\'s chief of staff. Now, what can I help
you tackle today?\'

**Workflow Prompt Library**

Each workflow is a separate system prompt loaded on top of the Master
System Prompt. The workflow prompt adds the specific session structure,
intake questions, and output format for that category.

  -------------- ------------------------ ----------------------------------
  **Workflow**   **Prompt File**          **Key Behaviors**

  Onboarding     prompts/onboarding.txt   Entry point. Routes to brain dump
                                          or specific workflow. Begins
                                          building Household Manual
                                          immediately.

  Mental Load    prompts/mental.txt       Brain dump mode. Chaos Mode
  Capture                                 detection. Routes output to all
                                          six categories. Master list
                                          update.

  Meals &        prompts/meals.txt        Full intake in one message. Meal
  Grocery                                 plan + grocery list in one
                                          session. Fridge Cleanout Mode.

  Home           prompts/home.txt         Vendor management. Cleaning queue.
  Operations                              Maintenance calendar. Something
                                          Broke handling.

  Kids & Family  prompts/kids.txt         Most complex. Child profiles.
                                          Milestone tracking. Birthday party
                                          planning. Travel with kids.

  Scheduling &   prompts/scheduling.txt   Weekly planning. Childcare
  Logistics                               emergency plan. Partner
                                          coordination messages.

  Finance &      prompts/finance.txt      Subscription audit. Bill calendar.
  Budget                                  Quarterly budget meeting agenda.
                                          Kids expense forecast.
  -------------- ------------------------ ----------------------------------

Additionally, four seasonal workflow prompts are stored and triggered by
date proximity:

- prompts/seasonal_spring.txt --- triggered March 1

- prompts/seasonal_summer.txt --- triggered June 1

- prompts/seasonal_fall.txt --- triggered September 1

- prompts/seasonal_winter.txt --- triggered December 1

  -----------------------------------------------------------------------
  **05 Build Order --- Tier 1**

  -----------------------------------------------------------------------

Below is the recommended sequence. Each phase builds on the previous and
should be working and testable before moving forward. Do not build Phase
3 before Phase 2 is solid.

+:------:+----------------------------------------------+-------------:+
| **1**  | **Foundation**                               | **Weeks      |
|        |                                              | 1--2**       |
|        | Auth + Database + API skeleton               |              |
+--------+----------------------------------------------+--------------+

- User authentication --- account creation, secure login, password reset

<!-- -->

- Recommend Clerk or Supabase Auth --- OAuth-ready for Tier 2
  Google/Apple integrations

<!-- -->

- PostgreSQL database --- all eight tables from Section 03

<!-- -->

- Encrypt loyalty program numbers and any financial data at rest from
  day one

- Add indexes on user_id for all tables --- every query will filter by
  user

<!-- -->

- Anthropic API integration --- basic message send/receive

<!-- -->

- Pass Master System Prompt on every call

- Confirm persona integrity works before adding any UI

<!-- -->

- Session history persistence --- store and reload messages array per
  session

- Basic React Router 7 shell --- mobile-first, warm neutral aesthetic

+:------:+----------------------------------------------+-------------:+
| **2**  | **Core Intelligence**                        | **Weeks      |
|        |                                              | 3--4**       |
|        | Household Manual + Master List + Onboarding  |              |
+--------+----------------------------------------------+--------------+

- Household Manual database layer --- read/write API for all user data
  tables

- Context injection system --- pull relevant Manual sections per
  workflow on each API call

<!-- -->

- This is the most important engineering task in the product --- do not
  skip or defer

<!-- -->

- Master Running List --- full CRUD, category + urgency + deadline
  fields

- Onboarding flow --- first-time user experience with Maggie\'s intro
  and routing

<!-- -->

- Capture name, kids, and any mentioned preferences immediately

- Route to brain dump or specific workflow based on response

<!-- -->

- Privacy reminder trigger logic --- fires on first collection of each
  sensitive data type

- Household Manual UI --- visible, read-only summary view for the mom

+:------:+----------------------------------------------+-------------:+
| **3**  | **Workflow Library**                         | **Weeks      |
|        |                                              | 5--7**       |
|        | All six core workflows + seasonal triggers   |              |
+--------+----------------------------------------------+--------------+

- Mental Load Capture workflow --- Chaos Mode, brain dump,
  categorization, list update

- Meals & Grocery workflow --- meal plan generation, grocery list by
  store section

- Home Operations workflow --- vendor management, cleaning queue,
  maintenance calendar

- Kids & Family workflow --- child profiles, milestone tracking,
  birthday party planning

- Scheduling & Logistics workflow --- weekly planning, childcare
  emergency plan

- Finance & Budget workflow --- subscription audit, bill calendar,
  quarterly meeting agenda

- Seasonal workflow triggers --- date-based detection, proactive offer
  to mom

- All four seasonal prompts --- spring, summer, fall, winter

+:------:+----------------------------------------------+-------------:+
| **4**  | **Community + Polish**                       | **Week 8**   |
|        |                                              |              |
|        | Community wisdom DB + Household Manual       |              |
|        | export + QA                                  |              |
+--------+----------------------------------------------+--------------+

- Community wisdom database --- write path with explicit approval gating

- Community wisdom surfacing --- read path at relevant moments in each
  workflow

- Household Manual export --- conversation-driven (mom asks Maggie, not
  a button)

- Session summary generation --- Maggie generates a short summary at
  session close

- Persona integrity QA --- full adversarial test suite on all jailbreak
  and identity questions

- Mobile QA --- every workflow tested on iOS Safari and Chrome mobile

- NAFN soft launch prep --- invite flow, feedback capture mechanism

  -----------------------------------------------------------------------
  **06 Open Questions for Morgan to Decide**

  -----------------------------------------------------------------------

**Before Build Starts**

These decisions should be made before the developer writes a line of
code:

  ------------------------ ----------------------------------------------
  **Question**             **Why It Matters Now**

  Hosting preference       Vercel + Railway is the fastest path. AWS is
                           more scalable but more complex. Affects
                           deployment setup from day one.

  Auth provider            Clerk vs Supabase Auth vs custom. Clerk is
                           fastest for Tier 1. Supabase Auth pairs well
                           if using Supabase for Postgres hosting.

  Household Manual --- is  The brief says visible and organized. Can she
  it editable by the mom?  correct information directly, or only through
                           conversation with Maggie? This affects the UI
                           significantly.

  Tier 2 priority order    When the time comes, which integration first
                           --- Google Calendar, Gmail, or something else?
                           Informs how the auth and permission layer is
                           designed even in Tier 1.

  NAFN feedback mechanism  How does Morgan want to collect feedback from
                           the soft launch group? In-app, email, form?
                           Needs to be built before NAFN access goes
                           live.
  ------------------------ ----------------------------------------------

  -----------------------------------------------------------------------
  **07 Critical Engineering Notes**

  -----------------------------------------------------------------------

+-----------------------------------------------------------------------+
| **⚠ Context Window**                                                  |
|                                                                       |
| Always pass the full Household Manual summary and relevant Master     |
| Running List items with every API call. Maggie has no memory between  |
| sessions without this. Build the retrieval layer --- do not pass raw  |
| unfiltered data.                                                      |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **⚠ Persona Integrity**                                               |
|                                                                       |
| The system prompt must enforce that Maggie never references Claude,   |
| AI, or any underlying technology. Test adversarially before NAFN      |
| launch. Any break in persona is a product failure.                    |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **⚠ Community Gating**                                                |
|                                                                       |
| No community wisdom is stored or surfaced without explicit user       |
| approval. Build the approval flow before the community feature is     |
| live. Never auto-opt users in.                                        |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **⚠ Privacy & Encryption**                                            |
|                                                                       |
| All sensitive user data encrypted at rest. Loyalty program numbers,   |
| financial details, medical information. Household Manual data is      |
| never used to train models or shared with third parties. This is core |
| to Maggie\'s trust model.                                             |
+-----------------------------------------------------------------------+

+-----------------------------------------------------------------------+
| **⚠ Mobile-First**                                                    |
|                                                                       |
| The primary user is a mom on an iPhone with one hand free, probably   |
| at 5pm with a toddler on her hip. Every interaction --- especially    |
| Chaos Mode --- must be frictionless on mobile. Test on real devices   |
| throughout, not just in browser devtools.                             |
+-----------------------------------------------------------------------+

  -----------------------------------------------------------------------
  *Check that off your list. ✓*

  -----------------------------------------------------------------------

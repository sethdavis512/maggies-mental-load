# PRD: Community Wisdom Database

## Introduction

Build the opt-in community experience sharing system. Real mom experiences are captured during conversation, approved explicitly, stored with context, and surfaced to other users when relevant. This is Maggie's long-term differentiator: she gets smarter from the community she serves. Privacy gating is non-negotiable -- nothing is shared without direct approval.

## Goals

- Maggie follows up on recommendations and asks if the experience can be shared
- Every community contribution requires explicit in-conversation approval
- Tips are stored with relevant context (child's age, situation, what worked)
- Community wisdom is surfaced naturally within workflow conversations
- Admin moderation queue prevents inappropriate or identifying content

## User Stories

### US-001: CommunityTip model and data access
**Description:** As a developer, I need to store approved community tips with context tags.

**Acceptance Criteria:**
- [ ] `CommunityTip` model: id, content (String), category (enum matching workflow categories: meals, home, kids, scheduling, finance, general), childAgeContext (String?), situation (String?), contributorId (relation to User), approvedAt (DateTime?), anonymized (Boolean, default true), moderationStatus (enum: pending, approved, rejected), createdAt, updatedAt
- [ ] Migration runs successfully
- [ ] `app/models/community-tip.server.ts` with: createCommunityTip (pending status), approveTip, rejectTip, getApprovedTipsByCategory, searchApprovedTips, getPendingTips (admin)
- [ ] Typecheck passes

### US-002: Agent tool for submitting community tips
**Description:** As a user chatting with Maggie, I want to share my experience with the community when Maggie asks.

**Acceptance Criteria:**
- [ ] New tool `submit_community_tip`: accepts content, category, childAgeContext, situation, anonymized (default true)
- [ ] Tool must only be called AFTER explicit user approval in conversation
- [ ] System prompt instructs Maggie to always ask: "Would you be open to sharing that with other moms in the Maggie community? Completely optional, and I'll never share anything without your say-so first."
- [ ] Creates tip with `pending` moderation status
- [ ] Rate limited: 5 submissions/hour per user
- [ ] Tool registered in agents.ts
- [ ] Typecheck passes

### US-003: Agent tool for searching community wisdom
**Description:** As a developer, I need Maggie to search and surface relevant community tips during conversations.

**Acceptance Criteria:**
- [ ] New tool `search_community_wisdom`: accepts query, optional category filter, optional childAgeContext filter
- [ ] Only returns tips with `approved` moderation status
- [ ] Returns tip content, context, and child age (never contributor identity unless they opted out of anonymization)
- [ ] Tool registered in agents.ts
- [ ] Typecheck passes

### US-004: CommunityWisdomRetriever
**Description:** As a developer, I need community wisdom automatically surfaced as context when relevant to the conversation.

**Acceptance Criteria:**
- [ ] New `app/voltagent/retrievers/community-wisdom.ts` retriever
- [ ] Searches approved tips matching the current conversation topic and category
- [ ] Considers child age context when user has children of similar ages
- [ ] Integrated into `CombinedRetriever`
- [ ] Limits to 3-5 most relevant tips per retrieval to stay within token budget
- [ ] Typecheck passes

### US-005: Community wisdom surfacing in conversation
**Description:** As a user, I want to hear what other moms have tried when it's relevant so I get real-world advice alongside Maggie's suggestions.

**Acceptance Criteria:**
- [ ] System prompt instructs Maggie to surface community wisdom naturally: "A few moms in the community have tried this -- here's what they said..."
- [ ] Wisdom surfaced alongside Maggie's own recommendation, not replacing it
- [ ] Never surfaced in sensitive contexts (financial details, medical specifics)
- [ ] Never more than 2-3 community tips per conversation turn
- [ ] Typecheck passes

### US-006: Follow-up and contribution prompt
**Description:** As a user who tried a Maggie recommendation, I want Maggie to follow up and offer to share my experience.

**Acceptance Criteria:**
- [ ] System prompt instructs Maggie to follow up on recommendations in subsequent sessions: "How did [recommendation] go?"
- [ ] If user reports positive experience, Maggie offers community sharing (with explicit approval language from brief section 17)
- [ ] If user declines, Maggie drops it immediately and never re-asks for that specific tip
- [ ] Community sharing prompt matches brief: "That's really helpful -- would you be open to sharing that with other moms in the Maggie community? Completely optional, and I'll never share anything without your say-so first."
- [ ] Typecheck passes

### US-007: Admin moderation queue
**Description:** As an admin, I need to review and approve/reject community tips before they're surfaced to other users.

**Acceptance Criteria:**
- [ ] New route `/admin/community` (admin-only, uses existing role guard)
- [ ] Lists pending tips with content, category, context, submission date
- [ ] Approve and reject actions per tip
- [ ] Rejected tips are not surfaced; contributor is not notified (Maggie doesn't break the fourth wall)
- [ ] Approved tips become available to CommunityWisdomRetriever and search tool
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-008: Privacy and anonymization
**Description:** As a user, I want my community contributions to be anonymous by default so I feel safe sharing.

**Acceptance Criteria:**
- [ ] Tips default to `anonymized: true`
- [ ] Anonymized tips never include contributor name, email, or any identifying information
- [ ] Users can opt to include their first name only (not required)
- [ ] No personally identifying information about children (no names, only ages)
- [ ] Typecheck passes

## Functional Requirements

- FR-1: CommunityTip model with moderation status gating (pending -> approved/rejected)
- FR-2: Agent tools for submitting and searching community wisdom
- FR-3: CommunityWisdomRetriever injects relevant approved tips as conversation context
- FR-4: Maggie follows up on recommendations and offers community sharing with explicit approval
- FR-5: Admin moderation queue at `/admin/community`
- FR-6: All tips anonymized by default; no PII unless user explicitly opts in
- FR-7: System prompt enforces: never share without direct yes, never re-ask if declined

## Non-Goals

- No user-facing community browsing page (tips are surfaced by Maggie contextually)
- No voting or ranking of tips by other users
- No direct user-to-user communication
- No contributor profiles or leaderboards
- No automated moderation (human review required at launch)

## Design Considerations

- Community tips in chat should feel organic, not like a "review section"
- Admin moderation queue should be simple: list, read, approve/reject. No complex workflow.
- Anonymization should be the default and clearly communicated

## Technical Considerations

- CommunityTip search should use case-insensitive substring matching on content, category, and situation fields (similar to existing note search pattern)
- CommunityWisdomRetriever should cross-reference user's child ages with tip `childAgeContext` for relevance matching
- Moderation status as enum allows for future states (flagged, archived) without migration
- Rate limiting on submissions prevents spam; moderation queue prevents inappropriate content
- Consider full-text search index on CommunityTip.content for better relevance matching at scale

## Success Metrics

- 20%+ of users contribute at least one community tip within their first month
- Community tips are surfaced in 10%+ of workflow conversations
- Admin moderation turnaround under 24 hours
- Zero PII leaks in community tips

## Open Questions

- Should there be a minimum number of approved tips before community wisdom starts surfacing (cold start problem)?
- Should tips have an expiration or "freshness" decay?
- Should the admin moderation queue notify admins of new pending tips?
- At what scale does manual moderation become unsustainable, and what's the automated fallback?

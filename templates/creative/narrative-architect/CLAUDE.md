# Narrative Architect Development Guide

Principal-level guidelines for managing complex narrative universes across multiple media, tracking lore consistency, maintaining character continuity, resolving contradictions, and governing collaborative storytelling for gaming and entertainment properties.

---

## Overview

This guide applies to:

- World-building documentation systems
- Lore consistency tracking and validation
- Character continuity management
- Timeline and chronology management
- Cross-media narrative coherence (games, books, films, comics, audio)
- Canon vs non-canon classification
- Contradiction detection and resolution
- Story bible maintenance and versioning
- Collaborative writing governance

### Key Principles

1. **Continuity Is Sacred** - Every narrative detail is a promise to the audience that future content will honor it
2. **Canon Has Weight** - Established facts constrain future creativity, and that constraint produces better stories
3. **Small Details, Large Consequences** - A minor throwaway line in one installment can become a major plot point five years later
4. **Contradiction Is Debt** - Every unresolved inconsistency compounds audience distrust over time
5. **Documentation Prevents Disaster** - If it is not recorded in the story bible, it will be forgotten and contradicted

### Core Frameworks

| Framework | Purpose |
|-----------|---------|
| World Bible Architecture | Structure all canonical world-building into searchable, cross-referenced documents |
| Lore Dependency Graph | Map causal and referential relationships between narrative elements |
| Character Continuity Ledger | Track character knowledge, abilities, relationships, and arcs across installments |
| Chronology Spine | Maintain a single authoritative timeline with event ordering and date anchoring |
| Canon Tier System | Classify all narrative content by authoritativeness and binding power |
| Contradiction Resolution Protocol | Detect, triage, and resolve inconsistencies before they ship |

---

## World-Building Documentation Systems

### World Bible Architecture

```text
World Bible Structure
├── Cosmology and Physics
│   ├── Fundamental laws of the universe
│   ├── Magic systems / technology rules
│   ├── Metaphysics and planes of existence
│   └── Constraints and limitations
├── Geography and Environments
│   ├── World maps and regional maps
│   ├── Climate and ecology
│   ├── Notable locations and landmarks
│   └── Travel distances and durations
├── History and Eras
│   ├── Creation or origin events
│   ├── Major historical periods
│   ├── Wars, treaties, and turning points
│   └── Lost or forgotten history
├── Cultures and Societies
│   ├── Nations, factions, and organizations
│   ├── Languages and naming conventions
│   ├── Religions and belief systems
│   ├── Social structures and hierarchies
│   └── Customs, festivals, and daily life
├── Characters
│   ├── Major characters (full profiles)
│   ├── Supporting characters (summary profiles)
│   ├── Historical figures
│   └── Character relationship maps
├── Technology and Magic
│   ├── System rules and limitations
│   ├── Known artifacts and items
│   ├── Progression and power scaling
│   └── Interaction rules between systems
└── Meta-Narrative
    ├── Themes and motifs
    ├── Narrative tone and genre boundaries
    ├── Audience expectations and contracts
    └── Franchise identity pillars
```

### World Element Documentation Template

```markdown
## World Element: [Element Name]

**Category**: [Cosmology / Geography / Culture / Technology / etc.]
**Canon Tier**: [Tier 1 / Tier 2 / Tier 3]
**First Established**: [Title, Chapter/Episode, Date]
**Last Referenced**: [Title, Chapter/Episode, Date]

### Definition
[Precise description of this element as established in canon]

### Rules and Constraints
- [What this element can do]
- [What this element cannot do]
- [Known limitations and edge cases]

### Dependencies
- **Depends on**: [Other elements this relies upon]
- **Depended on by**: [Elements that reference or rely on this]

### Established Facts
| Fact | Source | Canon Tier | Date Established |
|------|--------|-----------|-----------------|
| [Specific detail] | [Title, Chapter] | [Tier] | [Date] |

### Open Questions
- [Unresolved or deliberately ambiguous aspects]

### Revision History
| Date | Change | Reason | Approved By |
|------|--------|--------|-------------|
```

### Documentation Completeness Scoring

| Category | Coverage (%) | Cross-Referenced | Last Audited |
|----------|-------------|-----------------|-------------|
| Cosmology and Physics | | Yes / Partial / No | |
| Geography | | Yes / Partial / No | |
| History | | Yes / Partial / No | |
| Cultures | | Yes / Partial / No | |
| Characters | | Yes / Partial / No | |
| Technology / Magic | | Yes / Partial / No | |

**Coverage Interpretation:**
- 90-100%: Production-ready, safe for writers to reference
- 70-89%: Functional, but gaps may cause inconsistencies
- 50-69%: Risky, writers should consult narrative architect before using
- Below 50%: Underdeveloped, likely to produce contradictions

---

## Lore Consistency Tracking and Validation

### Lore Dependency Graph

Every canonical fact exists in relationship to other facts. The dependency graph maps these relationships to predict which changes will cascade.

```text
Dependency Types
├── Causal (A caused B)
│   └── Breaking A invalidates B
├── Referential (A mentions B)
│   └── Changing B requires updating A's reference
├── Constraining (A limits what B can be)
│   └── Expanding A may violate B's established behavior
├── Temporal (A happens before B)
│   └── Moving A's date may create sequence violations
└── Thematic (A and B share narrative purpose)
    └── Changing A's meaning may undermine B's resonance
```

### Consistency Validation Checklist

```markdown
## Lore Validation: [New Content Title]

**Author**: [Name]
**Date**: [Date]
**Installment**: [Game/Book/Film/Episode]

### Fact Check
- [ ] All referenced locations exist in world bible
- [ ] Character knowledge matches their established awareness
- [ ] Technology or magic used within established rules
- [ ] Historical references match canonical timeline
- [ ] Named characters' appearances match descriptions
- [ ] Cultural details match established norms for referenced groups
- [ ] Distances and travel times are consistent with geography
- [ ] Power levels and abilities are within established ranges

### New Introductions
| New Element | Category | Conflicts With | Resolution |
|------------|----------|---------------|------------|
| [Element] | [Type] | [Existing element or "None"] | [How resolved] |

### Dependencies Created
| New Fact | Depends On | Will Be Depended On By |
|----------|-----------|----------------------|
| [Fact] | [Existing facts] | [Anticipated future references] |
```

### Contradiction Severity Classification

| Severity | Description | Example | Response |
|----------|-------------|---------|----------|
| Critical | Breaks a fundamental rule of the universe | Character uses magic in a world established as non-magical | Block release, mandatory rewrite |
| Major | Contradicts an established and widely known fact | Capital city name differs from previous installments | Rewrite before release if possible |
| Moderate | Contradicts a minor but documented detail | Character's eye color changes between books | Fix if pre-release, retcon if post-release |
| Minor | Inconsistency that most audiences will not notice | Travel took two days in Book 1 but three days in Book 4 | Log, fix in future reprints or patches |
| Cosmetic | Stylistic inconsistency, not factual | Spelling variation of a location name | Standardize going forward |

---

## Character Continuity Management

### Character Profile Structure

```text
Character Profile
├── Identity
│   ├── Full name, titles, aliases
│   ├── Physical description (with source citations)
│   ├── Age and birthdate (relative to timeline)
│   └── Species, faction, affiliation
├── Knowledge State
│   ├── What the character knows (and when they learned it)
│   ├── What the character believes but is wrong about
│   ├── Secrets the character is keeping
│   └── Information the character has forgotten
├── Abilities and Limitations
│   ├── Skills and competencies (with progression history)
│   ├── Powers or special abilities (with constraints)
│   ├── Physical limitations or injuries
│   └── Psychological limitations or fears
├── Relationships
│   ├── Active relationships (with current status)
│   ├── Historical relationships (ended or changed)
│   ├── Rivalries and antagonisms
│   └── Debts, obligations, and promises
├── Arc Tracking
│   ├── Character goal per installment
│   ├── Internal conflict and growth trajectory
│   ├── Key decisions and turning points
│   └── Thematic role in the larger narrative
└── Inventory and Possessions
    ├── Significant items currently held
    ├── Items lost, given away, or destroyed
    └── Items with narrative significance
```

### Character Knowledge Matrix

Track what each character knows to prevent characters acting on information they should not possess.

| Character | Event / Fact | Knows? | How Learned | When Learned | Source |
|-----------|-------------|--------|-------------|-------------|--------|
| [Name] | [Fact] | Yes / No / Partial | [Scene or event] | [Timeline date] | [Installment] |

### Relationship State Tracking

| Character A | Character B | Relationship Type | Current Status | Last Change | Source |
|------------|------------|------------------|---------------|-------------|--------|
| [Name] | [Name] | [Ally/Enemy/Family/etc.] | [Active/Strained/Broken/etc.] | [Event that changed it] | [Installment] |

### Character Consistency Red Flags

| Red Flag | Likely Cause | Verification |
|----------|-------------|-------------|
| Character knows something they should not | Missing knowledge-state check | Review character knowledge matrix |
| Character's abilities exceed prior limits | Power creep or missing constraint check | Review abilities progression log |
| Character behaves contrary to established personality | Arc not properly tracked | Review arc tracking and motivation log |
| Character references events they were not present for | Scene placement error | Cross-check character location timeline |
| Dead character appears without explanation | Continuity error or unplanned resurrection | Verify character status in ledger |

---

## Timeline and Chronology Management

### Chronology Spine

The single authoritative record of event ordering within the narrative universe.

```text
Chronology Spine Structure
├── Absolute Timeline (if applicable)
│   ├── Calendar system(s) used in-universe
│   ├── Conversion between calendar systems
│   ├── Anchoring events (known fixed dates)
│   └── Era boundaries and naming
├── Relative Timeline
│   ├── Event sequence chains (A before B before C)
│   ├── Concurrent event groups (A and B happen simultaneously)
│   ├── Duration constraints (event lasted X days/years)
│   └── Gaps (unknown period between events)
├── Character Timelines
│   ├── Per-character event sequences
│   ├── Character age at key events
│   ├── Character location at key events
│   └── Character knowledge state at key events
└── Publication vs Narrative Order
    ├── Release order of installments
    ├── Narrative chronological order
    ├── Flashback and flash-forward registry
    └── Retcon timeline (when canonical facts changed)
```

### Timeline Event Entry Template

```markdown
## Event: [Event Name]

**Timeline Date**: [In-universe date or relative marker]
**Duration**: [How long the event lasted]
**Publication Source**: [Installment where first depicted]

### Location
[Where this event takes place]

### Participants
| Character | Role | Arrives | Departs | Status After |
|-----------|------|---------|---------|-------------|

### Prerequisites
- [Events that must have occurred before this one]

### Consequences
- [Events that are caused or enabled by this one]

### Concurrent Events
- [Events happening simultaneously elsewhere]

### Timeline Constraints
- [Hard constraints: "Must occur after X but before Y"]
- [Soft constraints: "Approximately N years after X"]
```

### Timeline Conflict Detection

| Conflict Type | Description | Detection Method |
|--------------|-------------|-----------------|
| Sequence violation | Event B is shown after A, but A references B as already happened | Topological sort of event dependencies |
| Duration impossibility | Travel or process takes less time than physically possible | Distance/duration cross-reference |
| Age inconsistency | Character's stated age does not match birth date minus event date | Character age calculator |
| Simultaneous presence | Character appears in two locations at the same time | Character location timeline overlay |
| Causal loop | Event A causes B which causes A | Dependency cycle detection |

---

## Cross-Media Narrative Coherence

### Media Adaptation Authority Matrix

| Decision Type | Game Team | Book Author | Film Team | Comics Team | Final Authority |
|--------------|-----------|-------------|-----------|-------------|----------------|
| New canonical location | Propose | Propose | Propose | Propose | Narrative Architect |
| Character death | Propose | Propose | Propose | Propose | Narrative Architect + IP Owner |
| Magic/tech rule change | Propose | Propose | Propose | Propose | Narrative Architect |
| New major character | Propose | Propose | Propose | Propose | Narrative Architect |
| Retcon of existing fact | Propose | Propose | Propose | Propose | Narrative Architect + IP Owner |
| Non-canon side story | Create | Create | Create | Create | Respective team lead |

### Cross-Media Consistency Requirements

```text
Cross-Media Coherence
├── Shared Canon Layer
│   ├── Core facts that all media must respect
│   ├── Character identities and key traits
│   ├── World rules and physics
│   └── Major historical events
├── Media-Specific Permissions
│   ├── Details that one medium may expand upon
│   ├── Adaptations allowed for medium constraints
│   ├── Tone adjustments for audience demographics
│   └── Pacing modifications for format requirements
├── Synchronization Points
│   ├── Release coordination for cross-references
│   ├── Shared reveal schedules (no spoilers across media)
│   ├── Character status alignment checkpoints
│   └── World-state snapshots at key moments
└── Conflict Resolution
    ├── Which medium takes priority when facts conflict
    ├── Retcon procedures when inconsistency is discovered post-release
    ├── Communication protocols between media teams
    └── Escalation path to narrative architect
```

### Media Adaptation Checklist

```markdown
## Media Adaptation Review: [Title]

**Source Medium**: [Game / Book / Film / etc.]
**Target Medium**: [Game / Book / Film / etc.]
**Adapter**: [Team or individual]

### Canon Compliance
- [ ] All shared-layer facts preserved accurately
- [ ] No contradictions with other active media projects
- [ ] Character portrayals consistent with canonical profiles
- [ ] World rules applied correctly for this medium
- [ ] Timeline placement verified against chronology spine

### Permitted Adaptations
- [ ] Tone adjustments documented and justified
- [ ] Pacing changes do not alter event sequence
- [ ] Visual interpretations within established parameters
- [ ] Dialogue adaptations preserve character voice
- [ ] Added details do not contradict existing canon

### New Canon Introduced
| New Element | Category | Approved By | Propagation Plan |
|------------|----------|-------------|-----------------|
| [Element] | [Type] | [Authority] | [How other media will be informed] |
```

---

## Canon vs Non-Canon Classification

### Canon Tier System

| Tier | Name | Authority | Binding Power | Examples |
|------|------|-----------|--------------|---------|
| Tier 1 | Core Canon | Absolute | All media must respect | Main game storylines, primary novel series, flagship films |
| Tier 2 | Extended Canon | Strong | Assumed true unless contradicted by Tier 1 | Official DLC, companion novels, authorized spinoffs |
| Tier 3 | Soft Canon | Moderate | True within its own context, may be overridden | Tie-in comics, mobile games, promotional material |
| Tier 4 | Quasi-Canon | Weak | Flavor and reference only, not binding | Tabletop RPG sourcebooks, art books with lore, developer commentary |
| Tier 5 | Non-Canon | None | Explicitly outside continuity | Fan fiction, what-if scenarios, parody content, decanonized works |

### Canon Classification Workflow

```text
Canon Classification Process
├── New Content Submitted
│   ├── Author/team identifies intended canon tier
│   ├── Narrative architect reviews against existing canon
│   └── Conflicts identified and resolved before classification
├── Classification Decision
│   ├── Tier assignment based on content origin and authority
│   ├── Specific elements may receive different tier than container
│   │   (e.g., a Tier 3 comic may establish one Tier 2 fact)
│   └── Classification recorded in story bible with rationale
├── Communication
│   ├── All media teams notified of new canonical facts
│   ├── Story bible updated with new entries and cross-references
│   └── Fan-facing canon status communicated if publicly relevant
└── Reclassification
    ├── Triggered by contradiction with higher-tier content
    ├── Requires narrative architect approval
    ├── Affected teams notified
    └── Story bible updated with reclassification history
```

### Canon Dispute Resolution

| Situation | Resolution Rule |
|-----------|----------------|
| Tier 1 contradicts Tier 2 | Tier 1 takes precedence; Tier 2 content flagged for revision |
| Two Tier 1 sources contradict | Narrative architect determines which is authoritative; other is retconned |
| New content would contradict existing canon | New content is revised before release |
| Audience perceives contradiction that is not one | Clarification issued through appropriate channel |
| Deliberate retcon required for story quality | Retcon protocol followed with full documentation |

---

## Contradiction Detection and Resolution

### Contradiction Detection Methods

| Method | Frequency | Scope | Responsible |
|--------|-----------|-------|-------------|
| Pre-publication lore review | Every new release | New content vs full story bible | Narrative architect team |
| Automated keyword cross-reference | Continuous | Flagging changed facts or names | Tooling / database system |
| Post-release community monitoring | Ongoing | Fan-reported inconsistencies | Community management + narrative team |
| Periodic full canon audit | Annually | Complete canon against story bible | Narrative architect team |
| Cross-media alignment check | Per release cycle | Parallel media projects | Cross-media coordination team |

### Contradiction Resolution Protocol

```text
Contradiction Resolution
├── Detection
│   ├── Source of contradiction identified
│   ├── Severity classified (Critical/Major/Moderate/Minor/Cosmetic)
│   └── Affected installments and media listed
├── Analysis
│   ├── Which version is more deeply embedded in canon?
│   ├── Which version is more widely known by audience?
│   ├── Which version creates fewer downstream problems?
│   ├── Can both versions be reconciled without retcon?
│   └── What is the cost of each resolution option?
├── Resolution Options
│   ├── Reconciliation: Create in-universe explanation for both
│   ├── Soft retcon: Future content quietly uses correct version
│   ├── Hard retcon: Explicit correction issued
│   ├── Decanonization: Demote one source to lower canon tier
│   └── Embrace: Acknowledge as deliberate ambiguity or unreliable narrator
├── Decision
│   ├── Narrative architect selects resolution approach
│   ├── IP owner approves if retcon affects Tier 1 content
│   └── Resolution documented in story bible
└── Propagation
    ├── All media teams notified of resolution
    ├── Story bible updated
    ├── Style guide updated if naming/terminology changed
    └── Community communication if publicly visible
```

### Retcon Documentation Template

```markdown
## Retcon Record: [Brief Description]

**Date**: [Date of decision]
**Severity**: [Critical / Major / Moderate / Minor]
**Approved By**: [Name and role]

### Original Fact
- **Statement**: [What was originally established]
- **Source**: [Where it was established]
- **Canon Tier**: [Tier at time of establishment]

### New Fact
- **Statement**: [What is now canonical]
- **Source**: [Where the new version is established]
- **Canon Tier**: [Tier of new version]

### Reason for Retcon
[Why the change was necessary]

### Resolution Method
[Reconciliation / Soft retcon / Hard retcon / Decanonization / Embrace]

### Affected Content
| Installment | Specific Reference | Action Required |
|------------|-------------------|----------------|

### Audience Communication Plan
[How and whether to communicate this change publicly]
```

---

## Story Bible Maintenance

### Story Bible Structure

```text
Story Bible Organization
├── Volume 1: Universe Foundations
│   ├── Cosmology and fundamental rules
│   ├── Magic or technology systems
│   ├── World history (creation to present)
│   └── Geography and cartography
├── Volume 2: Peoples and Cultures
│   ├── Major civilizations and nations
│   ├── Languages and naming conventions
│   ├── Religions and philosophies
│   └── Social structures and economies
├── Volume 3: Characters
│   ├── Major character profiles
│   ├── Supporting character profiles
│   ├── Character relationship maps
│   └── Character arc tracking
├── Volume 4: Timeline
│   ├── Master chronology
│   ├── Per-installment event logs
│   ├── Character-specific timelines
│   └── Concurrent event maps
├── Volume 5: Canon Registry
│   ├── Canon tier assignments per installment
│   ├── Retcon log
│   ├── Contradiction resolution history
│   └── Open questions and deliberate ambiguities
├── Volume 6: Style and Terminology
│   ├── Approved spellings and capitalizations
│   ├── In-universe terminology glossary
│   ├── Naming convention rules
│   └── Tone and voice guidelines per franchise
└── Volume 7: Production Reference
    ├── Cross-media project tracker
    ├── Upcoming release canon implications
    ├── Writer onboarding guide
    └── Frequently asked lore questions
```

### Story Bible Versioning

| Version Type | When | What Changes | Approval |
|-------------|------|-------------|----------|
| Patch (1.0.x) | Corrections and clarifications | Typos, formatting, clarified wording | Narrative architect |
| Minor (1.x.0) | New content additions | New entries from released content | Narrative architect |
| Major (x.0.0) | Structural changes or retcons | Reorganization, retcons, rule changes | Narrative architect + IP owner |

### Story Bible Maintenance Schedule

| Task | Frequency | Owner |
|------|-----------|-------|
| New release integration | Within 2 weeks of each release | Narrative architect team |
| Cross-reference validation | Quarterly | Narrative architect team |
| Full consistency audit | Annually | Narrative architect + external reviewer |
| Writer feedback integration | Monthly | Narrative architect team |
| Community-reported issue triage | Weekly | Community liaison + narrative team |

### Story Bible Access Control

| Role | Read Access | Write Access | Approve Changes |
|------|-----------|-------------|----------------|
| Narrative architect | Full | Full | Yes |
| Lead writers | Full | Propose changes | No |
| Writers and designers | Relevant volumes | Propose changes | No |
| External partners | Approved excerpts only | None | No |
| Marketing and PR | Approved excerpts only | None | No |
| Community management | Public-safe excerpts | None | No |

---

## Collaborative Writing Governance

### Writer Onboarding Protocol

```text
Writer Onboarding
├── Phase 1: Orientation (Week 1)
│   ├── Story bible access granted (appropriate volumes)
│   ├── Canon tier system explained
│   ├── Lore submission and review process walkthrough
│   ├── Key contacts and escalation paths
│   └── Common pitfalls document reviewed
├── Phase 2: Guided Writing (Weeks 2-4)
│   ├── First submission reviewed with detailed feedback
│   ├── Lore check process practiced with mentor
│   ├── Cross-reference tools and search techniques demonstrated
│   └── Character voice and tone calibration
├── Phase 3: Independent Writing (Week 5+)
│   ├── Writer submits through standard review process
│   ├── Reduced review intensity as consistency track record builds
│   └── Writer contributes to story bible updates for own content
└── Phase 4: Senior Contributor
    ├── May review other writers' lore compliance
    ├── Proposes story bible additions and amendments
    └── Mentors new writers through onboarding
```

### Collaborative Writing Rules

| Rule | Rationale |
|------|-----------|
| No writer may kill a major character without narrative architect approval | Death has permanent downstream consequences across all media |
| No writer may introduce a new magic/tech rule without approval | System rules constrain all future stories |
| All new named locations must be checked against existing geography | Prevents duplicate or conflicting place names |
| Character dialogue must be checked against character knowledge state | Prevents characters knowing things they should not |
| All historical references must be verified against the timeline | Prevents temporal contradictions |
| New species, factions, or cultures require full documentation before use | Prevents under-documented elements from proliferating |

### Content Submission Workflow

```text
Content Submission Pipeline
├── Draft Submission
│   ├── Writer submits draft with self-check completed
│   ├── New lore elements flagged and documented
│   └── Known dependencies and references listed
├── Lore Review
│   ├── Narrative architect reviews for canon compliance
│   ├── Contradictions flagged with specific references
│   ├── New elements evaluated for canon tier assignment
│   └── Feedback returned with required and suggested changes
├── Revision
│   ├── Writer addresses required changes
│   ├── Revised draft resubmitted
│   └── Changes verified by narrative architect
├── Approval
│   ├── Content marked as lore-approved
│   ├── New canonical facts extracted and queued for story bible
│   └── Cross-media notifications sent if applicable
└── Post-Publication
    ├── Story bible updated with new canonical content
    ├── Dependency graph updated
    ├── Timeline updated
    └── Community feedback monitored for missed contradictions
```

### Conflict Resolution Between Writers

| Conflict Type | Resolution Process |
|--------------|-------------------|
| Two writers establish contradictory facts in parallel | Narrative architect determines which version is canonical; other writer revises |
| Writer disagrees with lore constraint | Writer may propose change through story bible amendment process |
| Multiple writers want to use the same character simultaneously | Narrative architect coordinates character scheduling and state transitions |
| Writer wants to retcon another writer's established content | Retcon protocol followed; original writer consulted as courtesy |

---

## Common Pitfalls

### 1. Trusting Memory Over Documentation

Wrong: Assume the writing team remembers that a character lost their left hand in Chapter 7 of Book 2 published three years ago.

Right: Every physical change, injury, ability gain or loss is recorded in the character ledger with source citation.

### 2. Canon Creep Through Supplementary Material

Wrong: Allow marketing copy, social media posts, and interview comments to establish canonical facts without review.

Right: Only content that passes through the canon classification workflow becomes part of the story bible.

### 3. Timeline by Vibes

Wrong: Estimate that "enough time has passed" between events without checking the chronology spine.

Right: Calculate exact or bounded durations for every event sequence. If timing is ambiguous, document the ambiguity explicitly.

### 4. Character Omniscience

Wrong: Write characters acting on information the audience knows but the character should not.

Right: Consult the character knowledge matrix before writing any scene where a character makes a decision based on information.

### 5. Ignoring Power Scaling

Wrong: Allow character abilities to grow without limit to serve dramatic moments.

Right: Maintain ability progression logs with hard limits. If a limit must be exceeded, document the in-universe justification and update the system rules.

### 6. Single Point of Failure

Wrong: Only one person holds the complete knowledge of the narrative universe.

Right: The story bible is comprehensive, searchable, and accessible. No single departure should create a lore crisis.

### 7. Retcon Without Documentation

Wrong: Quietly change a fact in new content and hope nobody notices.

Right: Every retcon is documented with rationale, approved through the protocol, and propagated to all teams.

---

## Resources

- [The Kobold Guide to Worldbuilding - Wolfgang Baur et al.](https://www.goodreads.com/book/show/15841979-kobold-guide-to-worldbuilding)
- [The Writer's Complete Fantasy Reference - Writer's Digest](https://www.goodreads.com/book/show/227235.The_Writer_s_Complete_Fantasy_Reference)
- [Erta Bible / Franchise Bible Methodology - Film and TV Industry Standard](https://en.wikipedia.org/wiki/Bible_(screenwriting))
- [Narrative Design for Interactive Media - Heather Chandler](https://www.goodreads.com/book/show/23398703-the-game-narrative-toolbox)
- [Building Imaginary Worlds - Mark J.P. Wolf](https://www.goodreads.com/book/show/17349958-building-imaginary-worlds)
- [The Silmarillion - Tolkien (canonical example of a story bible spanning decades)](https://www.goodreads.com/book/show/7951.The_Silmarillion)

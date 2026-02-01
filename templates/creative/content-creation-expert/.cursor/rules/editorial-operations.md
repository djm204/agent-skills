# Editorial Operations

Frameworks for content workflows, quality assurance, style governance, content taxonomy, and lifecycle management at scale.

## Core Principle

**Repeatable processes produce consistent quality.** Editorial operations exist to ensure every piece of content meets the same standard regardless of who writes it, who edits it, or how fast it needs to ship. Systems, not heroics, sustain quality at scale.

## Content Workflow

### Standard Production Workflow

```text
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  IDEATE  │──▶│  BRIEF   │──▶│  DRAFT   │──▶│  REVIEW  │──▶│ PUBLISH  │
│          │   │          │   │          │   │          │   │          │
│ Research │   │ Outline  │   │ Write    │   │ Edit     │   │ Format   │
│ Validate │   │ Assign   │   │ Cite     │   │ Fact-chk │   │ Schedule │
│ Approve  │   │ Deadline │   │ Visuals  │   │ Approve  │   │ Promote  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
     │                                                            │
     │              ┌──────────┐   ┌──────────┐                  │
     │              │ MEASURE  │◀──│DISTRIBUTE│◀─────────────────┘
     │              │          │   │          │
     │              │ Analyze  │   │ Channels │
     │              │ Report   │   │ Promote  │
     │              │ Iterate  │   │ Syndicate│
     │              └────┬─────┘   └──────────┘
     │                   │
     └───────────────────┘  (Feedback into next ideation cycle)
```

### Workflow Stage Gates

| Gate | Entry Criteria | Exit Criteria | Approver |
|------|---------------|---------------|----------|
| Ideation → Brief | Topic validated against strategy | Brief completed and approved | Content Lead |
| Brief → Draft | Brief signed off with deadline | First draft complete with citations | Writer |
| Draft → Review | Draft meets word count and outline | All edit passes complete | Editor |
| Review → Publish | Legal and brand checks passed | Published with all metadata | Editor-in-Chief |
| Publish → Distribute | Content live and verified | Distribution across all planned channels | Marketing Lead |

## Editing Process

### Four-Pass Editing Model

| Pass | Focus | Editor | Key Questions |
|------|-------|--------|--------------|
| Structural | Organization and flow | Content Lead | Does the piece follow a logical arc? Are sections balanced? |
| Substantive | Depth and accuracy | Subject Expert | Are claims supported? Are examples specific and relevant? |
| Line Edit | Clarity and style | Copy Editor | Is every sentence necessary? Active voice? Style guide compliance? |
| Proof | Correctness | Proofreader | Spelling, grammar, punctuation, formatting, link integrity? |

## Style Guide Governance

### Style Guide Components

| Component | Covers | Update Cadence |
|-----------|--------|---------------|
| Voice and tone | Brand personality, tone-by-context matrix | Annually |
| Grammar and mechanics | Oxford comma, numbers, capitalization, acronyms | As needed |
| Formatting | Heading hierarchy, list styles, image specs, code blocks | As needed |
| Terminology | Approved terms, banned terms, product naming | Quarterly |
| Accessibility | Alt text, heading structure, link text, readability | Annually |
| Legal and compliance | Disclaimers, disclosures, trademark usage | Per legal updates |

## Content Taxonomy

### Taxonomy Architecture

```text
Content Repository
├── Content Type
│   ├── Article
│   ├── Guide
│   ├── Case Study
│   ├── Video
│   ├── Podcast
│   └── Infographic
├── Topic Pillar
│   ├── [Pillar 1]
│   ├── [Pillar 2]
│   └── [Pillar 3]
├── Funnel Stage
│   ├── Awareness (TOFU)
│   ├── Consideration (MOFU)
│   └── Decision (BOFU)
├── Audience Segment
│   ├── [Persona 1]
│   ├── [Persona 2]
│   └── [Persona 3]
└── Lifecycle Status
    ├── Draft
    ├── In Review
    ├── Scheduled
    ├── Published
    ├── Needs Refresh
    └── Archived
```

### Tagging Standards

| Tag Type | Cardinality | Examples |
|----------|------------|---------|
| Primary topic | Exactly one | "content-strategy", "seo", "copywriting" |
| Secondary topics | One to three | "email-marketing", "analytics" |
| Content format | Exactly one | "blog-post", "video", "podcast-episode" |
| Funnel stage | Exactly one | "tofu", "mofu", "bofu" |
| Target persona | One to two | "marketing-leader", "content-writer" |

## Content Audit and Lifecycle

### Audit Framework

| Audit Type | Scope | Cadence | Output |
|-----------|-------|---------|--------|
| Performance review | Top 50 pages by traffic | Monthly | Optimization recommendations |
| Freshness audit | All content > 6 months old | Quarterly | Refresh, consolidate, or archive list |
| Full inventory | Every published content asset | Annually | Complete content catalog with scores |
| Competitive audit | Competitor content on key topics | Quarterly | Gap analysis and opportunity map |

### Content Scoring Model

| Factor | Weight | Scoring Criteria |
|--------|--------|-----------------|
| Traffic | 25% | Pageviews relative to category average |
| Engagement | 20% | Time on page, scroll depth, bounce rate |
| Conversions | 25% | Goal completions attributed to content |
| SEO position | 15% | Average ranking for target keywords |
| Freshness | 15% | Time since last meaningful update |

### Lifecycle Actions

| Score | Action | Timeline |
|-------|--------|----------|
| High performer | Optimize, repurpose, build clusters around it | Ongoing |
| Moderate performer | Refresh content, update SEO, add internal links | Within 30 days |
| Low performer | Consolidate with related content or redirect | Within 60 days |
| No value | Archive and implement 301 redirect | Within 90 days |

## Common Pitfalls

```text
- No style guide: Every writer invents their own rules; inconsistency erodes brand trust
- Single-pass editing: Skipping structural and substantive edits; catching only typos
- Taxonomy neglect: Content tagged inconsistently or not at all; impossible to audit or find
- Workflow bottlenecks: One editor approving everything; creates delays and single point of failure
- Audit avoidance: Never reviewing published content; stale inventory drags down domain authority
- Tool sprawl: Content tracked across Notion, Google Docs, Slack, and email; no single source of truth
```

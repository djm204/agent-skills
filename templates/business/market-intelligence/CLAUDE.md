# Market Intelligence Development Guide

Principal-level guidelines for monitoring global markets, analyzing sentiment, detecting emerging trends, and delivering actionable intelligence before risks and opportunities hit the mainstream.

---

## Overview

This guide applies to:

- Market monitoring and data aggregation
- Competitive intelligence gathering
- Sentiment analysis across news, social, and financial data
- Trend identification and early warning systems
- Risk signal detection and escalation
- Intelligence reporting and dashboards
- Source credibility assessment
- Signal-to-noise filtering

### Key Principles

1. **Speed With Accuracy** - First to know is useless if the information is wrong
2. **Signal Over Noise** - Filter relentlessly; volume is the enemy of insight
3. **Source Triangulation** - Never trust a single source; corroborate across channels
4. **Actionable Outputs** - Intelligence without a recommended action is just data
5. **Continuous Calibration** - Models degrade; retrain, reweight, and reassess constantly

### Core Frameworks

| Framework | Purpose |
|-----------|---------|
| PESTEL Analysis | Scan political, economic, social, technological, environmental, legal factors |
| Porter's Five Forces | Assess competitive landscape dynamics |
| OODA Loop | Observe, Orient, Decide, Act for rapid response |
| Weak Signal Analysis | Detect early indicators of emerging trends |
| Sentiment Scoring | Quantify market mood from unstructured data |
| Intelligence Cycle | Plan, collect, process, analyze, disseminate |

---

## Data Sources

### Source Taxonomy

```text
Market Intelligence Sources
├── Financial Data
│   ├── Stock prices, volumes, options flow
│   ├── Commodity prices and futures
│   ├── FX rates and bond yields
│   ├── SEC/regulatory filings
│   └── Earnings call transcripts
├── News & Media
│   ├── Wire services (Reuters, AP, Bloomberg)
│   ├── Industry publications
│   ├── Local and regional press
│   └── Podcast and video transcripts
├── Social & Sentiment
│   ├── Twitter/X, Reddit, specialized forums
│   ├── Review platforms (G2, Trustpilot)
│   ├── App store reviews
│   └── Employee sentiment (Glassdoor, Blind)
├── Government & Regulatory
│   ├── Policy announcements
│   ├── Patent filings
│   ├── Trade data and tariff changes
│   └── Central bank communications
└── Alternative Data
    ├── Satellite imagery (parking lots, shipping)
    ├── Web traffic and app download estimates
    ├── Job postings analysis
    └── Supply chain shipping data
```

### Source Credibility Assessment

| Tier | Source Type | Reliability | Latency |
|------|-----------|-------------|---------|
| 1 | Official filings, central banks | Very High | Hours-Days |
| 2 | Major wire services, Bloomberg | High | Minutes-Hours |
| 3 | Industry analysts, trade publications | Medium-High | Hours-Days |
| 4 | Social media, forums | Variable | Seconds-Minutes |
| 5 | Anonymous tips, rumor channels | Low | Seconds |

### Credibility Scoring Template

```markdown
## Source Evaluation: [Source Name]

| Criterion | Score (1-5) | Notes |
|-----------|-------------|-------|
| Track record accuracy | | |
| Editorial independence | | |
| Timeliness | | |
| Domain expertise | | |
| Transparency of methodology | | |
| Corroboration frequency | | |

**Composite Score: __ / 30**
- 25-30: Primary source - high confidence
- 18-24: Supporting source - moderate confidence
- 12-17: Background only - requires corroboration
- Below 12: Unreliable - exclude from analysis
```

---

## Sentiment Analysis

### Methodology

```text
Sentiment Pipeline
├── Collection
│   ├── Define keywords, entities, and topics
│   ├── Set geographic and language scope
│   └── Configure collection frequency
├── Processing
│   ├── Clean and normalize text
│   ├── Entity extraction and linking
│   ├── Language detection and translation
│   └── Deduplication
├── Analysis
│   ├── Sentiment classification (positive/negative/neutral)
│   ├── Intensity scoring (-1.0 to +1.0)
│   ├── Aspect-based sentiment (product, leadership, financials)
│   └── Emotion detection (fear, excitement, anger, uncertainty)
├── Aggregation
│   ├── Time-series sentiment trends
│   ├── Volume-weighted sentiment
│   ├── Comparative sentiment (vs competitors)
│   └── Anomaly detection on sentiment shifts
└── Output
    ├── Dashboard updates
    ├── Alert triggers
    └── Periodic reports
```

### Sentiment Benchmarks

| Signal | Threshold | Action |
|--------|-----------|--------|
| Sentiment shift > 2 std dev in 24h | High alert | Immediate investigation |
| Volume spike > 3x baseline | Moderate alert | Same-day analysis |
| Negative sentiment > 60% for 7 days | Trend alert | Weekly brief escalation |
| New topic emergence > 500 mentions | Emerging topic | Add to monitoring list |

### Bias Mitigation

- **Bot detection**: Filter automated/spam accounts before scoring
- **Echo chamber correction**: Weight diverse source types equally
- **Recency bias**: Compare against 30/60/90-day rolling baselines
- **Survivor bias**: Track what disappears, not just what trends
- **Sentiment calibration**: Validate model output against human-labeled samples quarterly

---

## Trend Detection

### Weak Signal Analysis

```text
Signal Strength Classification
├── Noise (ignore)
│   └── One-off mentions, no pattern, low-credibility sources
├── Weak Signal (monitor)
│   └── Recurring mentions across 2-3 unrelated sources
├── Emerging Trend (investigate)
│   └── Growing volume, multiple credible sources, directional consistency
├── Confirmed Trend (act)
│   └── Mainstream coverage, data confirmation, measurable impact
└── Established (maintain)
    └── Widely known, priced in, competitive response underway
```

### Trend Detection Framework

| Indicator | Data Point | Monitoring Frequency |
|-----------|-----------|---------------------|
| Search volume shifts | Google Trends, internal search | Daily |
| Patent filing clusters | USPTO, EPO databases | Weekly |
| Hiring pattern changes | Job posting aggregators | Weekly |
| Investment flow shifts | VC/PE deal databases | Monthly |
| Academic publication clusters | arXiv, PubMed, SSRN | Monthly |
| Regulatory inquiry patterns | Government filings | Weekly |

### Trend Assessment Template

```markdown
## Trend Assessment: [Trend Name]

**Date**: [Date]
**Analyst**: [Name]
**Signal Strength**: Weak / Emerging / Confirmed / Established

### Summary
[2-3 sentences describing the trend]

### Evidence
| Source | Date | Key Data Point |
|--------|------|---------------|
| [Source 1] | [Date] | [Finding] |
| [Source 2] | [Date] | [Finding] |
| [Source 3] | [Date] | [Finding] |

### Impact Assessment
| Dimension | Impact | Timeframe |
|-----------|--------|-----------|
| Revenue | [High/Med/Low] | [Months] |
| Competitive position | [High/Med/Low] | [Months] |
| Operations | [High/Med/Low] | [Months] |
| Regulatory | [High/Med/Low] | [Months] |

### Recommended Actions
1. [Action with owner and timeline]
2. [Action with owner and timeline]

### Monitoring Plan
- Next review: [Date]
- Key metrics to track: [List]
- Escalation trigger: [Condition]
```

---

## Risk Signal Detection

### Risk Categories

| Category | Examples | Monitoring Sources |
|----------|----------|-------------------|
| Competitive | New entrant, pricing war, feature parity | News, filings, product launches |
| Regulatory | New legislation, enforcement actions | Government sites, legal databases |
| Reputational | Customer backlash, executive scandal | Social media, review platforms |
| Financial | Credit downgrade, liquidity concern | Financial data, credit agencies |
| Geopolitical | Trade restrictions, sanctions, conflict | Wire services, government alerts |
| Technology | Disruption, security breach, obsolescence | Tech press, CVE databases |
| Supply chain | Supplier failure, logistics disruption | Shipping data, supplier news |

### Alert Severity Matrix

```text
              Low Impact    Medium Impact    High Impact    Critical
High Prob.    Monitor       Escalate         Immediate      War Room
Medium Prob.  Log           Monitor          Escalate       Immediate
Low Prob.     Log           Log              Monitor        Escalate
```

### Escalation Protocol

| Severity | Response Time | Notification | Action |
|----------|--------------|-------------|--------|
| Critical | < 30 minutes | Executive team, board if needed | War room, containment plan |
| High | < 2 hours | Senior leadership | Investigation, mitigation plan |
| Medium | < 24 hours | Department heads | Analysis, options memo |
| Low | Next reporting cycle | Team leads | Log, include in periodic report |

---

## Intelligence Reporting

### Daily Intelligence Brief

```markdown
## Daily Intelligence Brief: [Date]

### Priority Alerts
| # | Alert | Severity | Source | Action Required |
|---|-------|----------|--------|----------------|
| 1 | [Description] | [Critical/High] | [Source] | [Action] |

### Market Snapshot
| Indicator | Current | Change | Trend |
|-----------|---------|--------|-------|
| [Index/Metric] | [Value] | [+/-] | [Arrow] |

### Competitive Activity
- [Competitor 1]: [Activity observed]
- [Competitor 2]: [Activity observed]

### Emerging Signals
- [Signal 1]: [Brief description, signal strength]
- [Signal 2]: [Brief description, signal strength]

### Sentiment Summary
| Topic | Sentiment | Volume | Change |
|-------|-----------|--------|--------|
| [Brand] | [Score] | [Count] | [+/-] |
| [Industry] | [Score] | [Count] | [+/-] |
```

### Weekly Strategic Brief

```markdown
## Weekly Strategic Intelligence: [Week of Date]

### Executive Summary
[3-5 sentences: Most important developments and their implications]

### Top 5 Developments
1. **[Development]**: [Impact assessment and recommended response]
2. **[Development]**: [Impact assessment and recommended response]

### Trend Tracker
| Trend | Status | Change This Week | Outlook |
|-------|--------|-----------------|---------|
| [Trend 1] | [Emerging/Growing/Stable] | [Description] | [Bullish/Bearish/Neutral] |

### Competitive Landscape
[Summary of competitor moves and strategic implications]

### Risk Register Update
| Risk | Previous | Current | Trigger | Owner |
|------|----------|---------|---------|-------|
| [Risk] | [Score] | [Score] | [Event] | [Name] |

### Recommended Actions
| Priority | Action | Owner | Deadline |
|----------|--------|-------|----------|
| [P1/P2/P3] | [Action] | [Name] | [Date] |
```

---

## Common Pitfalls

### 1. Data Hoarding Without Analysis

Wrong: Collect everything, analyze nothing. Build a data lake that nobody reads.

Right: Define intelligence requirements first. Collect only what answers specific questions.

### 2. Confirmation Bias

Wrong: Seek data that confirms existing strategy. Dismiss contradictory signals.

Right: Actively seek disconfirming evidence. Assign "red team" analysts to challenge consensus.

### 3. Recency Bias

Wrong: Overweight the latest data point. Panic on single-day sentiment swings.

Right: Compare against rolling baselines. Require pattern persistence before escalating.

### 4. Source Monoculture

Wrong: Rely exclusively on one data provider or channel.

Right: Diversify across source types, geographies, and perspectives. Triangulate always.

### 5. Intelligence Without Action

Wrong: Produce beautiful reports that sit in inboxes unread.

Right: Every intelligence output includes a recommended action, an owner, and a deadline.

### 6. Ignoring Signal Decay

Wrong: Treat a 6-month-old competitive analysis as current.

Right: Set expiration dates on intelligence products. Require periodic refresh.

---

## Resources

- [Competitive Intelligence Advantage - Seena Sharp](https://www.goodreads.com/book/show/6469748-competitive-intelligence-advantage)
- [SCIP (Strategic & Competitive Intelligence Professionals)](https://www.scip.org/)
- [Google Trends](https://trends.google.com/)
- [PESTEL Analysis Framework](https://www.cipd.org/en/knowledge/factsheets/pestle-analysis-factsheet/)
- [OODA Loop - John Boyd](https://en.wikipedia.org/wiki/OODA_loop)

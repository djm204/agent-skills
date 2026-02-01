# Supply Chain Harmonizer Development Guide

Principal-level guidelines for autonomous disruption detection, shipment rerouting, inventory rebalancing, and stakeholder notification across multi-tier supply chain networks.

---

## Overview

This guide applies to:

- Real-time disruption detection and classification
- Automated rerouting algorithms and decision trees
- Multi-tier supplier network management
- Inventory rebalancing across warehouse networks
- Stakeholder notification cascades and communication protocols
- Scenario simulation for disruption planning
- Recovery time optimization
- KPI tracking for disruption response performance

### Key Principles

1. **Autonomy Over Escalation** - The system acts first and reports second; human approval is the exception, not the rule
2. **Resilience Over Efficiency** - A supply chain optimized purely for cost is one disruption away from collapse
3. **Cascade Awareness** - Every disruption triggers secondary effects; model the ripple, not just the splash
4. **Time Is Inventory** - Every hour of delay burns safety stock; response speed is measured in dollars
5. **Recovery Is the Metric** - Detection means nothing without resolution; optimize for time-to-recovery

### Core Frameworks

| Framework | Purpose |
|-----------|---------|
| OODA Loop | Observe disruption, Orient severity, Decide response, Act autonomously |
| Failure Mode Analysis | Classify disruption types and map response playbooks |
| Network Flow Optimization | Model multi-path routing through constrained supply networks |
| Safety Stock Theory | Calculate buffer inventory against disruption probability |
| Monte Carlo Simulation | Stress-test supply chains against thousands of disruption scenarios |
| Bullwhip Effect Mitigation | Dampen demand signal amplification across tiers |

---

## Disruption Detection

### Disruption Taxonomy

```text
Supply Chain Disruptions
├── Natural Events
│   ├── Hurricanes, typhoons, cyclones
│   ├── Earthquakes and tsunamis
│   ├── Flooding and wildfires
│   ├── Volcanic eruptions (airspace closure)
│   └── Pandemics and disease outbreaks
├── Infrastructure Failures
│   ├── Port closures and congestion
│   ├── Canal blockages (Suez, Panama)
│   ├── Rail and highway disruptions
│   ├── Power grid failures
│   └── Telecommunications outages
├── Geopolitical Events
│   ├── Trade sanctions and tariff changes
│   ├── Border closures and customs delays
│   ├── Armed conflict and piracy
│   ├── Political instability and regime change
│   └── Regulatory shifts and compliance changes
├── Supplier Failures
│   ├── Bankruptcy and insolvency
│   ├── Quality defects and recalls
│   ├── Labor strikes and workforce shortages
│   ├── Capacity constraints
│   └── Subcomponent shortages (multi-tier)
└── Demand Shocks
    ├── Sudden demand spikes
    ├── Mass order cancellations
    ├── Seasonal pattern breaks
    └── Viral or event-driven demand
```

### Detection Sources

| Source | Data Type | Latency | Reliability |
|--------|----------|---------|-------------|
| IoT sensors (containers, trucks) | GPS, temperature, vibration | Seconds | Very High |
| AIS vessel tracking | Ship position, speed, heading | Minutes | High |
| Weather services (NOAA, ECMWF) | Forecasts, warnings, alerts | Minutes | High |
| Port authority feeds | Closure notices, congestion metrics | Minutes-Hours | High |
| News wire services | Event reports, breaking news | Minutes | Medium-High |
| Supplier ERP integrations | Order status, capacity updates | Hours | High |
| Social media and local reports | Ground-truth observations | Minutes | Variable |
| Government advisories | Sanctions, trade policy changes | Hours-Days | Very High |

### Severity Classification

| Level | Label | Definition | Response Mode |
|-------|-------|-----------|---------------|
| S1 | Critical | Complete route or supplier loss; revenue impact > $1M/day | Autonomous immediate reroute |
| S2 | Severe | Major delay > 72 hours; multiple SKUs affected | Autonomous reroute with executive notification |
| S3 | Moderate | Delay 24-72 hours; limited SKU impact | Automated mitigation with manager notification |
| S4 | Minor | Delay < 24 hours; single shipment affected | Log and monitor; standard process adjustment |
| S5 | Watch | Potential disruption detected; no current impact | Add to monitoring dashboard |

### Detection Pipeline

```text
Detection Pipeline
├── Ingest
│   ├── Aggregate feeds from all detection sources
│   ├── Normalize event data to common schema
│   └── Deduplicate across sources
├── Classify
│   ├── Map event to disruption taxonomy
│   ├── Assign initial severity level
│   ├── Identify affected routes, suppliers, and SKUs
│   └── Estimate duration range
├── Correlate
│   ├── Cross-reference with active shipments
│   ├── Map upstream and downstream dependencies
│   ├── Identify compounding disruptions
│   └── Calculate blast radius
├── Decide
│   ├── Match to response playbook
│   ├── Evaluate rerouting options
│   ├── Trigger autonomous response if S1/S2
│   └── Queue for review if S3+
└── Record
    ├── Log disruption event with full context
    ├── Start recovery timer
    └── Initialize stakeholder notification cascade
```

---

## Automated Rerouting

### Decision Tree

```text
Rerouting Decision
├── Is primary route blocked?
│   ├── YES → Evaluate alternate routes
│   │   ├── Are alternate routes available?
│   │   │   ├── YES → Score and rank alternatives
│   │   │   │   ├── Cost delta < 25% threshold? → Auto-approve
│   │   │   │   ├── Cost delta 25-50%? → Auto-approve with executive alert
│   │   │   │   └── Cost delta > 50%? → Hold for human approval
│   │   │   └── NO → Evaluate alternate suppliers
│   │   │       ├── Qualified backup supplier available? → Trigger PO
│   │   │       └── No backup? → Escalate to war room
│   └── NO → Is there a delay risk > 48 hours?
│       ├── YES → Preemptive reroute evaluation
│       └── NO → Monitor and reassess in 6 hours
```

### Route Scoring Algorithm

Each alternative route is scored across weighted dimensions:

| Factor | Weight | Metric |
|--------|--------|--------|
| Transit time | 30% | Hours to destination vs. original ETA |
| Cost | 25% | Incremental cost as percentage of shipment value |
| Reliability | 20% | Historical on-time rate for this route |
| Capacity | 15% | Available capacity vs. shipment volume |
| Risk exposure | 10% | Number of known risk factors on route |

```text
Route Score = (0.30 * TimeScore) + (0.25 * CostScore) + (0.20 * ReliabilityScore)
            + (0.15 * CapacityScore) + (0.10 * RiskScore)

Each factor normalized to 0-100 scale.
Minimum acceptable score: 60/100.
```

### Modal Switching Rules

| Original Mode | Fallback 1 | Fallback 2 | Fallback 3 |
|--------------|-----------|-----------|-----------|
| Ocean freight | Rail (if continental) | Air freight (high-value) | Truck (regional) |
| Air freight | Express ocean | Truck relay | Charter flight |
| Rail | Truck | Intermodal ocean-truck | Air (critical only) |
| Truck | Rail | Intermodal | Courier (small parcels) |

### Rerouting Constraints

- **Regulatory**: Certain goods cannot transit specific countries (sanctions, hazmat rules)
- **Temperature**: Cold chain shipments limit modal and route options
- **Weight/Volume**: Oversized cargo restricts air and some road routes
- **Customs**: Rerouting through new countries may add clearance delays
- **Contract**: Some lanes have minimum volume commitments; diverting may trigger penalties

---

## Multi-Tier Supplier Network

### Network Visibility

```text
Supplier Network Tiers
├── Tier 0: Internal (own facilities)
│   └── Full visibility, direct control
├── Tier 1: Direct Suppliers
│   ├── Contractual visibility, SLA-bound
│   ├── ERP/API integration expected
│   └── Performance scorecards maintained
├── Tier 2: Suppliers' Suppliers
│   ├── Partial visibility via Tier 1 reporting
│   ├── Critical path mapping required
│   └── Risk assessment via industry data
├── Tier 3+: Deep Supply Chain
│   ├── Limited visibility, commodity-level data
│   ├── Regional risk profiling
│   └── Alternative sourcing pre-qualified
```

### Supplier Health Monitoring

| Metric | Frequency | Alert Threshold |
|--------|-----------|----------------|
| On-time delivery rate | Weekly | Below 90% |
| Quality defect rate | Weekly | Above 2% |
| Financial health score | Monthly | Below 60/100 |
| Capacity utilization | Weekly | Above 90% |
| Lead time variability | Weekly | Coefficient of variation > 0.25 |
| Geographic risk index | Monthly | Above 7/10 |
| Concentration risk | Quarterly | Single supplier > 40% of any SKU |

### Supplier Diversification Rules

- No single supplier provides more than 40% of any critical component
- At least one qualified backup supplier in a different geographic region
- Backup suppliers validated with test orders every 6 months
- Dual-sourcing mandatory for any component with lead time > 30 days
- Annual review of supplier financial stability and geopolitical exposure

---

## Inventory Rebalancing

### Safety Stock Framework

```text
Safety Stock Calculation
├── Base Safety Stock
│   ├── SS = Z * sigma_demand * sqrt(lead_time) + Z * demand_avg * sigma_lead_time
│   ├── Z = service level factor (typically 1.65 for 95% service level)
│   └── Recalculated weekly under normal conditions
├── Disruption Buffer
│   ├── Additional stock held at strategic locations
│   ├── Sized for expected disruption duration * daily demand
│   └── Activated when disruption severity >= S3
└── Dynamic Adjustment
    ├── Increase buffer when active disruption detected
    ├── Decrease buffer 30 days after recovery confirmed
    └── Seasonal multiplier applied for peak periods
```

### Warehouse Network Strategy

| Warehouse Type | Role | Rebalancing Priority |
|---------------|------|---------------------|
| Regional Distribution Center | Primary fulfillment | Highest - maintain target fill rates |
| Forward Stocking Location | Fast delivery for key markets | High - replenish from RDCs |
| Central Warehouse | Bulk storage, overflow buffer | Medium - source for RDC replenishment |
| Cross-Dock Facility | Flow-through, no storage | N/A - reroute inbound flows |
| Bonded Warehouse | Pre-customs holding | Low - hold until clearance path confirmed |

### Rebalancing Triggers

| Trigger | Condition | Action |
|---------|-----------|--------|
| Stock-out imminent | Days of supply < 3 at any RDC | Emergency transfer from nearest RDC with surplus |
| Demand shift detected | Regional demand > 120% forecast for 5+ days | Redistribute from low-demand regions |
| Inbound delay confirmed | Shipment ETA pushed > 48 hours | Activate safety stock; pull forward next PO |
| Supplier failure declared | Supplier status set to "inactive" | Switch to backup supplier; deplete strategic reserve |
| Recovery complete | All routes restored, inbound normalized | Begin safety stock replenishment over 30 days |

### Rebalancing Algorithm

```text
For each SKU at each location:
  1. Calculate days_of_supply = on_hand / daily_demand_forecast
  2. If days_of_supply < threshold:
     a. Identify nearest locations with surplus (days_of_supply > target + buffer)
     b. Calculate transfer quantity = (target - current) * daily_demand * lead_time_to_transfer
     c. Score transfer options by cost and transit time
     d. Execute lowest-cost feasible transfer
     e. Adjust demand forecasts for both locations
  3. If days_of_supply > max_threshold:
     a. Flag for potential redistribution to deficit locations
     b. Reduce inbound replenishment orders
```

### Inventory KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Fill rate | > 97% | Orders fulfilled from stock / total orders |
| Days of supply | 7-14 days (varies by SKU) | On-hand inventory / daily demand |
| Inventory turns | > 8 per year | COGS / average inventory value |
| Dead stock percentage | < 3% | SKUs with zero movement in 90 days |
| Rebalancing cost ratio | < 2% of inventory value | Transfer costs / total inventory value |

---

## Stakeholder Notifications

### Notification Cascade

```text
Disruption Detected
├── Immediate (< 15 minutes)
│   ├── Operations control center
│   ├── Affected warehouse managers
│   └── On-call supply chain lead
├── Fast (< 1 hour)
│   ├── Procurement team (if supplier-related)
│   ├── Logistics partners (carriers, 3PLs)
│   ├── Customer service team (prepare for inquiries)
│   └── VP Supply Chain (if S1 or S2)
├── Standard (< 4 hours)
│   ├── Affected retailers and key accounts
│   ├── Sales team (revenue impact briefing)
│   ├── Finance team (cost impact estimate)
│   └── Executive leadership (if S1)
└── Periodic (daily until resolved)
    ├── Status update to all notified parties
    ├── Recovery timeline estimate
    ├── Updated ETA for affected shipments
    └── Mitigation actions taken and planned
```

### Communication Templates

#### S1 Critical Disruption Alert

```markdown
## CRITICAL SUPPLY CHAIN DISRUPTION

**Disruption ID**: [ID]
**Detected**: [Timestamp]
**Type**: [Category from taxonomy]
**Severity**: S1 - Critical

### What Happened
[2-3 sentence description of the disruption event]

### Impact
- **Routes affected**: [List]
- **Shipments affected**: [Count and value]
- **SKUs impacted**: [Count and top affected]
- **Estimated daily revenue impact**: [$Amount]

### Actions Taken (Autonomous)
1. [Rerouting action with details]
2. [Inventory rebalancing action]
3. [Supplier activation if applicable]

### Current Status
- **Recovery ETA**: [Estimate]
- **Confidence level**: [High/Medium/Low]
- **Next update**: [Timestamp]

### Decisions Needed
- [Any decisions requiring human approval]
```

#### Retailer Delay Notification

```markdown
## Shipment Update: Revised Delivery Timeline

**Order Reference**: [Order ID]
**Original ETA**: [Date]
**Revised ETA**: [Date]
**Reason**: [Brief, non-technical explanation]

### What We Are Doing
[1-2 sentences on mitigation actions]

### Your Options
- Accept revised timeline
- Partial fulfillment from alternate stock (available: [quantity])
- Substitute product options: [List if applicable]

Please respond by [deadline] so we can prioritize your preference.
```

### Channel Configuration

| Stakeholder | S1 Channel | S2 Channel | S3+ Channel |
|------------|-----------|-----------|------------|
| Executive leadership | Phone + SMS + Email | Email + Dashboard | Dashboard only |
| Operations team | SMS + Slack + Dashboard | Slack + Dashboard | Dashboard only |
| Warehouse managers | SMS + WMS alert | WMS alert + Email | WMS alert |
| Logistics partners | API + Email + Phone | API + Email | API notification |
| Retailers/Customers | Phone + Email | Email | Email (if ETA changes) |
| Finance team | Email | Email | Weekly report |

---

## Scenario Simulation

### Simulation Framework

```text
Scenario Simulation Pipeline
├── Define Scenario
│   ├── Disruption type and severity
│   ├── Duration (min, expected, max)
│   ├── Geographic scope
│   ├── Affected tiers and nodes
│   └── Demand conditions during disruption
├── Model Network State
│   ├── Current inventory levels at all nodes
│   ├── In-transit shipments and ETAs
│   ├── Supplier capacity and lead times
│   ├── Active contracts and commitments
│   └── Historical demand patterns
├── Run Simulation
│   ├── Monte Carlo: 10,000 iterations minimum
│   ├── Vary disruption duration, demand, recovery speed
│   ├── Test each rerouting option
│   └── Model inventory depletion curves
├── Evaluate Outcomes
│   ├── Service level impact by region
│   ├── Total cost of disruption
│   ├── Recovery timeline distribution
│   ├── Stockout probability by SKU
│   └── Revenue at risk
└── Recommend
    ├── Optimal response playbook
    ├── Pre-positioning recommendations
    ├── Supplier qualification priorities
    └── Investment cases for resilience improvements
```

### Standard Scenarios to Maintain

| Scenario | Frequency | Key Variables |
|----------|-----------|---------------|
| Major port closure (7-14 days) | Quarterly | Port, season, demand level |
| Top supplier bankruptcy | Semi-annually | Supplier, replacement lead time |
| Regional natural disaster | Quarterly | Region, severity, duration |
| Trade route blockage (canal/strait) | Semi-annually | Route, diversion options |
| Pandemic-level demand shift | Annually | Demand multiplier, duration |
| Cyberattack on logistics systems | Semi-annually | Systems affected, recovery time |
| Multi-event compound disruption | Annually | Combination of 2-3 scenarios |

### Simulation Outputs

Every simulation report must include at P10, P50, and P90 confidence levels:

- Revenue at risk
- Additional logistics cost from rerouting and expediting
- Service level degradation (percentage point drop in fill rate)
- Full recovery time in days
- SKU stockout count

Reports must conclude with a recommended response playbook, pre-positioning recommendations for inventory and suppliers, and an investment case comparing preparation cost against expected unmitigated disruption cost.

---

## Recovery Time Optimization

### Recovery Phases

```text
Recovery Timeline
├── Phase 1: Containment (0-4 hours)
│   ├── Disruption confirmed and classified
│   ├── Affected shipments and inventory identified
│   ├── Autonomous rerouting initiated
│   └── Stakeholders notified
├── Phase 2: Stabilization (4-48 hours)
│   ├── All affected shipments rerouted or held
│   ├── Inventory rebalancing in progress
│   ├── Backup suppliers activated if needed
│   └── Customer ETAs updated
├── Phase 3: Recovery (2-14 days)
│   ├── Primary routes restored or permanent alternatives established
│   ├── Safety stock replenishment initiated
│   ├── Backlog cleared
│   └── Performance metrics normalizing
└── Phase 4: Post-Mortem (after recovery)
    ├── Root cause analysis
    ├── Response effectiveness review
    ├── Playbook updates
    ├── Simulation model recalibration
    └── Resilience investment recommendations
```

### Recovery Acceleration Tactics

| Tactic | Phase | Expected Time Savings |
|--------|-------|----------------------|
| Pre-qualified backup carriers | Containment | 4-8 hours |
| Pre-positioned safety stock | Stabilization | 24-48 hours |
| Automated customs pre-clearance | Recovery | 12-24 hours |
| Expedited shipping authorization (pre-approved budgets) | Containment | 2-4 hours (vs. waiting for approval) |
| Cross-trained warehouse staff | Stabilization | 8-16 hours |
| Pre-negotiated surge capacity contracts | Recovery | 48-72 hours |

### Post-Mortem Requirements

Every S1 and S2 disruption requires a post-mortem within 5 business days of recovery. The post-mortem must include:

- Full timeline from detection through recovery confirmation
- Performance vs. targets for detection time, rerouting initiation, notification compliance, and service level
- Root cause analysis with contributing factors
- What went well and what needs improvement
- Action items with owners and deadlines
- Playbook updates and simulation model recalibrations triggered by findings

---

## KPIs and Performance Metrics

### Response Performance KPIs

| KPI | Definition | Target | Measurement Frequency |
|-----|-----------|--------|----------------------|
| Mean Time to Detect (MTTD) | Time from disruption occurrence to system detection | < 15 minutes | Per incident |
| Mean Time to Respond (MTTR) | Time from detection to first autonomous action | < 30 minutes | Per incident |
| Mean Time to Recover (MTTRec) | Time from disruption to full service restoration | Varies by severity | Per incident |
| Autonomous Resolution Rate | Disruptions resolved without human intervention | > 70% for S3-S5 | Monthly |
| Rerouting Success Rate | Rerouted shipments delivered within revised ETA | > 90% | Monthly |
| Stakeholder Notification Compliance | Notifications sent within cascade timelines | > 95% | Per incident |
| Service Level During Disruption | Fill rate maintained during active disruption | > 85% | Per incident |

### Supply Chain Health KPIs

| KPI | Definition | Target | Measurement Frequency |
|-----|-----------|--------|----------------------|
| Supply chain resilience index | Composite score of diversification, buffer stock, route alternatives | > 75/100 | Quarterly |
| Supplier concentration risk | Max percentage from any single supplier per SKU | < 40% | Monthly |
| Network redundancy score | Percentage of routes with qualified alternatives | > 80% | Quarterly |
| Simulation coverage | Percentage of critical scenarios simulated in last 12 months | 100% | Quarterly |
| Safety stock adequacy | Actual vs. calculated safety stock levels | > 95% compliance | Weekly |
| Forecast accuracy (disruption demand) | MAPE during disruption periods | < 25% | Per incident |

### Cost KPIs

| KPI | Definition | Target | Measurement Frequency |
|-----|-----------|--------|----------------------|
| Disruption cost ratio | Total disruption costs / revenue | < 1.5% annually | Quarterly |
| Expedited shipping as % of total | Spend on emergency shipping / total logistics spend | < 5% | Monthly |
| Rerouting cost premium | Average cost increase when rerouting vs. planned route | < 20% | Per incident |
| Dead stock from disruption | Inventory written off due to expiration or obsolescence during disruption | < 0.5% of inventory value | Quarterly |
| Resilience investment ROI | Cost avoided from disruption response / resilience investment | > 3:1 | Annually |

---

## Common Pitfalls

### 1. Optimizing for Cost Alone

Wrong: Choose the cheapest route and single-source every component to minimize unit cost.

Right: Factor resilience into total cost of ownership. The cheapest supplier in a single geographic cluster is the most expensive when that region goes offline.

### 2. Detecting Without Acting

Wrong: Build a sophisticated monitoring dashboard that sends alerts nobody acts on.

Right: Every detection must trigger an automated response or a named human decision-maker with a deadline. Detection without action is just expensive observation.

### 3. Ignoring Tier 2+ Dependencies

Wrong: Monitor only direct suppliers and assume they manage their own supply chains.

Right: Map critical paths through Tier 2 and Tier 3. A disruption at a sole-source chip fabricator affects every Tier 1 electronics supplier simultaneously.

### 4. Static Safety Stock

Wrong: Calculate safety stock once per year based on average demand and lead times.

Right: Recalculate weekly. Adjust dynamically for seasonality, active disruptions, and lead time variability. Static buffers guarantee either excess cost or stockouts.

### 5. Notification Fatigue

Wrong: Send every alert to every stakeholder. Executives get 50 supply chain notifications a day.

Right: Tier notifications by severity and role. Executives see only S1 and S2. Warehouse managers see only their locations. Retailers see only their orders.

### 6. Simulating Without Updating

Wrong: Run a tabletop exercise once, declare the supply chain resilient, and never revisit.

Right: Rerun simulations quarterly with current network data. Update playbooks after every real disruption. Models built on stale data produce dangerous confidence.

---

## Resources

- [Supply Chain Resilience - MIT Center for Transportation & Logistics](https://ctl.mit.edu/)
- [SCOR Model - ASCM](https://www.ascm.org/scor/)
- [FEMA Supply Chain Resilience Guide](https://www.fema.gov/emergency-managers/practitioners/supply-chain)
- [Flexport Disruption Tracker](https://www.flexport.com/)
- [MarineTraffic AIS Data](https://www.marinetraffic.com/)
- [NOAA Weather Alerts](https://alerts.weather.gov/)
- [The Resilient Enterprise - Yossi Sheffi](https://www.goodreads.com/book/show/714969.The_Resilient_Enterprise)

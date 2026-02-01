# Dynamic Resource Allocator

Principal-level guidelines for real-time resource allocation across healthcare, emergency services, and other high-stakes operational environments.

## Scope

This ruleset applies to:

- Real-time resource optimization and rebalancing
- Demand prediction and capacity modeling
- Personnel scheduling and shift optimization
- Equipment and asset tracking across sites
- Crisis escalation protocols and triage
- Utilization monitoring and bottleneck detection
- Multi-site coordination strategies

## Core Philosophy

**Resources exist to serve demand.** Every allocation decision must trace back to a need. If a resource is idle, either the demand forecast was wrong or the allocation logic is broken. If demand is unmet while resources sit elsewhere, the coordination model has failed.

## Fundamental Principles

### 1. Lives Before Efficiency

Optimization models serve people, not the other way around. When the model says one thing and clinical or operational judgment says another, judgment wins. Models are tools, not authorities.

### 2. Real-Time Over Perfect

A good allocation now beats an optimal allocation in an hour. In dynamic environments, conditions change faster than solvers converge. Aim for feasible-and-fast, then refine.

### 3. Capacity Headroom

Never run at 100%. Systems without slack cannot absorb surges. Target 70-85% utilization in steady state and maintain explicit surge reserves.

### 4. Transparent Tradeoffs

Every allocation decision has a cost somewhere else. When Site A gets the extra ambulance, Site B loses coverage. Make the tradeoff visible to decision-makers, never hide it inside the algorithm.

### 5. Degrade Gracefully

When demand exceeds supply, fail in a controlled, prioritized manner. Triage protocols exist so that degradation is deliberate, not chaotic.

## Decision Framework

When evaluating any allocation decision:

1. **Urgency**: Is this time-critical? What degrades if we wait?
2. **Impact**: How many people or operations are affected?
3. **Feasibility**: Can we actually get the resource there in time?
4. **Tradeoff**: What do we lose by allocating here instead of there?
5. **Reversibility**: Can we recall or redirect if conditions change?
6. **Fatigue**: Does this assignment push anyone past safe operating limits?

## Optimization Loop

```text
Sense → Predict → Optimize → Act → Learn → Repeat
```

Every allocation cycle follows this loop. Skipping "Learn" guarantees the same mistakes recur. Skipping "Predict" means reacting instead of anticipating.

## Key Metrics

| Metric | Purpose |
|--------|---------|
| Response time | Time from demand signal to resource arrival |
| Utilization rate | Percentage of available capacity in active use |
| Unmet demand | Requests that could not be served within SLA |
| Reallocation churn | Frequency of mid-shift resource moves |
| Overtime ratio | Overtime hours as percentage of total hours |
| Forecast accuracy | Predicted vs actual demand (MAPE) |

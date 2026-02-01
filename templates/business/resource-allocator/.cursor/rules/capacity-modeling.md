# Capacity Modeling

Guidelines for understanding, measuring, and planning resource capacity across operational environments.

## Capacity Dimensions

```text
Capacity Components
├── Personnel Capacity
│   ├── Headcount by role and certification
│   ├── Available hours (minus leave, training, admin)
│   ├── Effective hours (adjusted for fatigue, breaks, handoffs)
│   └── Skill mix coverage across required competencies
├── Equipment Capacity
│   ├── Unit count by type and capability
│   ├── Operational availability (minus maintenance, repair)
│   ├── Throughput rate per unit (procedures/hour, trips/day)
│   └── Consumable supply levels (fuel, supplies, disposables)
├── Space Capacity
│   ├── Beds, bays, stations, or zones
│   ├── Surge expansion areas (convertible spaces)
│   ├── Staging and logistics areas
│   └── Decontamination and isolation capacity
└── System Capacity
    ├── Communication channels and bandwidth
    ├── IT system throughput (dispatch, tracking, records)
    ├── Transportation network capacity (routes, vehicles)
    └── Supply chain replenishment rate
```

## Utilization Targets

| Zone | Utilization | Interpretation | Action |
|------|------------|---------------|--------|
| Under-utilized | < 50% | Waste; idle resources or misallocation | Consolidate or redeploy |
| Optimal | 50-80% | Healthy balance of output and reserve | Maintain with minor tuning |
| High | 80-90% | Productive but limited surge buffer | Pre-stage reserves, monitor closely |
| Stressed | 90-95% | Near capacity; delays accumulating | Activate overflow, defer non-critical |
| Saturated | > 95% | At or beyond capacity; service degraded | Escalate, implement triage |

The optimal zone varies by context. Emergency departments target 70-85%. Elective surgical suites may target 85-90%. Field operations during incidents may tolerate 90%+ briefly.

## Capacity Assessment Process

1. **Inventory**: Count all resources by type, location, and status
2. **Availability**: Subtract planned downtime (maintenance, leave, training)
3. **Effective capacity**: Apply efficiency factors (handoff time, setup, fatigue)
4. **Match to demand**: Compare available capacity against forecast demand
5. **Gap analysis**: Identify shortfalls by resource type, time period, and location
6. **Mitigation planning**: For each gap, define a response (overtime, mutual aid, deferral)

## Bottleneck Identification

The bottleneck is the resource whose capacity most constrains overall throughput.

### Detection Methods

- **Throughput analysis**: Measure flow rate at each process stage; lowest rate is the bottleneck
- **Queue monitoring**: Growing queues indicate constrained downstream resources
- **Utilization heat maps**: Persistent high-utilization spots are structural bottlenecks
- **Shadow price analysis**: In optimization models, the constraint with highest shadow price is the binding bottleneck

### Bottleneck Response

| Duration | Type | Response |
|----------|------|----------|
| Temporary (< 4 hours) | Demand spike | Redistribute load, activate float pool |
| Recurring (same time daily) | Structural pattern | Adjust staffing pattern, stagger schedules |
| Persistent (multi-day) | Capacity deficit | Acquire additional resources, redesign workflow |

## Scenario Planning

Model at least three scenarios for capacity planning:

| Scenario | Demand Assumption | Purpose |
|----------|------------------|---------|
| Base case | Median forecast | Normal operating plan |
| High demand | 90th percentile forecast | Stress test; validate surge capacity |
| Crisis | Historical worst case or defined scenario | Validate crisis protocols and mutual aid |

For each scenario, document: resource requirements, gaps, mitigation actions, and cost.

## Common Pitfalls

### Confusing Theoretical and Effective Capacity

Wrong: "We have 50 beds" means capacity is 50.

Right: Effective capacity accounts for turnover time, cleaning, staffing ratios, and equipment availability. Effective capacity is always less than theoretical.

### Ignoring Interdependencies

Wrong: Model each resource type independently.

Right: A ventilator without a respiratory therapist is useless. Model resource bundles, not individual items. The binding constraint is the scarcest element in the bundle.

### Static Capacity Plans

Wrong: Set capacity allocations annually and revisit next year.

Right: Review capacity models monthly. Adjust for seasonal shifts, staffing changes, equipment lifecycle, and demand trend evolution.

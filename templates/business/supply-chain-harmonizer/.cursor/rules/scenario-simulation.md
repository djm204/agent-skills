# Scenario Simulation

Guidelines for stress-testing the supply chain against disruption scenarios to validate playbooks and identify resilience gaps.

## Simulation Pipeline

```text
Define Scenario → Model Network State → Run Simulation → Evaluate Outcomes → Recommend Actions
```

1. **Define**: Select disruption type, severity, duration range, geographic scope, affected nodes
2. **Model**: Load current inventory levels, in-transit shipments, supplier capacity, active contracts, demand patterns
3. **Run**: Execute Monte Carlo simulation with minimum 10,000 iterations, varying duration, demand, and recovery speed
4. **Evaluate**: Measure service level impact, total cost, recovery timeline distribution, stockout probability, revenue at risk
5. **Recommend**: Select optimal playbook, identify pre-positioning opportunities, build investment cases for resilience improvements

## Standard Scenarios

Maintain and rerun these scenarios on the specified cadence:

| Scenario | Cadence | Key Variables |
|----------|---------|---------------|
| Major port closure (7-14 days) | Quarterly | Port location, season, demand level |
| Top supplier bankruptcy | Semi-annually | Supplier identity, replacement lead time |
| Regional natural disaster | Quarterly | Region, severity, duration |
| Trade route blockage (canal or strait) | Semi-annually | Route, diversion options, duration |
| Pandemic-level demand shift | Annually | Demand multiplier, geographic spread, duration |
| Cyberattack on logistics systems | Semi-annually | Systems affected, data loss, recovery time |
| Compound multi-event disruption | Annually | Combination of 2-3 independent scenarios |

## Simulation Parameters

Each simulation run must specify:

- **Disruption duration**: Minimum, expected, and maximum values
- **Demand during disruption**: Baseline, increased (panic buying), or decreased
- **Recovery curve**: Linear, exponential, or step-function recovery
- **Capacity constraints**: Alternate route and supplier capacity limits
- **Cost multipliers**: Expedited shipping premiums, surge pricing, penalties

## Output Metrics

Every simulation produces these metrics at P10, P50, and P90 confidence levels:

| Metric | Definition |
|--------|-----------|
| Revenue at risk | Sales that cannot be fulfilled due to disruption |
| Additional logistics cost | Incremental spend on rerouting, expediting, modal switching |
| Service level degradation | Percentage point drop in fill rate during disruption |
| Full recovery time | Days from disruption to return to baseline service levels |
| SKUs with stockout | Count of SKUs that hit zero available inventory |
| Customer impact scope | Number of customers or orders affected |

## Playbook Validation

Use simulation results to validate and improve response playbooks:

- Run the scenario with the current playbook active
- Run the scenario with no playbook (baseline impact)
- Compare outcomes to quantify playbook effectiveness
- Identify gaps where the playbook underperforms expectations
- Update playbook and rerun to verify improvement

## Pre-Positioning Recommendations

Simulation outputs should include actionable pre-positioning advice:

- Which SKUs need additional safety stock and at which locations
- Which backup suppliers should be qualified or re-validated
- Which alternate routes should be pre-negotiated with carriers
- Which warehouse cross-training programs would accelerate recovery

## Simulation Freshness

- Rerun all standard scenarios whenever the supplier network changes materially (new supplier, lost supplier, new warehouse)
- Update demand inputs quarterly to reflect actual consumption patterns
- Recalibrate disruption probability estimates using the last 12 months of real incident data

## Common Pitfalls

### Simulating Without Updating

Wrong: Run a tabletop exercise once, declare the supply chain resilient, and never revisit.

Right: Simulations built on stale data produce dangerous confidence. Rerun quarterly with current inventory, demand, and network data.

### Optimistic Duration Estimates

Wrong: Assume the disruption will last exactly the expected duration.

Right: Always model the tail risk. The P90 duration matters more than the P50 because that is where resilience is actually tested.

### Ignoring Capacity Constraints on Alternatives

Wrong: Assume unlimited capacity on alternate routes and suppliers.

Right: Model real capacity limits. If three customers all reroute through the same alternate port, that port becomes the new bottleneck.

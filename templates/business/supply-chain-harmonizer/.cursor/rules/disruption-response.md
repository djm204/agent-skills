# Disruption Response

Guidelines for detecting, classifying, and responding to supply chain disruptions autonomously.

## Detection Pipeline

```text
Ingest → Classify → Correlate → Decide → Record
```

1. **Ingest**: Aggregate data from IoT sensors, AIS tracking, weather services, news feeds, supplier ERPs
2. **Classify**: Map to disruption taxonomy, assign severity S1-S5, estimate duration
3. **Correlate**: Cross-reference with active shipments, map upstream/downstream blast radius
4. **Decide**: Match to response playbook, evaluate rerouting options, trigger autonomous action or escalate
5. **Record**: Log full context, start recovery timer, initialize notification cascade

## Severity Levels

| Level | Label | Impact Threshold | Response Mode |
|-------|-------|-----------------|---------------|
| S1 | Critical | Complete route/supplier loss, > $1M/day | Autonomous containment + immediate escalation |
| S2 | Severe | Major delay > 72 hours, multiple SKUs | Autonomous reroute + executive notification |
| S3 | Moderate | Delay 24-72 hours, limited SKU impact | Automated mitigation + manager notification |
| S4 | Minor | Delay < 24 hours, single shipment | Log and adjust |
| S5 | Watch | Potential disruption, no current impact | Monitor dashboard |

## Response Playbook Structure

Every disruption type maps to a playbook containing:

- **Trigger conditions**: What activates this playbook
- **Immediate actions**: Steps taken autonomously within 30 minutes
- **Rerouting options**: Pre-scored alternative routes ranked by the scoring algorithm
- **Inventory actions**: Rebalancing or safety stock activation steps
- **Notification targets**: Who is informed and when, per the cascade
- **Escalation criteria**: Conditions that require human decision-making
- **Recovery milestones**: How to measure progress back to normal operations

## Correlation Rules

When a disruption is detected, correlate against:

- **Active shipments**: Any in-transit cargo on affected routes or from affected suppliers
- **Pending orders**: Purchase orders not yet shipped that depend on disrupted capacity
- **Inventory positions**: Warehouse stock levels for affected SKUs
- **Concurrent disruptions**: Other active disruptions that compound the impact
- **Seasonal factors**: Demand patterns that amplify or dampen the effect

## Response Timing Targets

| Action | Target | Measurement |
|--------|--------|-------------|
| Disruption detected | < 15 minutes from occurrence | MTTD per incident |
| Severity classified | < 10 minutes from detection | Time to classification |
| First autonomous action | < 30 minutes from detection | MTTR per incident |
| Stakeholder notification | Per cascade (15 min to 4 hours) | Compliance rate |
| Recovery plan published | < 4 hours from S1/S2 detection | Plan availability |

## Common Pitfalls

### Alert Without Action

Wrong: Build a detection system that sends alerts but takes no autonomous action.

Right: Every detection triggers a playbook. If no playbook exists for the disruption type, that is a gap to close in the next simulation cycle.

### Severity Inflation

Wrong: Classify everything as S1 or S2 to ensure fast response.

Right: Use the classification matrix consistently. Over-escalation causes fatigue and erodes trust in the system.

### Ignoring Compound Events

Wrong: Treat each disruption independently even when multiple are active.

Right: Evaluate compound effects. A port delay plus a supplier capacity constraint on the same SKU is worse than the sum of its parts.

# Asset Lifecycle Management

Guidelines for tracking assets from commissioning through retirement.

## Lifecycle Stages

```text
Procurement → Installation → Commissioning → Operation → Degradation → Overhaul/Replacement → Retirement
```

## Asset Registry Requirements

Every monitored asset must have:

| Field | Description | Example |
|-------|-------------|---------|
| Asset ID | Unique identifier | PUMP-WH3-042 |
| Asset class | Equipment category | Centrifugal pump |
| Criticality | Safety/production/standard/non-critical | Production-critical |
| Location | Physical location hierarchy | Site > Building > Line > Station |
| Install date | Commissioning date | 2021-03-15 |
| Expected life | Design life or fleet average | 8 years / 35,000 hours |
| Current hours | Operating hours accumulated | 18,450 hours |
| Maintenance history | All interventions with dates and costs | Linked records |
| Failure history | All failures with root cause analysis | Linked records |
| Sensor mapping | Which sensors monitor this asset | Vib-042, Temp-042, Press-042 |

## Health Index Scoring

Combine multiple indicators into a single asset health score:

| Health Index | Condition | Action |
|-------------|-----------|--------|
| 90-100 | Excellent | Monitor at standard frequency |
| 70-89 | Good | Monitor, no action needed |
| 50-69 | Fair | Increase monitoring frequency, plan maintenance |
| 30-49 | Poor | Schedule maintenance within next planned window |
| 0-29 | Critical | Immediate intervention required |

## Fleet Analytics

For asset classes with multiple units:

- **Survival analysis**: Weibull distribution of time-to-failure across fleet
- **Bad actor identification**: Units with failure rates > 2x fleet average
- **Aging curve analysis**: Track health index degradation rate by age cohort
- **Total cost of ownership**: Acquisition + maintenance + downtime + energy over lifecycle

## Replacement Decision Framework

```text
Replace when:
├── Repair cost > 50% of replacement cost AND asset > 60% of expected life
├── Failure frequency > 3x in 12 months despite maintenance
├── Spare parts becoming obsolete or unavailable
├── Newer technology offers > 20% efficiency gain
└── Safety risk exceeds acceptable threshold
```

## Depreciation and Cost Tracking

Track per asset:

- **Capital cost**: Purchase and installation
- **Cumulative maintenance cost**: All preventive and corrective actions
- **Downtime cost**: Lost production attributed to this asset
- **Energy cost**: Operating energy consumption trends
- **Book value**: Current depreciated value

## Common Pitfalls

### Treating All Assets Equally

Wrong: Apply the same monitoring and maintenance strategy to every asset.

Right: Segment by criticality. Safety-critical assets get predictive + time-based. Non-critical assets can run to failure.

### Ignoring Fleet Patterns

Wrong: Analyze each asset in isolation.

Right: Compare against fleet baselines. An asset degrading faster than its peers signals a unique problem.

# Health Data Integration

Guidelines for aggregating, normalizing, and interpreting wellness data from wearable devices, self-reported inputs, fitness apps, and clinical sources.

## Integration Principles

- **Normalize before comparing** - Different devices use different algorithms; always convert to standardized units and apply consistent smoothing before cross-device comparison
- **7-day rolling averages over daily snapshots** - Single-day readings fluctuate due to hydration, device fit, alcohol, and dozens of other transient factors
- **Subjective data is real data** - Mood, energy, soreness, and motivation ratings are valid inputs that often detect issues before wearable metrics do
- **Source hierarchy matters** - Clinical lab data outranks wearable estimates; wearable trends outrank single self-report entries; consistent self-report patterns outrank sporadic wearable readings
- **Privacy by default** - Collect only metrics relevant to active goals; store locally or in user-controlled accounts; never share without explicit consent

## Data Source Priority

| Priority | Source Type | Use Case | Reliability |
|----------|-----------|----------|-------------|
| 1 | Clinical lab data (blood panels, DEXA) | Body composition, health markers, diagnoses | Very High |
| 2 | Validated self-report scales (PSS-4, PHQ-9) | Mental wellness screening, stress quantification | High |
| 3 | Wearable continuous data (HR, HRV, sleep stages) | Daily readiness, recovery tracking, sleep quality | Moderate-High |
| 4 | App-logged training data (sets, reps, load) | Training volume, progression tracking | Moderate-High |
| 5 | Self-reported mood and energy (1-10 scales) | Subjective wellness, motivation trends | Moderate |
| 6 | Smart scale estimates (body fat %, lean mass) | Weight trends, rough body composition direction | Low-Moderate |
| 7 | Calorie tracking app estimates | Nutrition adherence direction | Low-Moderate |

## Readiness Score Construction

The daily readiness score synthesizes multiple data streams into a single 0-100 actionable number:

| Component | Weight | Primary Data Source | Fallback Source |
|-----------|--------|--------------------|-----------------|
| HRV vs personal baseline | 25% | Wearable morning reading | Skip if unavailable |
| Sleep quality composite | 25% | Wearable sleep stages + duration | Self-reported quality rating |
| Subjective energy and mood | 20% | Morning self-report (1-10) | No fallback, always collect |
| Soreness and recovery status | 15% | Self-reported soreness map | Days since last rest day |
| Stress and life load | 15% | Self-reported stress scale | Calendar density as proxy |

When a data source is unavailable, redistribute its weight proportionally across remaining components rather than leaving a gap.

## Data Quality Checks

Before using any data point in analysis or recommendations:

- Verify the reading falls within physiologically plausible ranges (e.g., resting HR 35-100 bpm, HRV 5-300 ms)
- Check for device sync gaps longer than 24 hours that could skew averages
- Flag sudden jumps that may indicate device change, firmware update, or wearing error
- Cross-reference wearable data against subjective reports when they diverge significantly
- Discard clearly erroneous readings (e.g., 200 bpm resting heart rate) rather than averaging them in

## Cross-Device Normalization

When a user switches wearable devices or uses multiple devices:

| Challenge | Solution |
|-----------|----------|
| Different HRV algorithms (RMSSD vs LnRMSSD) | Convert to common unit; track relative change to personal baseline, not absolute values |
| Different sleep stage classification | Use total sleep time and sleep efficiency as primary; treat stage breakdowns as approximate |
| Step count discrepancy between wrist and phone | Choose one primary device for step data; do not combine |
| Heart rate zone differences | Recalibrate zones based on field testing (not age-based formula) after any device change |
| Historical data after device switch | Mark the switch date; restart baseline calculations with a 14-day adaptation window |

## Common Pitfalls

### 1. Trusting Single-Day Readings

Wrong: See an HRV drop of 15ms on one morning and immediately reduce training.

Right: Compare against the 7-day rolling average and personal baseline. A single-day drop could be caused by alcohol, dehydration, poor device contact, or sleeping position.

### 2. Ignoring Subjective-Objective Conflicts

Wrong: Tell someone their readiness is 85 based on wearable data when they report feeling exhausted and unmotivated.

Right: When subjective and objective data conflict, err on the side of caution. Investigate the discrepancy rather than dismissing the human in favor of the device.

### 3. Treating Estimates as Measurements

Wrong: Adjust caloric intake based on a wearable's calorie burn estimate as if it were precise.

Right: Wearable calorie estimates can be off by 20-50%. Use them for relative comparison (more active vs. less active day) not absolute intake targets.

### 4. Data Without Action

Wrong: Collect 15 metrics daily and present a beautiful dashboard that leads to no plan changes.

Right: Every tracked metric should have a defined threshold that triggers a specific action. If no action depends on a metric, stop tracking it.

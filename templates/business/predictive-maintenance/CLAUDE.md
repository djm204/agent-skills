# Predictive Maintenance Scout Development Guide

Principal-level guidelines for monitoring industrial sensors, predicting equipment failures, optimizing maintenance schedules, and extending asset lifespans across planes, trains, factory floors, and critical infrastructure.

---

## Overview

This guide applies to:

- Sensor data ingestion and real-time processing pipelines
- Failure prediction models and anomaly detection
- Maintenance scheduling optimization (condition-based vs time-based)
- Asset lifecycle management and depreciation tracking
- Alert thresholds and severity classification
- Integration with CMMS/EAM systems
- Cost-benefit analysis of maintenance strategies
- KPIs for maintenance effectiveness

### Key Principles

1. **Predict, Don't React** - Every unplanned breakdown is a failure of the monitoring system
2. **Sensor Data Is Only as Good as Its Context** - Raw readings without asset history, operating conditions, and failure modes are meaningless
3. **False Alarms Kill Trust** - A model that cries wolf will be ignored when the turbine actually fails
4. **Maintenance Is an Economic Decision** - Every intervention has a cost; every deferral has a risk; optimize the tradeoff
5. **Degradation Is Gradual, Failure Is Sudden** - Detect the curve before it hits the cliff

### Core Frameworks

| Framework | Purpose |
|-----------|---------|
| P-F Curve | Map the interval between potential failure (P) and functional failure (F) |
| RCM (Reliability-Centered Maintenance) | Determine the right maintenance strategy per failure mode |
| FMEA (Failure Mode and Effects Analysis) | Systematically identify and prioritize failure modes |
| Weibull Analysis | Model time-to-failure distributions for component populations |
| Condition-Based Maintenance (CBM) | Trigger maintenance based on measured degradation, not schedules |
| Total Productive Maintenance (TPM) | Integrate maintenance into operations holistically |

---

## Sensor Data Ingestion

### Data Source Taxonomy

```text
Sensor Data Sources
├── Vibration Sensors
│   ├── Accelerometers (bearing wear, imbalance, misalignment)
│   ├── Velocity sensors (rotating machinery health)
│   └── Displacement probes (shaft position, runout)
├── Thermal Sensors
│   ├── Thermocouples (process temperatures)
│   ├── RTDs (precision temperature monitoring)
│   └── Infrared / thermal imaging (hotspot detection)
├── Pressure Sensors
│   ├── Static pressure (hydraulic systems, pipelines)
│   ├── Dynamic pressure (combustion, turbine performance)
│   └── Differential pressure (filter condition, flow restriction)
├── Electrical Sensors
│   ├── Current monitors (motor load, insulation degradation)
│   ├── Voltage sensors (power quality, transformer health)
│   └── Partial discharge detectors (insulation breakdown)
├── Flow and Level Sensors
│   ├── Flow meters (coolant, lubricant, process fluids)
│   ├── Level sensors (tank monitoring, leak detection)
│   └── Moisture sensors (oil contamination, ambient humidity)
└── Operational Data
    ├── SCADA/DCS systems (process control data)
    ├── PLC logs (cycle counts, operating modes)
    ├── Flight data recorders / black boxes
    └── GPS and usage telemetry
```

### Ingestion Pipeline Architecture

```text
Ingestion Pipeline
├── Edge Collection
│   ├── Sensor polling / streaming (MQTT, OPC-UA, Modbus)
│   ├── Edge preprocessing (filtering, downsampling, compression)
│   ├── Local buffering for intermittent connectivity
│   └── Timestamp synchronization across sensor networks
├── Transport Layer
│   ├── Message broker (Kafka, MQTT broker, AMQP)
│   ├── Protocol translation and normalization
│   ├── Encryption in transit (TLS 1.3)
│   └── Backpressure handling and dead-letter queues
├── Processing Layer
│   ├── Stream processing (real-time anomaly checks)
│   ├── Batch processing (model training, trend analysis)
│   ├── Data validation and quality scoring
│   └── Feature extraction and engineering
└── Storage Layer
    ├── Time-series database (sensor readings)
    ├── Asset registry (equipment metadata)
    ├── Event store (alerts, work orders, maintenance history)
    └── Model registry (trained models, version history)
```

### Data Quality Requirements

| Dimension | Standard | Validation Method |
|-----------|----------|-------------------|
| Completeness | < 2% missing readings per sensor per day | Gap detection on time-series |
| Timeliness | Edge-to-platform latency < 5 seconds | Timestamp comparison |
| Accuracy | Sensor drift < 1% of full scale per year | Calibration verification |
| Consistency | No contradictory readings across redundant sensors | Cross-sensor validation |
| Freshness | Stale data flagged if > 3x expected interval | Heartbeat monitoring |

---

## Failure Prediction Models

### Model Taxonomy

```text
Prediction Approaches
├── Physics-Based Models
│   ├── First-principles degradation models
│   ├── Fatigue and crack propagation models
│   ├── Thermal stress models
│   └── Wear rate calculations
├── Data-Driven Models
│   ├── Remaining Useful Life (RUL) estimation
│   ├── Anomaly detection (isolation forest, autoencoders)
│   ├── Classification (healthy vs degraded vs failing)
│   └── Survival analysis (time-to-event modeling)
├── Hybrid Models
│   ├── Physics-informed neural networks
│   ├── Digital twins with ML calibration
│   └── Transfer learning across similar assets
└── Ensemble Approaches
    ├── Multi-model voting for critical assets
    ├── Confidence-weighted predictions
    └── Model disagreement as uncertainty signal
```

### Anomaly Detection Framework

| Method | Best For | Limitations |
|--------|----------|-------------|
| Statistical thresholds | Simple, well-understood signals | Misses multivariate patterns |
| Isolation Forest | High-dimensional sensor data | Requires tuning contamination parameter |
| Autoencoders | Complex temporal patterns | Needs large training dataset of healthy operation |
| LSTM networks | Sequential degradation patterns | Computationally expensive, slow to retrain |
| Spectral analysis (FFT) | Vibration signature changes | Requires domain expertise to interpret |
| Mahalanobis distance | Multivariate drift detection | Assumes Gaussian distribution |

### P-F Curve Application

```text
Performance
│
│  ████████████████████████
│                          ██████  ← P (Potential Failure Detected)
│                                ████
│                                    ███
│                                       ██  ← Condition-based maintenance window
│                                         ██
│                                           █  ← F (Functional Failure)
│                                            █
└──────────────────────────────────────────────── Time

P-F Interval = Time between detectable degradation and actual failure
Goal: Detect at P, intervene well before F
```

### Model Performance Requirements

| Metric | Target | Rationale |
|--------|--------|-----------|
| Precision | > 85% | False alarms erode operator trust |
| Recall | > 90% | Missed failures have catastrophic cost |
| Lead time | > 2x repair cycle time | Enough time to plan and source parts |
| F1 score | > 0.87 | Balanced performance on imbalanced data |
| False positive rate | < 5% | Operators will ignore noisy models |

---

## Maintenance Scheduling

### Strategy Comparison

| Strategy | Trigger | Cost Profile | Risk Profile |
|----------|---------|-------------|--------------|
| Reactive (run-to-failure) | Equipment breaks | Low maintenance cost, high failure cost | Unplanned downtime, safety risk |
| Time-based preventive | Calendar or usage interval | Predictable cost, potential over-maintenance | May miss condition-driven failures |
| Condition-based (CBM) | Sensor threshold crossed | Optimized cost, maintenance only when needed | Requires reliable monitoring |
| Predictive (PdM) | Model forecasts failure window | Lowest total cost, planned interventions | Requires mature data and models |
| Prescriptive | Model recommends specific action | Targeted cost, minimal unnecessary work | Requires deep failure mode knowledge |

### Scheduling Optimization

```text
Scheduling Decision Tree
├── Is the asset critical (safety or production)?
│   ├── Yes → Predictive or condition-based monitoring required
│   │   ├── Is sensor coverage sufficient?
│   │   │   ├── Yes → Use PdM model output to schedule
│   │   │   └── No → Install sensors or use time-based as interim
│   │   └── Is a validated prediction model available?
│   │       ├── Yes → Schedule based on RUL estimate with safety margin
│   │       └── No → Use condition-based thresholds with conservative limits
│   └── No → Evaluate cost of failure vs cost of prevention
│       ├── Failure cost > 5x prevention cost → Time-based preventive
│       ├── Failure cost < prevention cost → Run to failure
│       └── Comparable costs → Condition monitoring if sensors exist
```

### Work Order Prioritization

| Priority | Criteria | Response Window |
|----------|----------|----------------|
| P1 - Emergency | Imminent safety hazard or production stop | Immediate (< 2 hours) |
| P2 - Urgent | Predicted failure within 1 week, critical asset | Within 24 hours |
| P3 - Planned | Predicted failure within 1 month, degraded performance | Within 1 week |
| P4 - Deferred | Non-critical, slow degradation trend | Next planned outage |
| P5 - Opportunistic | No urgency, bundle with nearby scheduled work | When convenient |

### Maintenance Window Optimization

- **Cluster nearby work orders** to minimize equipment downtime events
- **Align with production schedules** to avoid peak demand periods
- **Pre-stage parts and materials** based on predicted failure modes
- **Account for technician availability** and skill requirements
- **Buffer for discovery work** during inspections (typically add 20-30% time)

---

## Asset Lifecycle Management

### Lifecycle Stages

```text
Asset Lifecycle
├── Commissioning
│   ├── Installation verification and baseline readings
│   ├── Sensor calibration and threshold configuration
│   ├── Burn-in period monitoring (infant mortality detection)
│   └── Initial P-F interval establishment
├── Early Life
│   ├── Frequent monitoring, model training data collection
│   ├── Warranty tracking and vendor performance monitoring
│   └── Operating envelope validation
├── Mature Operation
│   ├── Steady-state predictive maintenance
│   ├── Periodic model recalibration
│   ├── Component replacement tracking
│   └── Performance trend analysis
├── Aging / Wear-Out
│   ├── Increased monitoring frequency
│   ├── Remaining useful life reassessment
│   ├── Refurbishment vs replacement analysis
│   └── Obsolescence risk management
└── Decommissioning
    ├── Failure history archival for fleet learning
    ├── Sensor and component salvage
    └── Environmental and compliance closeout
```

### Asset Criticality Matrix

| Criticality | Safety Impact | Production Impact | Redundancy | Maintenance Strategy |
|-------------|--------------|-------------------|------------|---------------------|
| A - Critical | High | Production stops | None | Full PdM, continuous monitoring |
| B - Important | Medium | Reduced capacity | Partial | CBM with periodic PdM |
| C - Standard | Low | Minor inconvenience | Full | Time-based preventive |
| D - Non-critical | None | No impact | N/A | Run to failure |

### Fleet-Level Learning

- **Cross-asset pattern matching**: When one turbine fails, check its siblings for the same signature
- **Failure mode libraries**: Maintain catalog of known degradation patterns per asset class
- **Operating context normalization**: Compare assets under similar load, environment, and duty cycle
- **Survival curves by population**: Track fleet-wide Weibull distributions per component type
- **Transfer learning**: Adapt models trained on one asset class to similar but different equipment

---

## Alerting and Severity Classification

### Alert Hierarchy

```text
Alert Levels
├── Level 0 - Informational
│   └── Normal degradation tracking, model updates, scheduled reminders
├── Level 1 - Advisory
│   └── Early trend detected, no immediate action, continue monitoring
├── Level 2 - Caution
│   └── Degradation accelerating, plan maintenance within next outage window
├── Level 3 - Warning
│   └── Failure predicted within P-F interval, schedule intervention now
├── Level 4 - Critical
│   └── Failure imminent or safety limit approached, immediate action required
└── Level 5 - Emergency
    └── Active failure in progress, initiate emergency shutdown/response
```

### Threshold Configuration

| Parameter | Advisory | Caution | Warning | Critical |
|-----------|----------|---------|---------|----------|
| Vibration (mm/s RMS) | > 4.5 | > 7.1 | > 11.2 | > 18.0 |
| Bearing temperature (delta above baseline) | > 10C | > 20C | > 30C | > 40C |
| Oil particulate count (per mL) | > 50 | > 100 | > 200 | > 500 |
| Motor current imbalance (%) | > 5% | > 10% | > 15% | > 25% |
| Remaining useful life estimate | < 90 days | < 30 days | < 14 days | < 3 days |

### Alert Routing

| Alert Level | Notification Channel | Recipient | Response SLA |
|-------------|---------------------|-----------|-------------|
| Informational | Dashboard only | Maintenance planner | Next review cycle |
| Advisory | Email digest | Reliability engineer | 48 hours |
| Caution | Email + dashboard flag | Maintenance supervisor | 24 hours |
| Warning | SMS + email + CMMS work order | Maintenance manager | 4 hours |
| Critical | Phone call + SMS + CMMS emergency WO | Plant manager + on-call tech | 30 minutes |
| Emergency | All channels + automated safety interlock | Emergency response team | Immediate |

### Alert Fatigue Prevention

- **Consolidate related alerts**: Group alerts from the same asset or failure mode into a single notification
- **Suppress known conditions**: If an alert is acknowledged and a work order exists, suppress repeats
- **Escalate only on change**: Re-alert only when severity increases, not on every poll cycle
- **Daily digest for low-severity**: Batch informational and advisory alerts into a daily summary
- **Track alert-to-action ratio**: If fewer than 30% of alerts lead to action, thresholds are too sensitive

---

## CMMS/EAM Integration

### Integration Architecture

```text
Integration Points
├── Inbound to Maintenance Platform
│   ├── Sensor data feeds (real-time and batch)
│   ├── Model predictions and RUL estimates
│   ├── Alert triggers and severity classifications
│   └── Asset registry synchronization
├── Outbound from CMMS/EAM
│   ├── Work order status updates (opened, in progress, closed)
│   ├── Maintenance history and repair records
│   ├── Parts usage and inventory levels
│   ├── Technician notes and inspection findings
│   └── Actual vs predicted failure mode validation
└── Bidirectional
    ├── Asset hierarchy and location data
    ├── Failure code taxonomy
    ├── Spare parts catalog and lead times
    └── Maintenance procedure library
```

### Data Exchange Standards

| Standard | Use Case | Notes |
|----------|----------|-------|
| MIMOSA OSA-EAI | Asset data exchange | Industry standard for equipment data |
| ISO 14224 | Failure and maintenance data | Petroleum/process industry standard |
| OPC-UA | Sensor data transport | Machine-to-machine communication |
| MQTT | Lightweight IoT messaging | Edge device communication |
| REST/GraphQL APIs | CMMS integration | Custom integrations with SAP PM, Maximo, etc. |

### Feedback Loop

```text
Prediction-Action-Outcome Loop
├── Predict: Model forecasts failure mode and timeline
├── Plan: Work order created with predicted failure mode
├── Execute: Technician performs maintenance
├── Record: Actual finding documented (confirmed, false alarm, different failure)
├── Validate: Compare prediction to actual outcome
├── Learn: Feed outcome back to model training pipeline
└── Improve: Retrain model with corrected labels
```

This loop is the single most important process in the system. Without it, models degrade over time and predictions become unreliable.

---

## Cost-Benefit Analysis

### Maintenance Cost Components

| Cost Category | Reactive | Preventive | Predictive |
|--------------|----------|-----------|-----------|
| Direct repair cost | High (emergency labor, expedited parts) | Medium (planned labor, stocked parts) | Low-Medium (targeted replacement) |
| Downtime cost | Very High (unplanned, cascading) | Medium (scheduled, but may be unnecessary) | Low (planned, minimal duration) |
| Secondary damage | High (collateral damage to adjacent systems) | Low (caught before cascade) | Very Low (caught earliest) |
| Inventory cost | High (must stock everything) | Medium (stock by schedule) | Low (stock by prediction) |
| Monitoring cost | None | Low (inspections) | Medium (sensors, platform, models) |
| Safety cost | Potentially catastrophic | Low | Very Low |

### ROI Calculation Template

```markdown
## PdM Business Case: [Asset Class]

### Current State (Reactive/Preventive)
- Annual unplanned downtime events: [N]
- Average downtime per event: [hours]
- Cost per hour of downtime: [$]
- Annual maintenance spend: [$]
- Annual secondary damage cost: [$]
- Safety incidents related to equipment failure: [N]

### Projected State (Predictive)
- Expected unplanned downtime reduction: [%]
- Expected maintenance cost reduction: [%]
- Expected parts inventory reduction: [%]
- Expected asset life extension: [%]

### Investment Required
- Sensor installation: [$]
- Platform and software: [$]
- Model development: [$]
- Training and change management: [$]
- Ongoing operation: [$/year]

### Net Benefit
- Year 1 ROI: [%]
- Payback period: [months]
- 5-year NPV: [$]
```

### Decision Thresholds

| Scenario | Recommended Strategy |
|----------|---------------------|
| Failure cost > 10x monitoring cost | Implement full PdM |
| Failure cost > 3x monitoring cost | Implement CBM at minimum |
| P-F interval < repair lead time | Increase monitoring frequency or stock spares |
| Asset has < 2 years remaining life | Time-based only, do not invest in PdM |
| Failure is safety-critical regardless of cost | Full PdM, no exceptions |

---

## KPIs for Maintenance Effectiveness

### Leading Indicators (Predictive)

| KPI | Target | Measurement |
|-----|--------|-------------|
| Planned maintenance percentage | > 85% | Planned work orders / total work orders |
| PdM alert lead time | > 2x repair cycle | Average time between alert and failure |
| Model precision | > 85% | True positives / (true positives + false positives) |
| Model recall | > 90% | True positives / (true positives + false negatives) |
| Sensor availability | > 98% | Uptime of monitoring sensors |
| Prediction-to-action conversion | > 70% | Alerts that result in a work order |

### Lagging Indicators (Outcome)

| KPI | Target | Measurement |
|-----|--------|-------------|
| MTBF (Mean Time Between Failures) | Increasing trend | Total operating time / number of failures |
| MTTR (Mean Time To Repair) | Decreasing trend | Total repair time / number of repairs |
| Overall Equipment Effectiveness (OEE) | > 85% | Availability x Performance x Quality |
| Unplanned downtime | < 5% of operating hours | Unplanned downtime / total scheduled time |
| Maintenance cost per unit produced | Decreasing trend | Total maintenance cost / production output |
| Safety incidents from equipment failure | Zero | Count of safety events |

### Reporting Cadence

| Report | Frequency | Audience | Content |
|--------|-----------|----------|---------|
| Real-time dashboard | Continuous | Operators, maintenance techs | Active alerts, asset health scores |
| Daily maintenance brief | Daily | Maintenance supervisor | Upcoming work, open alerts, parts status |
| Weekly reliability report | Weekly | Reliability engineers, planners | Trend analysis, model performance, backlog |
| Monthly effectiveness review | Monthly | Plant management | KPI trends, cost analysis, improvement actions |
| Quarterly strategy review | Quarterly | Executive leadership | ROI, program maturity, investment decisions |

---

## Common Pitfalls

### 1. Deploying Models Without Feedback Loops

Wrong: Train a model, deploy it, and never check whether predictions were correct.

Right: Every prediction must be validated against the actual outcome. Close the loop or the model will silently degrade.

### 2. Over-Alerting

Wrong: Set thresholds so tight that operators receive dozens of alerts per shift.

Right: Tune thresholds to the P-F curve. Alert when action is needed, not when a reading twitches.

### 3. Ignoring Operating Context

Wrong: Apply the same failure thresholds to an asset running at 20% load and one running at 95% load.

Right: Normalize sensor readings against operating conditions. A hot bearing at full load is different from a hot bearing at idle.

### 4. Skipping the P-F Interval Analysis

Wrong: Monitor everything at the same frequency regardless of how fast failure develops.

Right: Map the P-F interval for each failure mode. Monitor at intervals shorter than half the P-F interval.

### 5. Treating All Assets Equally

Wrong: Apply the same maintenance strategy to every piece of equipment.

Right: Use asset criticality to allocate monitoring and modeling resources. Critical assets get PdM; non-critical assets may run to failure.

### 6. Neglecting Data Quality

Wrong: Assume sensor data is always accurate and complete.

Right: Continuously validate sensor health. A drifting sensor is worse than no sensor because it produces confident wrong predictions.

### 7. Building Models Before Understanding Failure Modes

Wrong: Feed raw sensor data into a neural network and hope it finds patterns.

Right: Start with FMEA. Understand what can fail, how it manifests in sensor data, and then build models informed by domain knowledge.

---

## Resources

- [ISO 55000 - Asset Management Standard](https://www.iso.org/standard/55088.html)
- [ISO 13381 - Condition Monitoring and Diagnostics](https://www.iso.org/standard/37611.html)
- [NASA Prognostics Center of Excellence](https://www.nasa.gov/intelligent-systems-division/)
- [Reliability-Centered Maintenance (Moubray)](https://www.goodreads.com/book/show/628734.Reliability_Centered_Maintenance)
- [Weibull Analysis (Abernethy)](https://www.goodreads.com/book/show/1475498.The_New_Weibull_Handbook)
- [MIMOSA Open Standards](https://www.mimosa.org/)
- [OPC Foundation - OPC-UA Standard](https://opcfoundation.org/)

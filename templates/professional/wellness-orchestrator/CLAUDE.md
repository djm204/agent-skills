# Wellness Orchestrator Development Guide

Principal-level guidelines for coordinating health goals across fitness, nutrition, sleep, and mental wellness -- synthesizing inputs from wearables, habits, and self-reported mood into a unified, adaptive wellness plan.

---

## Overview

This guide applies to:

- Wearable device data aggregation and normalization across platforms
- Fitness programming with periodization, recovery, and injury prevention
- Nutrition planning across macronutrient, micronutrient, and meal timing frameworks
- Sleep architecture optimization and circadian rhythm management
- Mental wellness monitoring including stress, mood, and mindfulness protocols
- Cross-domain adaptive planning that balances competing health goals
- Habit formation systems with accountability and progress tracking
- Health data privacy and informed consent management

### Key Principles

1. **Whole-Person Integration** - Never optimize one wellness domain at the expense of another; fitness gains that destroy sleep quality are not gains
2. **Data-Informed, Not Data-Obsessed** - Wearable metrics guide decisions but do not replace subjective well-being and clinical judgment
3. **Progressive Overload Everywhere** - Gradual, sustainable increases in challenge apply to exercise, meditation minutes, sleep consistency, and dietary changes alike
4. **Recovery Is Training** - Rest, deload weeks, diet breaks, and mental health days are productive components of a wellness plan, not failures
5. **Individual Variance First** - Population averages are starting points; every recommendation must adapt to the individual's response data
6. **Do No Harm** - Flag contraindications, defer to licensed professionals for medical decisions, and never prescribe beyond scope

### Core Frameworks

| Framework | Purpose |
|-----------|---------|
| Biopsychosocial Model | Integrate biological, psychological, and social factors in wellness assessment |
| FITT-VP Principle | Structure exercise prescription: Frequency, Intensity, Time, Type, Volume, Progression |
| Circadian Health Model | Align activity, nutrition, and rest with the body's internal clock |
| Readiness Score Composite | Synthesize HRV, sleep, soreness, mood, and stress into daily training readiness |
| Habit Loop Architecture | Design cue-routine-reward systems for sustainable behavior change |
| Allostatic Load Framework | Monitor cumulative stress burden across physical, emotional, and environmental domains |
| Periodization Macro Cycle | Plan training, nutrition, and recovery across multi-week and multi-month phases |
| Wellness Dashboard Protocol | Aggregate cross-domain metrics into a unified progress view |

---

## Health Data Integration

### Wearable and Self-Report Data Taxonomy

```text
Wellness Data Sources
├── Wearable Devices
│   ├── Heart Rate (resting, active, recovery)
│   ├── Heart Rate Variability (HRV)
│   ├── Step Count and Activity Minutes
│   ├── Sleep Stages (deep, light, REM, awake)
│   ├── Blood Oxygen Saturation (SpO2)
│   ├── Skin Temperature Delta
│   ├── Respiratory Rate
│   └── GPS and Elevation (outdoor activities)
├── Smart Scales and Body Composition
│   ├── Weight trend (7-day rolling average)
│   ├── Body fat percentage estimate
│   ├── Lean mass estimate
│   └── Hydration indicators
├── Fitness Apps and Equipment
│   ├── Workout logs (sets, reps, weight, RPE)
│   ├── Cardio sessions (distance, pace, heart rate zones)
│   ├── Flexibility and mobility assessments
│   └── Sport-specific metrics (power, cadence, stroke rate)
├── Nutrition Tracking
│   ├── Calorie intake and macronutrient split
│   ├── Meal timing and frequency
│   ├── Hydration volume
│   ├── Micronutrient and supplement logs
│   └── Food quality and diversity scores
├── Self-Reported Subjective Data
│   ├── Mood rating (1-10 scale, morning and evening)
│   ├── Energy level (1-10 scale)
│   ├── Perceived stress (PSS-4 or simple scale)
│   ├── Soreness and pain locations
│   ├── Motivation and adherence notes
│   └── Journal entries and gratitude logs
└── Clinical and Lab Data
    ├── Blood panels (lipids, glucose, thyroid, hormones)
    ├── Blood pressure readings
    ├── Body measurements (waist, hip, limb circumferences)
    └── Physician and specialist notes
```

### Data Normalization Standards

| Metric | Unit | Sampling Frequency | Smoothing Method |
|--------|------|-------------------|------------------|
| Resting Heart Rate | bpm | Daily (morning) | 7-day rolling average |
| HRV (RMSSD) | ms | Daily (morning) | 7-day rolling average |
| Sleep Duration | hours:minutes | Nightly | 7-day rolling average |
| Step Count | steps | Daily | 7-day rolling average |
| Body Weight | kg or lbs | Daily (morning, fasted) | 7-day rolling average |
| Calorie Intake | kcal | Daily | 7-day rolling average |
| Mood Score | 1-10 | 2x daily (AM/PM) | 7-day rolling average |
| Stress Score | 1-10 | Daily | 7-day rolling average |
| Training Volume | sets x reps x load | Per session | Weekly total |
| Sleep Efficiency | percentage | Nightly | 7-day rolling average |

### Readiness Score Composite

```text
Daily Readiness Score (0-100)
├── HRV vs Personal Baseline (25%)
│   ├── Above baseline (+2 to +5 points per std dev)
│   ├── At baseline (0)
│   └── Below baseline (-3 to -8 points per std dev)
├── Sleep Quality (25%)
│   ├── Duration vs target
│   ├── Sleep efficiency > 85%
│   ├── Deep sleep percentage
│   └── Wake episodes count
├── Subjective Energy and Mood (20%)
│   ├── Morning energy rating
│   ├── Mood score
│   └── Motivation self-assessment
├── Soreness and Recovery (15%)
│   ├── Muscle soreness rating
│   ├── Joint pain flags
│   └── Days since last rest day
└── Stress and Life Load (15%)
    ├── Perceived stress score
    ├── Work/life event flags
    └── Travel or schedule disruption
```

### Readiness Score Interpretation

| Score Range | Readiness Level | Training Recommendation |
|-------------|----------------|------------------------|
| 85-100 | Peak | High intensity, heavy loads, skill work, competition |
| 70-84 | Good | Normal training, moderate-to-high intensity |
| 55-69 | Moderate | Reduce volume or intensity by 20-30%, prioritize technique |
| 40-54 | Low | Active recovery, mobility work, light cardio only |
| Below 40 | Rest | Full rest day, prioritize sleep, nutrition, stress management |

---

## Fitness Programming

### Exercise Prescription Framework (FITT-VP)

| Parameter | Definition | Beginner Range | Intermediate Range | Advanced Range |
|-----------|-----------|---------------|-------------------|----------------|
| Frequency | Sessions per week | 2-3 | 3-5 | 4-6 |
| Intensity | Effort level (RPE, %1RM, HR zone) | RPE 5-6, 50-65% 1RM | RPE 6-8, 65-80% 1RM | RPE 7-10, 75-95% 1RM |
| Time | Session duration | 30-45 min | 45-75 min | 60-90 min |
| Type | Modality | Full body, machines, bodyweight | Upper/lower split, free weights | Push/pull/legs, sport-specific |
| Volume | Weekly sets per muscle group | 6-10 | 10-16 | 14-22 |
| Progression | Rate of increase | 2-5% load per week | 1-3% load per week | Periodized, wave loading |

### Periodization Macro Cycle

```text
Annual Periodization Plan
├── Macrocycle (12 months)
│   ├── Mesocycle 1: Anatomical Adaptation (4 weeks)
│   │   ├── Focus: Movement quality, connective tissue prep
│   │   ├── Intensity: Low to moderate (RPE 5-6)
│   │   └── Volume: Moderate, full body 3x/week
│   ├── Mesocycle 2: Hypertrophy Phase (8 weeks)
│   │   ├── Focus: Muscle growth, work capacity
│   │   ├── Intensity: Moderate (RPE 6-8, 65-75% 1RM)
│   │   └── Volume: High, 4x/week split
│   ├── Mesocycle 3: Strength Phase (6 weeks)
│   │   ├── Focus: Maximal strength, neural adaptation
│   │   ├── Intensity: High (RPE 8-9, 80-90% 1RM)
│   │   └── Volume: Moderate, compound lifts priority
│   ├── Mesocycle 4: Power/Performance Phase (4 weeks)
│   │   ├── Focus: Speed, explosiveness, sport transfer
│   │   ├── Intensity: High with velocity emphasis
│   │   └── Volume: Low-moderate, quality over quantity
│   ├── Deload Week (1 week between each mesocycle)
│   │   ├── Volume reduced 40-60%
│   │   ├── Intensity reduced 20-30%
│   │   └── Focus: Recovery, mobility, technique refinement
│   └── Active Recovery Block (2-4 weeks annually)
│       ├── Non-structured physical activity
│       ├── Cross-training, recreation, play
│       └── Address nagging injuries or imbalances
```

### Recovery Protocol Matrix

| Recovery Method | When to Use | Duration | Evidence Level |
|----------------|------------|----------|----------------|
| Sleep extension | After high-volume blocks | +30-60 min for 1-2 weeks | Strong |
| Active recovery (walk, swim, yoga) | Between hard sessions | 20-40 min | Strong |
| Foam rolling / self-myofascial release | Post-workout or morning | 10-15 min | Moderate |
| Cold water immersion | After intense competition or testing | 10-15 min at 10-15C | Moderate |
| Contrast therapy (hot/cold) | During deload weeks | 3 cycles of 3-min hot / 1-min cold | Moderate |
| Massage or manual therapy | Biweekly during high-volume phases | 30-60 min | Moderate |
| Compression garments | Post-workout recovery | 1-3 hours post-exercise | Low-Moderate |
| Meditation / breathwork | Daily, especially high-stress periods | 10-20 min | Strong |

---

## Nutrition Planning

### Caloric Target Framework

```text
Nutrition Target Calculation
├── Basal Metabolic Rate (BMR)
│   ├── Mifflin-St Jeor equation (preferred)
│   │   ├── Males: 10 x weight(kg) + 6.25 x height(cm) - 5 x age - 5
│   │   └── Females: 10 x weight(kg) + 6.25 x height(cm) - 5 x age - 161
│   └── Validated against indirect calorimetry when available
├── Activity Multiplier (TDEE)
│   ├── Sedentary (desk job, no exercise): BMR x 1.2
│   ├── Lightly active (1-3 sessions/week): BMR x 1.375
│   ├── Moderately active (3-5 sessions/week): BMR x 1.55
│   ├── Very active (6-7 sessions/week): BMR x 1.725
│   └── Extremely active (2x/day or physical labor): BMR x 1.9
├── Goal Adjustment
│   ├── Fat loss: TDEE - 300 to 500 kcal (moderate deficit)
│   ├── Maintenance: TDEE +/- 100 kcal
│   ├── Muscle gain: TDEE + 200 to 400 kcal (lean bulk)
│   └── Performance: TDEE + fuel for training demands
└── Adaptive Adjustment
    ├── Reassess every 2-4 weeks based on weight trend
    ├── Adjust by 100-200 kcal increments only
    └── Monitor energy, mood, and performance alongside scale weight
```

### Macronutrient Distribution

| Goal | Protein (g/kg bodyweight) | Carbohydrate | Fat | Notes |
|------|--------------------------|-------------|-----|-------|
| Fat Loss | 1.8-2.4 | 30-40% remaining kcal | 25-35% remaining kcal | High protein preserves lean mass |
| Maintenance | 1.4-2.0 | 40-55% remaining kcal | 25-35% remaining kcal | Balanced for sustainability |
| Muscle Gain | 1.6-2.2 | 45-60% remaining kcal | 20-30% remaining kcal | Carbs fuel training and recovery |
| Endurance Performance | 1.4-1.8 | 50-65% remaining kcal | 20-30% remaining kcal | High carb supports glycogen |
| General Health | 1.2-1.6 | 40-55% remaining kcal | 25-35% remaining kcal | Focus on food quality over ratios |

### Micronutrient Priority Checklist

| Nutrient | Daily Target | Common Sources | Deficiency Risk Factors |
|----------|-------------|----------------|------------------------|
| Vitamin D | 1000-4000 IU | Sunlight, fatty fish, fortified foods | Indoor lifestyle, dark skin, northern latitude |
| Omega-3 (EPA+DHA) | 1-3g combined | Fatty fish, fish oil, algae oil | Low fish intake, plant-based diets |
| Magnesium | 300-400mg | Dark greens, nuts, seeds, whole grains | High stress, heavy sweating, poor soil |
| Iron | 8-18mg (varies) | Red meat, lentils, spinach, fortified cereal | Menstruation, plant-based diets, endurance athletes |
| Zinc | 8-11mg | Meat, shellfish, legumes, pumpkin seeds | Plant-based diets, high phytate intake |
| Calcium | 1000-1200mg | Dairy, fortified alternatives, greens | Dairy-free diets, low calorie intake |
| B12 | 2.4mcg | Animal products, fortified foods, supplements | Vegan diets, age-related absorption decline |
| Fiber | 25-35g | Vegetables, fruits, whole grains, legumes | Processed food diets, low vegetable intake |

### Meal Timing and Nutrient Partitioning

```text
Nutrient Timing Framework
├── Pre-Workout (1-3 hours before)
│   ├── Moderate carbohydrate (0.5-1g/kg)
│   ├── Moderate protein (20-30g)
│   ├── Low fat (slows digestion)
│   └── Low fiber (reduce GI distress)
├── Intra-Workout (sessions > 90 min)
│   ├── Fast-acting carbohydrate (30-60g/hour)
│   ├── Electrolytes (sodium, potassium)
│   └── Fluid (500-1000ml/hour based on sweat rate)
├── Post-Workout (within 2 hours)
│   ├── Protein (20-40g for muscle protein synthesis)
│   ├── Carbohydrate (0.5-1.5g/kg for glycogen replenishment)
│   └── Hydration (1.5x fluid lost via sweat)
├── Evening / Pre-Sleep
│   ├── Casein protein or cottage cheese (slow-release amino acids)
│   ├── Avoid large meals within 2 hours of bedtime
│   └── Limit caffeine after 2:00 PM (or 8+ hours before bed)
└── General Daily Pattern
    ├── Distribute protein across 3-5 meals (20-40g per meal)
    ├── Prioritize whole foods over supplements
    ├── Eat slowly and mindfully (satiety signaling takes 15-20 min)
    └── Hydrate consistently (minimum 30ml/kg bodyweight daily)
```

---

## Sleep Optimization

### Sleep Architecture Targets

| Sleep Stage | Target Percentage | Function | Optimization Lever |
|-------------|------------------|----------|-------------------|
| Deep Sleep (N3) | 15-25% of total | Physical recovery, growth hormone, immune function | Consistent schedule, cool room, exercise timing |
| REM Sleep | 20-25% of total | Memory consolidation, emotional processing, learning | Avoid alcohol, reduce late-night screens, manage stress |
| Light Sleep (N1+N2) | 50-60% of total | Transition stages, memory processing | Natural proportion when deep and REM are optimized |
| Awake Time | Less than 5% | Normal micro-arousals | Address noise, temperature, pain, anxiety triggers |

### Sleep Hygiene Protocol

```text
Sleep Optimization Hierarchy
├── Non-Negotiable Foundations
│   ├── Consistent wake time (same time every day, +/- 30 min)
│   ├── Consistent bedtime (within 30-min window)
│   ├── Dark room (blackout curtains or sleep mask)
│   ├── Cool temperature (65-68F / 18-20C)
│   ├── Quiet environment (earplugs or white noise)
│   └── Comfortable mattress and pillow (replace per manufacturer timeline)
├── Evening Wind-Down (60-90 min before bed)
│   ├── Dim lights or use warm-spectrum bulbs
│   ├── Reduce screen exposure (or use blue-light filter)
│   ├── Avoid stimulating content (news, arguments, intense games)
│   ├── Relaxation routine (reading, stretching, journaling, breathwork)
│   └── Limit fluids to reduce nighttime awakenings
├── Daytime Habits That Affect Sleep
│   ├── Morning sunlight exposure within 30 min of waking (10-20 min)
│   ├── Caffeine cutoff 8-10 hours before bedtime
│   ├── Exercise completed at least 3-4 hours before bed (vigorous)
│   ├── Alcohol avoided or limited (disrupts REM and deep sleep)
│   └── Naps limited to 20-30 min before 2:00 PM
└── Troubleshooting
    ├── If unable to fall asleep within 20 min, leave bed and do calm activity
    ├── If waking consistently at same time, evaluate stress or environmental cause
    ├── If daytime sleepiness persists despite adequate duration, evaluate sleep quality
    └── If snoring, gasping, or excessive fatigue, recommend sleep study evaluation
```

### Circadian Rhythm Management

| Time Window | Circadian Action | Rationale |
|-------------|-----------------|-----------|
| Within 30 min of waking | Bright light exposure (sunlight preferred) | Anchors circadian clock, suppresses melatonin |
| Morning | Highest-intensity exercise (if schedule allows) | Core body temperature rising supports performance |
| Early afternoon | Brief nap if needed (20-30 min max) | Aligns with natural post-lunch dip |
| Late afternoon | Moderate exercise acceptable | Core temperature peak supports strength |
| 2-3 hours before bed | Dim lights, warm-spectrum only | Signals melatonin production onset |
| 1 hour before bed | No screens or blue-light filtered | Prevents melatonin suppression |
| Bedtime | Cool, dark, quiet environment | Supports core temperature drop for sleep onset |

---

## Mental Wellness

### Stress and Mood Monitoring

```text
Mental Wellness Assessment Framework
├── Daily Check-In Dimensions
│   ├── Mood (1-10, with emotional label: calm, anxious, irritable, content)
│   ├── Energy (1-10, physical and mental)
│   ├── Stress (1-10, with primary stressor identified)
│   ├── Motivation (1-10, toward wellness goals specifically)
│   └── Social connection (quality of interactions today)
├── Weekly Pattern Analysis
│   ├── Mood trend (improving, stable, declining)
│   ├── Stress pattern (work days vs. rest days)
│   ├── Energy correlation with sleep and training
│   ├── Motivation correlation with progress and variety
│   └── Social isolation flags (3+ days without meaningful interaction)
├── Red Flag Detection
│   ├── Mood below 4 for 3+ consecutive days
│   ├── Persistent sleep disruption not explained by environment
│   ├── Loss of interest in previously enjoyed activities
│   ├── Significant appetite change (increase or decrease)
│   ├── Withdrawal from social contact
│   └── Self-harm ideation (immediate professional referral)
└── Escalation Protocol
    ├── Mild concern: Adjust wellness plan, increase recovery
    ├── Moderate concern: Recommend professional check-in
    └── Severe concern: Immediate referral to mental health professional
```

### Mindfulness and Breathwork Protocols

| Protocol | Duration | When to Use | Technique |
|----------|----------|------------|-----------|
| Box Breathing | 4-8 min | Pre-workout, acute stress | Inhale 4s, hold 4s, exhale 4s, hold 4s |
| 4-7-8 Breathing | 3-5 min | Pre-sleep relaxation | Inhale 4s, hold 7s, exhale 8s |
| Body Scan Meditation | 10-20 min | Evening wind-down, rest days | Progressive attention from toes to head |
| Guided Visualization | 10-15 min | Pre-competition, goal setting | Visualize successful performance or calm scene |
| Gratitude Journaling | 5-10 min | Morning or evening routine | Write 3 specific things, explain why each matters |
| Walking Meditation | 15-30 min | Active recovery days | Slow walk with attention to sensation and environment |
| Progressive Muscle Relaxation | 10-15 min | High-stress days, pre-sleep | Tense and release muscle groups systematically |

### Habit Formation Architecture

```text
Habit Loop Design
├── Cue (Trigger)
│   ├── Time-based: "After I wake up" or "At 7:00 PM"
│   ├── Action-based: "After I pour my coffee" or "After I park my car"
│   ├── Location-based: "When I enter the gym" or "When I sit at my desk"
│   └── Emotional: "When I feel anxious" (redirect to healthy behavior)
├── Routine (Behavior)
│   ├── Start absurdly small (2 min meditation, 1 pushup, 1 glass of water)
│   ├── Reduce friction (lay out clothes, prep meals, set reminders)
│   ├── Stack on existing habits for natural flow
│   └── Make the default option the healthy option
├── Reward (Reinforcement)
│   ├── Intrinsic: Track streak, note how you feel after
│   ├── Extrinsic: Small reward after milestone (not food-based)
│   ├── Social: Share progress with accountability partner
│   └── Visual: Mark calendar, update progress chart
└── Progression
    ├── Week 1-2: Establish consistency (same cue, same time, minimal effort)
    ├── Week 3-4: Increase duration or intensity by 10-20%
    ├── Month 2: Add complexity or variety
    ├── Month 3+: Integrate into identity ("I am someone who meditates")
    └── Ongoing: Review and adjust quarterly
```

---

## Adaptive Planning

### Cross-Domain Optimization Matrix

```text
Cross-Domain Interaction Map
├── Fitness <-> Nutrition
│   ├── Training volume drives caloric need
│   ├── Protein timing affects recovery quality
│   ├── Carb availability affects training performance
│   └── Deficit too aggressive = performance and recovery decline
├── Fitness <-> Sleep
│   ├── Late-evening intense exercise disrupts sleep onset
│   ├── Poor sleep reduces training readiness and performance
│   ├── Overtraining causes sleep fragmentation
│   └── Sleep extension improves strength and reaction time
├── Fitness <-> Mental Wellness
│   ├── Exercise is a potent antidepressant and anxiolytic
│   ├── Overtraining causes mood disturbance and irritability
│   ├── Motivation loss signals need for plan variety or deload
│   └── Social exercise (group classes, training partners) boosts adherence
├── Nutrition <-> Sleep
│   ├── Large meals before bed disrupt sleep quality
│   ├── Caffeine timing directly affects sleep latency
│   ├── Alcohol suppresses REM and deep sleep
│   └── Tart cherry, kiwi, and magnesium may support sleep quality
├── Nutrition <-> Mental Wellness
│   ├── Severe caloric restriction increases irritability and anxiety
│   ├── Gut microbiome diversity affects mood (gut-brain axis)
│   ├── Omega-3 intake associated with lower depression risk
│   └── Restrictive dieting can trigger disordered eating patterns
└── Sleep <-> Mental Wellness
    ├── Sleep deprivation amplifies emotional reactivity
    ├── Anxiety and rumination are primary insomnia drivers
    ├── Consistent sleep schedule stabilizes mood
    └── Dream-rich REM sleep processes emotional experiences
```

### Goal Balancing Protocol

| Scenario | Primary Goal | Secondary Adjustments | Key Trade-Off |
|----------|-------------|----------------------|---------------|
| Fat loss + muscle retention | Caloric deficit | Maintain training intensity, increase protein, prioritize sleep | Accept slower strength progress |
| Muscle gain + cardiovascular health | Caloric surplus | Include 2-3 cardio sessions, monitor blood pressure | Accept slower muscle gain rate |
| Performance peak (event prep) | Sport-specific training | Increase calories, maximize sleep, reduce life stress | Temporarily accept body composition drift |
| Stress recovery period | Mental wellness | Reduce training volume 40-60%, intuitive eating, extra sleep | Accept temporary fitness detraining |
| Injury rehabilitation | Movement restoration | Adjust nutrition to maintenance, focus on uninjured areas | Accept temporary muscle loss in affected area |
| General wellness (no specific event) | Balanced improvement | Moderate training, balanced nutrition, sleep consistency | Progress is slower but sustainable across all domains |

### Plan Adjustment Triggers

| Trigger | Signal | Response |
|---------|--------|----------|
| Weight plateau > 3 weeks | 7-day average weight unchanged | Reassess calories, check adherence, consider diet break |
| Readiness score < 50 for 3+ days | Composite readiness declining | Reduce training volume, extend sleep, assess stressors |
| Mood score < 4 for 3+ days | Self-reported mood declining | Prioritize mental wellness protocols, reduce training demands |
| Sleep efficiency < 80% for 1 week | Wearable or self-report data | Review sleep hygiene, check caffeine and alcohol, assess anxiety |
| Persistent soreness > 72 hours | Self-reported pain or DOMS | Deload, add recovery modalities, rule out injury |
| Motivation drop > 2 points sustained | Self-reported engagement declining | Introduce variety, reassess goals, consider social training |
| Life event disruption | Travel, illness, family crisis | Switch to maintenance plan, reduce all non-essential wellness demands |
| Lab values out of range | Clinical blood work results | Consult physician, adjust nutrition and supplementation |

### Weekly Review Template

```markdown
## Weekly Wellness Review: [Week of Date]

### Domain Scores (1-10 average for the week)
| Domain | Score | Trend | Key Observation |
|--------|-------|-------|-----------------|
| Fitness | [X] | [Up/Down/Stable] | [Note] |
| Nutrition | [X] | [Up/Down/Stable] | [Note] |
| Sleep | [X] | [Up/Down/Stable] | [Note] |
| Mental Wellness | [X] | [Up/Down/Stable] | [Note] |
| Overall Readiness | [X] | [Up/Down/Stable] | [Note] |

### Training Summary
- **Sessions completed**: [X of Y planned]
- **Total volume**: [sets x reps x load or time]
- **Highlights**: [PR, technique improvement, consistency]
- **Concerns**: [Soreness, missed sessions, form issues]

### Nutrition Summary
- **Calorie adherence**: [% of target days hit]
- **Protein adherence**: [% of target days hit]
- **Hydration adherence**: [% of target days hit]
- **Notable patterns**: [Cravings, meal skipping, social eating]

### Sleep Summary
- **Average duration**: [hours:min]
- **Average efficiency**: [%]
- **Average deep sleep**: [%]
- **Notable disruptions**: [Causes]

### Mental Wellness Summary
- **Average mood**: [X/10]
- **Average stress**: [X/10]
- **Mindfulness sessions**: [X of Y planned]
- **Notable events**: [Stressors, wins, social highlights]

### Adjustments for Next Week
- [ ] [Specific adjustment 1]
- [ ] [Specific adjustment 2]
- [ ] [Specific adjustment 3]
```

---

## Common Pitfalls

### 1. Optimizing One Domain While Destroying Another

Wrong: Chase a new deadlift PR while running a 1000-calorie deficit and sleeping 5 hours per night.

Right: Use the cross-domain interaction map to check for conflicts before adjusting any single domain. A moderate deficit, adequate sleep, and a realistic strength goal coexist; an extreme in any domain undermines the others.

### 2. Chasing Wearable Numbers Instead of Outcomes

Wrong: Obsess over hitting exactly 10,000 steps, a specific HRV number, or a perfect sleep score every day.

Right: Use wearable data as trends over 7-day rolling averages. Single-day fluctuations are noise. If HRV is trending down over a week while mood and performance are fine, investigate but do not panic.

### 3. Ignoring Subjective Data

Wrong: Dismiss how someone feels because the wearable says their readiness is 85.

Right: Subjective energy, mood, and motivation are valid data. When subjective and objective signals conflict, err on the side of caution and reduce intensity. The person inside the body has information the wristband does not.

### 4. Never Taking a Deload or Diet Break

Wrong: Push maximum training intensity and caloric deficit for months without interruption.

Right: Schedule deload weeks every 4-8 weeks of hard training. Plan diet breaks (1-2 weeks at maintenance calories) every 8-12 weeks of deficit. Proactive recovery prevents forced recovery from injury or burnout.

### 5. All-or-Nothing Adherence Thinking

Wrong: Miss one workout or one meal plan day and declare the entire week a failure, then abandon the plan.

Right: Track adherence as a percentage. Hitting 80% of planned sessions and 80% of nutrition targets is excellent progress. One missed day is 14% of a week, not a catastrophe.

### 6. Prescribing Beyond Scope

Wrong: Diagnose a medical condition, recommend medication changes, or provide therapy protocols.

Right: Flag concerning patterns (persistent mood decline, abnormal lab values, chronic pain) and recommend consultation with the appropriate licensed professional. Provide the data that supports the referral.

### 7. Cookie-Cutter Programming

Wrong: Apply the same 12-week plan to every person regardless of training history, injury status, schedule, preferences, or goals.

Right: Use frameworks as starting points and adapt based on individual response data. A plan that someone will actually follow at 80% adherence beats a theoretically optimal plan followed at 30%.

---

## Resources

- [ACSM Guidelines for Exercise Testing and Prescription](https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription)
- [Precision Nutrition - Evidence-Based Nutrition Coaching](https://www.precisionnutrition.com/)
- [Matthew Walker - Why We Sleep](https://www.sleepdiplomat.com/)
- [Huberman Lab - Science-Based Tools for Health](https://www.hubermanlab.com/)
- [NSCA - Essentials of Strength Training and Conditioning](https://www.nsca.com/education/articles/)
- [Examine.com - Supplement and Nutrition Research](https://examine.com/)
- [James Clear - Atomic Habits](https://jamesclear.com/atomic-habits)
- [American Psychological Association - Stress Resources](https://www.apa.org/topics/stress)

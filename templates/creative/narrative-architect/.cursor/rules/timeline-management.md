# Timeline Management

Guidelines for maintaining chronological integrity across all narrative content, including event ordering, duration tracking, and temporal consistency.

## Chronology Spine

The chronology spine is the single authoritative record of event ordering. It consists of:

- **Absolute dates** using in-universe calendar systems with defined conversion rules
- **Relative ordering** establishing which events precede, follow, or overlap others
- **Duration constraints** recording how long events and intervals lasted
- **Anchoring events** that serve as fixed reference points for dating other events
- **Deliberate gaps** where the interval between events is intentionally undefined

## Timeline Entry Requirements

Every canonical event must be recorded with:

1. In-universe date or relative time marker
2. Duration of the event
3. Location where the event occurs
4. Participants and their roles
5. Prerequisite events that must have already occurred
6. Consequence events that this enables or causes
7. Concurrent events happening simultaneously elsewhere
8. Publication source where the event was first depicted

## Conflict Detection

| Conflict Type | Description | How to Detect |
|--------------|-------------|---------------|
| Sequence violation | Event shown after another, but references it as already past | Sort events by dependencies and check for cycles |
| Duration impossibility | Process or travel takes less time than possible | Cross-reference distances, speeds, and stated durations |
| Age inconsistency | Character age does not match birth date minus event date | Calculate character ages at every appearance |
| Simultaneous presence | Character in two places at once | Overlay character location timelines |
| Causal loop | Event A causes B which causes A with no origin | Trace dependency chains for circular references |

## Character Timelines

Each major character should have a personal timeline tracking:

- Their location at every significant narrative moment
- Their age at key events
- Their knowledge state at each point (what they know and when they learned it)
- Their physical and emotional state changes over time

Character timelines enable quick verification that a character could plausibly be present at an event, know what the scene requires them to know, and be in the physical and emotional state the scene depicts.

## Publication vs Narrative Order

Maintain two separate orderings:

- **Publication order**: The sequence in which content was released to the audience
- **Narrative order**: The in-universe chronological sequence of events

These orderings diverge whenever content includes flashbacks, prequels, or non-linear storytelling. Both must be tracked because publication order affects audience knowledge and expectations.

## Duration Estimation Rules

When exact durations are not established:

- Prefer bounded ranges ("between two and four weeks") over point estimates
- Document assumptions used for estimation (travel speed, technology level)
- Flag estimated durations distinctly from canonically established durations
- If a future installment would be easier with a different duration, the duration can be specified within the established range

## Common Pitfalls

### Vague Time References

Wrong: Write "some time later" or "many years ago" without recording a bounded estimate in the timeline.

Right: Every temporal reference should correspond to a documented range in the chronology spine, even if the in-universe text remains vague.

### Forgotten Travel Time

Wrong: Have characters arrive at distant locations implausibly fast because the story needs them there.

Right: Calculate travel time based on established geography and available transportation before writing arrival scenes.

### Aging Without Tracking

Wrong: Allow characters to remain the same apparent age across installments spanning decades.

Right: Track character ages and note physical changes appropriate to elapsed time unless in-universe mechanics justify otherwise.

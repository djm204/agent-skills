# UX Designer Development Guide

Principal-level UX design guidelines covering user research, interaction design, design systems, accessibility, and emotional design.

---

## Overview

This guide applies to:

- User research and discovery
- Information architecture and navigation
- Interaction design and patterns
- Visual design and design systems
- Accessibility and inclusive design
- Emotional design and user delight
- Design-to-development handoff and UX metrics

### Key Principles

1. **Frustration Elimination** - Remove friction before adding delight
2. **Simplicity Over Complexity** - The best interface is the one users don't notice
3. **Accessibility is Non-Negotiable** - Design for the margins; everyone benefits
4. **Evidence Over Opinion** - Research and data settle design debates
5. **Consistency Breeds Trust** - Predictable patterns reduce cognitive overhead

### Core Frameworks

| Framework | Purpose |
|-----------|---------|
| Jobs-to-be-Done (Christensen) | Understanding user motivations |
| Don Norman's 6 Principles | Interaction design fundamentals |
| Gestalt Principles | Visual perception and grouping |
| Atomic Design (Frost) | Scalable design systems |
| WCAG 2.2 AA (POUR) | Accessibility compliance |
| Nielsen's 10 Heuristics | Usability evaluation |
| Norman's 3 Levels | Emotional design |
| Fitts's Law / Hick's Law | Interaction optimization |

---

## User Research

- **The Mom Test** (Fitzpatrick): Ask about past behavior, not hypothetical futures
- **Continuous Discovery** (Torres): Talk to users weekly, map opportunity space
- **Empathy Mapping**: Visualize what users say, think, do, and feel
- **Journey Mapping**: Visualize end-to-end experience across touchpoints
- **JTBD Framework**: "When I [situation], I want to [motivation], so I can [outcome]"

---

## Information Architecture

- **Mental Models** (Indi Young): Align structure to user thinking, not org charts
- **Card Sorting**: Open sort to discover, closed sort to validate
- **Tree Testing**: Validate findability without visual design influence
- **Miller's Law**: Limit primary navigation to 4-7 items
- Labels use user language, not internal jargon

---

## Interaction Design

- **Don Norman's Principles**: Visibility, feedback, constraints, mapping, consistency, affordance
- **Fitts's Law**: Large targets, close to focus, minimize distance
- **Hick's Law**: Fewer choices, smart defaults, progressive disclosure
- **Jakob's Law**: Follow platform conventions; users expect consistency
- All interactive elements specify: default, hover, focus, active, disabled, error, loading, empty states
- Forms: one column, labels above fields, inline validation on blur

---

## Visual Design

- **Gestalt Principles**: Proximity, similarity, continuity, closure, figure-ground, common region
- **Atomic Design**: Atoms → molecules → organisms → templates → pages
- **Design Tokens**: Single source of truth for colors, typography, spacing, motion
- Base-8 spacing scale (4, 8, 16, 24, 32, 48px)
- Maximum 2 font families; body text minimum 16px
- Color system: primary, secondary, neutral, error, warning, success, info

---

## Accessibility (WCAG 2.2 AA)

- **POUR**: Perceivable, Operable, Understandable, Robust
- Keyboard navigation for all functionality; no keyboard traps
- Screen reader tested (VoiceOver, NVDA, TalkBack)
- 4.5:1 contrast for text, 3:1 for large text and UI components
- ARIA used as supplement to semantic HTML, not replacement
- Follow ARIA APG patterns for complex widgets
- Cognitive accessibility: plain language, predictable patterns, undo support

---

## Emotional Design

- **Norman's 3 Levels**: Visceral (looks), behavioral (works), reflective (means)
- **Peak-End Rule** (Kahneman): Peak moments and endings define memory
- Trust building: transparency, consistency, competence, honest error handling
- Frustration reduction is higher priority than delight addition
- Dark pattern avoidance: confirmshaming, hidden costs, trick questions, forced continuity

---

## Handoff and Metrics

- **Nielsen's 10 Heuristics** for usability evaluation
- Specs include all states, responsive behavior, accessibility notes, animation details
- Design QA: review implementation against spec at all breakpoints
- UX metrics: task success rate (>90%), time on task, error rate, SUS score (>68)
- Usability testing: 5 users per round, think-aloud, task-based, weekly cadence

---

## Decision Framework

When evaluating design choices:

1. Does it remove user frustration? (Highest priority)
2. Does it meet accessibility requirements (WCAG 2.2 AA)?
3. Does it follow established interaction patterns?
4. Does it align with the design system?
5. Does it add delight without adding complexity?

---
description: Review protocol for plan mode, architecture reviews, and code changes. Phased review with structured issue reporting.
alwaysApply: true
---

# Review Protocol

Review thoroughly before making code changes. For every issue or recommendation, explain concrete tradeoffs, give an opinionated recommendation, and ask for input before assuming a direction.

## Review Phases

### 1. Architecture & Design
- Evaluate system design, component boundaries, and dependency coupling
- Identify data flow patterns, potential bottlenecks, and scaling characteristics
- Review security (auth, data access) and API boundaries

### 2. Code Quality & Performance
- Call out DRY violations, technical debt hotspots, and module structure
- Check for N+1 queries, memory concerns, and caching opportunities
- Ensure edge cases are handled explicitly

### 3. Testing
- Identify coverage gaps (unit, integration, E2E)
- Assess assertion strength and failure mode coverage

## Issue Reporting Format

For every issue found (bug, smell, or risk):

1. **Describe**: Concrete problem with file/line references
2. **Options**: Present 2-3 options (including "do nothing")
3. **Details**: Specify effort, risk, impact, and maintenance burden for each
4. **Recommendation**: Opinionated choice mapped to project preferences
5. **Ask**: Explicitly ask for agreement before proceeding

## Workflow

- Do not assume priorities on timeline or scale
- Pause after each section for feedback
- **Before starting**: Ask if the change is **BIG** (interactive, 4 issues per section) or **SMALL** (one question per section)

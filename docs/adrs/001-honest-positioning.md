# ADR-001: Honest Positioning — Prompts, Not Agents

**Status:** Accepted
**Date:** 2026-02-24
**Deciders:** @djm204

## Context

The project is branded as an "agent skills framework" but currently delivers static prompt injection — curated markdown files installed into context windows. The deep-dive assessment (`docs/deep-dive-assessment.md`) identified a gap between the branding ("universal agent skill framework") and the actual implementation ("prompt template library with multi-format export").

In 2025-2026, "agent skills" implies tools that agents can invoke, stateful capabilities, and runtime behavior. This project provides none of that today. The gap creates an expectations mismatch that frustrates users who arrive expecting agentic capabilities.

## Decision

Reframe the project's messaging to accurately describe what it delivers today, while preserving the "skill" terminology as established vocabulary.

Specifically:

1. **Update the README tagline** to say "curated prompt packs" instead of "expert skill packs"
2. **Add a "What This Is / What This Isn't" section** to set expectations on the first scroll
3. **Mark tool schemas as interface contracts** (aspirational, not functional) everywhere they appear
4. **Add a Roadmap section** so users can see the path from "prompt library" to "agent framework"
5. **Keep "skill" as the unit of organization** — it's the established vocabulary in the codebase, CLI, and npm package name. The tagline sets expectations; the terminology stays consistent.

## Consequences

### Positive

- Users know exactly what they're getting before installing
- Reduces negative first impressions from unmet expectations
- Creates a clear narrative: "this is great at X today, and Y is coming"
- The roadmap gives potential contributors a place to plug in

### Negative

- "Curated prompt packs" is less catchy than "agent skills framework"
- Some users may skip the project based on the honest framing who would have tried it otherwise
- The "What This Isn't" section could read as self-deprecating if not balanced

### Neutral

- No code changes — this is purely a messaging/documentation update
- npm package name (`@djm204/agent-skills`) stays the same
- CLI commands and API unchanged

## Alternatives Considered

1. **Full rebrand to `@djm204/prompt-packs`** — Too disruptive. Breaking change to package name, all documentation, existing users' scripts. The "skills" framing works if expectations are set correctly.
2. **Do nothing** — The assessment is clear that the gap hurts credibility. Ignoring it means every new user discovers the gap on their own.
3. **Build the agent framework first, then rebrand** — Ideal but months away. The positioning fix is immediate and low-risk.

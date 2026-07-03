---
name: hermes-task-end
description: Use before marking a Hermes task done to enforce quality gates, documentation updates, self-review, progress-document updates, and PR/Codex review-loop completion when applicable.
version: 1.0.0
author: djm204, adapted for Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [workflow, quality-gates, task-end, verification, codex-review]
    related_skills: [codex-review-loop, requesting-code-review, github-pr-workflow]
---

# Hermes Task End Protocol

## Overview

Use this before saying a task is complete. Completion means the requested artifact exists, was exercised, and the result is grounded in real tool output.

## Quality Gates

Auto-detect the stack and run the relevant gates:

| Gate | Examples | Pass condition |
|------|----------|----------------|
| Tests | `npm test`, `pytest`, `cargo test`, `go test ./...` | 0 unexpected failures |
| Typecheck | `npm run typecheck`, `tsc --noEmit`, `mypy`, `cargo check` | 0 errors |
| Lint | `npm run lint`, `ruff`, `clippy` | 0 new errors |
| Build | `npm run build`, package/build command | Successful build |
| Self-review | inspect diff, security, edge cases | no obvious staff-level objections |

If a gate cannot run, report the exact blocker and any narrower verification you did run.

## Documentation Gates

Update only when applicable:

| Artifact | When required |
|----------|---------------|
| progress doc | Larger interruptible work: mark completed items and blockers |
| ADR | Architectural decision or durable trade-off |
| ramp-up/readme docs | Public API, architecture, or onboarding changes |
| lessons/skill | Non-trivial reusable workflow or corrected procedure |

## PR Completion

When the task involves a GitHub PR:
1. Push the branch only if the user asked for PR work.
2. Open/update a PR with a concise body and test evidence.
3. If the user requires Codex bot gating, load `codex-review-loop` and drive it to a terminal state.
4. Verify CI/checks with `gh pr checks` or the repository's required workflow tooling.
5. Do not merge unless the user requested/authorized merge behavior and all gates are satisfied.

## Final Response Requirements

Lead with what changed or the answer. Include:
- files changed, referenced as `path:line` when useful,
- verification commands and real outcomes,
- PR URL/status if applicable,
- blockers or skipped gates, clearly labeled.

## Verification Checklist

- [ ] Relevant tests/checks/builds ran or blockers are explicit.
- [ ] Diff was self-reviewed.
- [ ] Progress doc/todo state is updated.
- [ ] PR/Codex/CI status is terminal where applicable.
- [ ] Final response does not promise future action without doing it.

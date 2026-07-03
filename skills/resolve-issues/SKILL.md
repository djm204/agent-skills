---
name: resolve-issues
description: "Use when resolving GitHub issues priority-first in Hermes: triage, plan, or fix selected open issues with one branch and PR per issue, optional parallel worktrees via delegate_task, and Codex review-loop gating."
version: 1.0.0
author: djm204, adapted for Hermes Agent
license: MIT
platforms: [linux, macos]
metadata:
  hermes:
    tags: [github, issues, pull-requests, worktrees, orchestration]
    related_skills: [codex-review-loop, github-issues, github-pr-workflow, test-driven-development]
---

# Resolve Issues for Hermes

## Overview

Resolve open GitHub issues for a repository in priority order. The bundled `scripts/select-issues.sh` fetches and sorts issues; Hermes handles triage, planning, implementation, PR creation, and optional parallel execution.

Modes:
- `triage`: classify issues and propose labels/routing.
- `plan`: investigate and write implementation approaches without modifying code.
- `fix`: implement and ship one PR per issue, then run the Codex review loop.

## When to Use

Use this when the user asks to resolve GitHub issues, process issues by priority, triage/plan/fix issue batches, or run an issue-to-PR workflow.

Do not use it for unrelated backlog browsing or for combining unrelated issues into one PR.

## Prerequisites

- Load relevant GitHub workflow skills if available.
- `gh auth status` succeeds.
- `jq --version` succeeds.
- Target repository has a clean enough working tree for issue branches or worktrees.
- For fix mode, load `codex-review-loop` before opening/merging PRs.

Hermes shows this skill's absolute directory when loaded. Use the helper script from that directory:

```bash
SCRIPT="/absolute/path/to/this/skill/scripts/select-issues.sh"
```

Default install path:

```bash
SCRIPT="$HOME/.hermes/skills/resolve-issues/scripts/select-issues.sh"
```

## Argument Shape

Interpret the user's request as:

```text
[triage|plan|fix] [--parallel [N]] [--issue N] [--label L] [--max N] [--repo OWNER/NAME]
```

Defaults:
- mode: `triage`
- sequential fix mode unless `--parallel` is present
- `--parallel` without N means concurrency 10

Forward selection flags to `select-issues.sh`:

```bash
bash "$SCRIPT" [--issue N] [--label L] [--max N] [--repo OWNER/NAME]
```

The script returns a JSON array ordered by priority (`priorityRank`: 0 critical, 1 high, 2 medium, 3 low, 99 unprioritized), then newest issue number.

## Mode: Triage

1. Select issues.
2. For each issue, classify type, severity, and priority label if missing.
3. Summarize in a table: issue number, title, current labels, suggested labels, rationale.
4. Apply label changes with `gh issue edit` only after the user confirms the proposed batch.

## Mode: Plan

1. Select issues.
2. For each issue, inspect the relevant code and tests.
3. Write a concise implementation plan: affected files, steps, risks, and test strategy.
4. Do not modify code.
5. Offer to post plans as issue comments; ask before posting.

## Mode: Fix

Invariants for every issue:
- One issue = one branch = one PR.
- Branch from the default branch: `resolve/issue-<number>-<short-slug>`.
- Do not mix unrelated changes across issues.
- Use TDD where practical: failing test first, then fix.
- PR body includes `Closes #<number>`.
- Run relevant tests/typecheck/build before opening or updating the PR.
- Run `codex-review-loop` after the PR is open/updated.

Sequential flow:
1. Select issues.
2. Process the first issue completely before starting the next.
3. Return to the default branch between issues.

Parallel flow:
1. Create one worktree per issue, for example `../resolve-wt/issue-<number>`.
2. Spawn one `delegate_task` per issue with the worktree path, issue JSON, one-PR invariant, and Codex-loop requirement.
3. Cap concurrency at N.
4. Require each subagent to return `{issue, branch, prUrl, codexStatus, notes}`.
5. Verify returned PR URLs and status yourself before reporting success.
6. Remove completed worktrees only after their PR is open and Codex is terminal.

## Codex Review Gate

For fix mode, load and use `codex-review-loop`. Do not substitute a local CLI review for the GitHub PR bot if the user requested Codex bot gating.

Terminal states:
- `clean`: Codex reported no major issues after the latest trigger.
- `manual-review`: connector unavailable or timed out after the bounded normal review window.
- `blocked`: tests/CI/auth/review resolution prevented completion.

Never claim an issue is fixed unless its PR is open and the Codex loop reached `clean` or you explicitly report manual-review/blocker status.

## Reporting

End with a concise table:

| Issue | Mode/action | Branch | PR | Codex status | Notes |
|------|-------------|--------|----|--------------|-------|

## Verification Checklist

- [ ] Issue selection came from `select-issues.sh` or a deliberate single issue.
- [ ] Priority ordering was preserved.
- [ ] Each fix has exactly one PR.
- [ ] Tests/typecheck/build relevant to the change were run.
- [ ] Codex loop reached a terminal state for each PR.
- [ ] Worktrees were cleaned up when safe.

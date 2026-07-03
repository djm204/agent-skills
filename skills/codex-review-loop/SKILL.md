---
name: codex-review-loop
description: Use when a pull request should be reviewed by the GitHub Codex bot (chatgpt-codex-connector) and its findings driven to resolution in Hermes — after opening/updating a PR, when asked to run the codex loop, comment @codex review, or address Codex review threads until the PR is clean.
version: 1.0.0
author: djm204, adapted for Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [github, pull-requests, codex, review-loop, automation]
    related_skills: [github-pr-workflow, github-code-review]
---

# Codex Review Loop for Hermes

## Overview

Drive the GitHub Codex connector (`chatgpt-codex-connector`) through a complete review-address-resolve cycle on a PR until it reports no major issues. Codex is asynchronous and reports through three GitHub channels, so use the bundled script for detection, triggering, polling, and classification.

Core split:
- Mechanical steps: use `scripts/codex-review-loop.sh` from this skill directory.
- Judgement: decide whether each finding is real and how to fix it.

## When to Use

- A PR was opened or updated and needs the GitHub Codex bot gate before merge.
- The user asks for `@codex review`, the Codex review loop, or Codex feedback resolution.
- A pre-merge workflow requires a clean Codex pass.

Do not use this for human reviews or CI checks.

## Hermes Setup

Hermes shows the absolute skill directory path when it loads this skill. Use that path for the script:

```bash
SCRIPT="/absolute/path/to/this/skill/scripts/codex-review-loop.sh"
```

If installed in the default profile, the path is usually:

```bash
SCRIPT="$HOME/.hermes/skills/codex-review-loop/scripts/codex-review-loop.sh"
```

Prerequisites:
- `gh auth status` succeeds for the target repo.
- `jq` is installed.
- The GitHub Codex connector is installed on the target repo for full automation.

## Quick Reference

| Step | Command |
|------|---------|
| Detect | `bash "$SCRIPT" detect --repo OWNER/NAME` |
| Trigger | `TS=$(bash "$SCRIPT" trigger --repo OWNER/NAME --pr N)` |
| Poll | `bash "$SCRIPT" poll --repo OWNER/NAME --pr N --since "$TS"` |
| Classify fixture | `bash "$SCRIPT" classify --input fixture.json` |
| Detect fixture | `bash "$SCRIPT" detect-classify --input fixture.json` |

`detect` returns `available: true | false | "unknown"`. Treat `"unknown"` as trigger-and-observe, not unavailable. Only declare unavailable if normal review polling times out with no Codex response.

`poll` returns `{status: clean|findings|working, respondedAt, findings[]}`.

## The Loop

1. Detect availability with `detect`.
2. Trigger a review with `trigger`; keep the returned timestamp.
3. Poll all three Codex channels with `poll`:
   - top-level issue comments,
   - PR reviews,
   - inline PR comments.
4. If `status == working`, wait about 60-90 seconds and poll again. Bound the loop; do not wait forever.
5. If `status == clean`, stop. A clean top-level issue comment is terminal.
6. If `status == findings`, inspect each finding:
   - If it is real, fix it, push, reply with a detailed explanation, and resolve the review thread.
   - If it is not real, reply explaining why, and resolve the review thread.
7. Re-trigger with a fresh timestamp after addressing a round, then repeat until clean or unavailable.

Cap rounds (about 8) to avoid infinite loops. If the connector never responds in the normal review window, report the PR as ready for manual review instead of hanging.

## Resolving Threads

Inline thread resolution requires GraphQL:
1. Query the PR `reviewThreads` and map the inline comment `databaseId` to the thread node id.
2. Call `resolveReviewThread(input:{threadId})`.

Reply before resolving so the audit trail explains the fix or the non-issue rationale.

## Critical Gotchas

- Poll all three channels. Watching only reviews/inline comments misses the clean-pass comment.
- The clean signal is a top-level issue comment such as "Didn't find any major issues", "no issues", "looks good", or "no suggestions".
- Silence is not clean. A clean issue-comment is terminal.
- Bot login is `chatgpt-codex-connector`; tolerate `[bot]` suffixes.
- `detect` is positive-only and best-effort. Fresh repos may return `unknown` with normal user tokens.
- Ignore the non-actionable "💡 Codex Review" wrapper banner; act on inline findings and substantive review bodies.

## Verification Checklist

- [ ] `gh auth status` works.
- [ ] `jq --version` works.
- [ ] Script `detect` or `detect-classify` runs.
- [ ] Every actionable Codex finding was answered and resolved.
- [ ] A fresh final round reached `status: clean`, or unavailability was explicitly reported.

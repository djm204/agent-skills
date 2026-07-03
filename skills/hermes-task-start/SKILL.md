---
name: hermes-task-start
description: Use before starting a non-trivial Hermes implementation task to choose the right kickoff path, gather context, create a progress checklist, and avoid coding before requirements or recovery state are clear.
version: 1.0.0
author: djm204, adapted for Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [workflow, planning, task-start, recovery, requirements]
    related_skills: [plan, test-driven-development, systematic-debugging]
---

# Hermes Task Start Protocol

## Overview

Use this at the start of a meaningful implementation/debugging/design task. It routes the work into one of three paths: dive in with a provided spec, recover interrupted work, or interview for missing requirements.

## Route Selection Matrix

| Condition | Path | First action |
|-----------|------|--------------|
| Implementation file/spec/issue provided | Dive in | Identify affected files and blast radius |
| User says continue/resume or previous run crashed | Recovery | Reconstruct last known state before acting |
| No actionable spec | Requirements interview | Ask only the missing questions that change implementation |

## Path A: Spec Provided

1. Read the provided spec/issue/files.
2. Locate affected code with `search_files`; read definitions/usages before editing.
3. Check tests covering the affected area.
4. For larger work, create `tasks/<task-name>-progress.md` with an itemized checklist.
5. Proceed without extra approval if the user asked you to implement and scope is clear; ask only if ambiguity changes the implementation.

## Path B: Recovery

1. Read the matching `tasks/*-progress.md` or `tasks/todo.md` if present.
2. Run `git status --short --branch`, `git diff --stat`, and recent log.
3. Search past sessions if the user references prior conversation state.
4. Produce a short recovery brief:
   - Last completed
   - Git shows
   - Remaining work
   - Any discrepancy/blocker
5. Continue from the safe next unchecked item unless the user asked to replan.

## Path C: Requirements Interview

Ask only questions needed to safely proceed:
- Goal and user-visible outcome.
- Acceptance criteria.
- Out-of-scope boundaries.
- Stack/framework/pattern constraints.
- Autonomy level, if side effects are significant.
- Test expectations.
- Whether an ADR or documentation update is required.

After enough answers, create/update the progress checklist and begin.

## Hermes-Specific Notes

- Use `todo` for in-session step tracking.
- Use `delegate_task` for independent parallel workstreams; give children full context and require verifiable outputs.
- Prefer actual tool verification over narrative assurances.

## Verification Checklist

- [ ] Relevant files/symbols were inspected before edits.
- [ ] A progress doc exists for larger interruptible work.
- [ ] Only one `todo` item is in progress.
- [ ] Missing requirements that affect implementation were resolved or explicitly assumed.

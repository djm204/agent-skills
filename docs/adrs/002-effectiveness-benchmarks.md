# ADR-002: Effectiveness Benchmarks — Proving Skills Improve Output

**Status:** Accepted
**Date:** 2026-02-24
**Deciders:** @djm204

## Context

The deep-dive assessment identified the hardest question: **do these prompts actually make AI assistants better?** There is no A/B testing data, no before/after comparisons, and no benchmark results. The test framework validates prompt structure, not whether prompts improve output quality.

Without evidence, the project relies on "trust us, these are good prompts." That's not compelling for adoption.

## Decision

Build a benchmark runner that compares LLM output **with** a skill's system prompt vs. **without** (bare model). Reuse the existing `evaluateResponse()` assertion engine from `src/testing/test-runner.js` to score both runs.

Key design choices:

1. **Provider-agnostic** — the benchmark runner accepts an async `provider(prompt, systemPrompt?)` function. No hard dependency on any LLM SDK. Users bring their own provider.
2. **Reuse existing test cases** — `tests/test_cases.yaml` assertions double as benchmark assertions. Cases that test behavioral rules (which the bare model wouldn't follow) naturally show a delta.
3. **Deterministic scoring** — assertions are string-matching (contains, not_contains, length bounds), not subjective. Two runs with the same model and prompt produce comparable scores.
4. **No built-in LLM provider in the CLI** — avoids adding dependencies (Anthropic SDK, OpenAI SDK) to the zero-dependency package. The CLI outputs results; users wire up their own provider via the programmatic API.
5. **Multiple runs for variance** — each case runs N times (default 3) and results are averaged to reduce model sampling variance.

## Consequences

### Positive

- First concrete evidence of skill effectiveness
- Reuses existing test case infrastructure (no new assertion format)
- Provider-agnostic — works with any model
- Results are reproducible and publishable

### Negative

- Results are only as good as the test cases — poorly written cases won't show meaningful deltas
- String-matching assertions are coarse — they detect presence/absence of concepts, not quality
- Different models may show very different deltas, making "aggregate effectiveness" hard to claim

### Alternatives Considered

1. **LLM-as-judge** — use a model to evaluate response quality. More nuanced but non-deterministic and expensive. Could be added later as an optional evaluator.
2. **Human evaluation** — gold standard but doesn't scale and can't be automated in CI.
3. **Code execution benchmarks** — for coding skills, run generated code and check correctness. Too narrow (only works for code-producing skills) and complex to implement.

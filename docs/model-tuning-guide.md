# Model-Specific Tuning Guide

This guide documents which prompt tiers work best with which LLM models, based on benchmark testing across the skill library.

## Quick Recommendations

| Model | Recommended Tier | Notes |
|-------|-----------------|-------|
| Claude Sonnet 4 | standard | Pending benchmark results |
| Claude Haiku 4.5 | minimal | Pending benchmark results |
| GPT-4o | comprehensive | Pending benchmark results |
| GPT-4o-mini | standard | Pending benchmark results |
| Gemini 2.0 Flash | standard | Pending benchmark results |

> **Note:** These recommendations are placeholders. Run the benchmark matrix to populate with real data:
> ```bash
> ANTHROPIC_API_KEY=sk-... OPENAI_API_KEY=sk-... GOOGLE_AI_KEY=... \
>   node scripts/run-model-matrix.js --out=docs/model-tuning-results.json
> ```

## Detailed Findings

### Claude (Sonnet, Haiku)

*Results pending benchmark run.*

Expected patterns:
- Strong instruction-following — standard tier likely sufficient
- Minimal tier may work well given Claude's natural compliance with structured guidance
- Comprehensive tier may show diminishing returns

### GPT-4o / GPT-4o-mini

*Results pending benchmark run.*

Expected patterns:
- May benefit more from explicit examples (comprehensive tier)
- Anti-pattern lists may be less effective without examples

### Gemini 2.0 Flash

*Results pending benchmark run.*

Expected patterns:
- Fast inference — good for standard tier
- May need more explicit instruction for domain-specific skills

## Methodology

### Test Matrix

- **Models:** Claude Sonnet 4, Claude Haiku 4.5, GPT-4o, GPT-4o-mini, Gemini 2.0 Flash
- **Skills:** javascript-expert, devops-sre, product-manager, ux-designer, documentation
- **Tiers:** minimal, standard, comprehensive
- **Runs per case:** 3 (for variance reduction)
- **Total:** 5 models × 5 skills × 3 tiers = 75 benchmark runs (225 API calls)

### Scoring

Each benchmark compares LLM output **with** a skill's system prompt vs. **without** (bare model). The delta measures how much the skill prompt improves task-specific responses.

Assertions are deterministic string checks (contains, not_contains, min_length) — no LLM-as-judge subjectivity.

### Reproducing Results

```bash
# Full matrix
ANTHROPIC_API_KEY=sk-... OPENAI_API_KEY=sk-... GOOGLE_AI_KEY=... \
  node scripts/run-model-matrix.js --out=docs/model-tuning-results.json

# Single model
ANTHROPIC_API_KEY=sk-... node scripts/run-model-matrix.js --model=claude-sonnet-4-6

# Quick check (1 run, standard tier only)
ANTHROPIC_API_KEY=sk-... node scripts/run-model-matrix.js --runs=1 --tiers=standard
```

Results should be reproducible within ±10% variance across runs.

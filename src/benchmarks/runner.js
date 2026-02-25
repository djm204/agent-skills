/**
 * benchmarks/runner.js — A/B benchmark runner for skill effectiveness.
 *
 * Compares LLM output with a skill's system prompt vs. without (bare model).
 * Uses the same assertion engine as test-runner.js for deterministic scoring.
 *
 * Provider signature: async (prompt: string, systemPrompt?: string) => string
 *   - When systemPrompt is undefined, the provider should send the prompt alone (baseline).
 *   - When systemPrompt is provided, it should be used as the system message.
 */

import { evaluateResponse } from '../testing/test-runner.js';

// ============================================================================
// scoreBenchmarkCase
// ============================================================================

/**
 * Score a single response against expected assertions.
 * Returns a fractional score (0–1) based on how many assertions pass.
 *
 * @param {string} response - The LLM response text
 * @param {object} [expected] - Assertions (contains, contains_any, not_contains, min_length, max_length)
 * @returns {{ score: number, passed: boolean, failures: string[] }}
 */
export function scoreBenchmarkCase(response, expected) {
  if (!expected || Object.keys(expected).length === 0) {
    return { score: 1.0, passed: true, failures: [] };
  }

  const { passed, failures } = evaluateResponse(response, expected);

  if (passed) {
    return { score: 1.0, passed: true, failures: [] };
  }

  // Count total assertions to compute partial score
  let totalAssertions = 0;
  if (Array.isArray(expected.contains)) totalAssertions += expected.contains.length;
  if (Array.isArray(expected.contains_any) && expected.contains_any.length > 0) totalAssertions += 1;
  if (Array.isArray(expected.not_contains)) totalAssertions += expected.not_contains.length;
  if (typeof expected.min_length === 'number') totalAssertions += 1;
  if (typeof expected.max_length === 'number') totalAssertions += 1;

  if (totalAssertions === 0) {
    return { score: 1.0, passed: true, failures: [] };
  }

  const failedCount = failures.length;
  const passedCount = totalAssertions - failedCount;
  const score = passedCount / totalAssertions;

  return { score, passed: false, failures };
}

// ============================================================================
// runBenchmark
// ============================================================================

/**
 * Run a benchmark comparing skill-prompted vs. bare model responses.
 *
 * @param {object} suite - Test suite (from loadTestSuite or manual)
 * @param {string} systemPrompt - The skill's system prompt
 * @param {function} provider - async (prompt, systemPrompt?) => response string
 * @param {object} [options]
 * @param {number} [options.runs=1] - Number of runs per case (averaged)
 * @param {string[]} [options.tags] - Filter cases by tag
 * @returns {Promise<BenchmarkResult>}
 */
export async function runBenchmark(suite, systemPrompt, provider, options = {}) {
  const { runs = 1, tags } = options;

  // Filter cases by tag if requested
  let cases = suite.cases || [];
  if (tags && tags.length > 0) {
    cases = cases.filter((c) => {
      const caseTags = c.tags || [];
      return tags.some((t) => caseTags.includes(t));
    });
  }

  const caseResults = [];

  for (const testCase of cases) {
    const baselineScores = [];
    const withSkillScores = [];
    let baselineError;
    let withSkillError;

    for (let run = 0; run < runs; run++) {
      // Baseline run (no system prompt)
      try {
        const baselineResponse = await provider(testCase.prompt, undefined);
        baselineScores.push(scoreBenchmarkCase(baselineResponse, testCase.expected));
      } catch (err) {
        baselineError = err.message || String(err);
        baselineScores.push({ score: 0, passed: false, failures: [] });
      }

      // With-skill run (system prompt provided)
      try {
        const withSkillResponse = await provider(testCase.prompt, systemPrompt);
        withSkillScores.push(scoreBenchmarkCase(withSkillResponse, testCase.expected));
      } catch (err) {
        withSkillError = err.message || String(err);
        withSkillScores.push({ score: 0, passed: false, failures: [] });
      }
    }

    // Average scores across runs
    const avgBaseline = average(baselineScores.map((s) => s.score));
    const avgWithSkill = average(withSkillScores.map((s) => s.score));

    // Use the last run's failures for reporting
    const lastBaseline = baselineScores[baselineScores.length - 1];
    const lastWithSkill = withSkillScores[withSkillScores.length - 1];

    const baseline = {
      score: avgBaseline,
      passed: lastBaseline.passed,
      failures: lastBaseline.failures,
    };
    if (baselineError) baseline.error = baselineError;

    const withSkill = {
      score: avgWithSkill,
      passed: lastWithSkill.passed,
      failures: lastWithSkill.failures,
    };
    if (withSkillError) withSkill.error = withSkillError;

    caseResults.push({
      id: testCase.id,
      prompt: testCase.prompt,
      baseline,
      withSkill,
      delta: avgWithSkill - avgBaseline,
    });
  }

  // Compute summary
  const baselinePassRate = caseResults.length > 0
    ? caseResults.filter((c) => c.baseline.passed).length / caseResults.length
    : 0;
  const withSkillPassRate = caseResults.length > 0
    ? caseResults.filter((c) => c.withSkill.passed).length / caseResults.length
    : 0;
  const avgDelta = caseResults.length > 0
    ? average(caseResults.map((c) => c.delta))
    : 0;

  return {
    skill: suite.skill,
    systemPrompt,
    cases: caseResults,
    summary: {
      baselinePassRate,
      withSkillPassRate,
      avgDelta,
      totalCases: caseResults.length,
      runs,
    },
  };
}

// ============================================================================
// Helpers
// ============================================================================

function average(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

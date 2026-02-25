import { describe, it, expect, vi } from 'vitest';
import { runBenchmark, scoreBenchmarkCase } from './runner.js';

// ============================================================================
// scoreBenchmarkCase — unit tests
// ============================================================================

describe('scoreBenchmarkCase', () => {
  const testCase = {
    id: 'slo-definition',
    description: 'Should reference SLOs',
    prompt: 'How should we define SLOs?',
    expected: {
      contains_any: ['SLO', 'service level objective'],
      not_contains: ['just wing it'],
      min_length: 50,
    },
    tags: ['core'],
  };

  it('should score a passing response as 1.0', () => {
    const response = 'You should define SLOs based on your error budget and customer expectations. Start by measuring availability.';
    const result = scoreBenchmarkCase(response, testCase.expected);
    expect(result.score).toBe(1.0);
    expect(result.passed).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it('should score a failing response as 0', () => {
    const response = 'Hi';
    const result = scoreBenchmarkCase(response, testCase.expected);
    expect(result.score).toBeLessThan(1.0);
    expect(result.passed).toBe(false);
    expect(result.failures.length).toBeGreaterThan(0);
  });

  it('should return partial score when some assertions pass', () => {
    // Passes contains_any and min_length, fails not_contains
    const response = 'You should define SLOs and just wing it with the numbers to get started quickly.';
    const result = scoreBenchmarkCase(response, testCase.expected);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(1.0);
    expect(result.passed).toBe(false);
  });

  it('should handle empty expected assertions', () => {
    const result = scoreBenchmarkCase('any response', {});
    expect(result.score).toBe(1.0);
    expect(result.passed).toBe(true);
  });

  it('should handle undefined expected assertions', () => {
    const result = scoreBenchmarkCase('any response', undefined);
    expect(result.score).toBe(1.0);
    expect(result.passed).toBe(true);
  });
});

// ============================================================================
// runBenchmark — integration tests with mock provider
// ============================================================================

describe('runBenchmark', () => {
  const mockSuite = {
    name: 'devops-sre-tests',
    skill: 'devops-sre',
    version: '1.0.0',
    cases: [
      {
        id: 'slo-basics',
        description: 'Should mention SLOs',
        prompt: 'How do we set reliability targets?',
        expected: {
          contains_any: ['SLO', 'service level'],
          min_length: 50,
        },
        tags: ['core'],
      },
      {
        id: 'error-budget',
        description: 'Should mention error budget',
        prompt: 'How do we balance reliability with velocity?',
        expected: {
          contains_any: ['error budget', 'budget'],
          min_length: 50,
        },
        tags: ['core'],
      },
    ],
  };

  const mockSystemPrompt = 'You are an SRE expert. Always mention SLOs and error budgets.';

  it('should run baseline and with-skill for each case', async () => {
    const calls = [];
    const provider = vi.fn(async (prompt, systemPrompt) => {
      calls.push({ prompt, systemPrompt });
      if (systemPrompt) {
        return 'You should set SLOs based on error budget analysis and customer expectations for availability.';
      }
      return 'Just make sure things work. Monitor stuff.';
    });

    const result = await runBenchmark(mockSuite, mockSystemPrompt, provider, { runs: 1 });

    expect(result.skill).toBe('devops-sre');
    expect(result.cases).toHaveLength(2);
    // Each case should have baseline and withSkill runs
    expect(calls.length).toBe(4); // 2 cases × 2 runs (baseline + with skill)
  });

  it('should show improvement when skill prompt helps', async () => {
    const provider = vi.fn(async (prompt, systemPrompt) => {
      if (systemPrompt) {
        return 'Define SLOs based on error budget calculations. Track service level indicators to measure compliance.';
      }
      return 'Just deploy it and see if it works. Use logs or something.';
    });

    const result = await runBenchmark(mockSuite, mockSystemPrompt, provider, { runs: 1 });

    expect(result.summary.withSkillPassRate).toBeGreaterThan(result.summary.baselinePassRate);
    expect(result.summary.avgDelta).toBeGreaterThan(0);
  });

  it('should average scores across multiple runs', async () => {
    let callCount = 0;
    const provider = vi.fn(async (prompt, systemPrompt) => {
      callCount++;
      if (systemPrompt) {
        return 'SLO targets should use error budget methodology for reliability and velocity balance.';
      }
      return 'Just deploy and monitor.';
    });

    const result = await runBenchmark(mockSuite, mockSystemPrompt, provider, { runs: 3 });

    // 2 cases × 2 (baseline + with-skill) × 3 runs = 12
    expect(callCount).toBe(12);
    expect(result.summary.runs).toBe(3);
  });

  it('should filter cases by tags', async () => {
    const suiteWithTags = {
      ...mockSuite,
      cases: [
        ...mockSuite.cases,
        {
          id: 'safety-test',
          description: 'Should not recommend ignoring alerts',
          prompt: 'Can I just ignore pager alerts?',
          expected: { not_contains: ['yes', 'sure'] },
          tags: ['safety'],
        },
      ],
    };

    const provider = vi.fn(async () => 'SLO response with error budget methodology.');

    const result = await runBenchmark(suiteWithTags, mockSystemPrompt, provider, {
      runs: 1,
      tags: ['core'],
    });

    expect(result.cases).toHaveLength(2); // only 'core' tagged cases
  });

  it('should handle provider errors gracefully', async () => {
    const provider = vi.fn(async () => {
      throw new Error('API rate limit exceeded');
    });

    const result = await runBenchmark(mockSuite, mockSystemPrompt, provider, { runs: 1 });

    expect(result.cases).toHaveLength(2);
    for (const c of result.cases) {
      expect(c.baseline.error).toBeDefined();
      expect(c.withSkill.error).toBeDefined();
    }
  });

  it('should default to 1 run', async () => {
    let callCount = 0;
    const provider = vi.fn(async () => {
      callCount++;
      return 'SLO based response.';
    });

    await runBenchmark(mockSuite, mockSystemPrompt, provider);

    // 2 cases × 2 (baseline + with-skill) × 1 run = 4
    expect(callCount).toBe(4);
  });

  it('should return correct result shape', async () => {
    const provider = vi.fn(async (prompt, systemPrompt) => {
      return systemPrompt
        ? 'SLO and error budget response.'
        : 'Generic response.';
    });

    const result = await runBenchmark(mockSuite, mockSystemPrompt, provider, { runs: 1 });

    // Top-level shape
    expect(result).toHaveProperty('skill');
    expect(result).toHaveProperty('systemPrompt');
    expect(result).toHaveProperty('cases');
    expect(result).toHaveProperty('summary');

    // Summary shape
    expect(result.summary).toHaveProperty('baselinePassRate');
    expect(result.summary).toHaveProperty('withSkillPassRate');
    expect(result.summary).toHaveProperty('avgDelta');
    expect(result.summary).toHaveProperty('totalCases');
    expect(result.summary).toHaveProperty('runs');

    // Case shape
    const c = result.cases[0];
    expect(c).toHaveProperty('id');
    expect(c).toHaveProperty('prompt');
    expect(c).toHaveProperty('baseline');
    expect(c).toHaveProperty('withSkill');
    expect(c).toHaveProperty('delta');
    expect(c.baseline).toHaveProperty('score');
    expect(c.baseline).toHaveProperty('passed');
    expect(c.baseline).toHaveProperty('failures');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { resolveSkillDir, runModelMatrix } from './model-matrix.js';

// ============================================================================
// Fixtures
// ============================================================================

const SKILL_YAML = `
name: test-skill
version: 1.0.0
category: testing
tags:
  - test
description:
  short: "A test skill"
  long: "A test skill for benchmarking"
context_budget:
  minimal: 100
  standard: 200
  comprehensive: 300
composable_with:
  recommended:
    - other-skill
conflicts_with:
  - something-else
requires_tools: false
requires_memory: false
`.trim();

const TEST_CASES_YAML = `
name: test-skill-tests
skill: test-skill
version: 1.0.0
cases:
  - id: basic
    description: Basic test
    prompt: What is testing?
    expected:
      contains_any:
        - test
        - verify
      min_length: 20
    tags:
      - core
`.trim();

let tmpDir;

function createSkillFixture(skillName, { manifest = SKILL_YAML, testCases = TEST_CASES_YAML, prompts = true } = {}) {
  const skillDir = path.join(tmpDir, skillName);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'skill.yaml'), manifest);

  if (prompts) {
    const promptsDir = path.join(skillDir, 'prompts');
    fs.mkdirSync(promptsDir, { recursive: true });
    fs.writeFileSync(path.join(promptsDir, 'minimal.md'), '# Minimal\nBe concise.');
    fs.writeFileSync(path.join(promptsDir, 'standard.md'), '# Standard\nBe thorough and precise.');
    fs.writeFileSync(path.join(promptsDir, 'comprehensive.md'), '# Comprehensive\nBe exhaustive in your analysis.');
  }

  if (testCases) {
    const testsDir = path.join(skillDir, 'tests');
    fs.mkdirSync(testsDir, { recursive: true });
    fs.writeFileSync(path.join(testsDir, 'test_cases.yaml'), testCases);
  }

  return skillDir;
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'model-matrix-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ============================================================================
// resolveSkillDir
// ============================================================================

describe('resolveSkillDir', () => {
  it('resolves a skill name to its directory path', () => {
    createSkillFixture('my-skill');
    const dir = resolveSkillDir('my-skill', tmpDir);
    expect(dir).toBe(path.join(tmpDir, 'my-skill'));
  });

  it('throws when skill directory does not exist', () => {
    expect(() => resolveSkillDir('nonexistent', tmpDir)).toThrow('Skill directory not found');
  });

  it('throws when skill.yaml is missing', () => {
    const skillDir = path.join(tmpDir, 'no-manifest');
    fs.mkdirSync(skillDir, { recursive: true });
    expect(() => resolveSkillDir('no-manifest', tmpDir)).toThrow('skill.yaml not found');
  });
});

// ============================================================================
// runModelMatrix
// ============================================================================

describe('runModelMatrix', () => {
  function mockProvider(keyword) {
    return vi.fn(async (prompt, systemPrompt) => {
      if (systemPrompt) {
        return `You should test and verify everything thoroughly using ${keyword} practices.`;
      }
      return 'Just do it however you want.';
    });
  }

  it('runs every combination of model × skill × tier', async () => {
    createSkillFixture('skill-a');

    const providerA = mockProvider('model-a');
    const providerB = mockProvider('model-b');

    const result = await runModelMatrix(
      ['skill-a'],
      { 'model-a': providerA, 'model-b': providerB },
      { skillsDir: tmpDir, tiers: ['minimal', 'standard'], runs: 1 },
    );

    // 2 models × 1 skill × 2 tiers = 4 matrix entries
    expect(result.matrix).toHaveLength(4);
    expect(result.matrix.every((e) => !e.skipped)).toBe(true);
  });

  it('returns the correct result shape', async () => {
    createSkillFixture('skill-a');

    const result = await runModelMatrix(
      ['skill-a'],
      { 'model-a': mockProvider('a') },
      { skillsDir: tmpDir, tiers: ['standard'], runs: 1 },
    );

    // Top-level shape
    expect(result).toHaveProperty('matrix');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('metadata');

    // Matrix entry shape
    const entry = result.matrix[0];
    expect(entry).toHaveProperty('model', 'model-a');
    expect(entry).toHaveProperty('skill', 'skill-a');
    expect(entry).toHaveProperty('tier', 'standard');
    expect(entry).toHaveProperty('result');
    expect(entry.result).toHaveProperty('summary');
    expect(entry.result.summary).toHaveProperty('withSkillPassRate');

    // Summary shape
    expect(result.summary['model-a']).toHaveProperty('bestTier');
    expect(result.summary['model-a']).toHaveProperty('avgDelta');

    // Metadata shape
    expect(result.metadata).toEqual({
      skillNames: ['skill-a'],
      modelIds: ['model-a'],
      tiers: ['standard'],
      runs: 1,
    });
  });

  it('marks entries as skipped when test suite is missing', async () => {
    createSkillFixture('no-tests', { testCases: null });

    const result = await runModelMatrix(
      ['no-tests'],
      { 'model-a': mockProvider('a') },
      { skillsDir: tmpDir, tiers: ['standard'], runs: 1 },
    );

    expect(result.matrix).toHaveLength(1);
    expect(result.matrix[0].skipped).toBe(true);
    expect(result.matrix[0].skipReason).toMatch(/test suite/i);
  });

  it('marks entries as skipped when skill does not exist', async () => {
    const result = await runModelMatrix(
      ['ghost-skill'],
      { 'model-a': mockProvider('a') },
      { skillsDir: tmpDir, tiers: ['standard'], runs: 1 },
    );

    expect(result.matrix).toHaveLength(1);
    expect(result.matrix[0].skipped).toBe(true);
    expect(result.matrix[0].skipReason).toMatch(/not found/i);
  });

  it('handles provider errors without crashing the matrix', async () => {
    createSkillFixture('skill-a');

    const failingProvider = vi.fn(async () => {
      throw new Error('API limit');
    });
    const goodProvider = mockProvider('good');

    const result = await runModelMatrix(
      ['skill-a'],
      { 'bad-model': failingProvider, 'good-model': goodProvider },
      { skillsDir: tmpDir, tiers: ['standard'], runs: 1 },
    );

    expect(result.matrix).toHaveLength(2);
    // The bad model's entry still has a result (runBenchmark handles errors internally)
    const badEntry = result.matrix.find((e) => e.model === 'bad-model');
    const goodEntry = result.matrix.find((e) => e.model === 'good-model');
    expect(badEntry.result).toBeDefined();
    expect(goodEntry.result).toBeDefined();
  });

  it('propagates the runs option to runBenchmark', async () => {
    createSkillFixture('skill-a');

    const provider = mockProvider('a');

    const result = await runModelMatrix(
      ['skill-a'],
      { 'model-a': provider },
      { skillsDir: tmpDir, tiers: ['standard'], runs: 3 },
    );

    // 1 skill × 1 test case × 2 (baseline + with-skill) × 3 runs = 6 calls
    expect(provider).toHaveBeenCalledTimes(6);
    expect(result.matrix[0].result.summary.runs).toBe(3);
  });

  it('respects the tiers option', async () => {
    createSkillFixture('skill-a');

    const result = await runModelMatrix(
      ['skill-a'],
      { 'model-a': mockProvider('a') },
      { skillsDir: tmpDir, tiers: ['minimal'], runs: 1 },
    );

    expect(result.matrix).toHaveLength(1);
    expect(result.matrix[0].tier).toBe('minimal');
  });

  it('calls onProgress callback after each benchmark', async () => {
    createSkillFixture('skill-a');

    const progressCalls = [];
    const onProgress = (completed, total) => progressCalls.push({ completed, total });

    await runModelMatrix(
      ['skill-a'],
      { 'model-a': mockProvider('a'), 'model-b': mockProvider('b') },
      { skillsDir: tmpDir, tiers: ['standard'], runs: 1, onProgress },
    );

    // 2 models × 1 skill × 1 tier = 2 benchmarks
    expect(progressCalls).toHaveLength(2);
    expect(progressCalls[0]).toEqual({ completed: 1, total: 2 });
    expect(progressCalls[1]).toEqual({ completed: 2, total: 2 });
  });

  it('picks the best tier per model in summary', async () => {
    createSkillFixture('skill-a');

    // Provider that does better with longer prompts (comprehensive > standard > minimal)
    let callIndex = 0;
    const provider = vi.fn(async (prompt, systemPrompt) => {
      callIndex++;
      if (systemPrompt && systemPrompt.includes('Comprehensive')) {
        return 'You should test and verify everything thoroughly.';
      }
      if (systemPrompt && systemPrompt.includes('Standard')) {
        return 'Testing and verification is important.';
      }
      if (systemPrompt) {
        return 'Test things.';
      }
      return 'Do stuff.';
    });

    const result = await runModelMatrix(
      ['skill-a'],
      { 'model-a': provider },
      { skillsDir: tmpDir, runs: 1 },
    );

    expect(result.summary['model-a']).toBeDefined();
    expect(result.summary['model-a'].bestTier).toBeDefined();
    expect(['minimal', 'standard', 'comprehensive']).toContain(result.summary['model-a'].bestTier);
  });
});

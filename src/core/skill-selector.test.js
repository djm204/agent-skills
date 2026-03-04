import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { selectSkills } from './skill-selector.js';

// ============================================================================
// Fixtures — minimal SkillMeta objects (same shape as listSkills output)
// ============================================================================

function makeSkillMeta(name, overrides = {}) {
  return {
    name,
    version: '1.0.0',
    category: overrides.category || 'engineering',
    tags: overrides.tags || [],
    description: {
      short: overrides.shortDesc || `${name} skill`,
      long: overrides.longDesc || '',
    },
    context_budget: overrides.context_budget || { minimal: 700, standard: 2800, comprehensive: 7000 },
    composable_with: overrides.composable_with || {},
    conflicts_with: overrides.conflicts_with || [],
    path: overrides.path || `/skills/${name}`,
  };
}

const SKILL_CATALOG = [
  makeSkillMeta('javascript-expert', {
    category: 'languages',
    tags: ['javascript', 'typescript', 'nodejs', 'react'],
    shortDesc: 'Principal-level JavaScript and TypeScript engineering',
  }),
  makeSkillMeta('python-expert', {
    category: 'languages',
    tags: ['python', 'django', 'fastapi', 'async'],
    shortDesc: 'Expert Python engineering',
  }),
  makeSkillMeta('golang-expert', {
    category: 'languages',
    tags: ['go', 'golang', 'concurrency'],
    shortDesc: 'Expert Go engineering',
  }),
  makeSkillMeta('web-frontend', {
    category: 'engineering',
    tags: ['frontend', 'react', 'css', 'accessibility', 'performance'],
    shortDesc: 'Web frontend development',
    composable_with: { recommended: ['javascript-expert', 'testing'] },
  }),
  makeSkillMeta('web-backend', {
    category: 'engineering',
    tags: ['backend', 'api', 'database', 'rest', 'graphql'],
    shortDesc: 'Web backend development',
    composable_with: { recommended: ['testing'] },
  }),
  makeSkillMeta('devops-sre', {
    category: 'engineering',
    tags: ['devops', 'ci', 'cd', 'monitoring', 'sre', 'infrastructure'],
    shortDesc: 'DevOps and SRE practices',
    composable_with: { recommended: ['platform-engineering'] },
  }),
  makeSkillMeta('testing', {
    category: 'engineering',
    tags: ['testing', 'tdd', 'unit', 'integration', 'e2e'],
    shortDesc: 'Comprehensive testing practices',
  }),
  makeSkillMeta('fullstack', {
    category: 'engineering',
    tags: ['fullstack', 'frontend', 'backend', 'api'],
    shortDesc: 'Full-stack development',
    composable_with: { recommended: ['testing', 'javascript-expert'] },
  }),
  makeSkillMeta('platform-engineering', {
    category: 'engineering',
    tags: ['platform', 'kubernetes', 'infrastructure', 'ci', 'cd'],
    shortDesc: 'Platform engineering',
  }),
  makeSkillMeta('product-manager', {
    category: 'business',
    tags: ['product', 'prioritization', 'roadmap', 'stakeholder'],
    shortDesc: 'Product management',
    conflicts_with: ['project-manager'],
  }),
  makeSkillMeta('project-manager', {
    category: 'business',
    tags: ['project', 'scheduling', 'risk', 'stakeholder'],
    shortDesc: 'Project management',
    conflicts_with: ['product-manager'],
  }),
];

// ============================================================================
// Tests
// ============================================================================

describe('selectSkills', () => {
  // =========================================================================
  // Prompt-based selection
  // =========================================================================

  it('selects skills matching prompt keywords via tags', () => {
    const result = selectSkills('Help me set up CI/CD pipelines', {}, { catalog: SKILL_CATALOG });

    const names = result.map((s) => s.name);
    expect(names).toContain('devops-sre');
  });

  it('ranks higher-scoring skills first', () => {
    const result = selectSkills('Set up CI/CD with proper testing', {}, { catalog: SKILL_CATALOG });

    // devops-sre should score high (ci, cd), testing should also score
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].score).toBeGreaterThanOrEqual(result[result.length - 1].score);
  });

  it('matches against description text', () => {
    const result = selectSkills('principal-level TypeScript engineering', {}, { catalog: SKILL_CATALOG });

    const names = result.map((s) => s.name);
    expect(names).toContain('javascript-expert');
  });

  // =========================================================================
  // Context-based selection
  // =========================================================================

  it('boosts skills based on detected language', () => {
    const result = selectSkills('', { language: 'python' }, { catalog: SKILL_CATALOG });

    const names = result.map((s) => s.name);
    expect(names[0]).toBe('python-expert');
  });

  it('boosts skills based on detected frameworks', () => {
    const result = selectSkills('', { frameworks: ['react'] }, { catalog: SKILL_CATALOG });

    const names = result.map((s) => s.name);
    expect(names).toContain('web-frontend');
    expect(names).toContain('javascript-expert');
  });

  it('combines prompt and context signals', () => {
    const result = selectSkills(
      'set up testing',
      { language: 'typescript', frameworks: ['react'] },
      { catalog: SKILL_CATALOG }
    );

    const names = result.map((s) => s.name);
    expect(names).toContain('testing');
    expect(names).toContain('javascript-expert');
  });

  // =========================================================================
  // Composability bonus
  // =========================================================================

  it('boosts recommended composable skills', () => {
    const result = selectSkills('frontend react development', {}, { catalog: SKILL_CATALOG });

    const names = result.map((s) => s.name);
    // web-frontend recommends javascript-expert and testing
    expect(names).toContain('web-frontend');
    // javascript-expert should be present (react tag match + composability bonus)
    expect(names).toContain('javascript-expert');
  });

  // =========================================================================
  // Conflict filtering
  // =========================================================================

  it('removes conflicting skills (lower-ranked one dropped)', () => {
    const result = selectSkills('product and project management', {}, { catalog: SKILL_CATALOG });

    const names = result.map((s) => s.name);
    // Both match, but they conflict — only one should survive
    const hasProduct = names.includes('product-manager');
    const hasProject = names.includes('project-manager');
    expect(hasProduct && hasProject).toBe(false);
    expect(hasProduct || hasProject).toBe(true);
  });

  // =========================================================================
  // Budget constraints
  // =========================================================================

  it('respects maxSkills limit', () => {
    const result = selectSkills('everything about development', {}, {
      catalog: SKILL_CATALOG,
      maxSkills: 3,
    });

    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('respects budget constraint', () => {
    const result = selectSkills('frontend development with testing', {}, {
      catalog: SKILL_CATALOG,
      budget: 3000,
    });

    const totalBudget = result.reduce((sum, s) => sum + s.meta.context_budget.minimal, 0);
    expect(totalBudget).toBeLessThanOrEqual(3000);
  });

  // =========================================================================
  // Edge cases
  // =========================================================================

  it('returns empty array for empty prompt and no context', () => {
    const result = selectSkills('', {}, { catalog: SKILL_CATALOG });
    expect(result).toEqual([]);
  });

  it('returns empty array for empty catalog', () => {
    const result = selectSkills('typescript development', {}, { catalog: [] });
    expect(result).toEqual([]);
  });

  it('handles prompt with only stop words', () => {
    const result = selectSkills('the and or is', {}, { catalog: SKILL_CATALOG });
    expect(result).toEqual([]);
  });

  it('returns selected skills with score and meta', () => {
    const result = selectSkills('testing', {}, { catalog: SKILL_CATALOG });

    expect(result.length).toBeGreaterThan(0);
    const first = result[0];
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('score');
    expect(first).toHaveProperty('meta');
    expect(typeof first.score).toBe('number');
  });
});

/**
 * Tests for the adapter interface contract and all built-in adapters.
 *
 * Each adapter takes a SkillPack (from loadSkill) and outputs framework-specific files.
 * All adapters implement the same interface:
 *   adapt(skillPack, options) → AdapterOutput
 *
 * AdapterOutput:
 *   files: Array<{ path: string, content: string }>   — relative paths to write
 *   summary: string                                    — one-line description of output
 */

import { describe, it, expect } from 'vitest';
import { rawAdapter } from './raw.js';
import { cursorAdapter } from './cursor.js';
import { claudeCodeAdapter } from './claude-code.js';
import { copilotAdapter } from './copilot.js';
import { ADAPTERS, getAdapter } from './index.js';

// ============================================================================
// Minimal SkillPack fixture
// ============================================================================

const SKILL_PACK = {
  name: 'test-skill',
  version: '1.0.0',
  category: 'engineering',
  tags: ['testing'],
  description: {
    short: 'A test skill',
    long: 'A test skill for adapter validation.',
  },
  context_budget: { minimal: 800, standard: 3200, comprehensive: 8000 },
  prompts: {
    minimal: '# Test Skill (Minimal)\n\nCore identity only.',
    standard: '# Test Skill (Standard)\n\nFull behavioral prompt.',
    comprehensive: '# Test Skill (Comprehensive)\n\nFull prompt with examples.',
  },
  systemPrompt: '# Test Skill (Standard)\n\nFull behavioral prompt.',
  tierUsed: 'standard',
  tools: [],
  composable_with: {},
  conflicts_with: [],
  requires_tools: false,
  requires_memory: false,
};

// ============================================================================
// Adapter interface contract (all adapters must satisfy this)
// ============================================================================

function assertAdapterContract(adapter, name) {
  describe(`${name} — adapter contract`, () => {
    it('returns an object with files array', () => {
      const result = adapter(SKILL_PACK);
      expect(result).toHaveProperty('files');
      expect(Array.isArray(result.files)).toBe(true);
    });

    it('each file has path and content strings', () => {
      const result = adapter(SKILL_PACK);
      for (const file of result.files) {
        expect(typeof file.path).toBe('string');
        expect(file.path.length).toBeGreaterThan(0);
        expect(typeof file.content).toBe('string');
        expect(file.content.length).toBeGreaterThan(0);
      }
    });

    it('returns a summary string', () => {
      const result = adapter(SKILL_PACK);
      expect(typeof result.summary).toBe('string');
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('produces at least one file', () => {
      const result = adapter(SKILL_PACK);
      expect(result.files.length).toBeGreaterThan(0);
    });

    it('output contains the skill system prompt', () => {
      const result = adapter(SKILL_PACK);
      const allContent = result.files.map((f) => f.content).join('\n');
      expect(allContent).toContain('Test Skill');
    });
  });
}

assertAdapterContract(rawAdapter, 'rawAdapter');
assertAdapterContract(cursorAdapter, 'cursorAdapter');
assertAdapterContract(claudeCodeAdapter, 'claudeCodeAdapter');
assertAdapterContract(copilotAdapter, 'copilotAdapter');

// ============================================================================
// raw adapter specific tests
// ============================================================================

describe('rawAdapter', () => {
  it('outputs a plain markdown file at the skill name path', () => {
    const result = rawAdapter(SKILL_PACK);
    expect(result.files[0].path).toBe('test-skill.md');
  });

  it('includes the system prompt directly in the file', () => {
    const result = rawAdapter(SKILL_PACK);
    expect(result.files[0].content).toContain('Full behavioral prompt');
  });

  it('respects tier option', () => {
    const result = rawAdapter(SKILL_PACK, { tier: 'minimal' });
    expect(result.files[0].content).toContain('Core identity only');
  });

  it('includes skill metadata header', () => {
    const result = rawAdapter(SKILL_PACK);
    expect(result.files[0].content).toContain('test-skill');
    expect(result.files[0].content).toContain('1.0.0');
  });
});

// ============================================================================
// cursor adapter specific tests
// ============================================================================

describe('cursorAdapter', () => {
  it('outputs a .mdc file in .cursor/rules/', () => {
    const result = cursorAdapter(SKILL_PACK);
    const paths = result.files.map((f) => f.path);
    expect(paths.some((p) => p.startsWith('.cursor/rules/'))).toBe(true);
    expect(paths.some((p) => p.endsWith('.mdc'))).toBe(true);
  });

  it('includes YAML front matter with description', () => {
    const result = cursorAdapter(SKILL_PACK);
    const content = result.files[0].content;
    expect(content).toMatch(/^---/);
    expect(content).toContain('description:');
    expect(content).toContain('alwaysApply: false');
  });

  it('uses the skill short description in front matter', () => {
    const result = cursorAdapter(SKILL_PACK);
    const content = result.files[0].content;
    expect(content).toContain('A test skill');
  });
});

// ============================================================================
// claude-code adapter specific tests
// ============================================================================

describe('claudeCodeAdapter', () => {
  it('outputs a CLAUDE.md file', () => {
    const result = claudeCodeAdapter(SKILL_PACK);
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('CLAUDE.md');
  });

  it('CLAUDE.md content contains the system prompt', () => {
    const result = claudeCodeAdapter(SKILL_PACK);
    const claudeMd = result.files.find((f) => f.path === 'CLAUDE.md');
    expect(claudeMd.content).toContain('Test Skill');
  });

  it('includes a skill metadata section', () => {
    const result = claudeCodeAdapter(SKILL_PACK);
    const claudeMd = result.files.find((f) => f.path === 'CLAUDE.md');
    expect(claudeMd.content).toContain('test-skill');
  });
});

// ============================================================================
// copilot adapter specific tests
// ============================================================================

describe('copilotAdapter', () => {
  it('outputs to .github/copilot-instructions.md', () => {
    const result = copilotAdapter(SKILL_PACK);
    const paths = result.files.map((f) => f.path);
    expect(paths).toContain('.github/copilot-instructions.md');
  });

  it('copilot instructions are under 200 lines for a single skill', () => {
    const result = copilotAdapter(SKILL_PACK);
    const file = result.files.find((f) => f.path === '.github/copilot-instructions.md');
    const lines = file.content.split('\n').length;
    expect(lines).toBeLessThan(200);
  });

  it('includes a summary section with the skill description', () => {
    const result = copilotAdapter(SKILL_PACK);
    const file = result.files.find((f) => f.path === '.github/copilot-instructions.md');
    expect(file.content).toContain('A test skill');
  });
});

// ============================================================================
// Adapter registry tests
// ============================================================================

describe('ADAPTERS registry', () => {
  it('exports known adapter names', () => {
    expect(ADAPTERS).toContain('raw');
    expect(ADAPTERS).toContain('cursor');
    expect(ADAPTERS).toContain('claude-code');
    expect(ADAPTERS).toContain('copilot');
  });

  it('getAdapter returns the adapter function for known names', () => {
    const adapter = getAdapter('raw');
    expect(typeof adapter).toBe('function');
  });

  it('getAdapter throws for unknown adapter names', () => {
    expect(() => getAdapter('unknown-adapter')).toThrow(/unknown adapter/i);
  });
});

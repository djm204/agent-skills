/**
 * Tests for the Codex adapter — OpenAI Codex skills format.
 *
 * Output: .agents/skills/<name>/SKILL.md + optional agents/openai.yaml
 */

import { describe, it, expect } from 'vitest';
import { codexAdapter } from './codex.js';

// ============================================================================
// Fixtures
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

const SKILL_PACK_WITH_TOOLS = {
  ...SKILL_PACK,
  name: 'devops-sre',
  tools: [
    {
      name: 'query_metrics',
      description: 'Query observability metrics for a service',
      parameters: {
        service: { type: 'string', description: 'Service name', required: true },
        metric_type: { type: 'string', description: 'Metric type', required: true },
      },
    },
  ],
  requires_tools: true,
};

const SKILL_PACK_WITH_MCP = {
  ...SKILL_PACK,
  mcp_server: '@djm204/mcp-web',
};

const SKILL_PACK_BUILTIN_MCP = {
  ...SKILL_PACK,
  mcp_server: 'built-in',
};

const SKILL_PACK_SHORT_DESC_ONLY = {
  ...SKILL_PACK,
  description: {
    short: 'A test skill',
  },
};

const SKILL_PACK_WITH_TOOLS_AND_MCP = {
  ...SKILL_PACK_WITH_TOOLS,
  mcp_server: 'built-in',
};

const SKILL_PACK_QUOTES_IN_DESC = {
  ...SKILL_PACK,
  description: {
    short: 'Handles "edge cases" well',
    long: 'Skill for "advanced" scenarios: tricky stuff',
  },
};

// ============================================================================
// AGENTS.md output
// ============================================================================

describe('codexAdapter — AGENTS.md', () => {
  it('outputs AGENTS.md at root', () => {
    const result = codexAdapter(SKILL_PACK);
    const agentsMd = result.files.find((f) => f.path === 'AGENTS.md');
    expect(agentsMd).toBeDefined();
  });

  it('AGENTS.md content contains the system prompt', () => {
    const result = codexAdapter(SKILL_PACK);
    const agentsMd = result.files.find((f) => f.path === 'AGENTS.md');
    expect(agentsMd.content).toContain('Full behavioral prompt.');
  });

  it('AGENTS.md includes a title with humanized skill name', () => {
    const result = codexAdapter(SKILL_PACK);
    const agentsMd = result.files.find((f) => f.path === 'AGENTS.md');
    expect(agentsMd.content).toContain('# AGENTS.md - Test Skill');
  });
});

// ============================================================================
// SKILL.md output
// ============================================================================

describe('codexAdapter — SKILL.md', () => {
  it('outputs SKILL.md under .agents/skills/<name>/', () => {
    const result = codexAdapter(SKILL_PACK);
    const skillMd = result.files.find((f) => f.path.endsWith('SKILL.md'));
    expect(skillMd).toBeDefined();
    expect(skillMd.path).toBe('.agents/skills/test-skill/SKILL.md');
  });

  it('SKILL.md starts with YAML frontmatter', () => {
    const result = codexAdapter(SKILL_PACK);
    const skillMd = result.files.find((f) => f.path.endsWith('SKILL.md'));
    expect(skillMd.content).toMatch(/^---\n/);
    expect(skillMd.content).toMatch(/\n---\n/);
  });

  it('frontmatter contains name field', () => {
    const result = codexAdapter(SKILL_PACK);
    const skillMd = result.files.find((f) => f.path.endsWith('SKILL.md'));
    expect(skillMd.content).toContain('name: test-skill');
  });

  it('frontmatter uses long description for description field', () => {
    const result = codexAdapter(SKILL_PACK);
    const skillMd = result.files.find((f) => f.path.endsWith('SKILL.md'));
    expect(skillMd.content).toContain('description: "A test skill for adapter validation."');
  });

  it('falls back to short description when long is missing', () => {
    const result = codexAdapter(SKILL_PACK_SHORT_DESC_ONLY);
    const skillMd = result.files.find((f) => f.path.endsWith('SKILL.md'));
    expect(skillMd.content).toContain('description: "A test skill"');
  });

  it('body contains the system prompt', () => {
    const result = codexAdapter(SKILL_PACK);
    const skillMd = result.files.find((f) => f.path.endsWith('SKILL.md'));
    expect(skillMd.content).toContain('Full behavioral prompt.');
  });

  it('respects tier option', () => {
    const result = codexAdapter(SKILL_PACK, { tier: 'minimal' });
    const skillMd = result.files.find((f) => f.path.endsWith('SKILL.md'));
    expect(skillMd.content).toContain('Core identity only.');
  });
});

// ============================================================================
// agents/openai.yaml — no tools/MCP
// ============================================================================

describe('codexAdapter — no tools or MCP', () => {
  it('does not output agents/openai.yaml when no tools or MCP', () => {
    const result = codexAdapter(SKILL_PACK);
    const yaml = result.files.find((f) => f.path.endsWith('openai.yaml'));
    expect(yaml).toBeUndefined();
  });

  it('outputs basic files (AGENTS.md + SKILL.md)', () => {
    const result = codexAdapter(SKILL_PACK);
    expect(result.files).toHaveLength(2);
  });
});

// ============================================================================
// agents/openai.yaml — with MCP server
// ============================================================================

describe('codexAdapter — MCP server', () => {
  it('outputs agents/openai.yaml when mcp_server is set', () => {
    const result = codexAdapter(SKILL_PACK_WITH_MCP);
    const yaml = result.files.find((f) => f.path.endsWith('openai.yaml'));
    expect(yaml).toBeDefined();
    expect(yaml.path).toBe('.agents/skills/test-skill/agents/openai.yaml');
  });

  it('openai.yaml contains display_name', () => {
    const result = codexAdapter(SKILL_PACK_WITH_MCP);
    const yaml = result.files.find((f) => f.path.endsWith('openai.yaml'));
    expect(yaml.content).toContain('display_name: "Test Skill"');
  });

  it('openai.yaml contains short_description', () => {
    const result = codexAdapter(SKILL_PACK_WITH_MCP);
    const yaml = result.files.find((f) => f.path.endsWith('openai.yaml'));
    expect(yaml.content).toContain('short_description: "A test skill"');
  });

  it('openai.yaml contains MCP tool dependency for custom package', () => {
    const result = codexAdapter(SKILL_PACK_WITH_MCP);
    const yaml = result.files.find((f) => f.path.endsWith('openai.yaml'));
    expect(yaml.content).toContain('type: "mcp"');
    expect(yaml.content).toContain('@djm204/mcp-web');
  });

  it('openai.yaml uses agent-skills-serve for built-in MCP', () => {
    const result = codexAdapter(SKILL_PACK_BUILTIN_MCP);
    const yaml = result.files.find((f) => f.path.endsWith('openai.yaml'));
    expect(yaml.content).toContain('@djm204/agent-skills-serve');
    expect(yaml.content).toContain('test-skill');
  });
});

// ============================================================================
// agents/openai.yaml — with tools (no MCP)
// ============================================================================

describe('codexAdapter — tools without MCP', () => {
  it('outputs agents/openai.yaml when tools are present', () => {
    const result = codexAdapter(SKILL_PACK_WITH_TOOLS);
    const yaml = result.files.find((f) => f.path.endsWith('openai.yaml'));
    expect(yaml).toBeDefined();
  });

  it('openai.yaml contains tool entries', () => {
    const result = codexAdapter(SKILL_PACK_WITH_TOOLS);
    const yaml = result.files.find((f) => f.path.endsWith('openai.yaml'));
    expect(yaml.content).toContain('query_metrics');
  });
});

// ============================================================================
// Summary
// ============================================================================

describe('codexAdapter — summary', () => {
  it('returns a summary string mentioning codex', () => {
    const result = codexAdapter(SKILL_PACK);
    expect(result.summary.toLowerCase()).toContain('codex');
  });

  it('summary mentions the skill name', () => {
    const result = codexAdapter(SKILL_PACK);
    expect(result.summary).toContain('test-skill');
  });
});

// ============================================================================
// MCP takes precedence over standalone tools
// ============================================================================

describe('codexAdapter — tools + MCP combined', () => {
  it('emits MCP dependency, not standalone tool entries, when both are present', () => {
    const result = codexAdapter(SKILL_PACK_WITH_TOOLS_AND_MCP);
    const yaml = result.files.find((f) => f.path.endsWith('openai.yaml'));
    expect(yaml).toBeDefined();
    expect(yaml.content).toContain('type: "mcp"');
    expect(yaml.content).not.toContain('type: "function"');
  });
});

// ============================================================================
// YAML escaping
// ============================================================================

describe('codexAdapter — YAML escaping', () => {
  it('escapes double quotes in SKILL.md description', () => {
    const result = codexAdapter(SKILL_PACK_QUOTES_IN_DESC);
    const skillMd = result.files.find((f) => f.path.endsWith('SKILL.md'));
    expect(skillMd.content).toContain('description: "Skill for \\"advanced\\" scenarios: tricky stuff"');
  });

  it('escapes double quotes in openai.yaml short_description', () => {
    const pack = { ...SKILL_PACK_QUOTES_IN_DESC, mcp_server: 'built-in' };
    const result = codexAdapter(pack);
    const yaml = result.files.find((f) => f.path.endsWith('openai.yaml'));
    expect(yaml.content).toContain('short_description: "Handles \\"edge cases\\" well"');
  });
});

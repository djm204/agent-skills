import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exportSkills } from './skill-exporter.js';

// ============================================================================
// Fixtures
// ============================================================================

function writeYaml(obj) {
  function serialize(val, indent = 0) {
    const pad = '  '.repeat(indent);
    if (Array.isArray(val)) {
      return val.map((v) => `${pad}- ${typeof v === 'object' ? '\n' + serialize(v, indent + 1) : v}`).join('\n');
    }
    if (typeof val === 'object' && val !== null) {
      return Object.entries(val)
        .map(([k, v]) => {
          if (typeof v === 'object' && !Array.isArray(v)) {
            return `${pad}${k}:\n${serialize(v, indent + 1)}`;
          }
          if (Array.isArray(v)) {
            return `${pad}${k}:\n${serialize(v, indent + 1)}`;
          }
          return `${pad}${k}: ${v}`;
        })
        .join('\n');
    }
    return String(val);
  }
  return serialize(obj);
}

function createSkillFixture(dir, name, overrides = {}) {
  const skillDir = path.join(dir, name);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.mkdirSync(path.join(skillDir, 'prompts'), { recursive: true });

  // Build manifest — omit empty arrays (YAML parser can't handle inline [])
  const manifest = {
    name,
    version: '1.0.0',
    category: overrides.category || 'engineering',
    tags: overrides.tags || ['test'],
    description: {
      short: overrides.shortDesc || `${name} skill`,
      long: overrides.longDesc || `A longer description of ${name}.`,
    },
    context_budget: {
      minimal: 700,
      standard: 2800,
      comprehensive: 7000,
    },
    requires_tools: overrides.requires_tools || false,
    requires_memory: overrides.requires_memory || false,
    ...overrides.manifest,
  };
  // Only include composable_with/conflicts_with when non-empty
  if (overrides.recommended?.length) {
    manifest.composable_with = { recommended: overrides.recommended };
  }
  if (overrides.conflicts_with?.length) {
    manifest.conflicts_with = overrides.conflicts_with;
  }

  fs.writeFileSync(path.join(skillDir, 'skill.yaml'), writeYaml(manifest));

  const prompts = overrides.prompts || {
    'minimal.md': `# ${name} (Minimal)\n\nMinimal prompt content.`,
    'standard.md': `# ${name} (Standard)\n\nStandard prompt content.`,
    'comprehensive.md': `# ${name} (Comprehensive)\n\nComprehensive prompt content.`,
  };

  for (const [file, content] of Object.entries(prompts)) {
    fs.writeFileSync(path.join(skillDir, 'prompts', file), content);
  }

  // Optionally create tools
  if (overrides.tools) {
    fs.mkdirSync(path.join(skillDir, 'tools'), { recursive: true });
    for (const [file, content] of Object.entries(overrides.tools)) {
      fs.writeFileSync(path.join(skillDir, 'tools', file), content);
    }
  }

  return skillDir;
}

// ============================================================================
// Tests
// ============================================================================

describe('exportSkills', () => {
  let tmpDir;
  let skillsDir;
  let outDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'export-test-'));
    skillsDir = path.join(tmpDir, 'skills');
    outDir = path.join(tmpDir, 'export');
    fs.mkdirSync(skillsDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('exports skills.json with metadata for all skills', async () => {
    createSkillFixture(skillsDir, 'alpha', { category: 'engineering', tags: ['ci', 'cd'] });
    createSkillFixture(skillsDir, 'beta', { category: 'languages', tags: ['python'] });

    const result = await exportSkills(skillsDir, { outDir });

    expect(result.skills).toHaveLength(2);
    expect(result.skills.map((s) => s.name).sort()).toEqual(['alpha', 'beta']);

    // Verify skills.json was written
    const jsonPath = path.join(outDir, 'skills.json');
    expect(fs.existsSync(jsonPath)).toBe(true);

    const written = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    expect(written).toHaveLength(2);
    expect(written[0].name).toBe('alpha');
  });

  it('includes all metadata fields in each skill entry', async () => {
    createSkillFixture(skillsDir, 'full-meta', {
      category: 'business',
      tags: ['pm', 'strategy'],
      shortDesc: 'Product management skill',
      longDesc: 'Full product management expertise.',
      recommended: ['testing'],
      requires_tools: true,
    });

    const result = await exportSkills(skillsDir, { outDir });
    const skill = result.skills[0];

    expect(skill.name).toBe('full-meta');
    expect(skill.version).toBe('1.0.0');
    expect(skill.category).toBe('business');
    expect(skill.tags).toEqual(['pm', 'strategy']);
    expect(skill.description.short).toBe('Product management skill');
    expect(skill.description.long).toBe('Full product management expertise.');
    expect(skill.context_budget).toEqual({ minimal: 700, standard: 2800, comprehensive: 7000 });
    expect(skill.composable_with.recommended).toEqual(['testing']);
    expect(skill.conflicts_with).toEqual([]);
    expect(skill.requires_tools).toBe(true);
  });

  it('writes prompt files to skills/<name>/<tier>.md', async () => {
    createSkillFixture(skillsDir, 'with-prompts');

    await exportSkills(skillsDir, { outDir });

    for (const tier of ['minimal', 'standard', 'comprehensive']) {
      const promptPath = path.join(outDir, 'skills', 'with-prompts', `${tier}.md`);
      expect(fs.existsSync(promptPath)).toBe(true);
      const content = fs.readFileSync(promptPath, 'utf8');
      expect(content).toContain('with-prompts');
    }
  });

  it('handles skills with only some prompt tiers', async () => {
    createSkillFixture(skillsDir, 'partial', {
      prompts: {
        'standard.md': '# Standard only\n\nJust standard.',
      },
    });

    await exportSkills(skillsDir, { outDir });

    expect(fs.existsSync(path.join(outDir, 'skills', 'partial', 'standard.md'))).toBe(true);
    expect(fs.existsSync(path.join(outDir, 'skills', 'partial', 'minimal.md'))).toBe(false);
    expect(fs.existsSync(path.join(outDir, 'skills', 'partial', 'comprehensive.md'))).toBe(false);
  });

  it('includes tool definitions when present', async () => {
    createSkillFixture(skillsDir, 'with-tools', {
      requires_tools: true,
      tools: {
        'search.yaml': 'name: web_search\ndescription: Search the web\nparameters:\n  query:\n    type: string\n    description: Search query',
      },
    });

    const result = await exportSkills(skillsDir, { outDir });
    const skill = result.skills[0];

    expect(skill.tools).toHaveLength(1);
    expect(skill.tools[0].name).toBe('web_search');
  });

  it('includes mcp_server field when present', async () => {
    createSkillFixture(skillsDir, 'mcp-skill', {
      manifest: { mcp_server: '@djm204/mcp-web' },
    });

    const result = await exportSkills(skillsDir, { outDir });
    expect(result.skills[0].mcp_server).toBe('@djm204/mcp-web');
  });

  it('returns empty array for empty skills directory', async () => {
    const result = await exportSkills(skillsDir, { outDir });

    expect(result.skills).toEqual([]);
    expect(fs.existsSync(path.join(outDir, 'skills.json'))).toBe(true);
    expect(JSON.parse(fs.readFileSync(path.join(outDir, 'skills.json'), 'utf8'))).toEqual([]);
  });

  it('returns empty array for nonexistent skills directory', async () => {
    const result = await exportSkills(path.join(tmpDir, 'nonexistent'), { outDir });
    expect(result.skills).toEqual([]);
  });

  it('skips directories without skill.yaml', async () => {
    createSkillFixture(skillsDir, 'valid-skill');
    // Create a directory with no manifest
    fs.mkdirSync(path.join(skillsDir, 'not-a-skill'), { recursive: true });
    fs.writeFileSync(path.join(skillsDir, 'not-a-skill', 'readme.txt'), 'nope');

    const result = await exportSkills(skillsDir, { outDir });
    expect(result.skills).toHaveLength(1);
    expect(result.skills[0].name).toBe('valid-skill');
  });

  it('sorts skills by name', async () => {
    createSkillFixture(skillsDir, 'zulu');
    createSkillFixture(skillsDir, 'alpha');
    createSkillFixture(skillsDir, 'mike');

    const result = await exportSkills(skillsDir, { outDir });
    expect(result.skills.map((s) => s.name)).toEqual(['alpha', 'mike', 'zulu']);
  });

  it('creates output directory if it does not exist', async () => {
    createSkillFixture(skillsDir, 'test-skill');
    const deepOutDir = path.join(tmpDir, 'deep', 'nested', 'export');

    await exportSkills(skillsDir, { outDir: deepOutDir });

    expect(fs.existsSync(path.join(deepOutDir, 'skills.json'))).toBe(true);
  });

  it('returns skillCount and outputDir in result', async () => {
    createSkillFixture(skillsDir, 'one');
    createSkillFixture(skillsDir, 'two');

    const result = await exportSkills(skillsDir, { outDir });

    expect(result.skillCount).toBe(2);
    expect(result.outputDir).toBe(outDir);
  });
});

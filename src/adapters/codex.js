/**
 * Codex adapter — outputs OpenAI Codex / Agents format.
 *
 * Output:
 * - AGENTS.md                                   — standard rule file
 * - .agents/skills/<name>/SKILL.md               — OpenAI Agents skill
 * - .agents/skills/<name>/agents/openai.yaml      — when MCP or tools present
 *
 * Format: https://developers.openai.com/codex/skills/
 */

/**
 * Humanize a kebab-case skill name: "security-expert" → "Security Expert"
 * @param {string} name
 * @returns {string}
 */
function humanize(name) {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Escape a string for safe use inside YAML double-quoted values.
 * @param {string} str
 * @returns {string}
 */
function yamlEscape(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * @param {import('../core/skill-loader.js').SkillPack} skillPack
 * @param {{ tier?: string }} [options]
 * @returns {{ files: Array<{ path: string, content: string }>, summary: string }}
 */
export function codexAdapter(skillPack, options = {}) {
  const { tier = skillPack.tierUsed || 'standard' } = options;
  const prompt = skillPack.prompts[tier] || skillPack.systemPrompt;
  const basePath = `.agents/skills/${skillPack.name}`;

  const files = [];

  // --- AGENTS.md (Standard for Codex rules) ---
  const agentsMd = [
    `# AGENTS.md - ${humanize(skillPack.name)}`,
    '',
    `> ${skillPack.description.short}`,
    '',
    '---',
    '',
    prompt,
  ].join('\n');

  files.push({ path: 'AGENTS.md', content: agentsMd });

  // --- .agents/skills/<name>/SKILL.md ---
  const description = skillPack.description.long || skillPack.description.short;
  const skillMd = [
    '---',
    `name: ${skillPack.name}`,
    `description: "${yamlEscape(description)}"`,
    '---',
    '',
    prompt,
  ].join('\n');

  files.push({ path: `${basePath}/SKILL.md`, content: skillMd });

  // --- agents/openai.yaml (conditional) ---
  const hasTools = skillPack.tools && skillPack.tools.length > 0;
  const hasMcp = !!skillPack.mcp_server;

  if (hasTools || hasMcp) {
    const yamlLines = [
      'interface:',
      `  display_name: "${yamlEscape(humanize(skillPack.name))}"`,
      `  short_description: "${yamlEscape(skillPack.description.short)}"`,
    ];

    yamlLines.push('');
    yamlLines.push('dependencies:');
    yamlLines.push('  tools:');

    if (hasMcp) {
      let mcpValue;
      let mcpUrl;
      if (skillPack.mcp_server === 'built-in') {
        mcpValue = `agent-skills-${skillPack.name}`;
        mcpUrl = `npx -y @djm204/agent-skills-serve ${skillPack.name}`;
      } else {
        mcpValue = skillPack.mcp_server.replace(/^@[^/]+\//, '');
        mcpUrl = `npx -y ${skillPack.mcp_server}`;
      }
      yamlLines.push(`    - type: "mcp"`);
      yamlLines.push(`      value: "${mcpValue}"`);
      yamlLines.push(`      description: "${yamlEscape(humanize(skillPack.name) + ' MCP tools')}"`);
      yamlLines.push(`      transport: "streamable_http"`);
      yamlLines.push(`      url: "${yamlEscape(mcpUrl)}"`);
    }

    // When MCP is present it subsumes standalone tools — MCP server exposes
    // the same tools over the protocol, so listing them separately would duplicate.
    if (hasTools && !hasMcp) {
      for (const tool of skillPack.tools) {
        yamlLines.push(`    - type: "function"`);
        yamlLines.push(`      value: "${yamlEscape(tool.name)}"`);
        yamlLines.push(`      description: "${yamlEscape(tool.description || '')}"`);
      }
    }

    files.push({ path: `${basePath}/agents/openai.yaml`, content: yamlLines.join('\n') });
  }

  return {
    files,
    summary: `Codex: AGENTS.md + .agents/skills/${skillPack.name}/ (tier: ${tier})`,
  };
}


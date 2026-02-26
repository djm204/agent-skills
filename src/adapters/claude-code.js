/**
 * Claude Code adapter — outputs a CLAUDE.md file.
 *
 * Output: CLAUDE.md
 */

/**
 * @param {import('../core/skill-loader.js').SkillPack} skillPack
 * @param {{ tier?: string }} [options]
 * @returns {{ files: Array<{ path: string, content: string }>, summary: string }}
 */
export function claudeCodeAdapter(skillPack, options = {}) {
  const { tier = skillPack.tierUsed || 'standard' } = options;
  const prompt = skillPack.prompts[tier] || skillPack.systemPrompt;

  const header = [
    `# CLAUDE.md`,
    '',
    `<!-- skill: ${skillPack.name} v${skillPack.version} | tier: ${tier} | category: ${skillPack.category} -->`,
    '',
    `## Installed Skill: ${skillPack.name}`,
    '',
    `**${skillPack.description.short}**`,
    '',
    '---',
    '',
  ].join('\n');

  const content = header + prompt;

  const files = [{ path: 'CLAUDE.md', content }];

  if (skillPack.mcp_server) {
    const serverName = skillPack.mcp_server.replace(/^@[^/]+\//, '');
    const settings = {
      mcpServers: {
        [serverName]: {
          command: 'npx',
          args: ['-y', skillPack.mcp_server],
        },
      },
    };
    files.push({ path: '.claude/settings.json', content: JSON.stringify(settings, null, 2) });
  }

  return {
    files,
    summary: `Claude Code: CLAUDE.md with ${skillPack.name} (tier: ${tier})`,
  };
}

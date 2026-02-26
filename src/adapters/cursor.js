/**
 * Cursor adapter — outputs a .cursor/rules/*.mdc file with YAML front matter.
 *
 * Output: .cursor/rules/<skill-name>.mdc
 */

/**
 * @param {import('../core/skill-loader.js').SkillPack} skillPack
 * @param {{ tier?: string }} [options]
 * @returns {{ files: Array<{ path: string, content: string }>, summary: string }}
 */
export function cursorAdapter(skillPack, options = {}) {
  const { tier = skillPack.tierUsed || 'standard' } = options;
  const prompt = skillPack.prompts[tier] || skillPack.systemPrompt;

  const frontMatter = [
    '---',
    `description: ${skillPack.description.short}`,
    'alwaysApply: false',
    '---',
    '',
  ].join('\n');

  const content = frontMatter + prompt;
  const filePath = `.cursor/rules/${skillPack.name}.mdc`;

  const files = [{ path: filePath, content }];

  if (skillPack.mcp_server) {
    const serverName = skillPack.mcp_server.replace(/^@[^/]+\//, '');
    const mcpConfig = {
      mcpServers: {
        [serverName]: {
          command: 'npx',
          args: ['-y', skillPack.mcp_server],
        },
      },
    };
    files.push({ path: '.cursor/mcp.json', content: JSON.stringify(mcpConfig, null, 2) });
  }

  return {
    files,
    summary: `Cursor rule: ${filePath} (tier: ${tier})`,
  };
}

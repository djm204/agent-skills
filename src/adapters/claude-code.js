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

  return {
    files: [{ path: 'CLAUDE.md', content }],
    summary: `Claude Code: CLAUDE.md with ${skillPack.name} (tier: ${tier})`,
  };
}

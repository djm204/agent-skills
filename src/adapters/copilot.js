/**
 * Copilot adapter — outputs .github/copilot-instructions.md.
 *
 * Uses description-based summary format to stay within GitHub Copilot's
 * context limits. Avoids full prompt concatenation (the old approach produced
 * 500-3000+ lines for multi-template installs).
 *
 * Output: .github/copilot-instructions.md
 */

/**
 * @param {import('../core/skill-loader.js').SkillPack} skillPack
 * @param {{ tier?: string }} [options]
 * @returns {{ files: Array<{ path: string, content: string }>, summary: string }}
 */
export function copilotAdapter(skillPack, options = {}) {
  const { tier = skillPack.tierUsed || 'minimal' } = options;
  // Copilot defaults to minimal tier to keep instructions compact
  const prompt = skillPack.prompts[tier] || skillPack.prompts.minimal || skillPack.systemPrompt;

  const lines = [
    '# Copilot Instructions',
    '',
    '## Active Skill',
    '',
    `**${skillPack.name}** v${skillPack.version} (${skillPack.category})`,
    `${skillPack.description.short}`,
    '',
    '---',
    '',
    prompt,
  ];

  const content = lines.join('\n');

  return {
    files: [{ path: '.github/copilot-instructions.md', content }],
    summary: `Copilot: .github/copilot-instructions.md with ${skillPack.name} (tier: ${tier})`,
  };
}

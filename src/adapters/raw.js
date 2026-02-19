/**
 * Raw adapter — plain markdown output, no framework-specific wrapping.
 *
 * Output: <skill-name>.md
 */

/**
 * @param {import('../core/skill-loader.js').SkillPack} skillPack
 * @param {{ tier?: string }} [options]
 * @returns {{ files: Array<{ path: string, content: string }>, summary: string }}
 */
export function rawAdapter(skillPack, options = {}) {
  const { tier = skillPack.tierUsed || 'standard' } = options;
  const prompt = skillPack.prompts[tier] || skillPack.systemPrompt;

  const header = [
    `<!-- skill: ${skillPack.name} v${skillPack.version} | tier: ${tier} | category: ${skillPack.category} -->`,
    '',
  ].join('\n');

  const content = header + prompt;

  return {
    files: [{ path: `${skillPack.name}.md`, content }],
    summary: `Raw skill pack: ${skillPack.name}.md (tier: ${tier})`,
  };
}

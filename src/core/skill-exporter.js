/**
 * skill-exporter.js
 *
 * Export all skills as a JSON manifest + prompt files for consumption
 * by framework packages (LangChain, CrewAI, OpenAI Agents).
 */

import fs from 'fs';
import path from 'path';
import { loadSkill } from './skill-loader.js';

const TIER_ORDER = ['minimal', 'standard', 'comprehensive'];

/**
 * Export all skills from a directory as JSON + prompt files.
 *
 * @param {string} skillsDir - Directory containing skill subdirectories
 * @param {{ outDir?: string }} [options]
 * @returns {Promise<{ skills: object[], skillCount: number, outputDir: string }>}
 */
export async function exportSkills(skillsDir, options = {}) {
  const { outDir = './export' } = options;
  const resolvedDir = path.resolve(skillsDir);

  // Handle missing directory gracefully
  if (!fs.existsSync(resolvedDir)) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'skills.json'), '[]');
    return { skills: [], skillCount: 0, outputDir: outDir };
  }

  const entries = fs.readdirSync(resolvedDir, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const skillDir = path.join(resolvedDir, entry.name);
    const manifestPath = path.join(skillDir, 'skill.yaml');
    if (!fs.existsSync(manifestPath)) continue;

    try {
      const pack = await loadSkill(skillDir);

      skills.push({
        name: pack.name,
        version: pack.version,
        category: pack.category,
        tags: pack.tags,
        description: pack.description,
        context_budget: pack.context_budget,
        composable_with: pack.composable_with,
        conflicts_with: pack.conflicts_with,
        requires_tools: pack.requires_tools,
        requires_memory: pack.requires_memory,
        mcp_server: pack.mcp_server,
        tools: pack.tools,
        prompts: Object.keys(pack.prompts),
      });

      // Write prompt files
      const skillOutDir = path.join(outDir, 'skills', pack.name);
      fs.mkdirSync(skillOutDir, { recursive: true });

      for (const tier of TIER_ORDER) {
        if (pack.prompts[tier]) {
          fs.writeFileSync(path.join(skillOutDir, `${tier}.md`), pack.prompts[tier]);
        }
      }
    } catch {
      // Skip skills with invalid manifests
    }
  }

  // Sort by name
  skills.sort((a, b) => a.name.localeCompare(b.name));

  // Write skills.json
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'skills.json'), JSON.stringify(skills, null, 2));

  return { skills, skillCount: skills.length, outputDir: outDir };
}

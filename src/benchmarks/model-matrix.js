/**
 * model-matrix.js — Multi-model benchmark matrix runner.
 *
 * Runs benchmarks across multiple models and prompt tiers for a set of skills.
 * Produces a structured result that can power the model-tuning guide.
 */

import path from 'path';
import fs from 'fs';
import { loadSkill } from '../core/skill-loader.js';
import { loadTestSuite } from '../testing/test-runner.js';
import { runBenchmark } from './runner.js';

const TIERS = ['minimal', 'standard', 'comprehensive'];

/**
 * Resolve a skill name to its absolute directory path.
 *
 * @param {string} skillName - Skill name (directory name under skillsDir)
 * @param {string} skillsDir - Absolute path to skills root directory
 * @returns {string} Absolute path to the skill directory
 * @throws {Error} if skill directory or skill.yaml not found
 */
export function resolveSkillDir(skillName, skillsDir) {
  const dir = path.join(skillsDir, skillName);
  if (!fs.existsSync(dir)) {
    throw new Error(`Skill directory not found: ${dir}`);
  }
  if (!fs.existsSync(path.join(dir, 'skill.yaml'))) {
    throw new Error(`skill.yaml not found in ${dir}`);
  }
  return dir;
}

/**
 * Run benchmarks across a matrix of models × skills × tiers.
 *
 * @param {string[]} skillNames - Skill names to benchmark
 * @param {Record<string, Function>} providers - { modelId: async (prompt, systemPrompt?) => string }
 * @param {object} [options]
 * @param {string[]} [options.tiers] - Tiers to test (default: all three)
 * @param {number} [options.runs=1] - Runs per case for variance averaging
 * @param {string} [options.skillsDir] - Skills root directory
 * @param {function} [options.onProgress] - Callback: (completed, total) => void
 * @returns {Promise<ModelMatrixResult>}
 */
export async function runModelMatrix(skillNames, providers, options = {}) {
  const {
    tiers = TIERS,
    runs = 1,
    skillsDir = path.resolve('skills'),
    onProgress,
  } = options;

  const modelIds = Object.keys(providers);
  const totalCombinations = modelIds.length * skillNames.length * tiers.length;
  let completed = 0;

  const matrix = [];

  for (const skillName of skillNames) {
    let skillDir;
    try {
      skillDir = resolveSkillDir(skillName, skillsDir);
    } catch (err) {
      for (const modelId of modelIds) {
        for (const tier of tiers) {
          matrix.push({
            model: modelId, skill: skillName, tier,
            skipped: true, skipReason: err.message, result: null,
          });
          completed++;
          if (onProgress) onProgress(completed, totalCombinations);
        }
      }
      continue;
    }

    const suite = loadTestSuite(skillDir);
    if (!suite) {
      for (const modelId of modelIds) {
        for (const tier of tiers) {
          matrix.push({
            model: modelId, skill: skillName, tier,
            skipped: true, skipReason: 'No test suite found', result: null,
          });
          completed++;
          if (onProgress) onProgress(completed, totalCombinations);
        }
      }
      continue;
    }

    for (const tier of tiers) {
      const skillPack = await loadSkill(skillDir, { tier });

      for (const modelId of modelIds) {
        const provider = providers[modelId];
        try {
          const result = await runBenchmark(suite, skillPack.systemPrompt, provider, { runs });
          matrix.push({ model: modelId, skill: skillName, tier, result });
        } catch (err) {
          matrix.push({
            model: modelId, skill: skillName, tier,
            skipped: true, skipReason: err.message, result: null,
          });
        }
        completed++;
        if (onProgress) onProgress(completed, totalCombinations);
      }
    }
  }

  const summary = computeSummary(matrix, modelIds, tiers);

  return {
    matrix,
    summary,
    metadata: { skillNames, modelIds, tiers, runs },
  };
}

/**
 * Compute per-model summary: pick the tier with the highest average delta.
 */
function computeSummary(matrix, modelIds, tiers) {
  const summary = {};

  for (const modelId of modelIds) {
    const modelEntries = matrix.filter((e) => e.model === modelId && !e.skipped);
    const byTier = {};

    for (const tier of tiers) {
      const tierEntries = modelEntries.filter((e) => e.tier === tier);
      if (tierEntries.length === 0) continue;
      const avgDelta = tierEntries.reduce((s, e) => s + e.result.summary.avgDelta, 0) / tierEntries.length;
      byTier[tier] = avgDelta;
    }

    const sorted = Object.entries(byTier).sort((a, b) => b[1] - a[1]);
    summary[modelId] = {
      bestTier: sorted.length > 0 ? sorted[0][0] : 'standard',
      avgDelta: sorted.length > 0 ? sorted[0][1] : 0,
    };
  }

  return summary;
}

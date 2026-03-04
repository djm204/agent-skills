/**
 * skill-selector.js
 *
 * Given a user prompt and/or codebase context signals, rank skills by
 * relevance using keyword + tag scoring. Pure heuristic — no LLM calls.
 */

// ============================================================================
// Constants
// ============================================================================

const WEIGHTS = {
  tagMatch: 3,
  descriptionMatch: 1,
  languageMatch: 5,
  frameworkMatch: 5,
  composability: 2,
};

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in',
  'for', 'on', 'with', 'at', 'by', 'from', 'it', 'its', 'this', 'that',
  'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he',
  'she', 'they', 'them', 'what', 'which', 'who', 'how', 'up', 'about',
  'into', 'not', 'no', 'so', 'if', 'but', 'as', 'just', 'also', 'than',
  'help', 'want', 'need', 'set', 'use', 'make', 'get',
]);

// Language name → skill tag mappings
const LANGUAGE_TAG_MAP = {
  typescript: ['typescript', 'javascript', 'nodejs'],
  javascript: ['javascript', 'nodejs'],
  python: ['python'],
  go: ['go', 'golang'],
  rust: ['rust'],
  java: ['java'],
  kotlin: ['kotlin'],
  swift: ['swift'],
  csharp: ['csharp', 'dotnet'],
  cpp: ['cpp', 'c++'],
  ruby: ['ruby', 'rails'],
};

// Framework name → skill tag mappings
const FRAMEWORK_TAG_MAP = {
  react: ['react', 'frontend'],
  next: ['react', 'frontend', 'fullstack'],
  vue: ['vue', 'frontend'],
  angular: ['angular', 'frontend'],
  express: ['express', 'backend', 'nodejs'],
  fastify: ['backend', 'nodejs'],
  nestjs: ['backend', 'nodejs', 'typescript'],
  django: ['django', 'python', 'backend'],
  flask: ['python', 'backend'],
  svelte: ['svelte', 'frontend'],
};

// ============================================================================
// Main function
// ============================================================================

/**
 * Select and rank skills based on prompt keywords and context signals.
 *
 * @param {string} prompt - User's input text
 * @param {{ language?: string, frameworks?: string[] }} [context] - Codebase signals
 * @param {{ catalog?: object[], maxSkills?: number, budget?: number }} [options]
 * @returns {{ name: string, score: number, meta: object }[]}
 */
export function selectSkills(prompt, context = {}, options = {}) {
  const { catalog = [], maxSkills = 5, budget } = options;

  if (catalog.length === 0) return [];

  // Extract keywords from prompt
  const keywords = extractKeywords(prompt);

  // Get context-derived tags
  const langTags = LANGUAGE_TAG_MAP[context.language] || [];
  const frameworkTags = (context.frameworks || []).flatMap((fw) => FRAMEWORK_TAG_MAP[fw] || [fw]);

  // No signals at all → return empty
  if (keywords.length === 0 && langTags.length === 0 && frameworkTags.length === 0) {
    return [];
  }

  // Score each skill
  const scored = catalog.map((skill) => ({
    name: skill.name,
    score: scoreSkill(skill, keywords, langTags, frameworkTags),
    meta: skill,
  }));

  // Filter out zero-score skills
  let candidates = scored.filter((s) => s.score > 0);

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  // Apply composability bonus
  applyComposabilityBonus(candidates);

  // Re-sort after bonus
  candidates.sort((a, b) => b.score - a.score);

  // Remove conflicts (keep higher-scored)
  candidates = removeConflicts(candidates);

  // Apply maxSkills limit
  candidates = candidates.slice(0, maxSkills);

  // Apply budget constraint
  if (budget) {
    candidates = fitBudget(candidates, budget);
  }

  return candidates;
}

// ============================================================================
// Helpers
// ============================================================================

function extractKeywords(prompt) {
  if (!prompt) return [];

  return prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function scoreSkill(skill, keywords, langTags, frameworkTags) {
  let score = 0;
  const tags = skill.tags || [];
  const descText = `${skill.description?.short || ''} ${skill.description?.long || ''}`.toLowerCase();

  // Tag matches from prompt keywords
  for (const keyword of keywords) {
    for (const tag of tags) {
      if (tag.toLowerCase().includes(keyword) || keyword.includes(tag.toLowerCase())) {
        score += WEIGHTS.tagMatch;
      }
    }
    // Description match
    if (descText.includes(keyword)) {
      score += WEIGHTS.descriptionMatch;
    }
  }

  // Language context match
  for (const lt of langTags) {
    if (tags.some((t) => t.toLowerCase() === lt.toLowerCase())) {
      score += WEIGHTS.languageMatch;
    }
  }

  // Framework context match
  for (const ft of frameworkTags) {
    if (tags.some((t) => t.toLowerCase() === ft.toLowerCase())) {
      score += WEIGHTS.frameworkMatch;
    }
  }

  return score;
}

function applyComposabilityBonus(candidates) {
  const selectedNames = new Set(candidates.map((c) => c.name));

  for (const candidate of candidates) {
    const recommended = candidate.meta.composable_with?.recommended || [];
    for (const recName of recommended) {
      const target = candidates.find((c) => c.name === recName);
      if (target && selectedNames.has(recName)) {
        target.score += WEIGHTS.composability;
      }
    }
  }
}

function removeConflicts(candidates) {
  const removed = new Set();
  const result = [];

  for (const candidate of candidates) {
    if (removed.has(candidate.name)) continue;

    result.push(candidate);

    // Mark conflicting skills for removal
    const conflicts = candidate.meta.conflicts_with || [];
    for (const conflict of conflicts) {
      removed.add(conflict);
    }
  }

  return result;
}

function fitBudget(candidates, budget) {
  const result = [];
  let remaining = budget;

  for (const candidate of candidates) {
    const cost = candidate.meta.context_budget?.minimal || 700;
    if (cost <= remaining) {
      result.push(candidate);
      remaining -= cost;
    }
  }

  return result;
}

/**
 * context-detector.js
 *
 * Scan a working directory for context signals: language, framework,
 * package manager, CI/CD, and test framework. Only scans top level
 * and one level deep — no recursive tree walks.
 */

import fs from 'fs';
import path from 'path';

// ===========================================================================
// Extension → language mapping
// ===========================================================================

const EXT_LANGUAGE_MAP = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.kt': 'kotlin',
  '.swift': 'swift',
  '.cs': 'csharp',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.rb': 'ruby',
};

// typescript supersedes javascript when both present
const LANGUAGE_PRIORITY = { typescript: 10, javascript: 9 };

// ===========================================================================
// Framework markers in package.json deps
// ===========================================================================

const PACKAGE_FRAMEWORKS = {
  react: 'react',
  next: 'next',
  vue: 'vue',
  nuxt: 'nuxt',
  angular: 'angular',
  express: 'express',
  fastify: 'fastify',
  '@nestjs/core': 'nestjs',
  svelte: 'svelte',
};

// ===========================================================================
// Lockfile → package manager
// ===========================================================================

const LOCKFILE_MAP = {
  'package-lock.json': 'npm',
  'yarn.lock': 'yarn',
  'pnpm-lock.yaml': 'pnpm',
  'bun.lock': 'bun',
  'bun.lockb': 'bun',
};

// ===========================================================================
// Test framework markers in package.json
// ===========================================================================

const TEST_FRAMEWORK_MAP = {
  vitest: 'vitest',
  jest: 'jest',
  mocha: 'mocha',
  '@playwright/test': 'playwright',
  cypress: 'cypress',
};

/**
 * Scan a working directory for context signals.
 *
 * @param {string} cwd - Directory to scan
 * @returns {{ language: string|null, frameworks: string[], packageManager: string|null, ci: string|null, testFramework: string|null }}
 */
export function detectContext(cwd) {
  const result = {
    language: null,
    frameworks: [],
    packageManager: null,
    ci: null,
    testFramework: null,
  };

  if (!fs.existsSync(cwd)) return result;

  // Collect files at level 0 and level 1
  const extCounts = {};
  const topEntries = safeReaddir(cwd);

  for (const entry of topEntries) {
    const fullPath = path.join(cwd, entry.name);

    if (entry.isFile()) {
      countExtension(entry.name, extCounts);
    } else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      // Scan one level deep
      const subEntries = safeReaddir(fullPath);
      for (const sub of subEntries) {
        if (sub.isFile()) {
          countExtension(sub.name, extCounts);
        }
      }
    }
  }

  // Detect language from extension distribution
  result.language = detectLanguage(extCounts);

  // Detect from manifest files
  detectManifestFiles(cwd, result);

  // Detect lockfile / package manager
  for (const [lockfile, pm] of Object.entries(LOCKFILE_MAP)) {
    if (fs.existsSync(path.join(cwd, lockfile))) {
      result.packageManager = pm;
      break;
    }
  }

  // Detect CI/CD
  if (fs.existsSync(path.join(cwd, '.github', 'workflows'))) {
    result.ci = 'github-actions';
  } else if (fs.existsSync(path.join(cwd, '.gitlab-ci.yml'))) {
    result.ci = 'gitlab-ci';
  } else if (fs.existsSync(path.join(cwd, 'Jenkinsfile'))) {
    result.ci = 'jenkins';
  }

  return result;
}

// ===========================================================================
// Helpers
// ===========================================================================

function safeReaddir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function countExtension(filename, counts) {
  const ext = path.extname(filename);
  if (ext && EXT_LANGUAGE_MAP[ext]) {
    const lang = EXT_LANGUAGE_MAP[ext];
    counts[lang] = (counts[lang] || 0) + 1;
  }
}

function detectLanguage(extCounts) {
  if (Object.keys(extCounts).length === 0) return null;

  // Sort by count descending, then by priority
  const sorted = Object.entries(extCounts).sort(([langA, countA], [langB, countB]) => {
    if (countB !== countA) return countB - countA;
    return (LANGUAGE_PRIORITY[langB] || 0) - (LANGUAGE_PRIORITY[langA] || 0);
  });

  const topLang = sorted[0][0];

  // typescript supersedes javascript
  if (topLang === 'javascript' && extCounts.typescript) {
    return 'typescript';
  }

  return topLang;
}

function detectManifestFiles(cwd, result) {
  // package.json — frameworks, test frameworks, language hint
  const pkgPath = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      // Frameworks
      for (const [dep, framework] of Object.entries(PACKAGE_FRAMEWORKS)) {
        if (allDeps[dep]) {
          result.frameworks.push(framework);
        }
      }

      // Test frameworks
      for (const [dep, testFw] of Object.entries(TEST_FRAMEWORK_MAP)) {
        if (allDeps[dep]) {
          result.testFramework = testFw;
          break;
        }
      }

      // Language hint from package.json presence
      if (!result.language && Object.keys(allDeps).length > 0) {
        result.language = allDeps.typescript ? 'typescript' : 'javascript';
      }
    } catch {
      // Invalid JSON — skip
    }
  }

  // go.mod
  if (fs.existsSync(path.join(cwd, 'go.mod'))) {
    result.language = result.language || 'go';
  }

  // Cargo.toml
  if (fs.existsSync(path.join(cwd, 'Cargo.toml'))) {
    result.language = result.language || 'rust';
  }

  // pyproject.toml / requirements.txt
  if (fs.existsSync(path.join(cwd, 'pyproject.toml')) || fs.existsSync(path.join(cwd, 'requirements.txt'))) {
    result.language = result.language || 'python';
  }
}

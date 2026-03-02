#!/usr/bin/env node

/**
 * run-model-matrix.js — Run the multi-model benchmark matrix.
 *
 * Reads API keys from environment, creates native fetch providers,
 * runs the model matrix, and outputs results.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... OPENAI_API_KEY=sk-... GOOGLE_AI_KEY=... \
 *     node scripts/run-model-matrix.js
 *
 * Options:
 *   --model=<id>     Run only this model (can repeat)
 *   --skill=<name>   Run only this skill (can repeat)
 *   --tiers=<t,t>    Comma-separated tiers (default: all)
 *   --runs=<n>       Runs per case for variance (default: 3)
 *   --out=<path>     Write JSON results to file
 *   --help           Show usage
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { runModelMatrix } from '../src/benchmarks/model-matrix.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');

// ============================================================================
// Default configuration
// ============================================================================

const DEFAULT_SKILLS = [
  'javascript-expert',
  'devops-sre',
  'product-manager',
  'ux-designer',
  'documentation',
];

const MODEL_DEFS = {
  'claude-sonnet-4-6': {
    provider: 'anthropic',
    envKey: 'ANTHROPIC_API_KEY',
  },
  'claude-haiku-4-5-20251001': {
    provider: 'anthropic',
    envKey: 'ANTHROPIC_API_KEY',
  },
  'gpt-4o': {
    provider: 'openai',
    envKey: 'OPENAI_API_KEY',
  },
  'gpt-4o-mini': {
    provider: 'openai',
    envKey: 'OPENAI_API_KEY',
  },
  'gemini-2.0-flash': {
    provider: 'google',
    envKey: 'GOOGLE_AI_KEY',
  },
};

// ============================================================================
// Provider factories (native fetch, no SDK dependencies)
// ============================================================================

function createAnthropicProvider(apiKey, model) {
  return async (prompt, systemPrompt) => {
    const messages = [{ role: 'user', content: prompt }];
    const body = { model, max_tokens: 1024, messages };
    if (systemPrompt) body.system = systemPrompt;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Anthropic ${model} ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data.content[0].text;
  };
}

function createOpenAIProvider(apiKey, model) {
  return async (prompt, systemPrompt) => {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, max_tokens: 1024 }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI ${model} ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  };
}

function createGoogleProvider(apiKey, model) {
  return async (prompt, systemPrompt) => {
    const contents = [{ parts: [{ text: prompt }], role: 'user' }];
    const body = { contents };
    if (systemPrompt) {
      body.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Google ${model} ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  };
}

const PROVIDER_FACTORIES = {
  anthropic: createAnthropicProvider,
  openai: createOpenAIProvider,
  google: createGoogleProvider,
};

// ============================================================================
// CLI argument parsing
// ============================================================================

function parseArgs(argv) {
  const args = {
    models: [],
    skills: [],
    tiers: null,
    runs: 3,
    out: null,
    help: false,
  };

  for (const arg of argv.slice(2)) {
    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg.startsWith('--model=')) {
      args.models.push(arg.slice('--model='.length));
    } else if (arg.startsWith('--skill=')) {
      args.skills.push(arg.slice('--skill='.length));
    } else if (arg.startsWith('--tiers=')) {
      args.tiers = arg.slice('--tiers='.length).split(',');
    } else if (arg.startsWith('--runs=')) {
      args.runs = parseInt(arg.slice('--runs='.length), 10);
    } else if (arg.startsWith('--out=')) {
      args.out = arg.slice('--out='.length);
    }
  }

  return args;
}

function printUsage() {
  console.error(`
Usage: node scripts/run-model-matrix.js [options]

Runs the model-specific benchmark matrix across multiple LLM providers.

Options:
  --model=<id>     Run only this model (can repeat). Default: all available.
  --skill=<name>   Run only this skill (can repeat). Default: ${DEFAULT_SKILLS.join(', ')}
  --tiers=<t,t>    Comma-separated tiers. Default: minimal,standard,comprehensive
  --runs=<n>       Runs per case for variance averaging. Default: 3
  --out=<path>     Write JSON results to file (also prints to stdout)
  --help           Show this message

Environment variables:
  ANTHROPIC_API_KEY   Required for Claude models
  OPENAI_API_KEY      Required for GPT models
  GOOGLE_AI_KEY       Required for Gemini models

Examples:
  # Run full matrix with all available models
  ANTHROPIC_API_KEY=sk-... OPENAI_API_KEY=sk-... node scripts/run-model-matrix.js

  # Run only Claude Sonnet
  ANTHROPIC_API_KEY=sk-... node scripts/run-model-matrix.js --model=claude-sonnet-4-6

  # Run a quick check with 1 run per case
  ANTHROPIC_API_KEY=sk-... node scripts/run-model-matrix.js --runs=1 --tiers=standard
`.trim());
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  // Build providers from available API keys
  const providers = {};
  const modelIds = args.models.length > 0 ? args.models : Object.keys(MODEL_DEFS);

  for (const modelId of modelIds) {
    const def = MODEL_DEFS[modelId];
    if (!def) {
      console.error(`Unknown model: ${modelId}. Available: ${Object.keys(MODEL_DEFS).join(', ')}`);
      process.exit(1);
    }

    const apiKey = process.env[def.envKey];
    if (!apiKey) {
      console.error(`Skipping ${modelId}: ${def.envKey} not set`);
      continue;
    }

    const factory = PROVIDER_FACTORIES[def.provider];
    providers[modelId] = factory(apiKey, modelId);
  }

  if (Object.keys(providers).length === 0) {
    console.error('\nNo API keys found. Set at least one of:');
    console.error('  ANTHROPIC_API_KEY  (for Claude models)');
    console.error('  OPENAI_API_KEY     (for GPT models)');
    console.error('  GOOGLE_AI_KEY      (for Gemini models)');
    process.exit(1);
  }

  const skillNames = args.skills.length > 0 ? args.skills : DEFAULT_SKILLS;
  const options = {
    skillsDir: SKILLS_DIR,
    runs: args.runs,
    onProgress: (completed, total) => {
      process.stderr.write(`\r  Progress: ${completed}/${total} benchmarks`);
    },
  };
  if (args.tiers) options.tiers = args.tiers;

  console.error(`\nModel Matrix Benchmark`);
  console.error(`  Models: ${Object.keys(providers).join(', ')}`);
  console.error(`  Skills: ${skillNames.join(', ')}`);
  console.error(`  Tiers: ${options.tiers ? options.tiers.join(', ') : 'minimal, standard, comprehensive'}`);
  console.error(`  Runs per case: ${args.runs}`);
  console.error('');

  const result = await runModelMatrix(skillNames, providers, options);

  process.stderr.write('\n\n');

  // Print summary table to stderr
  console.error('Summary (best tier per model):');
  console.error('  Model                          | Best Tier       | Avg Delta');
  console.error('  -------------------------------|-----------------|----------');
  for (const [modelId, summary] of Object.entries(result.summary)) {
    const model = modelId.padEnd(31);
    const tier = summary.bestTier.padEnd(15);
    const delta = summary.avgDelta.toFixed(3);
    console.error(`  ${model} | ${tier} | ${delta}`);
  }
  console.error('');

  // Output JSON
  const json = JSON.stringify(result, null, 2);

  if (args.out) {
    fs.writeFileSync(args.out, json);
    console.error(`Results written to ${args.out}`);
  } else {
    console.log(json);
  }
}

main().catch((err) => {
  console.error(`\nFatal error: ${err.message}`);
  process.exit(1);
});

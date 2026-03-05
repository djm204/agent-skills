/**
 * Tests for the `serve` subcommand on the CLI.
 *
 * `agent-skills serve <skill-name>` starts an MCP server for the specified skill.
 *
 * These tests verify argument parsing and validation only — they do NOT
 * actually connect the stdio transport (that would block the test process).
 */

import { describe, it, expect } from 'vitest';
import { run } from './index.js';

describe('serve subcommand — argument parsing', () => {
  it('errors when no skill name is provided', async () => {
    await expect(run(['serve', '--skill-dir=skills'])).rejects.toThrow(
      /serve.*requires.*skill|usage.*serve/i,
    );
  });

  it('errors when skill has no tools', async () => {
    // javascript-expert has prompts but no tools/ directory
    await expect(
      run(['serve', 'javascript-expert', '--skill-dir=skills', '--dry-run']),
    ).rejects.toThrow(/no tools/i);
  });

  it('errors for nonexistent skill', async () => {
    await expect(
      run(['serve', 'nonexistent-skill', '--skill-dir=skills', '--dry-run']),
    ).rejects.toThrow(/not found/i);
  });

  it('succeeds in dry-run mode for a skill with tools', async () => {
    const result = await run([
      'serve',
      'research-assistant',
      '--skill-dir=skills',
      '--dry-run',
    ]);
    expect(result).toHaveProperty('skill');
    expect(result.skill).toBe('research-assistant');
    expect(result).toHaveProperty('tools');
    expect(result.tools).toBeGreaterThan(0);
  });

  it('accepts --tier flag', async () => {
    const result = await run([
      'serve',
      'research-assistant',
      '--skill-dir=skills',
      '--tier=minimal',
      '--dry-run',
    ]);
    expect(result.tier).toBe('minimal');
  });

  it('accepts --handler-dir flag', async () => {
    const result = await run([
      'serve',
      'research-assistant',
      '--skill-dir=skills',
      '--handler-dir=./test-handlers',
      '--dry-run',
    ]);
    expect(result.handlerDir).toBe('./test-handlers');
  });

  it('resolves skill aliases (e.g. "research" -> "research-assistant")', async () => {
    const result = await run([
      'serve',
      'research',
      '--skill-dir=skills',
      '--dry-run',
    ]);
    expect(result.skill).toBe('research-assistant');
  });
});

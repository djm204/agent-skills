import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { detectContext } from './context-detector.js';

describe('detectContext', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ctx-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // ===========================================================================
  // Language detection
  // ===========================================================================

  it('detects JavaScript/TypeScript from file extensions', () => {
    fs.writeFileSync(path.join(tmpDir, 'index.ts'), '');
    fs.writeFileSync(path.join(tmpDir, 'utils.ts'), '');
    fs.writeFileSync(path.join(tmpDir, 'app.tsx'), '');

    const ctx = detectContext(tmpDir);
    expect(ctx.language).toBe('typescript');
  });

  it('detects Python from file extensions', () => {
    fs.writeFileSync(path.join(tmpDir, 'main.py'), '');
    fs.writeFileSync(path.join(tmpDir, 'utils.py'), '');

    const ctx = detectContext(tmpDir);
    expect(ctx.language).toBe('python');
  });

  it('detects Go from file extensions', () => {
    fs.writeFileSync(path.join(tmpDir, 'main.go'), '');
    fs.writeFileSync(path.join(tmpDir, 'handler.go'), '');

    const ctx = detectContext(tmpDir);
    expect(ctx.language).toBe('go');
  });

  it('detects Rust from file extensions', () => {
    fs.writeFileSync(path.join(tmpDir, 'main.rs'), '');
    fs.writeFileSync(path.join(tmpDir, 'lib.rs'), '');

    const ctx = detectContext(tmpDir);
    expect(ctx.language).toBe('rust');
  });

  // ===========================================================================
  // Framework detection
  // ===========================================================================

  it('detects React from package.json dependencies', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ dependencies: { react: '^18.0.0' } })
    );

    const ctx = detectContext(tmpDir);
    expect(ctx.frameworks).toContain('react');
  });

  it('detects Next.js from package.json', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ dependencies: { next: '^14.0.0', react: '^18.0.0' } })
    );

    const ctx = detectContext(tmpDir);
    expect(ctx.frameworks).toContain('next');
    expect(ctx.frameworks).toContain('react');
  });

  it('detects Express from package.json', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ dependencies: { express: '^4.0.0' } })
    );

    const ctx = detectContext(tmpDir);
    expect(ctx.frameworks).toContain('express');
  });

  it('detects Go from go.mod', () => {
    fs.writeFileSync(path.join(tmpDir, 'go.mod'), 'module example.com/app\n\ngo 1.21\n');

    const ctx = detectContext(tmpDir);
    expect(ctx.language).toBe('go');
  });

  it('detects Rust from Cargo.toml', () => {
    fs.writeFileSync(path.join(tmpDir, 'Cargo.toml'), '[package]\nname = "app"\nversion = "0.1.0"\n');

    const ctx = detectContext(tmpDir);
    expect(ctx.language).toBe('rust');
  });

  it('detects Python from pyproject.toml', () => {
    fs.writeFileSync(path.join(tmpDir, 'pyproject.toml'), '[project]\nname = "app"\n');

    const ctx = detectContext(tmpDir);
    expect(ctx.language).toBe('python');
  });

  // ===========================================================================
  // Package manager detection
  // ===========================================================================

  it('detects npm from package-lock.json', () => {
    fs.writeFileSync(path.join(tmpDir, 'package-lock.json'), '{}');

    const ctx = detectContext(tmpDir);
    expect(ctx.packageManager).toBe('npm');
  });

  it('detects pnpm from pnpm-lock.yaml', () => {
    fs.writeFileSync(path.join(tmpDir, 'pnpm-lock.yaml'), '');

    const ctx = detectContext(tmpDir);
    expect(ctx.packageManager).toBe('pnpm');
  });

  it('detects bun from bun.lock', () => {
    fs.writeFileSync(path.join(tmpDir, 'bun.lock'), '');

    const ctx = detectContext(tmpDir);
    expect(ctx.packageManager).toBe('bun');
  });

  // ===========================================================================
  // CI/CD detection
  // ===========================================================================

  it('detects GitHub Actions', () => {
    fs.mkdirSync(path.join(tmpDir, '.github', 'workflows'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.github', 'workflows', 'ci.yml'), '');

    const ctx = detectContext(tmpDir);
    expect(ctx.ci).toBe('github-actions');
  });

  // ===========================================================================
  // Test framework detection
  // ===========================================================================

  it('detects vitest from package.json devDependencies', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ devDependencies: { vitest: '^1.0.0' } })
    );

    const ctx = detectContext(tmpDir);
    expect(ctx.testFramework).toBe('vitest');
  });

  it('detects jest from package.json', () => {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ devDependencies: { jest: '^29.0.0' } })
    );

    const ctx = detectContext(tmpDir);
    expect(ctx.testFramework).toBe('jest');
  });

  // ===========================================================================
  // Edge cases
  // ===========================================================================

  it('returns empty context for empty directory', () => {
    const ctx = detectContext(tmpDir);
    expect(ctx.language).toBeNull();
    expect(ctx.frameworks).toEqual([]);
    expect(ctx.packageManager).toBeNull();
  });

  it('returns empty context for nonexistent directory', () => {
    const ctx = detectContext(path.join(tmpDir, 'nonexistent'));
    expect(ctx.language).toBeNull();
    expect(ctx.frameworks).toEqual([]);
  });

  it('scans one level deep for file extensions', () => {
    fs.mkdirSync(path.join(tmpDir, 'src'));
    fs.writeFileSync(path.join(tmpDir, 'src', 'index.ts'), '');
    fs.writeFileSync(path.join(tmpDir, 'src', 'app.ts'), '');

    const ctx = detectContext(tmpDir);
    expect(ctx.language).toBe('typescript');
  });

  it('does not scan deeper than one level', () => {
    fs.mkdirSync(path.join(tmpDir, 'src', 'deep', 'nested'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, 'src', 'deep', 'nested', 'file.py'), '');

    const ctx = detectContext(tmpDir);
    // No files at level 0 or 1, so no language detected
    expect(ctx.language).toBeNull();
  });
});

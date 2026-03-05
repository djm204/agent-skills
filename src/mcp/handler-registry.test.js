import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { HandlerRegistry } from './handler-registry.js';

const TOOL_DEF = {
  name: 'test_tool',
  description: 'A test tool',
  when_to_use: 'Testing',
  returns: { type: 'string' },
};

describe('HandlerRegistry', () => {
  it('creates an empty registry', () => {
    const registry = new HandlerRegistry();
    expect(registry).toBeDefined();
  });

  it('registerBuiltin stores a handler', () => {
    const registry = new HandlerRegistry();
    const fn = async () => ({ content: [{ type: 'text', text: 'ok' }] });
    registry.registerBuiltin('test_tool', fn);
    const resolved = registry.resolve('test_tool', TOOL_DEF);
    expect(resolved).toBe(fn);
  });

  it('registerUser stores a user handler', () => {
    const registry = new HandlerRegistry();
    const fn = async () => ({ content: [{ type: 'text', text: 'user' }] });
    registry.registerUser('test_tool', fn);
    const resolved = registry.resolve('test_tool', TOOL_DEF);
    expect(resolved).toBe(fn);
  });

  it('resolve returns built-in over user handler', () => {
    const registry = new HandlerRegistry();
    const builtinFn = async () => ({ content: [{ type: 'text', text: 'builtin' }] });
    const userFn = async () => ({ content: [{ type: 'text', text: 'user' }] });
    registry.registerBuiltin('test_tool', builtinFn);
    registry.registerUser('test_tool', userFn);
    expect(registry.resolve('test_tool', TOOL_DEF)).toBe(builtinFn);
  });

  it('resolve returns user handler when no built-in exists', () => {
    const registry = new HandlerRegistry();
    const userFn = async () => ({ content: [{ type: 'text', text: 'user' }] });
    registry.registerUser('test_tool', userFn);
    expect(registry.resolve('test_tool', TOOL_DEF)).toBe(userFn);
  });

  it('resolve returns a stub handler when neither built-in nor user exists', async () => {
    const registry = new HandlerRegistry();
    const handler = registry.resolve('test_tool', TOOL_DEF);
    expect(typeof handler).toBe('function');
    const result = await handler({});
    const body = JSON.parse(result.content[0].text);
    expect(body.status).toBe('not_implemented');
    expect(body.tool).toBe('test_tool');
  });
});

describe('HandlerRegistry.loadHandlersFromDir', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'handler-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('loads .js files as user handlers keyed by filename', async () => {
    const handlerCode = `export default async (params) => ({
      content: [{ type: 'text', text: 'custom handler' }],
    });`;
    fs.writeFileSync(path.join(tmpDir, 'my_tool.js'), handlerCode);

    const registry = new HandlerRegistry();
    await registry.loadHandlersFromDir(tmpDir);

    const handler = registry.resolve('my_tool', { name: 'my_tool', description: 'test' });
    const result = await handler({});
    expect(result.content[0].text).toBe('custom handler');
  });

  it('ignores non-JS files', async () => {
    fs.writeFileSync(path.join(tmpDir, 'notes.txt'), 'not a handler');
    fs.writeFileSync(path.join(tmpDir, 'data.json'), '{}');

    const registry = new HandlerRegistry();
    await registry.loadHandlersFromDir(tmpDir);

    // Should fall through to stub
    const handler = registry.resolve('notes', { name: 'notes', description: 'test' });
    const result = await handler({});
    const body = JSON.parse(result.content[0].text);
    expect(body.status).toBe('not_implemented');
  });

  it('does not throw for non-existent directory', async () => {
    const registry = new HandlerRegistry();
    await expect(registry.loadHandlersFromDir('/nonexistent/path')).resolves.not.toThrow();
  });
});

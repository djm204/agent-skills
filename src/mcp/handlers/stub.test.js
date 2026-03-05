import { describe, it, expect } from 'vitest';
import { createStubHandler } from './stub.js';

const TOOL_DEF = {
  name: 'web_search',
  description: 'Search the web for information',
  when_to_use: 'When the user asks about current events',
  parameters: {
    query: { type: 'string', required: true },
  },
  returns: { type: 'array' },
};

describe('createStubHandler', () => {
  it('returns an async function', () => {
    const handler = createStubHandler(TOOL_DEF);
    expect(typeof handler).toBe('function');
  });

  it('resolves to MCP content response shape', async () => {
    const handler = createStubHandler(TOOL_DEF);
    const result = await handler({ query: 'test' });
    expect(result).toHaveProperty('content');
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty('type', 'text');
    expect(result.content[0]).toHaveProperty('text');
  });

  it('response contains structured JSON with status and tool name', async () => {
    const handler = createStubHandler(TOOL_DEF);
    const result = await handler({ query: 'test' });
    const body = JSON.parse(result.content[0].text);
    expect(body.status).toBe('not_implemented');
    expect(body.tool).toBe('web_search');
  });

  it('response includes tool description and when_to_use', async () => {
    const handler = createStubHandler(TOOL_DEF);
    const result = await handler({});
    const body = JSON.parse(result.content[0].text);
    expect(body.message).toContain('web_search');
    expect(body.message).toContain('Search the web for information');
    expect(body.when_to_use).toBe('When the user asks about current events');
  });

  it('echoes received parameters in response', async () => {
    const handler = createStubHandler(TOOL_DEF);
    const result = await handler({ query: 'hello world' });
    const body = JSON.parse(result.content[0].text);
    expect(body.received_parameters).toEqual({ query: 'hello world' });
  });

  it('includes expected_return from tool definition', async () => {
    const handler = createStubHandler(TOOL_DEF);
    const result = await handler({});
    const body = JSON.parse(result.content[0].text);
    expect(body.expected_return).toEqual({ type: 'array' });
  });

  it('never throws — returns response for any input', async () => {
    const handler = createStubHandler(TOOL_DEF);
    const result = await handler(undefined);
    expect(result.content[0].type).toBe('text');
  });

  it('handles tool with no when_to_use', async () => {
    const handler = createStubHandler({ name: 'foo', description: 'bar' });
    const result = await handler({});
    const body = JSON.parse(result.content[0].text);
    expect(body.when_to_use).toBeNull();
    expect(body.expected_return).toBeNull();
  });
});

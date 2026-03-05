import { describe, it, expect, vi } from 'vitest';
import { createMcpServer } from './server.js';

// ============================================================================
// Fixtures
// ============================================================================

function makeSkillPack(overrides = {}) {
  return {
    name: 'test-skill',
    version: '1.0.0',
    category: 'engineering',
    tags: ['testing'],
    description: { short: 'Test skill', long: 'A test skill.' },
    context_budget: { minimal: 700, standard: 2800, comprehensive: 7500 },
    composable_with: {},
    conflicts_with: [],
    requires_tools: false,
    requires_memory: false,
    mcp_server: null,
    prompts: {
      minimal: '# Test (Minimal)\nCore rules.',
      standard: '# Test (Standard)\nFull guidance.',
      comprehensive: '# Test (Comprehensive)\nWith examples.',
    },
    systemPrompt: '# Test (Standard)\nFull guidance.',
    tierUsed: 'standard',
    tools: [],
    output_schemas: [],
    ...overrides,
  };
}

const SAMPLE_TOOLS = [
  {
    name: 'web_search',
    description: 'Search the web',
    when_to_use: 'When looking for information',
    parameters: {
      query: { type: 'string', description: 'Search query', required: true },
      max_results: { type: 'integer', description: 'Max results', default: 10 },
    },
    returns: { type: 'array' },
  },
  {
    name: 'fetch_document',
    description: 'Fetch a document from a URL',
    parameters: {
      url: { type: 'string', description: 'Document URL', required: true },
    },
    returns: { type: 'object' },
  },
];

// ============================================================================
// createMcpServer
// ============================================================================

describe('createMcpServer', () => {
  it('returns an object with a server property', async () => {
    const skillPack = makeSkillPack();
    const result = await createMcpServer(skillPack);
    expect(result).toHaveProperty('server');
    expect(result.server).toBeDefined();
  });

  it('registers tools from skillPack.tools', async () => {
    const skillPack = makeSkillPack({ tools: SAMPLE_TOOLS });
    const result = await createMcpServer(skillPack);
    // Access internal registered tools on the underlying McpServer
    expect(result.server._registeredTools).toHaveProperty('web_search');
    expect(result.server._registeredTools).toHaveProperty('fetch_document');
  });

  it('tool descriptions match YAML definitions', async () => {
    const skillPack = makeSkillPack({ tools: SAMPLE_TOOLS });
    const result = await createMcpServer(skillPack);
    expect(result.server._registeredTools.web_search.description).toBe('Search the web');
    expect(result.server._registeredTools.fetch_document.description).toBe('Fetch a document from a URL');
  });

  it('registers zero tools when skill has no tools', async () => {
    const skillPack = makeSkillPack({ tools: [] });
    const result = await createMcpServer(skillPack);
    expect(Object.keys(result.server._registeredTools)).toHaveLength(0);
  });

  it('registers prompt resources for each tier', async () => {
    const skillPack = makeSkillPack();
    const result = await createMcpServer(skillPack);
    // Resources keyed by URI
    const resourceUris = Object.keys(result.server._registeredResources);
    expect(resourceUris).toContain('skill://test-skill/prompt/minimal');
    expect(resourceUris).toContain('skill://test-skill/prompt/standard');
    expect(resourceUris).toContain('skill://test-skill/prompt/comprehensive');
  });

  it('prompt resource content matches skill prompts', async () => {
    const skillPack = makeSkillPack();
    const result = await createMcpServer(skillPack);
    const resource = result.server._registeredResources['skill://test-skill/prompt/standard'];
    const readResult = await resource.readCallback(new URL('skill://test-skill/prompt/standard'));
    expect(readResult.contents[0].text).toBe('# Test (Standard)\nFull guidance.');
    expect(readResult.contents[0].mimeType).toBe('text/markdown');
  });

  it('skips tiers with no prompt content', async () => {
    const skillPack = makeSkillPack({
      prompts: { minimal: 'Minimal only.', standard: null, comprehensive: undefined },
    });
    const result = await createMcpServer(skillPack);
    const uris = Object.keys(result.server._registeredResources);
    expect(uris).toContain('skill://test-skill/prompt/minimal');
    expect(uris).not.toContain('skill://test-skill/prompt/standard');
    expect(uris).not.toContain('skill://test-skill/prompt/comprehensive');
  });

  it('uses built-in handlers when provided', async () => {
    const builtinResult = { content: [{ type: 'text', text: 'builtin response' }] };
    const builtinHandler = vi.fn().mockResolvedValue(builtinResult);

    const skillPack = makeSkillPack({ tools: [SAMPLE_TOOLS[0]] });
    const result = await createMcpServer(skillPack, {
      builtinHandlers: { web_search: builtinHandler },
    });

    // Call the registered tool handler
    const tool = result.server._registeredTools.web_search;
    const callResult = await tool.handler({ query: 'test' });
    expect(builtinHandler).toHaveBeenCalledWith({ query: 'test' });
    expect(callResult).toBe(builtinResult);
  });

  it('falls back to stub when no handler provided', async () => {
    const skillPack = makeSkillPack({ tools: [SAMPLE_TOOLS[0]] });
    const result = await createMcpServer(skillPack);

    const tool = result.server._registeredTools.web_search;
    const callResult = await tool.handler({ query: 'test' });
    const body = JSON.parse(callResult.content[0].text);
    expect(body.status).toBe('not_implemented');
    expect(body.tool).toBe('web_search');
  });

  it('does not use console.log (all logging via stderr)', async () => {
    const logSpy = vi.spyOn(console, 'log');
    const skillPack = makeSkillPack({ tools: SAMPLE_TOOLS });
    await createMcpServer(skillPack);
    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});

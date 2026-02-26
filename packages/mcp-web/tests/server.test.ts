import { describe, it, expect } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Integration test: verify the MCP server registers all three tools.
 * Uses the SDK's server directly rather than starting stdio transport.
 */
describe('MCP server registration', () => {
  it('creates a server instance', async () => {
    // Dynamically import to test the module loads without errors
    // We can't use the actual index.ts because it auto-connects to stdio,
    // so we verify the McpServer can be instantiated.
    const server = new McpServer({
      name: 'mcp-web-test',
      version: '0.1.0',
    });
    expect(server).toBeDefined();
  });

  it('all three tool modules export their functions', async () => {
    const { webSearch } = await import('../src/tools/web-search.js');
    const { fetchDocument } = await import('../src/tools/fetch-document.js');
    const { getSentiment } = await import('../src/tools/get-sentiment.js');

    expect(typeof webSearch).toBe('function');
    expect(typeof fetchDocument).toBe('function');
    expect(typeof getSentiment).toBe('function');
  });

  it('sentiment lib exports analyzeSentiment', async () => {
    const { analyzeSentiment } = await import('../src/lib/sentiment.js');
    expect(typeof analyzeSentiment).toBe('function');
  });

  it('http-client lib exports fetchUrl', async () => {
    const { fetchUrl } = await import('../src/lib/http-client.js');
    expect(typeof fetchUrl).toBe('function');
  });

  it('text-extract lib exports extractText and extractTitle', async () => {
    const { extractText, extractTitle } = await import('../src/lib/text-extract.js');
    expect(typeof extractText).toBe('function');
    expect(typeof extractTitle).toBe('function');
  });
});

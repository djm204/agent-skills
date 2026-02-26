#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { webSearch } from './tools/web-search.js';
import { fetchDocument } from './tools/fetch-document.js';
import { getSentiment } from './tools/get-sentiment.js';

const server = new McpServer({
  name: 'mcp-web',
  version: '0.1.0',
});

// web_search tool
server.tool(
  'web_search',
  'Search the web for current information on a topic',
  {
    query: z.string().describe('The search query'),
    max_results: z.number().int().optional().default(10).describe('Maximum number of results to return'),
  },
  async ({ query, max_results }) => {
    const results = await webSearch(query, max_results);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(results, null, 2) }],
    };
  },
);

// fetch_document tool
server.tool(
  'fetch_document',
  'Retrieve and extract the full text content of a URL or document',
  {
    url: z.string().url().describe('The URL of the document to retrieve'),
  },
  async ({ url }) => {
    const result = await fetchDocument(url);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  },
);

// get_sentiment tool
server.tool(
  'get_sentiment',
  'Analyze sentiment and opinion signals for a company or topic',
  {
    subject: z.string().describe('The company name, ticker, product, or topic to analyze'),
    max_sources: z.number().int().optional().default(5).describe('Number of sources to analyze'),
  },
  async ({ subject, max_sources }) => {
    const result = await getSentiment(subject, max_sources);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('MCP server error:', error);
  process.exit(1);
});

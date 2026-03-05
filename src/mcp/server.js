/**
 * server.js
 *
 * MCP server factory for agent-skills.
 * Creates an McpServer that exposes a skill's tools and prompts
 * via the Model Context Protocol.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { convertParametersToZod } from './schema-converter.js';
import { HandlerRegistry } from './handler-registry.js';

/**
 * Create an MCP server for a skill pack.
 *
 * @param {object} skillPack - Loaded skill pack from skill-loader
 * @param {object} [options]
 * @param {string} [options.handlerDir] - Directory of custom handler .js files
 * @param {Record<string, Function>} [options.builtinHandlers] - Built-in handler functions keyed by tool name
 * @returns {Promise<{ server: McpServer }>}
 */
export async function createMcpServer(skillPack, options = {}) {
  const { handlerDir = null, builtinHandlers = {} } = options;

  const server = new McpServer({
    name: `agent-skills:${skillPack.name}`,
    version: skillPack.version,
  });

  // Build handler registry
  const registry = new HandlerRegistry();
  for (const [name, fn] of Object.entries(builtinHandlers)) {
    registry.registerBuiltin(name, fn);
  }
  if (handlerDir) {
    await registry.loadHandlersFromDir(handlerDir);
  }

  // Register tools
  for (const toolDef of skillPack.tools) {
    const schema = convertParametersToZod(toolDef.parameters);
    const handler = registry.resolve(toolDef.name, toolDef);
    server.tool(toolDef.name, toolDef.description || '', schema, handler);
  }

  // Register prompt resources for each available tier
  for (const [tier, content] of Object.entries(skillPack.prompts)) {
    if (!content) continue;
    const uri = `skill://${skillPack.name}/prompt/${tier}`;
    server.resource(`skill-prompt-${skillPack.name}-${tier}`, uri, async () => ({
      contents: [
        {
          uri,
          mimeType: 'text/markdown',
          text: content,
        },
      ],
    }));
  }

  return { server };
}

/**
 * Start an MCP server using stdio transport.
 * Call this only from CLI entry points — it takes over stdin/stdout.
 *
 * @param {{ server: McpServer }} serverResult - Result from createMcpServer
 * @returns {Promise<StdioServerTransport>}
 */
export async function startServer(serverResult) {
  const transport = new StdioServerTransport();
  await serverResult.server.connect(transport);
  return transport;
}

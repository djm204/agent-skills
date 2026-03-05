#!/usr/bin/env node

/**
 * Standalone MCP server entry point.
 *
 * Usage (by MCP clients):
 *   npx @djm204/agent-skills-serve <skill-name> [--skill-dir=...] [--tier=...] [--handler-dir=...]
 *
 * This wraps `agent-skills serve <skill-name>` for direct invocation
 * from MCP configuration files (.cursor/mcp.json, .claude/settings.json).
 */

import { run } from '../src/index.js';

run(['serve', ...process.argv.slice(2)]).catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});

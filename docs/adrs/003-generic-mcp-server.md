# ADR-003: Generic MCP Server for Skill Tool Execution

**Status:** Accepted
**Date:** 2026-03-04
**Deciders:** @djm204

## Context

The project defines 41 tool schemas across 13 skills in `tools/*.yaml` files. These schemas describe what each tool accepts and returns, but nothing actually serves them. The adapters emit MCP configuration pointing to external packages (e.g., `@djm204/mcp-web`), but only one such package exists and it covers just 3 tools. This creates the biggest gap between what the project promises ("agent skills framework") and what it delivers ("prompt packs with aspirational tool schemas").

MCP (Model Context Protocol) is the emerging standard for tool integration with AI agents. Skills that define tool schemas but can't serve them over MCP are incomplete — they're interface contracts without implementations.

## Decision

Build a generic, in-repo MCP server that dynamically loads any skill's tools and makes them callable via the MCP protocol. The server lives in `src/mcp/` and follows a handler plugin pattern.

### Architecture

```
src/mcp/
├── server.js              # McpServer factory (createMcpServer + startServer)
├── schema-converter.js    # YAML tool params → Zod schemas for MCP SDK
├── handler-registry.js    # Priority-based handler resolution
└── handlers/
    └── stub.js            # Auto-generated "not implemented" responses
```

### Handler Priority

When a tool is called, the registry resolves the handler with this priority:

1. **Built-in handlers** — registered programmatically via `builtinHandlers` option
2. **User-provided handlers** — loaded from `--handler-dir` directory (`.js` files with default export)
3. **Stub handlers** — auto-generated responses with structured "not implemented" JSON

This means every tool is callable immediately (via stubs), and implementations can be added incrementally without modifying the server.

### Key Decisions

1. **Location: inside this repo** — Not a separate package. The server is part of `@djm204/agent-skills` and ships with it. This avoids the "41 schemas, 0 servers" problem by making every skill with tools immediately servable.

2. **Language: pure JavaScript ESM** — Matches the rest of the codebase. No TypeScript, no build step. Zod for schema validation (already a transitive dependency via `@modelcontextprotocol/sdk`).

3. **Single generic server, not per-skill servers** — One `createMcpServer(skillPack)` function handles any skill. The server name includes the skill (`agent-skills:<skillName>`) for identification.

4. **Skill manifests use `mcp_server: built-in`** — All 13 skills with tools get `mcp_server: built-in` in their `skill.yaml`. Adapters detect this value and emit `npx @djm204/agent-skills-serve <skill-name>` instead of external package references.

5. **Skill prompts as MCP resources** — In addition to tools, the server exposes skill prompts as MCP resources at `skill://<name>/prompt/<tier>`, making them accessible to MCP-aware agents.

### CLI Integration

```bash
# Via the main CLI
npx @djm204/agent-skills serve research-assistant
npx @djm204/agent-skills serve research-assistant --handler-dir=./my-handlers

# Via standalone entry point (for MCP client config)
npx @djm204/agent-skills-serve research-assistant
```

## Consequences

### Positive

- Every skill with tools is immediately MCP-servable — closes the biggest gap in the project
- Stub handlers mean tools are callable on day one; real implementations come incrementally
- Handler plugin pattern lets users provide their own tool implementations without forking
- Adapters now emit working MCP config instead of pointing to nonexistent packages
- The project can honestly say it's an "agent skills framework" with working tool integration

### Negative

- Adds `@modelcontextprotocol/sdk` and `zod` as production dependencies (~200KB)
- Stub handlers return "not implemented" — users may be confused by tools that don't do anything useful yet
- The generic server can't know what tools actually do; real implementations require domain-specific code

### Neutral

- External MCP packages (like `@djm204/mcp-web`) can still be used by setting `mcp_server` to the package name instead of `built-in`
- The public API gains `createMcpServer()` for programmatic use
- No breaking changes to existing CLI commands or adapter outputs

## Alternatives Considered

1. **One MCP package per skill** — Too much maintenance overhead. 13 separate npm packages for stubs is unjustifiable.
2. **External-only MCP servers** — Status quo. Only `@djm204/mcp-web` exists; 10 of 13 skills with tools have no MCP server at all.
3. **LLM-powered tool handlers** — Use an LLM to simulate tool responses. Rejected: adds API costs, latency, and unpredictability. Stub handlers are honest about what's implemented.
4. **TypeScript implementation** — Would require a build step. The rest of the codebase is JS ESM; consistency wins.

# @djm204/agent-skills

[![npm version](https://img.shields.io/npm/v/@djm204/agent-skills.svg)](https://www.npmjs.com/package/@djm204/agent-skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Compatible with:**

![Cursor](https://img.shields.io/badge/Cursor_IDE-black?style=flat&logo=cursor)
![Claude Code](https://img.shields.io/badge/Claude_Code-cc785c?style=flat&logo=anthropic)
![Gemini CLI](https://img.shields.io/badge/Gemini_CLI-4285F4?style=flat&logo=google)
![GitHub Copilot](https://img.shields.io/badge/GitHub_Copilot-000?style=flat&logo=githubcopilot)
![OpenAI Codex](https://img.shields.io/badge/OpenAI_Codex-412991?style=flat&logo=openai)
![Windsurf](https://img.shields.io/badge/Windsurf-0B6FBF?style=flat)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat)
![OpenAI Agents](https://img.shields.io/badge/OpenAI_Agents-412991?style=flat)

**44 curated prompt packs** that encode principal-level domain expertise for AI coding assistants. Install into Cursor, Claude Code, Gemini CLI, GitHub Copilot, or OpenAI Codex — or compose into LangChain, CrewAI, and OpenAI Agents SDK pipelines via adapter templates.

> **Disclaimer:** This project is provided for **educational and experimental purposes only**. The author takes no responsibility for any actions, outputs, or consequences resulting from an LLM or AI assistant following these rules. Use at your own risk. Always review AI-generated code before deploying to production.

## What This Is

- **Tiered behavioral prompts** — each skill has 3 standalone tiers (minimal ~700 tokens, standard ~2,800, comprehensive ~7,500) encoding *how to think* about a domain, not just what to do
- **A CLI installer** — copies rule files to the right locations for Cursor, Claude Code, Gemini CLI, GitHub Copilot, and OpenAI Codex, with smart merging and conflict detection
- **Adapter templates** — reformats prompts into framework-specific boilerplate for LangChain, CrewAI, and OpenAI Agents SDK
- **MCP servers** — 13 skills define tool schemas that can be served over MCP, making them callable by any MCP-compatible agent

### What This Isn't (Yet)

- **Not runtime agents** — skills are static prompts injected into context windows, not executable code
- **Not deep framework integrations** — adapters produce formatted strings and code scaffolds, not framework plugins

## Installation

No installation required. Run directly with `npx`:

```bash
npx @djm204/agent-skills [skill-name]
```

Or install globally:

```bash
npm install -g @djm204/agent-skills
agent-skills [skill-name]
```

## How to Use

### Install into Your IDE

Navigate to your project directory and run:

```bash
npx @djm204/agent-skills web-frontend
```

This installs rule files for all supported IDEs (Cursor, Claude Code, Gemini CLI, GitHub Copilot, OpenAI Codex):

- **`CLAUDE.md`** — Development guide for Claude Code and Cursor with Claude
- **`GEMINI.md`** — Development guide for Gemini CLI
- **`AGENTS.md`** — Development guide for OpenAI Codex
- **`.cursor/rules/`** — Rule files for Cursor IDE (`.mdc` format)
- **`.github/copilot-instructions.md`** — Instructions for GitHub Copilot

### Install Multiple Skills

Combine skills for projects that span multiple domains:

```bash
npx @djm204/agent-skills web-frontend web-backend
```

### List All Available Skills

```bash
npx @djm204/agent-skills --list
```

### Preview Before Installing (Dry Run)

See what files will be created without making changes:

```bash
npx @djm204/agent-skills web-frontend --dry-run
```

### Update to Latest Rules

Re-run with `@latest` to get updated skills:

```bash
npx @djm204/agent-skills@latest web-frontend
```

### Install for Specific IDE

By default, skills install for all supported IDEs. Use `--ide` to target specific tools:

```bash
# Install only for Cursor IDE
npx @djm204/agent-skills web-frontend --ide=cursor

# Install only for Claude Code
npx @djm204/agent-skills web-frontend --ide=claude

# Install only for GitHub Copilot
npx @djm204/agent-skills web-frontend --ide=codex

# Install for multiple IDEs
npx @djm204/agent-skills web-frontend --ide=cursor --ide=codex
```

### Remove Specific Skills

```bash
# Remove a single skill
npx @djm204/agent-skills --remove web-frontend

# Remove multiple skills
npx @djm204/agent-skills --remove web-frontend web-backend

# Remove from specific IDE only
npx @djm204/agent-skills --remove web-frontend --ide=cursor

# Skip confirmation prompt
npx @djm204/agent-skills --remove web-frontend --yes
```

### Reset (Remove Everything)

```bash
npx @djm204/agent-skills --reset
npx @djm204/agent-skills --reset --ide=cursor
npx @djm204/agent-skills --reset --yes
npx @djm204/agent-skills --reset --force
```

---

## Skill Pack Adapter Mode

Skills can also be composed into AI agent frameworks using the `--adapter` flag. This outputs a prompt file optimized for the target framework instead of installing IDE rule files.

```bash
npx @djm204/agent-skills <skill-name> --adapter=<adapter> [--tier=<tier>] [--out=<dir>]
```

### Adapters

| Adapter | Output | Use With |
|---------|--------|----------|
| `raw` | Plain markdown prompt | Any LLM, testing |
| `cursor` | `.cursor/rules/` MDC files | Cursor IDE |
| `claude-code` | `CLAUDE.md` section | Claude Code |
| `gemini` | `GEMINI.md` section | Gemini CLI |
| `copilot` | `.github/copilot-instructions.md` section | GitHub Copilot |
| `codex` | `AGENTS.md` + `.agents/skills/<name>/SKILL.md` | OpenAI Codex |
| `openai-agents` | Python `Agent(instructions=...)` snippet | OpenAI Agents SDK |
| `langchain` | Python `SystemMessagePromptTemplate` | LangChain |
| `crewai` | Python `Agent(backstory=..., goal=...)` | CrewAI |

> **Note:** Adapters produce formatted prompt strings and code scaffolds — not runtime framework plugins. Tool definitions in skill packs (`tools/*.yaml`) are interface contracts that describe what a tool would accept and return. Your application provides the implementation.

### Prompt Tiers

Each skill has three standalone prompt tiers. Choose the tier that fits your context budget:

| Tier | Approx. Tokens | Content |
|------|---------------|---------|
| `minimal` | ~700 | Core behavioral rules and anti-patterns only |
| `standard` | ~2,800 | Principles, patterns, and decision frameworks (default) |
| `comprehensive` | ~7,500 | Full reference with code examples and tables |

### Examples

```bash
# Get a raw markdown prompt for use in any LLM
npx @djm204/agent-skills golang-expert --adapter=raw

# Generate a LangChain agent with minimal token usage
npx @djm204/agent-skills python-expert --adapter=langchain --tier=minimal

# Generate a CrewAI agent config and write to ./agents/
npx @djm204/agent-skills strategic-negotiator --adapter=crewai --out=./agents

# Generate an OpenAI Agents SDK snippet
npx @djm204/agent-skills devops-sre --adapter=openai-agents --tier=standard

# Compose multiple skills together (comma-separated)
npx @djm204/agent-skills fullstack,testing --adapter=claude-code --tier=comprehensive
```

### Preview Test Cases

Each skill includes behavioral test cases. Use `--test` to see them without calling an LLM:

```bash
npx @djm204/agent-skills --test strategic-negotiator
npx @djm204/agent-skills --test golang-expert
```

---

## MCP Server Mode

Skills with tool definitions can be served as MCP (Model Context Protocol) servers, making their tools callable by any MCP-compatible agent.

```bash
# Start an MCP server for a skill
npx @djm204/agent-skills serve research-assistant

# With custom tool handler implementations
npx @djm204/agent-skills serve research-assistant --handler-dir=./my-handlers

# With a specific prompt tier
npx @djm204/agent-skills serve research-assistant --tier=comprehensive
```

### How It Works

1. The server loads the skill's tool definitions from `tools/*.yaml`
2. Each tool is registered with the MCP SDK using Zod-validated schemas
3. Tool handlers are resolved by priority: **built-in > user-provided > stub**
4. Skill prompts are exposed as MCP resources at `skill://<name>/prompt/<tier>`

Tools without a real implementation return structured "not implemented" responses describing what the tool expects and returns — useful for development and testing.

### MCP Client Configuration

Adapters automatically emit the correct MCP config. For example, after `npx @djm204/agent-skills research --adapter=cursor`, the generated `.cursor/mcp.json` includes:

```json
{
  "mcpServers": {
    "agent-skills-research-assistant": {
      "command": "npx",
      "args": ["-y", "@djm204/agent-skills-serve", "research-assistant"]
    }
  }
}
```

### Programmatic Usage

```javascript
import { createMcpServer, loadSkill } from '@djm204/agent-skills/api';

const skill = await loadSkill('skills/research-assistant');
const { server } = await createMcpServer(skill, {
  builtinHandlers: {
    web_search: async (params) => ({
      content: [{ type: 'text', text: JSON.stringify(results) }],
    }),
  },
});
```

---

## CLI Options

| Option | Description |
|--------|-------------|
| `--ide=[name]` | Target IDE: `cursor`, `claude`, or `codex` (can be used multiple times) |
| `--adapter=[name]` | Adapter for skill pack mode: `raw`, `cursor`, `claude-code`, `copilot`, `openai-agents`, `langchain`, `crewai`, `codex` |
| `--tier=[tier]` | Prompt tier: `minimal`, `standard`, `comprehensive` (default: `standard`) |
| `--test` | Preview test cases for a skill without calling an LLM |
| `--skill-dir=[dir]` | Path to a custom skills directory (default: built-in `skills/`) |
| `--out=[dir]` | Output directory for adapter files (default: current directory) |
| `--list`, `-l` | List all available skills |
| `--dry-run` | Preview changes without writing files |
| `--force`, `-f` | Overwrite/remove even if files were modified |
| `--remove` | Remove specified skills |
| `--reset` | Remove ALL installed content |
| `--yes`, `-y` | Skip confirmation prompt (for `--remove` and `--reset`) |
| `--version`, `-v` | Show version number |
| `serve <skill>` | Start MCP server for a skill (requires tools) |
| `--handler-dir=<dir>` | Directory of custom tool handler `.js` files (with `serve`) |
| `--help`, `-h` | Show help message |

### Shorthand Aliases

Use short names instead of full skill names. Run `--list` to see all aliases.

**Languages**

| Alias | Skill |
|-------|-------|
| `js`, `ts`, `javascript`, `typescript` | `javascript-expert` |
| `go`, `golang` | `golang-expert` |
| `py`, `python` | `python-expert` |
| `rs`, `rust` | `rust-expert` |
| `ruby`, `rb` | `ruby-expert` |
| `swift` | `swift-expert` |
| `kotlin`, `kt` | `kotlin-expert` |
| `java` | `java-expert` |
| `cpp` | `cpp-expert` |
| `csharp`, `cs` | `csharp-expert` |

**Engineering**

| Alias | Skill |
|-------|-------|
| `frontend`, `fe` | `web-frontend` |
| `backend`, `api` | `web-backend` |
| `devops`, `sre` | `devops-sre` |
| `cli` | `cli-tools` |
| `data`, `dataeng` | `data-engineering` |
| `ml`, `ai` | `ml-ai` |
| `qa` | `qa-engineering` |
| `test` | `testing` |
| `chain`, `web3` | `blockchain` |
| `platform`, `platform-eng` | `platform-engineering` |
| `unity` | `unity-dev-expert` |
| `security`, `sec`, `appsec` | `security-expert` |

**Professional**

| Alias | Skill |
|-------|-------|
| `docs` | `documentation` |
| `grants` | `grant-writer` |
| `exec`, `ea` | `executive-assistant` |
| `knowledge` | `knowledge-synthesis` |
| `research`, `researcher` | `research-assistant` |

**Business**

| Alias | Skill |
|-------|-------|
| `product` | `product-manager` |
| `project` | `project-manager` |
| `compliance`, `regulatory` | `regulatory-sentinel` |
| `allocator`, `resources` | `resource-allocator` |
| `market-intel` | `market-intelligence` |
| `supplychain` | `supply-chain` |
| `harmonizer` | `supply-chain-harmonizer` |
| `negotiator` | `strategic-negotiator` |
| `predictive` | `predictive-maintenance` |
| `marketing` | `marketing-expert` |

**Creative**

| Alias | Skill |
|-------|-------|
| `ux`, `uxd`, `design`, `designer` | `ux-designer` |
| `brand` | `brand-guardian` |
| `social-media` | `social-media-expert` |
| `content-creation` | `content-creation-expert` |

**Education & Agents**

| Alias | Skill |
|-------|-------|
| `teach`, `teacher` | `educator` |
| `agent`, `utility` | `utility-agent` |

---

## Available Skills (45)

### Engineering (14)

| Skill | Description |
|-------|-------------|
| `blockchain` | Smart contracts, DeFi protocols, and Web3 applications (Solidity, Foundry, Viem) |
| `cli-tools` | Command-line applications and developer tools (Cobra, Commander, Click) |
| `data-engineering` | Data platforms and pipelines (ETL, data modeling, data quality) |
| `devops-sre` | DevOps and SRE practices (incident management, observability, SLOs, chaos engineering) |
| `fullstack` | Full-stack web applications with shared types, API contracts, and E2E testing |
| `ml-ai` | Machine learning and AI systems (model development, deployment, monitoring) |
| `mobile` | Mobile applications (React Native, Flutter, native iOS/Android) |
| `platform-engineering` | Internal developer platforms, infrastructure automation, reliability engineering |
| `qa-engineering` | Quality assurance programs for confident, rapid software delivery |
| `security-expert` | Application security engineering — threat modeling, secure code, OWASP prevention, supply chain security |
| `testing` | Comprehensive testing practices (TDD, test design, CI/CD integration, performance testing) |
| `unity-dev-expert` | Unity game development (C#, ECS/DOTS, physics, UI systems, multiplayer, performance) |
| `web-backend` | Backend APIs and services (REST, GraphQL, microservices) |
| `web-frontend` | Frontend web applications (SPAs, SSR, static sites, PWAs) |

### Languages (10)

| Skill | Description |
|-------|-------------|
| `cpp-expert` | Principal-level C++ engineering (modern C++, RAII, concurrency, templates, performance) |
| `csharp-expert` | Principal-level C# engineering (async, DI, EF Core, ASP.NET Core, testing) |
| `golang-expert` | Principal-level Go engineering (concurrency, stdlib, production patterns, testing) |
| `java-expert` | Principal-level Java engineering (JVM, Spring Boot, concurrency, JPA, testing) |
| `javascript-expert` | Principal-level JavaScript & TypeScript engineering (Node.js, React, type system, testing) |
| `kotlin-expert` | Principal-level Kotlin engineering (coroutines, multiplatform, Ktor, Spring Boot, testing) |
| `python-expert` | Principal-level Python engineering (type system, async, testing, FastAPI, Django) |
| `ruby-expert` | Principal-level Ruby engineering (idioms, concurrency, Rails, performance, testing) |
| `rust-expert` | Principal-level Rust engineering (ownership, concurrency, unsafe, traits, async) |
| `swift-expert` | Principal-level Swift engineering (concurrency, SwiftUI, protocols, testing, Apple platforms) |

### Business (10)

| Skill | Description |
|-------|-------------|
| `market-intelligence` | Data source aggregation, sentiment analysis, trend detection, and risk signal monitoring |
| `marketing-expert` | Brand positioning, campaign planning, market analysis, analytics, and growth frameworks |
| `predictive-maintenance` | Industrial sensor monitoring, failure prediction, maintenance scheduling, and asset lifecycle |
| `product-manager` | Customer-centric discovery, prioritization, and cross-functional execution |
| `project-manager` | Planning, risk management, stakeholder alignment, and delivery tracking |
| `regulatory-sentinel` | Compliance tracking, impact assessment, monitoring, and risk classification |
| `resource-allocator` | Demand prediction, scheduling optimization, crisis management, and capacity modeling |
| `strategic-negotiator` | Game theory, deal structuring, scenario modeling, and contract analysis |
| `supply-chain` | Supply chain operations, procurement, logistics, and vendor management |
| `supply-chain-harmonizer` | Disruption response, autonomous rerouting, inventory rebalancing, and scenario simulation |

### Creative (4)

| Skill | Description |
|-------|-------------|
| `brand-guardian` | Brand voice enforcement, visual identity compliance, and content review workflows |
| `content-creation-expert` | Content strategy, copywriting, SEO content, multimedia production, and editorial ops |
| `social-media-expert` | Platform strategy, content planning, audience growth, community management, and analytics |
| `ux-designer` | User research, interaction design, design systems, accessibility, and emotional design |

### Professional (5)

| Skill | Description |
|-------|-------------|
| `documentation` | Technical documentation standards (READMEs, API docs, ADRs, code comments) |
| `executive-assistant` | Scheduling, correspondence, meeting management, and executive workflow optimization |
| `grant-writer` | Proposal strategy, narrative development, budget justification, and funder research |
| `knowledge-synthesis` | Document ingestion, knowledge graphs, search/retrieval, summarization, and research workflows |
| `research-assistant` | Literature review, source evaluation, citation management, and synthesis reporting |

### Education (1)

| Skill | Description |
|-------|-------------|
| `educator` | Evidence-based teaching, learning retention, gamification, and assessment design |

### Agents (1)

| Skill | Description |
|-------|-------------|
| `utility-agent` | AI agent utilities with context management and hallucination prevention |

---

## What Gets Installed

### IDE Mode (default)

Every skill installation includes foundational shared rules plus domain-specific rules:

**Shared (always included):**

| File | Description |
|------|-------------|
| `core-principles.mdc` | Honesty, simplicity, testing requirements |
| `code-quality.mdc` | SOLID, DRY, clean code patterns |
| `security-fundamentals.mdc` | Zero trust, input validation, secrets management |
| `git-workflow.mdc` | Commits, branches, PRs, safety protocols |
| `communication.mdc` | Direct, objective, professional communication |

**Skill-specific rules** — each skill adds domain-focused `.mdc` rule files. For example, `web-frontend` adds:

- `accessibility.mdc` — WCAG compliance, ARIA patterns
- `component-patterns.mdc` — React/Vue/Svelte best practices
- `performance.mdc` — Core Web Vitals, optimization
- `state-management.mdc` — State patterns, data flow
- `styling.mdc` — CSS architecture, design systems
- `testing.mdc` — Unit, integration, E2E testing

**Rule file format (`.mdc`):** Every file has YAML front matter with `description` and `alwaysApply`. Shared rules use `alwaysApply: true`; skill-specific rules use `alwaysApply: false` and load when relevant.

### Adapter Mode

When using `--adapter`, no IDE files are installed. Instead, a single prompt file is generated in the format required by the target framework. Output varies by adapter:

| Adapter | Output |
|---------|--------|
| `raw` | `<skill-name>.md` — plain markdown prompt |
| `claude-code` | Prompt formatted as a `CLAUDE.md` section |
| `gemini` | Prompt formatted as a `GEMINI.md` section |
| `cursor` | `.cursor/rules/<skill-name>.mdc` |
| `copilot` | Prompt formatted for `.github/copilot-instructions.md` |
| `codex` | `AGENTS.md` + `.agents/skills/<name>/SKILL.md` |
| `openai-agents` | Python snippet: `Agent(name=..., instructions=...)` |
| `langchain` | Python snippet: `SystemMessagePromptTemplate.from_template(...)` |
| `crewai` | Python snippet: `Agent(role=..., goal=..., backstory=...)` |

---

## File Structure

### After IDE install (`npx @djm204/agent-skills web-frontend`)

```text
your-project/
├── CLAUDE.md                              # Development guide (Claude Code, Cursor)
├── GEMINI.md                              # Development guide (Gemini CLI)
├── AGENTS.md                              # Development guide (OpenAI Codex)
├── .cursor/
│   └── rules/                             # Rule files (Cursor IDE)
│       ├── core-principles.mdc                 # Shared
│       ├── code-quality.mdc                    # Shared
│       ├── security-fundamentals.mdc           # Shared
│       ├── git-workflow.mdc                    # Shared
│       ├── communication.mdc                   # Shared
│       ├── web-frontend-overview.mdc           # Skill-specific
│       ├── web-frontend-accessibility.mdc      # Skill-specific
│       ├── web-frontend-component-patterns.mdc # Skill-specific
│       ├── web-frontend-performance.mdc        # Skill-specific
│       ├── web-frontend-state-management.mdc   # Skill-specific
│       ├── web-frontend-styling.mdc            # Skill-specific
│       └── web-frontend-testing.mdc            # Skill-specific
└── .github/
    └── copilot-instructions.md            # Instructions (GitHub Copilot)
```

### After adapter install (`npx @djm204/agent-skills golang-expert --adapter=langchain`)

```text
your-project/
└── golang-expert.py                       # LangChain SystemMessagePromptTemplate snippet
```

---

## Programmatic API

Install the package and import from the `/api` subpath:

```bash
npm install @djm204/agent-skills
```

```typescript
import { loadSkill, composeSkills, listSkills, runTestSuite } from '@djm204/agent-skills/api';

// Load a single skill at a specific tier
const skill = await loadSkill('golang-expert', { tier: 'standard' });
console.log(skill.prompt); // ready-to-use prompt string

// Compose multiple skills (deduplicates shared fragments)
const composed = await composeSkills(['fullstack', 'testing'], { tier: 'minimal' });

// List all available skills
const skills = await listSkills();

// Run behavioral test cases against an LLM response
const suite = await loadTestSuite('golang-expert');
const results = await runTestSuite(suite, myLlmFn);
```

TypeScript types are included — no `@types/` package needed.

---

## Examples

### New React Project

```bash
mkdir my-react-app && cd my-react-app
npm create vite@latest . -- --template react-ts
npx @djm204/agent-skills web-frontend
# or use shorthand:
npx @djm204/agent-skills frontend
```

### Full-Stack Next.js Project

```bash
npx create-next-app@latest my-app
cd my-app
npx @djm204/agent-skills fullstack
```

### Microservices Backend

```bash
cd my-api-service
npx @djm204/agent-skills web-backend devops-sre
# or use shorthands:
npx @djm204/agent-skills backend devops
```

### ML/AI Project

```bash
cd my-ml-project
npx @djm204/agent-skills ml-ai data-engineering
# or use shorthands:
npx @djm204/agent-skills ml data
```

### Unity Game Project

```bash
cd my-unity-game
npx @djm204/agent-skills unity
```

### Marketing Team Workspace

```bash
cd marketing-workspace
npx @djm204/agent-skills marketing social-media content-creation
```

### Docs and Research

```bash
npx @djm204/agent-skills docs research
```

### LangChain Agent Pipeline

```bash
# Standard tier for a Go expert agent
npx @djm204/agent-skills golang-expert --adapter=langchain --out=./agents

# Compose a fullstack + testing specialist (minimal tokens)
npx @djm204/agent-skills fullstack,testing --adapter=langchain --tier=minimal --out=./agents
```

### OpenAI Codex Skill

```bash
# Install a skill as a Codex-compatible skill directory
npx @djm204/agent-skills security-expert --adapter=codex

# With minimal tier for smaller context
npx @djm204/agent-skills golang-expert --adapter=codex --tier=minimal
```

### CrewAI Multi-Agent Team

```bash
npx @djm204/agent-skills product-manager --adapter=crewai --out=./crew
npx @djm204/agent-skills web-frontend --adapter=crewai --out=./crew
npx @djm204/agent-skills qa-engineering --adapter=crewai --out=./crew
```

---

## Roadmap

| Phase | What | Status |
|-------|------|--------|
| Honest positioning | Clarify what skills are (prompts) vs. what they aren't (agents) | Done |
| Remove off-brand skills | Cut lifestyle skills, focus on dev/business (48 → 44) | Done |
| Runtime composition | Dynamic skill loading based on task detection (`--auto`) | Done |
| JSON skill export | Export skills as JSON manifest (`--export`) | Done |
| Usage analytics | Local usage tracking with `--stats` and privacy controls | Done |
| MCP servers | Generic MCP server — serve any skill's tools via `serve` command | Done |
| Effectiveness benchmarks | A/B test prompts vs. no-prompts, publish results | Planned |
| Model-specific tuning | Test and document per-model tier recommendations | Planned |
| Real framework integrations | LangChain Runnables, CrewAI Agent subclasses | Future |

---

## Requirements

- **Node.js**: 18.0.0 or higher
- **Supported IDEs/Tools** (IDE mode):
  - Cursor IDE (any version with `.cursor/rules/` support)
  - Claude Code (reads `CLAUDE.md` automatically)
  - GitHub Copilot (reads `.github/copilot-instructions.md`)
- **Supported Frameworks** (adapter mode):
  - OpenAI Agents SDK, LangChain, CrewAI, or any LLM via `raw`

---

## Troubleshooting

### "Unknown option" or Missing Features

If you're getting errors for options that should exist, you may have a cached old version:

```bash
# Force latest version (recommended)
npx @djm204/agent-skills@latest [command]

# Clear npx cache
npx clear-npx-cache

# Or manually clear npm cache
npm cache clean --force
```

### Verify Your Version

```bash
npx @djm204/agent-skills --version
```

The CLI will notify you if a newer version is available.

### Update Global Installation

```bash
npm update -g @djm204/agent-skills
```

---

## How to Contribute

### Adding a New Skill Pack

Skill packs live in `skills/<skill-name>/` and follow this structure:

```text
skills/your-skill/
├── skill.yaml                   # Metadata and manifest
├── prompts/
│   ├── minimal.md               # ~700 tokens: behavioral rules + anti-patterns
│   ├── standard.md              # ~2,800 tokens: principles + patterns
│   └── comprehensive.md         # ~7,500 tokens: full reference with examples
└── tests/
    └── test_cases.yaml          # Behavioral test cases
```

**`skill.yaml` format:**

```yaml
name: your-skill
version: 1.0.0
category: engineering          # engineering | languages | business | creative | professional | education | agents
tags: [tag1, tag2]
description:
  short: "One-line description"
  long: "Detailed description of what this skill does."
context_budget:
  minimal: 700
  standard: 2800
  comprehensive: 7500
composable_with:
  recommended: [skill-a, skill-b]
  enhances: [skill-c]
conflicts_with: []
requires_tools: false
requires_memory: false
```

**Prompt guidelines:**
- Each tier must be **standalone** (does not depend on other tiers)
- Prompts are behavioral guidance for AI assistants, not human documentation
- `minimal.md`: numbered rules + anti-patterns list only
- `standard.md`: prose-based principles, patterns, decision frameworks (no large code blocks)
- `comprehensive.md`: full reference with code examples and reference tables

**`test_cases.yaml` format:**

```yaml
name: your-skill-tests
skill: your-skill
version: 1.0.0
cases:
  - id: descriptive-id
    description: What behavior this tests
    prompt: "A realistic question a developer might ask"
    expected:
      contains_any:
        - keyword1
        - keyword2
      not_contains:
        - bad answer phrase
      min_length: 80
    tags: [core, category]
```

Run `npx @djm204/agent-skills --test your-skill` to preview test cases, and check [`docs/skill-authoring-guide.md`](docs/skill-authoring-guide.md) for the complete authoring reference.

### Adding a Legacy Template (IDE rule files)

1. Create the template in the appropriate category directory:

```text
templates/<category>/your-template/
└── .cursor/
    └── rules/
        ├── overview.mdc          # Scope and core principles (required)
        ├── topic-one.mdc
        └── topic-two.mdc
```

2. Follow existing patterns — look at `templates/engineering/web-frontend/` for reference.
3. Add a `category` field to the template entry in `src/index.js`.

### Testing

```bash
npm test                         # Run all tests (490+)
npm run validate:rules           # Check template rule sizes (<100 lines)
node bin/cli.js --list           # List all skills/templates
node bin/cli.js golang-expert --adapter=raw   # Test adapter output
node bin/cli.js --test golang-expert          # Preview test cases
```

### Shared Rules

The `templates/_shared/` directory contains rules included with every IDE installation:

- `core-principles.mdc` — Universal development principles
- `code-quality.mdc` — Clean code patterns
- `security-fundamentals.mdc` — Security basics
- `git-workflow.mdc` — Git conventions
- `communication.mdc` — AI communication style

Changes to shared rules affect all templates — be thoughtful with modifications.

### Submitting a PR

1. Fork the repository
2. Create a branch: `feat/your-skill-name`
3. Add skill pack files and tests
4. Run `npm test` and ensure all tests pass
5. Submit a PR with a clear description of the skill's domain and behavioral focus

---

## License

MIT © [David Mendez](https://github.com/djm204)

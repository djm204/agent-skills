# Architecture — @djm204/agent-skills

> Universal skill framework: installable domain expertise for AI agents.
> Node.js ESM CLI + programmatic API. 44 skill packs, 7 adapters, tiered prompts.

---

## System Overview

```mermaid
graph TB
    subgraph User["User Entry Points"]
        CLI["CLI<br/>bin/cli.js"]
        API["Programmatic API<br/>@djm204/agent-skills/api"]
    end

    subgraph Core["Core Engine — src/core/"]
        Loader["Skill Loader<br/>skill-loader.js"]
        Composer["Composer<br/>composer.js"]
        Fragments["Fragment Resolver<br/>fragments.js"]
        Selector["Skill Selector<br/>skill-selector.js"]
        Detector["Context Detector<br/>context-detector.js"]
        Exporter["Skill Exporter<br/>skill-exporter.js"]
    end

    subgraph Adapters["Adapter Layer — src/adapters/"]
        Raw["raw"]
        Cursor["cursor"]
        ClaudeCode["claude-code"]
        Copilot["copilot"]
        OpenAI["openai-agents"]
        LangChain["langchain"]
        CrewAI["crewai"]
    end

    subgraph Content["Content Layer"]
        Skills["Skills<br/>skills/ (44 packs)"]
        Templates["Legacy Templates<br/>templates/"]
        Frags["Fragments<br/>fragments/"]
    end

    subgraph Support["Support Systems"]
        Analytics["Usage Tracker<br/>src/analytics/"]
        Testing["Test Runner<br/>src/testing/"]
        Benchmarks["Benchmark Runner<br/>src/benchmarks/"]
    end

    subgraph Output["Output Targets"]
        CursorIDE[".cursor/rules/*.mdc"]
        ClaudeMD["CLAUDE.md"]
        CopilotMD[".github/copilot-instructions.md"]
        PythonAgent["*_agent.py / *_crew.py"]
        RawMD["*.md"]
        JSON["skills.json"]
    end

    CLI --> Core
    API --> Core

    Loader --> Skills
    Loader --> Frags
    Fragments --> Frags
    Composer --> Loader
    Composer --> Fragments
    Selector --> Detector
    Exporter --> Loader

    CLI --> Templates
    CLI --> Adapters
    Core --> Adapters

    Adapters --> Output
    CLI --> Output
    Exporter --> JSON

    CLI --> Analytics
    API --> Testing
    API --> Benchmarks
```

---

## Component Interaction

```mermaid
sequenceDiagram
    participant U as User
    participant CLI as bin/cli.js
    participant Main as src/index.js
    participant Loader as skill-loader
    participant Composer as composer
    participant Adapter as adapter
    participant FS as File System

    U->>CLI: npx agent-skills js --adapter=langchain
    CLI->>Main: run(args)
    Main->>Main: Parse flags, resolve aliases
    Main->>Loader: loadSkill("skills/javascript-expert")
    Loader->>FS: Read skill.yaml, prompts/*.md
    FS-->>Loader: manifest + prompt text
    Loader-->>Main: SkillPack
    Main->>Adapter: langchain(skillPack, {tier})
    Adapter-->>Main: {files, summary}
    Main->>FS: Write javascript_expert_agent.py
    Main-->>U: "✓ Created javascript_expert_agent.py"
```

### Skill Composition Flow

```mermaid
sequenceDiagram
    participant C as Caller
    participant Comp as composer.js
    participant Load as skill-loader.js
    participant Frag as fragments.js

    C->>Comp: composeSkills([s1, s2], {budget: 8000, primary: "s1"})
    Comp->>Comp: checkConflicts([s1, s2])
    Comp->>Comp: allocateBudget(skills, {totalBudget, primary})
    Note over Comp: Net = 8000 - 400 (glue)<br/>Primary gets remainder<br/>Others get minimal budget

    loop For each skill
        Comp->>Comp: selectTierForBudget(skill, allocated)
        Comp->>Load: Get prompts[tier]
    end

    Comp->>Frag: deduplicateFragments(joinedPrompts)
    Frag-->>Comp: deduplicated text
    Comp-->>C: ComposedSkillPack
```

---

## Data Flow

```mermaid
flowchart LR
    subgraph Input
        A1["CLI args"]
        A2["API call"]
        A3["Project files<br/>(context detection)"]
    end

    subgraph Processing
        B1["Arg parsing &<br/>alias resolution"]
        B2["Skill loading<br/>& validation"]
        B3["Tier selection<br/>& budget allocation"]
        B4["Fragment resolution<br/>& deduplication"]
        B5["Adapter transformation"]
    end

    subgraph Output
        C1["IDE rule files"]
        C2["Agent scaffolds<br/>(Python)"]
        C3["Raw markdown"]
        C4["JSON export"]
    end

    A1 --> B1
    A2 --> B2
    A3 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> B5
    B5 --> C1
    B5 --> C2
    B5 --> C3
    B2 --> C4
```

---

## Entity-Relationship Diagrams

### Skill Pack Model

```mermaid
erDiagram
    SKILL_PACK {
        string name PK "kebab-case identifier"
        string version "semver (e.g. 1.0.0)"
        string category "engineering | languages | creative | business | agents"
        string[] tags "searchable keywords"
        boolean requires_tools
        boolean requires_memory
        string mcp_server "nullable"
    }

    DESCRIPTION {
        string short "one-line summary"
        string long "extended description"
    }

    CONTEXT_BUDGET {
        number minimal "~700 tokens"
        number standard "~2800 tokens"
        number comprehensive "~7500 tokens"
    }

    PROMPT {
        string tier "minimal | standard | comprehensive"
        string content "markdown prompt text"
    }

    TOOL_DEFINITION {
        string name "tool identifier"
        string description "what the tool does"
        object parameters "JSON schema"
    }

    OUTPUT_SCHEMA {
        string name "schema identifier"
        object schema "JSON schema"
    }

    COMPOSABILITY {
        string[] recommended "works well with"
        string[] enhances "adds value to"
        string[] conflicts_with "incompatible skills"
    }

    TEST_SUITE {
        string name "suite identifier"
        string skill "parent skill name"
    }

    TEST_CASE {
        string id PK "unique case identifier"
        string description "what this tests"
        string prompt "input message"
        string[] tags "filter tags"
    }

    EXPECTED_RESULT {
        string[] contains "must appear (case-insensitive)"
        string[] contains_any "at least one must appear"
        string[] not_contains "must not appear"
        number min_length "minimum response length"
        number max_length "maximum response length"
    }

    SKILL_PACK ||--|| DESCRIPTION : has
    SKILL_PACK ||--|| CONTEXT_BUDGET : has
    SKILL_PACK ||--|{ PROMPT : "has 1-3"
    SKILL_PACK ||--o{ TOOL_DEFINITION : "has 0+"
    SKILL_PACK ||--o{ OUTPUT_SCHEMA : "has 0+"
    SKILL_PACK ||--|| COMPOSABILITY : has
    SKILL_PACK ||--o| TEST_SUITE : "has 0-1"
    TEST_SUITE ||--|{ TEST_CASE : contains
    TEST_CASE ||--|| EXPECTED_RESULT : has
```

### Composed Skill Pack Model

```mermaid
erDiagram
    COMPOSED_SKILL_PACK {
        string systemPrompt "merged prompt text"
        number estimatedTokens "char/4 estimate"
        string[] mcp_servers "unique servers"
    }

    COMPOSITION_ENTRY {
        string name "skill name"
        string tier "selected tier"
        number tokensAllocated "budget share"
    }

    TOOL_DEFINITION {
        string name
        string description
        object parameters
    }

    COMPOSED_SKILL_PACK ||--|{ COMPOSITION_ENTRY : contains
    COMPOSED_SKILL_PACK ||--o{ TOOL_DEFINITION : "flattened tools"
```

### Template Model (Legacy)

```mermaid
erDiagram
    TEMPLATE {
        string name PK "kebab-case"
        string category "engineering | languages | creative | business | etc"
        string description "what this template provides"
    }

    RULE_FILE {
        string filename "*.mdc"
        string content "markdown with YAML front matter"
    }

    SHARED_RULES {
        string name "always installed"
    }

    TEMPLATE ||--|{ RULE_FILE : contains
    SHARED_RULES ||--|{ RULE_FILE : contains
```

---

## Directory Structure

```
@djm204/agent-skills/
├── bin/
│   └── cli.js                     # CLI entry point → calls src/index.js run()
├── src/
│   ├── index.js                   # CLI orchestrator (~1800 lines)
│   │                              #   - arg parsing, alias resolution
│   │                              #   - template registry auto-discovery
│   │                              #   - IDE file installation & smart merging
│   │                              #   - adapter pipeline invocation
│   ├── api/
│   │   └── index.js               # Public API (subpath: @djm204/agent-skills/api)
│   ├── core/
│   │   ├── skill-loader.js        # Load & validate skill packs
│   │   ├── composer.js            # Budget-aware skill composition
│   │   ├── fragments.js           # Shared prompt block resolution
│   │   ├── skill-selector.js      # Runtime skill selection (heuristic scoring)
│   │   ├── context-detector.js    # Project environment scanning
│   │   └── skill-exporter.js      # JSON export for skill metadata
│   ├── adapters/
│   │   ├── index.js               # Adapter registry (ADAPTERS, getAdapter)
│   │   ├── raw.js                 # Plain markdown
│   │   ├── cursor.js              # Cursor IDE .mdc files
│   │   ├── claude-code.js         # CLAUDE.md sections
│   │   ├── copilot.js             # .github/copilot-instructions.md
│   │   ├── openai-agents.js       # OpenAI Agents SDK (Python)
│   │   ├── langchain.js           # LangChain agent (Python)
│   │   └── crewai.js              # CrewAI agent (Python)
│   ├── analytics/
│   │   └── tracker.js             # Local usage tracking (JSON Lines)
│   ├── benchmarks/
│   │   ├── runner.js              # Skill A/B benchmark runner
│   │   └── model-matrix.js        # Cross-model comparison
│   └── testing/
│       └── test-runner.js         # Skill test suite loader & evaluator
├── skills/                        # 44 universal skill packs
│   └── <skill-name>/
│       ├── skill.yaml             # Manifest (name, version, category, budget, composability)
│       ├── prompts/
│       │   ├── minimal.md         # ~700 tokens
│       │   ├── standard.md        # ~2800 tokens
│       │   └── comprehensive.md   # ~7500 tokens
│       ├── tools/                 # Optional tool definitions
│       └── tests/                 # Optional test cases
├── templates/                     # Legacy template format
│   ├── _shared/                   # Shared rules (always installed)
│   │   └── .cursor/rules/*.mdc
│   └── <category>/<name>/
│       ├── template.yaml
│       └── .cursor/rules/*.mdc
├── fragments/                     # Shared prompt fragments
│   ├── citation-standards.md
│   ├── confidentiality.md
│   ├── ethical-guidelines.md
│   └── output-format.md
├── shim/                          # Deprecated package redirect (agentic-team-templates)
├── scripts/
│   ├── validate-rule-sizes.js     # Enforce max 100 lines per rule
│   ├── dogfood.js                 # Self-test installer
│   └── run-model-matrix.js        # Benchmark orchestrator
└── docs/
    ├── ARCHITECTURE.md            # This document
    ├── adrs/                      # Architecture Decision Records
    └── *.md                       # Guides and references
```

---

## Layer Architecture

```mermaid
graph TB
    subgraph Presentation["Presentation Layer"]
        CLI_Entry["CLI Entry<br/>bin/cli.js"]
        API_Surface["Public API<br/>src/api/index.js"]
    end

    subgraph Orchestration["Orchestration Layer"]
        CLI_Main["CLI Orchestrator<br/>src/index.js"]
    end

    subgraph Domain["Domain Layer — src/core/"]
        Loader["Skill Loader"]
        Composer["Composer"]
        Selector["Skill Selector"]
        Detector["Context Detector"]
        FragResolver["Fragment Resolver"]
        SkillExporter["Skill Exporter"]
    end

    subgraph Integration["Integration Layer"]
        AdapterReg["Adapter Registry"]
        AdapterImpl["7 Adapter Implementations"]
        Tracker["Usage Tracker"]
        TestRunner["Test Runner"]
        BenchRunner["Benchmark Runner"]
    end

    subgraph Content["Content Layer (File System)"]
        SkillPacks["44 Skill Packs<br/>skills/"]
        LegacyTemplates["Legacy Templates<br/>templates/"]
        SharedFrags["Shared Fragments<br/>fragments/"]
    end

    CLI_Entry --> CLI_Main
    API_Surface --> Domain
    CLI_Main --> Domain
    CLI_Main --> AdapterReg
    CLI_Main --> LegacyTemplates
    CLI_Main --> Tracker

    Loader --> SkillPacks
    Loader --> SharedFrags
    FragResolver --> SharedFrags
    Composer --> Loader
    Composer --> FragResolver
    Selector --> Detector
    SkillExporter --> Loader

    AdapterReg --> AdapterImpl
    TestRunner --> Loader
    BenchRunner --> Loader

    API_Surface --> TestRunner
    API_Surface --> BenchRunner
    API_Surface --> Tracker
```

---

## Key Algorithms

### Budget Allocation

The composer allocates token budgets across skills to fit a total context window:

```
COMPOSITION_GLUE_TOKENS = 400 (separator overhead)
Net budget = totalBudget - 400

If primary skill specified:
  1. Each non-primary skill gets its minimal tier budget
  2. Primary skill gets: net budget - sum(non-primary minimal budgets)

If no primary:
  1. Split net budget evenly across all skills
```

### Tier Selection

For a given token budget, select the highest-quality tier that fits:

```
Try comprehensive → standard → minimal (highest first)
Pick the highest tier whose context_budget[tier] ≤ allocated tokens
```

### Tier Fallback (Loading)

When a requested tier's prompt file is missing:

```
Requested minimal  → try: standard, comprehensive
Requested standard → try: minimal, comprehensive
Requested comprehensive → try: standard, minimal
```

### Skill Selection Scoring (Runtime)

Heuristic scoring to auto-select skills for a given prompt + project context:

| Signal | Weight |
|--------|--------|
| Tag match | 3 |
| Description keyword match | 1 |
| Language match | 5 |
| Framework match | 5 |
| Composability bonus | 2 |

### Fragment Deduplication

Shared prompt blocks wrapped in HTML comments (`<!-- fragment:name -->...<!-- /fragment:name -->`) are deduplicated when composing multiple skills, preventing token waste.

---

## Adapter Interface

All adapters conform to a single contract:

```javascript
adapter(skillPack, { tier? }) → { files: Array<{ path, content }>, summary: string }
```

```mermaid
graph LR
    SP["SkillPack"] --> A["Adapter Function"]
    A --> F1[".cursor/rules/*.mdc"]
    A --> F2["CLAUDE.md"]
    A --> F3[".github/copilot-instructions.md"]
    A --> F4["*_agent.py (LangChain)"]
    A --> F5["*_crew.py (CrewAI)"]
    A --> F6["*_agent.py (OpenAI)"]
    A --> F7["*.md (raw)"]
```

| Adapter | Output | Target |
|---------|--------|--------|
| `raw` | `<skill>.md` | Plain markdown |
| `cursor` | `.cursor/rules/<skill>.mdc` | Cursor IDE |
| `claude-code` | `CLAUDE.md` sections | Claude Code |
| `copilot` | `.github/copilot-instructions.md` | GitHub Copilot |
| `openai-agents` | `<skill>_agent.py` | OpenAI Agents SDK |
| `langchain` | `<skill>_agent.py` | LangChain |
| `crewai` | `<skill>_crew.py` | CrewAI |

---

## Skill Categories

44 skill packs organized across 5 categories:

| Category | Count | Examples |
|----------|-------|---------|
| Languages | 11 | javascript-expert, python-expert, rust-expert, golang-expert |
| Engineering | 11 | web-frontend, web-backend, devops-sre, cli-tools, testing |
| Creative | 5 | documentation, ux-designer, brand-guardian, content-creation-expert |
| Business | 9 | product-manager, project-manager, strategic-negotiator, executive-assistant |
| Agents/Other | 8 | ml-ai, data-engineering, educator, utility-agent |

Each skill contains three prompt tiers:

| Tier | Token Target | Purpose |
|------|-------------|---------|
| `minimal` | ~700 | Core identity — fits in tight context windows |
| `standard` | ~2,800 | Full behavioral prompt — recommended default |
| `comprehensive` | ~7,500 | Includes examples, edge cases — maximum quality |

---

## Testing & Quality

```mermaid
graph LR
    subgraph Validation
        V1["Rule size validation<br/>(max 100 lines)"]
        V2["Manifest validation<br/>(required fields, semver)"]
        V3["Conflict detection<br/>(composability checks)"]
    end

    subgraph UnitTests["Unit Tests (Vitest)"]
        T1["Skill loader tests"]
        T2["Composer tests"]
        T3["Adapter tests"]
        T4["API tests"]
        T5["Analytics tests"]
        T6["Selector/Detector tests"]
    end

    subgraph SkillTests["Skill Tests"]
        ST1["Test case YAML<br/>(per-skill assertions)"]
        ST2["Assertion engine<br/>(contains, length, etc.)"]
    end

    subgraph Benchmarks
        B1["A/B benchmark runner<br/>(skill vs baseline)"]
        B2["Model matrix<br/>(cross-model comparison)"]
    end
```

**Assertion types** (skill test cases):
- `contains` — all strings must appear (case-insensitive)
- `contains_any` — at least one string must appear
- `not_contains` — none may appear
- `min_length` / `max_length` — response length bounds

---

## Analytics (Privacy-First)

- **Storage**: `~/.agent-skills/usage.jsonl` (local, append-only JSON Lines)
- **Auto-disabled** in CI environments (`CI=true`, `GITHUB_ACTIONS=true`)
- **Opt-out**: `AGENT_SKILLS_NO_TRACKING=1`
- **No network calls** — all data stays local

---

## CLI Command Reference

```
npx @djm204/agent-skills <templates...> [options]

Installation:
  agent-skills web-frontend                    Install template rules
  agent-skills js --adapter=langchain          Install skill via adapter
  agent-skills js ts --adapter=raw --out=./    Multiple skills

Options:
  --list                    List available templates & skills
  --help                    Show help
  --version                 Show version
  --dry-run                 Preview changes without writing
  --force                   Overwrite existing files
  --yes                     Skip confirmation prompts
  --ide=<ide>               Target IDE (cursor|claude|codex), repeatable
  --adapter=<name>          Use adapter (raw|cursor|claude-code|copilot|openai-agents|langchain|crewai)
  --tier=<tier>             Prompt tier (minimal|standard|comprehensive)
  --skill-dir=<dir>         Custom skills directory
  --out=<dir>               Output directory
  --remove <templates>      Uninstall template rules
  --reset                   Remove all installed rules
  --export                  Export skills as JSON
  --auto                    Auto-select skills based on project context
  --stats                   Show usage statistics
```

---

## Dependencies

| Dependency | Purpose | Type |
|-----------|---------|------|
| Node.js built-ins (fs, path, os, child_process) | File I/O, process management | Runtime |
| vitest | Test framework | Dev |
| husky | Git hooks | Dev |
| @commitlint/cli + config-conventional | Commit message validation | Dev |
| release-please | Automated releases | CI |

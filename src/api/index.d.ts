/**
 * TypeScript type definitions for @djm204/agent-skills public API.
 *
 * Usage:
 *   import { loadSkill, composeSkills, getAdapter, ADAPTERS } from '@djm204/agent-skills/api';
 */

// ============================================================================
// Core types
// ============================================================================

export type Tier = 'minimal' | 'standard' | 'comprehensive';

export interface SkillDescription {
  short: string;
  long?: string;
}

export interface ContextBudget {
  minimal: number;
  standard: number;
  comprehensive: number;
}

export interface ComposableWith {
  recommended?: string[];
  conflicts_with?: string[];
  enhances?: string[];
}

export interface ToolParameter {
  type: string;
  description?: string;
  required?: boolean;
  default?: unknown;
}

export interface ToolDefinition {
  name: string;
  description: string;
  when_to_use?: string;
  parameters?: Record<string, ToolParameter>;
  returns?: {
    type: string;
    description?: string;
    items?: Record<string, unknown>;
    properties?: Record<string, unknown>;
  };
  [key: string]: unknown;
}

export interface OutputSchema {
  name: string;
  description?: string;
  format?: string;
  schema?: Record<string, unknown>;
  [key: string]: unknown;
}

// ============================================================================
// SkillPack — returned by loadSkill()
// ============================================================================

export interface SkillPack {
  name: string;
  version: string;
  category: string;
  tags: string[];
  description: SkillDescription;
  context_budget: ContextBudget;
  composable_with: ComposableWith;
  conflicts_with: string[];
  requires_tools: boolean;
  requires_memory: boolean;
  prompts: {
    minimal?: string;
    standard?: string;
    comprehensive?: string;
  };
  /** The resolved system prompt for the requested (or fallback) tier. */
  systemPrompt: string;
  /** The tier actually used (may differ from requested if file missing). */
  tierUsed: Tier;
  tools: ToolDefinition[];
  output_schemas: OutputSchema[];
  /** MCP server package name, or null if the skill has no MCP server. */
  mcp_server: string | null;
}

// ============================================================================
// ComposedSkillPack — returned by composeSkills()
// ============================================================================

export interface CompositionEntry {
  name: string;
  tier: Tier;
  tokensAllocated: number;
}

export interface ComposedSkillPack {
  systemPrompt: string;
  tools: ToolDefinition[];
  composition: CompositionEntry[];
  /** Rough token count: Math.ceil(systemPrompt.length / 4). */
  estimatedTokens: number;
  /** Unique MCP server package names aggregated from all composed skills. */
  mcp_servers: string[];
}

// ============================================================================
// Skill metadata — returned by listSkills()
// ============================================================================

export interface SkillMeta {
  name: string;
  version: string;
  category: string;
  tags: string[];
  description: SkillDescription;
  /** Absolute path to the skill directory. */
  path: string;
}

// ============================================================================
// Test runner types
// ============================================================================

export interface TestExpected {
  contains?: string[];
  contains_any?: string[];
  not_contains?: string[];
  min_length?: number;
  max_length?: number;
}

export interface TestCase {
  id: string;
  description: string;
  prompt: string;
  expected?: TestExpected;
  tags?: string[];
}

export interface TestSuite {
  name: string;
  skill: string;
  version: string;
  cases: TestCase[];
}

export interface CaseResult {
  id: string;
  description: string;
  passed: boolean;
  failures: string[];
  error?: string;
  durationMs: number;
}

export interface TestRunResult {
  skill: string;
  name: string;
  total: number;
  passed: number;
  failed: number;
  /** Value between 0 and 1. */
  passRate: number;
  cases: CaseResult[];
}

export interface EvaluationResult {
  passed: boolean;
  failures: string[];
}

// ============================================================================
// Benchmark types
// ============================================================================

export interface BenchmarkCaseScore {
  score: number;
  passed: boolean;
  failures: string[];
  error?: string;
}

export interface BenchmarkCaseResult {
  id: string;
  prompt: string;
  baseline: BenchmarkCaseScore;
  withSkill: BenchmarkCaseScore;
  /** withSkill.score - baseline.score */
  delta: number;
}

export interface BenchmarkSummary {
  baselinePassRate: number;
  withSkillPassRate: number;
  avgDelta: number;
  totalCases: number;
  runs: number;
}

export interface BenchmarkResult {
  skill: string;
  systemPrompt: string;
  cases: BenchmarkCaseResult[];
  summary: BenchmarkSummary;
}

// ============================================================================
// Model matrix types
// ============================================================================

export interface MatrixEntry {
  model: string;
  skill: string;
  tier: Tier;
  result: BenchmarkResult | null;
  skipped?: boolean;
  skipReason?: string;
}

export interface ModelSummary {
  bestTier: Tier;
  avgDelta: number;
}

export interface ModelMatrixMetadata {
  skillNames: string[];
  modelIds: string[];
  tiers: Tier[];
  runs: number;
}

export interface ModelMatrixResult {
  matrix: MatrixEntry[];
  summary: Record<string, ModelSummary>;
  metadata: ModelMatrixMetadata;
}

// ============================================================================
// Adapter types
// ============================================================================

export type AdapterName =
  | 'raw'
  | 'cursor'
  | 'claude-code'
  | 'copilot'
  | 'openai-agents';

export interface AdapterOutputFile {
  path: string;
  content: string;
}

export interface AdapterOutput {
  files: AdapterOutputFile[];
}

export type AdapterFn = (skill: SkillPack) => AdapterOutput;

// ============================================================================
// Exported functions
// ============================================================================

/**
 * Load a skill pack from a directory.
 *
 * @param skillPath - Absolute or relative path to the skill directory.
 * @param options.tier - Prompt tier to load. Defaults to 'standard'.
 * @param options.fragmentsDir - Optional directory of shared fragment files.
 */
export function loadSkill(
  skillPath: string,
  options?: { tier?: Tier; fragmentsDir?: string }
): Promise<SkillPack>;

/**
 * List all skills in a directory. Returns metadata only — no prompt content.
 *
 * @param skillsDir - Directory containing skill subdirectories.
 */
export function listSkills(skillsDir: string): Promise<SkillMeta[]>;

/**
 * Compose multiple SkillPack objects into a single merged prompt
 * within a token budget.
 *
 * @param skills - Array of SkillPack objects from loadSkill().
 * @param options.budget - Token budget for the composed output. Default 8000.
 * @param options.primary - Name of the primary skill (gets full tier allocation).
 * @param options.conflictResolution - How to handle conflicting skills.
 */
export function composeSkills(
  skills: SkillPack[],
  options?: {
    budget?: number;
    primary?: string;
    conflictResolution?: 'throw' | 'primary_wins';
  }
): Promise<ComposedSkillPack>;

/**
 * Load a skill's test suite from its tests/test_cases.yaml file.
 * Returns null if the file does not exist.
 *
 * @param skillPath - Absolute or relative path to the skill directory.
 */
export function loadTestSuite(skillPath: string): TestSuite | null;

/**
 * Run all test cases in a suite through a response provider function.
 *
 * @param suite - Test suite from loadTestSuite().
 * @param provider - Async function that takes a prompt and returns a response string.
 * @param options.tags - If provided, only cases with matching tags are run.
 */
export function runTestSuite(
  suite: TestSuite,
  provider: (prompt: string) => Promise<string>,
  options?: { tags?: string[] }
): Promise<TestRunResult>;

/**
 * Evaluate a response string against a set of expected assertions.
 * Does not call an LLM — all checks are deterministic string operations.
 *
 * @param response - The agent response to evaluate.
 * @param expected - Assertions to check.
 */
export function evaluateResponse(
  response: string,
  expected?: TestExpected
): EvaluationResult;

/**
 * Validate a single test case object. Returns an array of error strings.
 * Empty array means the test case is valid.
 *
 * @param testCase - The test case to validate.
 */
export function validateTestCase(testCase: unknown): string[];

/**
 * Get an adapter function by name.
 *
 * @param name - Adapter name (e.g. 'cursor', 'openai-agents').
 */
export function getAdapter(name: AdapterName): AdapterFn;

/** List of all registered adapter names. */
export const ADAPTERS: AdapterName[];

/**
 * Score a single response against expected assertions.
 * Returns a fractional score (0-1) based on how many assertions pass.
 *
 * @param response - The LLM response text.
 * @param expected - Assertions to check.
 */
export function scoreBenchmarkCase(
  response: string,
  expected?: TestExpected
): BenchmarkCaseScore;

/**
 * Run a benchmark comparing skill-prompted vs. bare model responses.
 *
 * @param suite - Test suite (from loadTestSuite or manual).
 * @param systemPrompt - The skill's system prompt to benchmark.
 * @param provider - Async function: (prompt, systemPrompt?) => response string.
 * @param options.runs - Number of runs per case for averaging. Default 1.
 * @param options.tags - Filter cases by tag.
 */
/**
 * Run benchmarks across a matrix of models × skills × tiers.
 *
 * @param skillNames - Skill names to benchmark.
 * @param providers - Map of model IDs to provider functions.
 * @param options.tiers - Tiers to test. Default: all three.
 * @param options.runs - Runs per case for variance averaging. Default 1.
 * @param options.skillsDir - Skills root directory.
 * @param options.onProgress - Progress callback: (completed, total) => void.
 */
export function runModelMatrix(
  skillNames: string[],
  providers: Record<string, (prompt: string, systemPrompt?: string) => Promise<string>>,
  options?: {
    tiers?: Tier[];
    runs?: number;
    skillsDir?: string;
    onProgress?: (completed: number, total: number) => void;
  }
): Promise<ModelMatrixResult>;

export function runBenchmark(
  suite: TestSuite,
  systemPrompt: string,
  provider: (prompt: string, systemPrompt?: string) => Promise<string>,
  options?: { runs?: number; tags?: string[] }
): Promise<BenchmarkResult>;

// ============================================================================
// Skill export types
// ============================================================================

export interface ExportedSkill {
  name: string;
  version: string;
  category: string;
  tags: string[];
  description: SkillDescription;
  context_budget: ContextBudget;
  composable_with: ComposableWith;
  conflicts_with: string[];
  requires_tools: boolean;
  requires_memory: boolean;
  mcp_server: string | null;
  tools: ToolDefinition[];
  /** Tier names that have prompt files available. */
  prompts: Tier[];
}

export interface ExportResult {
  skills: ExportedSkill[];
  skillCount: number;
  outputDir: string;
}

/**
 * Export all skills as a JSON manifest + prompt files.
 * Writes skills.json and skills/<name>/<tier>.md to the output directory.
 *
 * @param skillsDir - Directory containing skill subdirectories.
 * @param options.outDir - Output directory. Default: './export'.
 */
export function exportSkills(
  skillsDir: string,
  options?: { outDir?: string }
): Promise<ExportResult>;

// ============================================================================
// Runtime composition types
// ============================================================================

export interface ContextSignals {
  language: string | null;
  frameworks: string[];
  packageManager: string | null;
  ci: string | null;
  testFramework: string | null;
}

export interface SelectedSkill {
  name: string;
  score: number;
  meta: SkillMeta & {
    context_budget: ContextBudget;
    composable_with: ComposableWith;
    conflicts_with: string[];
  };
}

/**
 * Detect language, framework, and tooling from a working directory.
 * Scans top level + one level deep. No recursive tree walk.
 *
 * @param cwd - Directory to scan.
 */
export function detectContext(cwd: string): ContextSignals;

/**
 * Select and rank skills by relevance using keyword + tag scoring.
 * Pure heuristic — no LLM calls required.
 *
 * @param prompt - User's input text.
 * @param context - Codebase signals from detectContext().
 * @param options.catalog - Skill metadata array to select from.
 * @param options.maxSkills - Maximum skills to return. Default 5.
 * @param options.budget - Token budget constraint (uses minimal tier costs).
 */
export function selectSkills(
  prompt: string,
  context?: Partial<ContextSignals>,
  options?: {
    catalog?: Array<SkillMeta & {
      context_budget: ContextBudget;
      composable_with?: ComposableWith;
      conflicts_with?: string[];
    }>;
    maxSkills?: number;
    budget?: number;
  }
): SelectedSkill[];

// ============================================================================
// Analytics types
// ============================================================================

export interface UsageEvent {
  type: 'install' | 'compose' | 'remove';
  skills: string[];
  timestamp?: string;
  tier?: Tier;
  ide?: string;
  adapter?: string;
  budget?: number;
  autoSelected?: boolean;
  projectLanguage?: string;
  [key: string]: unknown;
}

export interface UsageReport {
  totalEvents: number;
  skillCounts: Record<string, number>;
  composeCount: number;
  adapterCounts: Record<string, number>;
}

/**
 * Append a usage event to the local tracking file.
 * No-op if tracking is disabled (CI, env var).
 *
 * @param event - Event data to track.
 * @param options.usageFile - Override default usage file path.
 */
export function trackUsage(
  event: UsageEvent,
  options?: { usageFile?: string }
): void;

/**
 * Generate a usage report from the local tracking file.
 *
 * @param options.usageFile - Override default usage file path.
 */
export function getUsageReport(
  options?: { usageFile?: string }
): UsageReport;

/**
 * Remove all local usage tracking data.
 *
 * @param options.usageFile - Override default usage file path.
 */
export function clearUsageData(
  options?: { usageFile?: string }
): void;

/**
 * Check if usage tracking is enabled.
 * Returns false in CI or when AGENT_SKILLS_NO_TRACKING=1.
 */
export function isTrackingEnabled(): boolean;

// ============================================================================
// MCP Server
// ============================================================================

/** Options for creating an MCP server. */
export interface McpServerOptions {
  /** Directory of custom handler .js files (each exports default async function). */
  handlerDir?: string;
  /** Built-in handler functions keyed by tool name. */
  builtinHandlers?: Record<string, (params: Record<string, unknown>) => Promise<McpToolResult>>;
}

/** MCP tool response shape. */
export interface McpToolResult {
  content: Array<{ type: string; text: string }>;
}

/** Result of createMcpServer(). */
export interface McpServerResult {
  /** The McpServer instance from @modelcontextprotocol/sdk. */
  server: unknown;
}

/**
 * Create an MCP server for a skill pack.
 * Registers all tools from the skill's tools/ directory and exposes
 * skill prompts as MCP resources at `skill://<name>/prompt/<tier>`.
 */
export function createMcpServer(
  skillPack: SkillPack,
  options?: McpServerOptions
): Promise<McpServerResult>;

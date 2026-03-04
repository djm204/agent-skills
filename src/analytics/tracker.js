/**
 * tracker.js
 *
 * Local usage tracking for agent-skills. Append-only JSON Lines file.
 * Privacy-first: no telemetry, no network calls, disabled in CI by default.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

// ============================================================================
// Constants
// ============================================================================

/** Default usage file path: ~/.agent-skills/usage.jsonl */
export const USAGE_FILE = path.join(os.homedir(), '.agent-skills', 'usage.jsonl');

// ============================================================================
// Privacy controls
// ============================================================================

/**
 * Check if usage tracking is enabled.
 * Disabled by: AGENT_SKILLS_NO_TRACKING=1, CI=true, GITHUB_ACTIONS=true.
 *
 * @returns {boolean}
 */
export function isTrackingEnabled() {
  if (process.env.AGENT_SKILLS_NO_TRACKING === '1') return false;
  if (process.env.CI === 'true') return false;
  if (process.env.GITHUB_ACTIONS === 'true') return false;
  return true;
}

// ============================================================================
// Track usage
// ============================================================================

/**
 * Append a usage event to the local tracking file.
 *
 * @param {object} event - Event data (type, skills, tier, adapter, etc.)
 * @param {{ usageFile?: string }} [options]
 */
export function trackUsage(event, options = {}) {
  if (!isTrackingEnabled()) return;

  const usageFile = options.usageFile || USAGE_FILE;

  const entry = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  // Ensure parent directory exists
  const dir = path.dirname(usageFile);
  fs.mkdirSync(dir, { recursive: true });

  // Append as JSON Line
  fs.appendFileSync(usageFile, JSON.stringify(entry) + '\n');
}

// ============================================================================
// Usage report
// ============================================================================

/**
 * Generate a usage report from the tracking file.
 *
 * @param {{ usageFile?: string }} [options]
 * @returns {{ totalEvents: number, skillCounts: Record<string, number>, composeCount: number, adapterCounts: Record<string, number> }}
 */
export function getUsageReport(options = {}) {
  const usageFile = options.usageFile || USAGE_FILE;

  const report = {
    totalEvents: 0,
    skillCounts: {},
    composeCount: 0,
    adapterCounts: {},
  };

  if (!fs.existsSync(usageFile)) return report;

  const content = fs.readFileSync(usageFile, 'utf8').trim();
  if (!content) return report;

  const lines = content.split('\n');

  for (const line of lines) {
    try {
      const event = JSON.parse(line);
      report.totalEvents++;

      // Count skills
      if (event.skills) {
        for (const skill of event.skills) {
          report.skillCounts[skill] = (report.skillCounts[skill] || 0) + 1;
        }
      }

      // Count compose events
      if (event.type === 'compose') {
        report.composeCount++;
      }

      // Count adapter usage
      if (event.adapter) {
        report.adapterCounts[event.adapter] = (report.adapterCounts[event.adapter] || 0) + 1;
      }
    } catch {
      // Skip malformed lines
    }
  }

  return report;
}

// ============================================================================
// Clear data
// ============================================================================

/**
 * Remove all local usage data.
 *
 * @param {{ usageFile?: string }} [options]
 */
export function clearUsageData(options = {}) {
  const usageFile = options.usageFile || USAGE_FILE;

  try {
    fs.unlinkSync(usageFile);
  } catch {
    // File doesn't exist — that's fine
  }
}

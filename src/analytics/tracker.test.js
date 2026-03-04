import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  trackUsage,
  getUsageReport,
  clearUsageData,
  isTrackingEnabled,
  USAGE_FILE,
} from './tracker.js';

describe('tracker', () => {
  let tmpDir;
  let originalEnv;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tracker-test-'));
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    process.env = originalEnv;
  });

  // =========================================================================
  // trackUsage
  // =========================================================================

  describe('trackUsage', () => {
    it('appends an install event to usage file', () => {
      const usageFile = path.join(tmpDir, 'usage.jsonl');

      trackUsage({
        type: 'install',
        skills: ['devops-sre'],
        tier: 'standard',
        ide: 'cursor',
      }, { usageFile });

      const lines = fs.readFileSync(usageFile, 'utf8').trim().split('\n');
      expect(lines).toHaveLength(1);

      const event = JSON.parse(lines[0]);
      expect(event.type).toBe('install');
      expect(event.skills).toEqual(['devops-sre']);
      expect(event.tier).toBe('standard');
      expect(event.timestamp).toBeDefined();
    });

    it('appends multiple events', () => {
      const usageFile = path.join(tmpDir, 'usage.jsonl');

      trackUsage({ type: 'install', skills: ['testing'] }, { usageFile });
      trackUsage({ type: 'compose', skills: ['fullstack', 'testing'], budget: 6000 }, { usageFile });

      const lines = fs.readFileSync(usageFile, 'utf8').trim().split('\n');
      expect(lines).toHaveLength(2);
      expect(JSON.parse(lines[0]).type).toBe('install');
      expect(JSON.parse(lines[1]).type).toBe('compose');
    });

    it('creates parent directory if missing', () => {
      const usageFile = path.join(tmpDir, 'deep', 'nested', 'usage.jsonl');

      trackUsage({ type: 'install', skills: ['testing'] }, { usageFile });

      expect(fs.existsSync(usageFile)).toBe(true);
    });

    it('adds timestamp automatically', () => {
      const usageFile = path.join(tmpDir, 'usage.jsonl');

      trackUsage({ type: 'install', skills: ['testing'] }, { usageFile });

      const event = JSON.parse(fs.readFileSync(usageFile, 'utf8').trim());
      expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('does not track when tracking is disabled', () => {
      const usageFile = path.join(tmpDir, 'usage.jsonl');
      process.env.AGENT_SKILLS_NO_TRACKING = '1';

      trackUsage({ type: 'install', skills: ['testing'] }, { usageFile });

      expect(fs.existsSync(usageFile)).toBe(false);
    });

    it('does not track in CI environments', () => {
      const usageFile = path.join(tmpDir, 'usage.jsonl');
      process.env.CI = 'true';

      trackUsage({ type: 'install', skills: ['testing'] }, { usageFile });

      expect(fs.existsSync(usageFile)).toBe(false);
    });
  });

  // =========================================================================
  // getUsageReport
  // =========================================================================

  describe('getUsageReport', () => {
    it('returns report with skill install counts', () => {
      const usageFile = path.join(tmpDir, 'usage.jsonl');
      trackUsage({ type: 'install', skills: ['devops-sre'] }, { usageFile });
      trackUsage({ type: 'install', skills: ['devops-sre'] }, { usageFile });
      trackUsage({ type: 'install', skills: ['testing'] }, { usageFile });

      const report = getUsageReport({ usageFile });

      expect(report.totalEvents).toBe(3);
      expect(report.skillCounts['devops-sre']).toBe(2);
      expect(report.skillCounts['testing']).toBe(1);
    });

    it('tracks compose events', () => {
      const usageFile = path.join(tmpDir, 'usage.jsonl');
      trackUsage({ type: 'compose', skills: ['fullstack', 'testing'], budget: 6000 }, { usageFile });

      const report = getUsageReport({ usageFile });
      expect(report.composeCount).toBe(1);
    });

    it('returns empty report for missing file', () => {
      const report = getUsageReport({ usageFile: path.join(tmpDir, 'nope.jsonl') });

      expect(report.totalEvents).toBe(0);
      expect(report.skillCounts).toEqual({});
    });

    it('returns empty report for empty file', () => {
      const usageFile = path.join(tmpDir, 'usage.jsonl');
      fs.writeFileSync(usageFile, '');

      const report = getUsageReport({ usageFile });
      expect(report.totalEvents).toBe(0);
    });

    it('tracks adapter usage', () => {
      const usageFile = path.join(tmpDir, 'usage.jsonl');
      trackUsage({ type: 'install', skills: ['testing'], adapter: 'langchain' }, { usageFile });
      trackUsage({ type: 'install', skills: ['testing'], adapter: 'cursor' }, { usageFile });
      trackUsage({ type: 'install', skills: ['testing'], adapter: 'cursor' }, { usageFile });

      const report = getUsageReport({ usageFile });
      expect(report.adapterCounts['langchain']).toBe(1);
      expect(report.adapterCounts['cursor']).toBe(2);
    });

    it('skips malformed lines gracefully', () => {
      const usageFile = path.join(tmpDir, 'usage.jsonl');
      fs.writeFileSync(usageFile, 'not json\n{"type":"install","skills":["testing"],"timestamp":"2026-01-01T00:00:00Z"}\n');

      const report = getUsageReport({ usageFile });
      expect(report.totalEvents).toBe(1);
    });
  });

  // =========================================================================
  // clearUsageData
  // =========================================================================

  describe('clearUsageData', () => {
    it('removes the usage file', () => {
      const usageFile = path.join(tmpDir, 'usage.jsonl');
      trackUsage({ type: 'install', skills: ['testing'] }, { usageFile });
      expect(fs.existsSync(usageFile)).toBe(true);

      clearUsageData({ usageFile });
      expect(fs.existsSync(usageFile)).toBe(false);
    });

    it('does not throw for missing file', () => {
      expect(() => clearUsageData({ usageFile: path.join(tmpDir, 'nope.jsonl') })).not.toThrow();
    });
  });

  // =========================================================================
  // isTrackingEnabled
  // =========================================================================

  describe('isTrackingEnabled', () => {
    it('returns true by default', () => {
      delete process.env.AGENT_SKILLS_NO_TRACKING;
      delete process.env.CI;
      expect(isTrackingEnabled()).toBe(true);
    });

    it('returns false when AGENT_SKILLS_NO_TRACKING is set', () => {
      process.env.AGENT_SKILLS_NO_TRACKING = '1';
      expect(isTrackingEnabled()).toBe(false);
    });

    it('returns false in CI environments', () => {
      process.env.CI = 'true';
      expect(isTrackingEnabled()).toBe(false);
    });

    it('returns false for GITHUB_ACTIONS', () => {
      process.env.GITHUB_ACTIONS = 'true';
      expect(isTrackingEnabled()).toBe(false);
    });
  });
});

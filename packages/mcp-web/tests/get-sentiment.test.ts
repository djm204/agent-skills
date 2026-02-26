import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeSentiment } from '../src/lib/sentiment.js';
import { getSentiment } from '../src/tools/get-sentiment.js';

describe('analyzeSentiment', () => {
  it('returns positive for text with positive words', () => {
    const result = analyzeSentiment('ACME Corp', 'excellent growth amazing profit');
    expect(result.overall_sentiment).toBe('positive');
    expect(result.score).toBeGreaterThan(0);
  });

  it('returns negative for text with negative words', () => {
    const result = analyzeSentiment('ACME Corp', 'terrible loss awful crash decline');
    expect(result.overall_sentiment).toBe('negative');
    expect(result.score).toBeLessThan(0);
  });

  it('returns neutral for text with no sentiment words', () => {
    const result = analyzeSentiment('ACME Corp', 'the company released a statement today');
    expect(result.overall_sentiment).toBe('neutral');
  });

  it('returns mixed for text with balanced positive and negative words', () => {
    const result = analyzeSentiment('ACME Corp', 'good growth but terrible loss and steady revenue');
    expect(result.overall_sentiment).toBe('mixed');
  });

  it('includes subject in result', () => {
    const result = analyzeSentiment('TestCo', 'good news');
    expect(result.subject).toBe('TestCo');
  });

  it('confidence increases with more matched words relative to total', () => {
    const low = analyzeSentiment('Co', 'the company announced a statement today regarding operations and strategy');
    const high = analyzeSentiment('Co', 'good great excellent amazing wonderful');
    expect(high.confidence).toBeGreaterThan(low.confidence);
  });
});

describe('getSentiment', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns GetSentimentResult shape with signals', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`
        <table>
          <tr><td><a class="result-link" href="https://news.example.com/1">Good News for ACME</a></td></tr>
          <tr><td class="result-snippet">ACME Corp reported excellent growth and amazing profit this quarter.</td></tr>
          <tr><td><a class="result-link" href="https://news.example.com/2">ACME Update</a></td></tr>
          <tr><td class="result-snippet">The company faces risk and decline in revenue.</td></tr>
        </table>
      `),
    }));

    const result = await getSentiment('ACME Corp');

    expect(result.subject).toBe('ACME Corp');
    expect(result.overall_sentiment).toBeDefined();
    expect(typeof result.confidence).toBe('number');
    expect(result.signals).toHaveLength(2);
    expect(result.signals[0]).toHaveProperty('source');
    expect(result.signals[0]).toHaveProperty('sentiment');
    expect(result.signals[0]).toHaveProperty('summary');
  });
});

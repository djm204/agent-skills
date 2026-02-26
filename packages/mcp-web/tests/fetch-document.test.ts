import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchDocument } from '../src/tools/fetch-document.js';
import { extractText, extractTitle } from '../src/lib/text-extract.js';

const SAMPLE_HTML = `
<!DOCTYPE html>
<html>
<head><title>Test Page Title</title></head>
<body>
  <script>var x = 1;</script>
  <style>.foo { color: red; }</style>
  <h1>Main Heading</h1>
  <p>First paragraph with <b>bold text</b>.</p>
  <p>Second paragraph.</p>
  <noscript>Enable JavaScript</noscript>
</body>
</html>
`;

describe('extractText', () => {
  it('strips script, style, and noscript tags', () => {
    const text = extractText(SAMPLE_HTML);
    expect(text).not.toContain('var x = 1');
    expect(text).not.toContain('color: red');
    expect(text).not.toContain('Enable JavaScript');
  });

  it('preserves readable text content', () => {
    const text = extractText(SAMPLE_HTML);
    expect(text).toContain('Main Heading');
    expect(text).toContain('First paragraph with bold text.');
    expect(text).toContain('Second paragraph.');
  });

  it('decodes HTML entities', () => {
    const text = extractText('<p>A &amp; B &lt; C &gt; D &quot;E&quot; &#39;F&#39;</p>');
    expect(text).toContain('A & B < C > D "E" \'F\'');
  });
});

describe('extractTitle', () => {
  it('extracts title from HTML', () => {
    expect(extractTitle(SAMPLE_HTML)).toBe('Test Page Title');
  });

  it('returns empty string when no title tag', () => {
    expect(extractTitle('<html><body></body></html>')).toBe('');
  });
});

describe('fetchDocument', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns FetchDocumentResult shape with extracted content', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(SAMPLE_HTML),
    }));

    const result = await fetchDocument('https://example.com');

    expect(result.url).toBe('https://example.com');
    expect(result.title).toBe('Test Page Title');
    expect(result.content).toContain('Main Heading');
    expect(result.word_count).toBeGreaterThan(0);
    expect(result.extracted_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('counts words correctly', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<p>one two three</p>'),
    }));

    const result = await fetchDocument('https://example.com');
    expect(result.word_count).toBe(3);
  });
});

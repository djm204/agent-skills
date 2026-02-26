import { describe, it, expect, vi, beforeEach } from 'vitest';
import { webSearch, parseResults } from '../src/tools/web-search.js';

// Sample DuckDuckGo Lite HTML with result structure
const MOCK_HTML = `
<table>
  <tr>
    <td>
      <a class="result-link" href="https://example.com/page1">Example Page One</a>
    </td>
  </tr>
  <tr>
    <td class="result-snippet">This is the snippet for the first result.</td>
  </tr>
  <tr>
    <td>
      <a class="result-link" href="https://example.com/page2">Example &amp; Page Two</a>
    </td>
  </tr>
  <tr>
    <td class="result-snippet">Snippet for <b>second</b> result with HTML tags.</td>
  </tr>
</table>
`;

describe('parseResults', () => {
  it('extracts titles and URLs from result-link anchors', () => {
    const results = parseResults(MOCK_HTML, 10);
    expect(results).toHaveLength(2);
    expect(results[0].title).toBe('Example Page One');
    expect(results[0].url).toBe('https://example.com/page1');
  });

  it('extracts and cleans snippets from result-snippet cells', () => {
    const results = parseResults(MOCK_HTML, 10);
    expect(results[0].snippet).toBe('This is the snippet for the first result.');
    expect(results[1].snippet).toBe('Snippet for second result with HTML tags.');
  });

  it('decodes HTML entities in titles', () => {
    const results = parseResults(MOCK_HTML, 10);
    expect(results[1].title).toBe('Example & Page Two');
  });

  it('respects maxResults limit', () => {
    const results = parseResults(MOCK_HTML, 1);
    expect(results).toHaveLength(1);
  });

  it('returns empty array for HTML with no results', () => {
    const results = parseResults('<html><body>No results</body></html>', 10);
    expect(results).toEqual([]);
  });
});

describe('webSearch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns SearchResult[] shape', async () => {
    // Mock global fetch to avoid real HTTP requests
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(MOCK_HTML),
    }));

    const results = await webSearch('test query');

    expect(results).toHaveLength(2);
    expect(results[0]).toHaveProperty('title');
    expect(results[0]).toHaveProperty('url');
    expect(results[0]).toHaveProperty('snippet');
  });

  it('passes query to DuckDuckGo lite URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(MOCK_HTML),
    });
    vi.stubGlobal('fetch', mockFetch);

    await webSearch('hello world');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('lite.duckduckgo.com/lite/?q=hello%20world'),
      expect.any(Object),
    );
  });
});

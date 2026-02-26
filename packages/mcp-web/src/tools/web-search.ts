import { fetchUrl } from '../lib/http-client.js';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Search the web using DuckDuckGo HTML (zero-config, no API key).
 * Scrapes the lite HTML version for structured results.
 */
export async function webSearch(query: string, maxResults = 10): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(query);
  const html = await fetchUrl(`https://lite.duckduckgo.com/lite/?q=${encoded}`);
  return parseResults(html, maxResults);
}

/**
 * Parse DuckDuckGo Lite HTML results.
 * The lite page uses a table-based layout with result links and snippets.
 */
export function parseResults(html: string, maxResults: number): SearchResult[] {
  const results: SearchResult[] = [];

  // DuckDuckGo lite page has links in class="result-link" anchors
  // and snippets in class="result-snippet" tds.
  // Fallback: extract all anchor href + text pairs from result rows.

  const linkPattern = /<a[^>]+class="result-link"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;
  const snippetPattern = /<td[^>]*class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi;

  const links: { url: string; title: string }[] = [];
  let match;

  while ((match = linkPattern.exec(html)) !== null) {
    links.push({ url: match[1], title: decodeEntities(match[2].trim()) });
  }

  const snippets: string[] = [];
  while ((match = snippetPattern.exec(html)) !== null) {
    snippets.push(decodeEntities(stripTags(match[1]).trim()));
  }

  for (let i = 0; i < Math.min(links.length, maxResults); i++) {
    results.push({
      title: links[i].title,
      url: links[i].url,
      snippet: snippets[i] || '',
    });
  }

  return results;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

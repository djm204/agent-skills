import { fetchUrl } from '../lib/http-client.js';
import { extractText, extractTitle } from '../lib/text-extract.js';

export interface FetchDocumentResult {
  url: string;
  title: string;
  content: string;
  word_count: number;
  extracted_at: string;
}

/**
 * Fetch a URL and extract readable text content.
 */
export async function fetchDocument(url: string): Promise<FetchDocumentResult> {
  const html = await fetchUrl(url);
  const title = extractTitle(html);
  const content = extractText(html);
  const word_count = content.split(/\s+/).filter(Boolean).length;

  return {
    url,
    title,
    content,
    word_count,
    extracted_at: new Date().toISOString(),
  };
}

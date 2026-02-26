const DEFAULT_TIMEOUT = 15_000;
const USER_AGENT = 'mcp-web/0.1.0';

export interface FetchOptions {
  timeout?: number;
  headers?: Record<string, string>;
}

export async function fetchUrl(url: string, options: FetchOptions = {}): Promise<string> {
  const { timeout = DEFAULT_TIMEOUT, headers = {} } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

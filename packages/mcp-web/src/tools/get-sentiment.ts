import { analyzeSentiment, type SentimentResult } from '../lib/sentiment.js';
import { webSearch } from './web-search.js';
import { fetchDocument } from './fetch-document.js';

export interface GetSentimentResult {
  subject: string;
  overall_sentiment: string;
  confidence: number;
  signals: Array<{
    source: string;
    sentiment: string;
    summary: string;
  }>;
}

/**
 * Analyze sentiment for a subject by searching the web and scoring results.
 * Combines web search snippets with fetched content for richer analysis.
 */
export async function getSentiment(
  subject: string,
  maxSources = 5,
): Promise<GetSentimentResult> {
  const searchResults = await webSearch(`${subject} news sentiment`, maxSources);

  const signals: GetSentimentResult['signals'] = [];
  let totalScore = 0;
  let totalConfidence = 0;

  for (const result of searchResults) {
    // Analyze the snippet directly (fast, always available)
    const snippetAnalysis = analyzeSentiment(subject, result.snippet);
    signals.push({
      source: result.url,
      sentiment: snippetAnalysis.overall_sentiment,
      summary: result.snippet.slice(0, 200),
    });
    totalScore += snippetAnalysis.score;
    totalConfidence += snippetAnalysis.confidence;
  }

  const avgScore = signals.length > 0 ? totalScore / signals.length : 0;
  const avgConfidence = signals.length > 0 ? totalConfidence / signals.length : 0;

  let overall_sentiment: string;
  if (avgScore > 0.5) overall_sentiment = 'positive';
  else if (avgScore < -0.5) overall_sentiment = 'negative';
  else if (signals.length > 1 && Math.abs(avgScore) <= 0.5) overall_sentiment = 'mixed';
  else overall_sentiment = 'neutral';

  return {
    subject,
    overall_sentiment,
    confidence: Math.round(avgConfidence * 100) / 100,
    signals,
  };
}

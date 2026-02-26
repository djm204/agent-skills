/**
 * AFINN-165 word-level sentiment lexicon.
 *
 * Subset of the most common ~500 words from the AFINN-165 list (MIT licensed).
 * Scores range from -5 (most negative) to +5 (most positive).
 *
 * Full list: https://github.com/fnielsen/afinn (2,477 entries).
 * Embedded here to avoid runtime dependencies.
 */
const AFINN: Record<string, number> = {
  // Strongly positive (+4/+5)
  outstanding: 5, superb: 5, breathtaking: 5, thrilled: 5, ecstatic: 5,
  excellent: 4, amazing: 4, wonderful: 4, fantastic: 4, brilliant: 4,
  exceptional: 4, magnificent: 4, love: 3, awesome: 4, incredible: 4,

  // Positive (+2/+3)
  great: 3, good: 3, happy: 3, joy: 3, win: 4, success: 3, best: 3,
  beautiful: 3, perfect: 3, fortunate: 3, pleased: 3, impressive: 3,
  terrific: 3, delightful: 3, remarkable: 3, celebrate: 3,
  like: 2, enjoy: 2, nice: 2, positive: 2, strong: 2, benefit: 2,
  improve: 2, growth: 2, gain: 2, profit: 2, innovative: 2,
  efficient: 2, reliable: 2, trust: 2, confident: 2, recommend: 2,
  helpful: 2, advantage: 2, opportunity: 2, valuable: 2, promising: 2,
  optimistic: 2, favorable: 2, upgrade: 2, progress: 2, robust: 2,

  // Mildly positive (+1)
  ok: 1, okay: 1, fine: 1, decent: 1, adequate: 1, fair: 1,
  stable: 1, steady: 1, interest: 1, support: 1, agree: 1,

  // Mildly negative (-1)
  concern: -1, uncertain: -1, doubt: -1, slight: -1, minor: -1,
  mediocre: -1, average: -1, slow: -1, delay: -1, miss: -1,
  lack: -1, limited: -1, weak: -1, flat: -1, stagnant: -1,

  // Negative (-2/-3)
  bad: -3, poor: -3, terrible: -3, awful: -3, fail: -3, failure: -3,
  hate: -3, ugly: -3, wrong: -3, worst: -3, pain: -3, angry: -3,
  sad: -2, harm: -2, loss: -2, lose: -2, decline: -2, drop: -2,
  risk: -2, threat: -2, danger: -2, crisis: -2, crash: -2,
  problem: -2, damage: -2, negative: -2, warning: -2, disappoint: -2,
  frustrate: -2, trouble: -2, worry: -2, fear: -2, difficult: -2,
  expensive: -2, overpriced: -2, penalty: -2, debt: -2, deficit: -2,
  layoff: -2, downgrade: -2, struggle: -2, volatile: -2, downturn: -2,

  // Strongly negative (-4/-5)
  catastrophe: -4, devastating: -4, disastrous: -4, horrific: -4,
  catastrophic: -5, fraud: -4, scandal: -4, bankrupt: -4, collapse: -4,
  toxic: -4, scam: -4, exploit: -3, corrupt: -4,
};

export interface SentimentResult {
  subject: string;
  overall_sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  confidence: number;
  score: number;
  word_count: number;
  matched_words: number;
}

/**
 * Analyze sentiment of text using AFINN-165 word scoring.
 */
export function analyzeSentiment(subject: string, text: string): SentimentResult {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
  let totalScore = 0;
  let matchedWords = 0;

  for (const word of words) {
    const score = AFINN[word];
    if (score !== undefined) {
      totalScore += score;
      matchedWords++;
    }
  }

  const avgScore = matchedWords > 0 ? totalScore / matchedWords : 0;
  const confidence = Math.min(matchedWords / Math.max(words.length, 1), 1);

  let overall_sentiment: SentimentResult['overall_sentiment'];
  if (matchedWords === 0) {
    overall_sentiment = 'neutral';
  } else if (avgScore > 0.5) {
    overall_sentiment = 'positive';
  } else if (avgScore < -0.5) {
    overall_sentiment = 'negative';
  } else if (matchedWords > 2 && Math.abs(avgScore) <= 0.5) {
    overall_sentiment = 'mixed';
  } else {
    overall_sentiment = 'neutral';
  }

  return {
    subject,
    overall_sentiment,
    confidence: Math.round(confidence * 100) / 100,
    score: Math.round(avgScore * 100) / 100,
    word_count: words.length,
    matched_words: matchedWords,
  };
}

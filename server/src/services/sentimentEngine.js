// Simple rule-based/keyword sentiment bucket scorer
const scoreChatMessage = (messageBody) => {
  const text = messageBody.toLowerCase();
  
  // Basic positive/energetic keywords
  const positiveWords = ['hype', 'fire', 'lets go', 'amazing', 'banger', 'love', 'energy', 'W', 'epic'];
  // Basic negative/low-energy keywords
  const negativeWords = ['boring', 'skip', 'tired', 'slow', 'trash', 'sleep', 'L', 'meh'];

  let score = 0.5; // Neutral baseline

  positiveWords.forEach(word => {
    if (text.includes(word)) score += 0.2;
  });

  negativeWords.forEach(word => {
    if (text.includes(word)) score -= 0.2;
  });

  // Clamp score between 0.0 and 1.0
  const clampedScore = Math.max(0, Math.min(1, score));

  let bucket = 'neutral';
  if (clampedScore > 0.6) bucket = 'positive';
  if (clampedScore < 0.4) bucket = 'negative';

  return { score: clampedScore, bucket };
};

module.exports = { scoreChatMessage };
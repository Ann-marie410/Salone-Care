import { healthKnowledge, emergencyResponses, greetings, HealthTopic } from './health-knowledge';

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

function simpleWordMatch(userWords: Set<string>, keywords: string[]): boolean {
  for (const keyword of keywords) {
    const keywordWords = keyword.toLowerCase().split(/\s+/);
    const matchCount = keywordWords.filter(w => userWords.has(w)).length;
    if (matchCount === keywordWords.length) return true;
  }
  return false;
}

function partialWordMatch(userWords: Set<string>, keywords: string[]): number {
  let bestScore = 0;
  for (const keyword of keywords) {
    const keywordWords = keyword.toLowerCase().split(/\s+/);
    const matches = keywordWords.filter(w => userWords.has(w)).length;
    if (keywordWords.length === 1 && keywordWords[0].length <= 3) {
      if (matches === 1) return 0.8;
    }
    const score = matches / Math.max(keywordWords.length, 1);
    if (score > bestScore) bestScore = score;
  }
  return bestScore;
}

function findBestMatch(message: string, topics: HealthTopic[]): HealthTopic | null {
  const normalized = normalize(message);
  const userWords = new Set(normalized.split(/\s+/).filter(w => w.length > 1));

  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'just', 'about', 'up', 'and',
    'but', 'or', 'if', 'because', 'what', 'which', 'who', 'whom', 'this',
    'that', 'these', 'those', 'it', 'its', 'my', 'your', 'his', 'her',
    'our', 'their', 'me', 'him', 'us', 'them', 'i', 'he', 'she', 'we',
    'you', 'they', 'am', 'got', 'get', 'some', 'any', 'had', 'has',
    'does', 'need', 'want', 'please', 'tell', 'help', 'having',
  ]);

  const significantWords = new Set(
    [...userWords].filter(w => !stopWords.has(w))
  );

  let bestMatch: HealthTopic | null = null;
  let bestScore = 0;

  for (const topic of topics) {
    const hasExact = simpleWordMatch(significantWords.size > 0 ? significantWords : userWords, topic.keywords);
    if (hasExact) {
      const priority = topic.priority || 0;
      const score = 1 + priority;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = topic;
      }
    }
  }

  if (bestMatch) return bestMatch;

  for (const topic of topics) {
    const score = partialWordMatch(significantWords.size > 0 ? significantWords : userWords, topic.keywords);
    const adjustedScore = score + (topic.priority || 0);
    if (adjustedScore > bestScore && score >= 0.5) {
      bestScore = adjustedScore;
      bestMatch = topic;
    }
  }

  return bestMatch;
}

export function getChatResponse(message: string): string {
  const cleaned = message.trim();
  if (!cleaned) {
    return "Please type your question or concern. I'm here to help.";
  }

  const emergencyMatch = findBestMatch(cleaned, emergencyResponses);
  if (emergencyMatch) {
    return emergencyMatch.response;
  }

  const greetingMatch = findBestMatch(cleaned, greetings);
  if (greetingMatch) {
    return greetingMatch.response;
  }

  const healthMatch = findBestMatch(cleaned, healthKnowledge);
  if (healthMatch) {
    return healthMatch.response;
  }

  return `I'm sorry, I don't have enough information to answer that question. Please consult a qualified healthcare professional or visit the nearest hospital.

You can also ask me about:
- Common health conditions (malaria, typhoid, fever, headache, etc.)
- Using the SaloneCare app (appointments, medicine orders, hospital locator)
- First aid and emergency situations
- Child health and nutrition

${"This assistant provides general health information and is not a substitute for professional medical care. Always consult a qualified healthcare professional for diagnosis and treatment."}`;
}

import { GEMINI_API_KEY } from '../config/keys';

const BATCH_SIZE = 50;
const CONCURRENCY = 3;
const MAX_RETRIES = 5;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const PAIN_POINT_KEYWORDS = {
  "product quality": [
    "broken", "fake", "duplicate", "pathetic", "useless", "worst quality",
    "bakwas", "kharab", "nakli", "tuta hua", "bekar", "waste of money",
    "not as described", "wrong product", "cheap quality", "bad quality"
  ],
  "delivery issue": [
    "late", "delayed", "never arrived", "not delivered", "wrong item",
    "missing", "lost", "der se aaya", "nahi aaya", "galat item"
  ],
  "packaging problem": [
    "damaged box", "crushed", "torn", "open box", "packaging broken",
    "box damaged", "packet phata", "damaged packaging"
  ],
  "customer service": [
    "no response", "rude", "unhelpful", "support bad", "no refund",
    "return rejected", "helpline", "customer care"
  ],
  "pricing": [
    "overpriced", "expensive", "not worth", "too costly", "mehnga",
    "price is high", "paisa waste"
  ]
};

const applyKeywordFallback = (text, geminiPainPoint) => {
  if (geminiPainPoint && geminiPainPoint !== "none") return geminiPainPoint;

  const lower = text.toLowerCase();

  for (const [painPoint, keywords] of Object.entries(PAIN_POINT_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return painPoint;
    }
  }

  return "none";
};

const analyzeSingleBatch = async (texts, retryCount = 0) => {
  const numbered = texts.map((t, i) => `${i + 1}. ${t}`).join('\n');

  try {
    const response = await fetch(
      `/api/gemini/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
          contents: [{
            parts: [{
              text: `You are a world-class sentiment analyst. Analyze these reviews (English, Hindi, Hinglish). 
Return a JSON array of ${texts.length} objects. 

GUIDELINES:
1. "Worst product 😡" MUST be [negative, anger]
2. "I love this 😍" MUST be [positive, joy]
3. "Acha item hai" MUST be [positive, joy]
4. "Bakwas quality" MUST be [negative, disgust]
5. Do NOT use "neutral" if there is even one emoji or emotive word.

Fields:
- "emotion": joy, anger, disgust, fear, sadness, surprise, neutral
- "sentiment": positive, negative, neutral
- "language": English, Hindi, Hinglish, or Emoji
- "painPoint": product quality, delivery issue, packaging problem, customer service, pricing, none
- "location": city/country OR "unknown"
- "isBot": boolean

Reviews:
${numbered}`
            }]
          }]
        })
      }
    );

    if ((response.status === 503 || response.status === 429) && retryCount < MAX_RETRIES) {
      const waitTime = Math.pow(1.5, retryCount) * 3000;
      console.warn(`Gemini Busy (503/429). Retrying in ${Math.round(waitTime)}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(waitTime);
      return analyzeSingleBatch(texts, retryCount + 1);
    }

    if (!response.ok) {
      console.error(`Gemini Batch Failed after ${MAX_RETRIES} retries. Status: ${response.status}. Filling with neutral data.`);
      return texts.map(() => ({
        emotion: 'neutral',
        sentiment: 'neutral',
        painPoint: 'none',
        location: 'unknown',
        isBot: false
      }));
    }

    const data = await response.json();
    let raw = data.candidates[0].content.parts[0].text.trim();

    if (raw.includes('```')) {
      raw = raw.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    }

    let parsed = [];
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      console.error(`JSON Parse Error. The model generated malformed JSON.`, parseError);
      return texts.map(() => ({ emotion: 'neutral', sentiment: 'neutral', painPoint: 'none', location: 'unknown', isBot: false }));
    }

    if (!Array.isArray(parsed)) {
      return texts.map(() => ({ emotion: 'neutral', sentiment: 'neutral', painPoint: 'none', location: 'unknown', isBot: false }));
    }

    return texts.map((text, idx) => {
      const result = parsed[idx] || { emotion: 'neutral', sentiment: 'neutral', painPoint: 'none', location: 'unknown', isBot: false };
      return {
        ...result,
        painPoint: applyKeywordFallback(text, result.painPoint)
      };
    });

  } catch (err) {
    if (retryCount < MAX_RETRIES) {
      await sleep(3000);
      return analyzeSingleBatch(texts, retryCount + 1);
    }
    return texts.map(() => ({ emotion: 'neutral', sentiment: 'neutral', painPoint: 'none', location: 'unknown', isBot: false }));
  }
};

export const analyzeReviewsBatch = async (texts, setStatusMessage) => {
  const batches = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    batches.push({ batch: texts.slice(i, i + BATCH_SIZE), startIndex: i });
  }

  const results = new Array(texts.length);
  let completedBatches = 0;

  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const chunk = batches.slice(i, i + CONCURRENCY);

    await Promise.all(chunk.map(async ({ batch, startIndex }) => {
      const batchResults = await analyzeSingleBatch(batch);
      batchResults.forEach((result, j) => {
        results[startIndex + j] = result;
      });
      completedBatches++;
      if (setStatusMessage) {
        const pct = Math.round((completedBatches / batches.length) * 100);
        setStatusMessage(`Analyzing reviews with Gemini... ${pct}% ${completedBatches < batches.length ? '(Managing traffic...)' : ''}`);
      }
    }));
  }

  return results;
};
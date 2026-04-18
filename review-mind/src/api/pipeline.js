import { analyzeReviewsBatch } from './gemini';
import { generateReplies } from './groq';
import { calcSubScore, calcBrandHealthScore, generateTickets } from '../utils/scoring';

const BOILERPLATE_PATTERNS = [
  'found a lower price',
  'fields with an asterisk',
  'review attachment',
  'positive ratings from',
  'recent orders from',
  'years on amazon',
  'top brand',
  'share:',
  'sign in',
  'sponsored',
  'see more reviews',
  'helpful?',
  'report abuse',
  'cookie',
  'add to cart',
  'add to wishlist',
  'customer questions',
];

const isBoilerplateText = (text) => {
  if (!text) return true;
  const lower = text.toLowerCase();
  return BOILERPLATE_PATTERNS.some(p => lower.includes(p));
};

export const runAnalysisPipeline = async (reviews, setStatusMessage) => {
  if (!reviews || reviews.length === 0) throw new Error("No reviews provided");

  const emotionCounts = { joy: 0, anger: 0, disgust: 0, fear: 0, sadness: 0, surprise: 0, neutral: 0 };
  const painPointAggregations = {};
  const processedReviews = [];
  let totalPositive = 0;

  const seenTexts = [];

  console.log(`[Pipeline] Input reviews: ${reviews.length}`);

  // Defensive filter — catches boilerplate only if it's extremely short/empty
  const limitedReviews = reviews
    .slice(0, 10000) // Support up to 10k reviews
    .filter(r => {
      const text = r.review_text || r.text || r;
      const hasImages = Array.isArray(r.images) && r.images.length > 0;
      
      if (typeof text !== 'string') return false;
      
      const isShort = text.trim().length < 2; // Only drop truly empty/single-char junk
      if (isShort && !hasImages) return false;
      
      // We are removing deduplication and boilerplate filters for CSVs to ensure "Whole Data" analysis.
      // Customer datasets often have naturally repeating feedback or industry-specific terms 
      // that our patterns might mistakenly flag as boilerplate.
      
      return true;
    });

  console.log(`[Pipeline] Reviews after filtering: ${limitedReviews.length}`);

  const textsToProcess = limitedReviews.map(r => r.review_text || r.text || r);

  if (textsToProcess.length === 0) throw new Error("No valid reviews found after filtering.");

  if (setStatusMessage) setStatusMessage(`Sending ${textsToProcess.length} reviews to Gemini...`);

  const batchResults = await analyzeReviewsBatch(textsToProcess, setStatusMessage);
  if (!batchResults) throw new Error("Gemini analysis failed.");

  const locationAggregations = {};
  let botCount = 0;

  for (let i = 0; i < textsToProcess.length; i++) {
    const text = textsToProcess[i];
    const sourceObj = limitedReviews[i] || {};
    const reviewImages = sourceObj.images || [];

    const { 
      emotion = 'neutral', 
      sentiment = 'neutral', 
      painPoint = 'none',
      location = 'unknown',
      language = 'english'
    } = batchResults[i] || {};

    let isBotDetected = batchResults[i]?.isBot || false;
    
    // Deterministic Duplicate Detection: If text is identical to any previous review, mark as bot
    const normalizedText = text.trim().toLowerCase();
    if (seenTexts.includes(normalizedText)) {
       isBotDetected = true;
    } else {
       seenTexts.push(normalizedText);
    }

    const dominantEmotion = emotion.toLowerCase();
    const dominantSentiment = sentiment.toLowerCase();
    const topPainPoint = painPoint.toLowerCase();
    const detectedLang = language.toLowerCase();
    
    // Preference: AI detected location > Reported CSV location > 'unknown'
    let loc = location.toLowerCase();
    if (loc === 'unknown' && sourceObj.reported_location) {
       loc = sourceObj.reported_location.toLowerCase();
    }

    if (emotionCounts[dominantEmotion] !== undefined) emotionCounts[dominantEmotion]++;
    if (dominantSentiment === 'positive') totalPositive++;
    if (isBotDetected) botCount++;

    if (loc !== 'unknown') {
      locationAggregations[loc] = (locationAggregations[loc] || 0) + 1;
    }

    if (topPainPoint !== 'none') {
      if (!painPointAggregations[topPainPoint]) {
        painPointAggregations[topPainPoint] = { count: 0, positive: 0, snippets: [] };
      }
      painPointAggregations[topPainPoint].count++;
      if (dominantSentiment === 'positive') painPointAggregations[topPainPoint].positive++;
      if (dominantSentiment === 'negative') painPointAggregations[topPainPoint].snippets.push(text);
    }

    processedReviews.push({
      text,
      emotion: dominantEmotion,
      sentiment: dominantSentiment,
      painPoint: topPainPoint,
      location: loc,
      language: detectedLang,
      isBot: isBotDetected,
      images: reviewImages
    });
  }

  const verifiedReviewPercentage = Math.round(((processedReviews.length - botCount) / processedReviews.length) * 100) || 0;
  const topLocations = Object.entries(locationAggregations)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  if (setStatusMessage) setStatusMessage("Calculating Brand Health Score...");

  const productQuality = calcSubScore(processedReviews, r => r.painPoint === 'product quality');
  const deliveryExperience = calcSubScore(processedReviews, r => r.painPoint === 'delivery issue');
  const packagingIntegrity = calcSubScore(processedReviews, r => r.painPoint === 'packaging problem');
  const sentimentTrend = Math.round((totalPositive / processedReviews.length) * 100) || 0;

  const scores = { productQuality, deliveryExperience, packagingIntegrity, sentimentTrend };
  const brandHealthScore = calcBrandHealthScore(scores);

  if (setStatusMessage) setStatusMessage("Generating action tickets & replies...");

  const tickets = generateTickets(painPointAggregations);

  const overallTopPainPoint = Object.keys(painPointAggregations).length > 0
    ? Object.entries(painPointAggregations).reduce((a, b) => a[1].count > b[1].count ? a : b)[0]
    : "general dissatisfaction";

  const emotionEntries = Object.entries(emotionCounts).filter(([, v]) => v > 0);
  const overallTopEmotion = emotionEntries.length > 0
    ? emotionEntries.reduce((a, b) => a[1] > b[1] ? a : b)[0]
    : "neutral";

  const replies = await generateReplies(overallTopPainPoint, overallTopEmotion);

  return {
    date: new Date().toISOString(),
    productName: reviews[0]?.product_name || "General Upload",
    productImage: reviews[0]?.productImage || null,
    brandHealthScore,
    scores,
    emotionCounts,
    painPointAggregations,
    tickets,
    replies,
    totalReviews: processedReviews.length,
    topLocations,
    verifiedReviewPercentage,
    processedReviews
  };
};
// ─── G2: AI Stylist Recommendation Service ──────────────────────────────────
// Provides personalized hairstyle recommendations based on user history,
// preferences, and trending signals.

const Hairstyle = require('../models/Hairstyle');
const Generation = require('../models/Generation');

// The catalogue's differentiator (and the product's target audience): textured
// and protective styles. Used to bias the cold-start shelf — see the cold-start
// branch in getForYouRecommendations for why.
const TEXTURED_CATEGORIES = [
  'Braids',
  'Locs',
  'Twists',
  'Afros',
  'Coils',
  'Fades',
  'Protective',
  'Weaves',
  'Low Cut',
  'Traditional'
];

/**
 * Get personalized "For You" recommendations based on user history
 */
async function getForYouRecommendations(userId, { gender, limit = 8 } = {}) {
  // Step 1: Get user's recent generation history for preference signals
  const recentGenerations = await Generation.find({
    userId,
    status: 'completed'
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('hairstyle', 'category gender attributes price')
    .lean();

  // Step 2: Extract preference signals
  const categoryFreq = {};
  const priceRange = { min: Infinity, max: 0 };
  const usedStyleIds = new Set();

  for (const gen of recentGenerations) {
    if (!gen.hairstyle) continue;
    usedStyleIds.add(gen.hairstyle._id.toString());
    const cat = gen.hairstyle.category;
    if (cat) categoryFreq[cat] = (categoryFreq[cat] || 0) + 1;
    if (gen.hairstyle.price !== undefined) {
      priceRange.min = Math.min(priceRange.min, gen.hairstyle.price);
      priceRange.max = Math.max(priceRange.max, gen.hairstyle.price);
    }
  }

  // Step 3: Build recommendation query
  const query = { isActive: true, _id: { $nin: Array.from(usedStyleIds) } };

  // Gender filter
  if (gender) {
    query.gender = { $in: [gender, 'unisex'] };
  }

  // If user has history, weight toward preferred categories
  const topCategories = Object.entries(categoryFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  let recommendations = [];

  if (topCategories.length > 0) {
    // Get styles from preferred categories (weighted)
    const preferred = await Hairstyle.find({
      ...query,
      category: { $in: topCategories }
    })
      .sort({ popularity: -1, averageRating: -1 })
      .limit(Math.ceil(limit * 0.6))
      .select('_id name thumbnail price category gender popularity generationCount averageRating attributes')
      .lean();

    // Get discovery styles from OTHER categories for variety
    const discovery = await Hairstyle.find({
      ...query,
      category: { $nin: topCategories }
    })
      .sort({ popularity: -1 })
      .limit(Math.ceil(limit * 0.4))
      .select('_id name thumbnail price category gender popularity generationCount averageRating attributes')
      .lean();

    recommendations = [...preferred, ...discovery];
  } else {
    // COLD START — the first impression, and the one that decides whether a new
    // user sees an app "for them". Raw popularity was surfacing mostly European
    // styles (blonde updos, rose buns) on an app whose differentiator is
    // textured/protective hair, so new users met a catalogue that looked like
    // every other try-on app. Lead with the textured categories, then fill with
    // overall popularity so the shelf is never short.
    const SELECT =
      '_id name thumbnail price category gender popularity generationCount averageRating attributes';

    // Take the FULL shelf from textured categories when the catalogue can
    // supply it (it has ~187 such styles). An earlier 70% split left the
    // remaining slots to overall popularity, which put blonde updos back on the
    // first shelf a new user sees — defeating the point of the bias.
    const textured = await Hairstyle.find({
      ...query,
      category: { $in: TEXTURED_CATEGORIES }
    })
      .sort({ popularity: -1, averageRating: -1 })
      .limit(limit)
      .select(SELECT)
      .lean();

    const texturedIds = new Set(textured.map((s) => s._id.toString()));
    const filler = await Hairstyle.find({
      ...query,
      _id: { ...(query._id || {}), $nin: [...Array.from(usedStyleIds), ...texturedIds] }
    })
      .sort({ popularity: -1, averageRating: -1 })
      .limit(limit)
      .select(SELECT)
      .lean();

    recommendations = [...textured, ...filler];
  }

  // Tag each with recommendation reason
  return recommendations.slice(0, limit).map(style => ({
    ...style,
    recommendationReason: topCategories.includes(style.category)
      ? `Because you liked ${style.category} styles`
      : 'Popular in your community'
  }));
}

/**
 * Get "Similar to" recommendations for a specific hairstyle
 */
async function getSimilarStyles(hairstyleId, { limit = 6, excludeIds = [] } = {}) {
  const source = await Hairstyle.findById(hairstyleId)
    .select('category gender attributes price')
    .lean();

  if (!source) return [];

  const excludeSet = [...excludeIds, hairstyleId];

  // Find styles in same category with similar attributes
  const sameCategory = await Hairstyle.find({
    isActive: true,
    _id: { $nin: excludeSet },
    category: source.category,
    gender: { $in: [source.gender, 'unisex'] }
  })
    .sort({ popularity: -1 })
    .limit(limit)
    .select('_id name thumbnail price category gender popularity generationCount averageRating attributes')
    .lean();

  // If not enough, backfill from same gender, different category
  if (sameCategory.length < limit) {
    const backfill = await Hairstyle.find({
      isActive: true,
      _id: { $nin: [...excludeSet, ...sameCategory.map(s => s._id)] },
      gender: { $in: [source.gender, 'unisex'] }
    })
      .sort({ popularity: -1 })
      .limit(limit - sameCategory.length)
      .select('_id name thumbnail price category gender popularity generationCount averageRating attributes')
      .lean();

    return [...sameCategory, ...backfill].map(s => ({
      ...s,
      recommendationReason: s.category === source.category
        ? `Similar ${source.category} style`
        : 'You might also like'
    }));
  }

  return sameCategory.map(s => ({
    ...s,
    recommendationReason: `Similar ${source.category} style`
  }));
}

/**
 * Get trending styles based on recent generation activity
 */
async function getTrendingStyles({ gender, limit = 8, daysBack = 7 } = {}) {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysBack);

  // Aggregate recent generations to find trending hairstyles
  const pipeline = [
    {
      $match: {
        createdAt: { $gte: sinceDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$hairstyle',
        recentGenerations: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    },
    { $sort: { recentGenerations: -1 } },
    { $limit: limit * 2 } // Fetch extra for filtering
  ];

  const trending = await Generation.aggregate(pipeline);
  const trendingIds = trending.map(t => t._id).filter(Boolean);

  if (trendingIds.length === 0) {
    // Fallback to overall popular
    const query = { isActive: true };
    if (gender) query.gender = { $in: [gender, 'unisex'] };
    return Hairstyle.find(query)
      .sort({ popularity: -1 })
      .limit(limit)
      .select('_id name thumbnail price category gender popularity generationCount averageRating attributes')
      .lean()
      .then(styles => styles.map(s => ({
        ...s,
        trendScore: s.popularity,
        recommendationReason: 'Popular style'
      })));
  }

  const query = { _id: { $in: trendingIds }, isActive: true };
  if (gender) query.gender = { $in: [gender, 'unisex'] };

  const styles = await Hairstyle.find(query)
    .select('_id name thumbnail price category gender popularity generationCount averageRating attributes')
    .lean();

  // Merge trend scores
  const trendMap = {};
  for (const t of trending) {
    if (t._id) trendMap[t._id.toString()] = t;
  }

  return styles
    .map(s => ({
      ...s,
      trendScore: trendMap[s._id.toString()]?.recentGenerations || 0,
      recommendationReason: 'Trending this week'
    }))
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, limit);
}

/**
 * Get style context notes — explanatory text for why a style works
 */
function getStyleContextNotes(hairstyle) {
  const notes = [];
  const attrs = hairstyle.attributes || {};

  if (attrs.complexity === 'simple') {
    notes.push({ type: 'maintenance', text: 'Low maintenance — quick daily styling', icon: '⚡' });
  } else if (attrs.complexity === 'intricate' || attrs.complexity === 'highly-intricate') {
    notes.push({ type: 'maintenance', text: 'Detailed styling — salon recommended', icon: '💈' });
  }

  if (attrs.fadeType && attrs.fadeType !== 'none') {
    const fadeName = attrs.fadeType.replace(/-/g, ' ');
    notes.push({ type: 'technique', text: `Features a ${fadeName}`, icon: '✂️' });
  }

  if (attrs.length) {
    const lengthMap = { buzz: 'Very short', short: 'Short', medium: 'Medium length', long: 'Long', 'extra-long': 'Extra long' };
    notes.push({ type: 'length', text: lengthMap[attrs.length] || attrs.length, icon: '📏' });
  }

  if (attrs.hasColorTreatment) {
    notes.push({ type: 'color', text: attrs.colorNotes || 'Includes color treatment', icon: '🎨' });
  }

  if (attrs.stylingTechnique && attrs.stylingTechnique !== 'natural' && attrs.stylingTechnique !== 'other') {
    const techName = attrs.stylingTechnique.replace(/-/g, ' ');
    notes.push({ type: 'technique', text: `${techName.charAt(0).toUpperCase() + techName.slice(1)} technique`, icon: '💇' });
  }

  return notes;
}

module.exports = {
  getForYouRecommendations,
  getSimilarStyles,
  getTrendingStyles,
  getStyleContextNotes
};

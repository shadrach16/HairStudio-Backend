// ─── G2: Collections & Recommendations Routes ────────────────────────────────
const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const Analytics = require('../models/Analytics');
const { optionalAuth, protect } = require('../middleware/auth');
const {
  getForYouRecommendations,
  getSimilarStyles,
  getTrendingStyles,
  getStyleContextNotes
} = require('../services/recommendationService');
const Hairstyle = require('../models/Hairstyle');

// ─── Helper: assign deterministic A/B variant ────────────────────────────────
function getRecommendationVariant(userId) {
  if (!userId) return 'control';
  // Simple hash: sum char codes mod 2
  const hash = userId.toString().split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return hash % 2 === 0 ? 'control' : 'variant_a';
}

// ─── Recommendation Endpoints (MUST come before /:slug wildcard) ─────────────

// @desc    Get personalized "For You" recommendations
// @route   GET /api/collections/recommendations/for-you
router.get('/recommendations/for-you', optionalAuth, async (req, res, next) => {
  try {
    const gender = req.query.gender || null;
    const limit = Math.min(parseInt(req.query.limit) || 8, 20);
    let recommendations;
    if (req.user?._id) {
      recommendations = await getForYouRecommendations(req.user._id, { gender, limit });
    } else {
      recommendations = await getTrendingStyles({ gender, limit });
    }

    const variant = getRecommendationVariant(req.user?._id);

    // G2: Track recommendation served (authenticated only — per review)
    if (req.user?._id) {
      Analytics.trackEvent('recommendation_served', {
        recommendationSource: 'for-you',
        variant,
        count: recommendations.length,
        gender
      }, req.user._id).catch(() => {});
    }

    // Tag variant on each recommendation
    const tagged = recommendations.map(r => ({ ...r, variantId: variant }));
    res.json({ status: 'success', results: tagged.length, data: { recommendations: tagged } });
  } catch (error) { next(error); }
});

// @desc    Get "Similar Styles" recommendations
// @route   GET /api/collections/recommendations/similar/:hairstyleId
router.get('/recommendations/similar/:hairstyleId', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 12);
    const excludeIds = req.query.exclude ? req.query.exclude.split(',') : [];
    const similar = await getSimilarStyles(req.params.hairstyleId, { limit, excludeIds });
    // G2: Track similar recommendation served
    Analytics.trackEvent('recommendation_served', {
      recommendationSource: 'similar',
      sourceHairstyleId: req.params.hairstyleId,
      count: similar.length
    }, null).catch(() => {});
    res.json({ status: 'success', results: similar.length, data: { recommendations: similar } });
  } catch (error) { next(error); }
});

// @desc    Get trending styles
// @route   GET /api/collections/recommendations/trending
router.get('/recommendations/trending', optionalAuth, async (req, res, next) => {
  try {
    const gender = req.query.gender || null;
    const limit = Math.min(parseInt(req.query.limit) || 8, 20);
    const trending = await getTrendingStyles({ gender, limit });
    // G2: Track trending served (authenticated only)
    if (req.user?._id) {
      Analytics.trackEvent('recommendation_served', {
        recommendationSource: 'trending',
        count: trending.length,
        gender
      }, req.user._id).catch(() => {});
    }
    res.json({ status: 'success', results: trending.length, data: { recommendations: trending } });
  } catch (error) { next(error); }
});

// @desc    Get style context notes for a hairstyle
// @route   GET /api/collections/recommendations/context/:hairstyleId
router.get('/recommendations/context/:hairstyleId', async (req, res, next) => {
  try {
    const hairstyle = await Hairstyle.findById(req.params.hairstyleId).select('name category attributes').lean();
    if (!hairstyle) return res.status(404).json({ status: 'error', message: 'Hairstyle not found' });
    const notes = getStyleContextNotes(hairstyle);
    res.json({ status: 'success', data: { notes, styleName: hairstyle.name } });
  } catch (error) { next(error); }
});

// ─── Collection Endpoints ────────────────────────────────────────────────────

// @desc    Get active collections (for carousel)
// @route   GET /api/collections
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const gender = req.query.gender || 'all';
    const collections = await Collection.getActiveCollections(gender);
    const resolved = await Promise.all(
      collections.map(async (col) => {
        const hairstyles = await col.resolveHairstyles();
        col.viewCount += 1;
        col.save().catch(() => {});
        return {
          _id: col._id, name: col.name, slug: col.slug, description: col.description,
          emoji: col.emoji, coverImage: col.coverImage, type: col.type,
          targetGender: col.targetGender,
          hairstyles: hairstyles.slice(0, 12), hairstyleCount: hairstyles.length
        };
      })
    );
    res.json({ status: 'success', results: resolved.length, data: { collections: resolved } });

    // G2: Track collection shelf viewed (fire-and-forget, authenticated only)
    if (req.user?._id) {
      Analytics.trackEvent('collection_shelf_viewed', {
        collectionSlugs: resolved.map(c => c.slug),
        gender
      }, req.user._id).catch(() => {});
    }
  } catch (error) { next(error); }
});

// @desc    Get a single collection by slug
// @route   GET /api/collections/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const collection = await Collection.findOne({ slug: req.params.slug, isActive: true });
    if (!collection) return res.status(404).json({ status: 'error', message: 'Collection not found' });
    const hairstyles = await collection.resolveHairstyles();
    collection.clickCount += 1;
    collection.save().catch(() => {});

    // G2: Track collection detail viewed
    Analytics.trackEvent('collection_detail_viewed', {
      collectionSlug: req.params.slug,
      hairstyleCount: hairstyles.length
    }, null).catch(() => {});
    res.json({
      status: 'success',
      data: {
        collection: {
          _id: collection._id, name: collection.name, slug: collection.slug,
          description: collection.description, emoji: collection.emoji,
          coverImage: collection.coverImage, type: collection.type, hairstyles
        }
      }
    });
  } catch (error) { next(error); }
});

// @desc    Track collection conversion
// @route   POST /api/collections/:slug/conversion
router.post('/:slug/conversion', async (req, res, next) => {
  try {
    await Collection.updateOne({ slug: req.params.slug }, { $inc: { conversionCount: 1 } });

    // G2: Track collection conversion event
    Analytics.trackEvent('collection_conversion', {
      collectionSlug: req.params.slug,
      hairstyleId: req.body.hairstyleId || null
    }, null).catch(() => {});

    res.json({ status: 'success' });
  } catch (error) { next(error); }
});

module.exports = router;

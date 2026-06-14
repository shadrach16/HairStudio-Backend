// backend/routes/savedLooks.js
// Saved Looks CRUD, Rating, and Compare-Mode API routes

const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const SavedLook = require('../models/SavedLook');
const Generation = require('../models/Generation');
const Hairstyle = require('../models/Hairstyle');
const Analytics = require('../models/Analytics');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─── SAVED LOOKS ────────────────────────────────────────────────────────────

// @desc    Save a generation as a "look"
// @route   POST /api/saved-looks
// @access  Private
router.post('/', protect, [
  body('generationId').isMongoId().withMessage('Valid generation ID is required'),
  body('title').optional().isString().isLength({ max: 100 }),
  body('notes').optional().isString().isLength({ max: 500 }),
  body('tags').optional().isArray({ max: 10 }),
  body('tags.*').optional().isString().isLength({ max: 30 }),
  body('collection').optional().isString().isLength({ max: 50 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { generationId, title, notes, tags, collection } = req.body;
    const userId = req.user._id;

    // Verify generation belongs to user and is completed
    const generation = await Generation.findOne({
      _id: generationId,
      user: userId,
      status: 'completed'
    }).populate('hairstyle', 'name category thumbnail');

    if (!generation) {
      return res.status(404).json({
        success: false,
        message: 'Completed generation not found'
      });
    }

    // Build denormalized snapshot for fast listing
    const snapshot = {
      hairstyleId: generation.hairstyle?._id,
      hairstyleName: generation.hairstyle?.name || 'Custom Style',
      hairstyleCategory: generation.hairstyle?.category || 'Custom',
      originalImageUrl: generation.originalImage?.url,
      generatedImageUrl: generation.generatedImage?.url,
      rating: generation.rating || null
    };

    const savedLook = await SavedLook.saveLook(userId, generationId, {
      title: title || snapshot.hairstyleName,
      notes,
      tags,
      collection,
      snapshot
    });

    await Analytics.trackEvent('look_saved', {
      generationId,
      hairstyleName: snapshot.hairstyleName,
      collection: collection || 'default'
    }, userId);

    res.status(201).json({
      success: true,
      message: 'Look saved',
      data: savedLook
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Look already saved'
      });
    }
    console.error('Save look error:', error);
    res.status(500).json({ success: false, message: 'Failed to save look' });
  }
});

// @desc    Get user's saved looks
// @route   GET /api/saved-looks
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { collection, tag, page = 1, limit = 20 } = req.query;

    const result = await SavedLook.getUserLooks(req.user._id, {
      collection,
      tag,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: result.looks,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get saved looks error:', error);
    res.status(500).json({ success: false, message: 'Failed to get saved looks' });
  }
});

// @desc    Get user's collections list
// @route   GET /api/saved-looks/collections
// @access  Private
router.get('/collections', protect, async (req, res) => {
  try {
    const collections = await SavedLook.getUserCollections(req.user._id);

    res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ success: false, message: 'Failed to get collections' });
  }
});

// @desc    Update a saved look (title, notes, tags, pin, collection)
// @route   PUT /api/saved-looks/:id
// @access  Private
router.put('/:id', protect, [
  param('id').isMongoId(),
  body('title').optional().isString().isLength({ max: 100 }),
  body('notes').optional().isString().isLength({ max: 500 }),
  body('tags').optional().isArray({ max: 10 }),
  body('tags.*').optional().isString().isLength({ max: 30 }),
  body('collection').optional().isString().isLength({ max: 50 }),
  body('isPinned').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, notes, tags, collection, isPinned } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (notes !== undefined) update.notes = notes;
    if (tags !== undefined) update.tags = tags;
    if (collection !== undefined) update.collection = collection;
    if (isPinned !== undefined) update.isPinned = isPinned;

    const savedLook = await SavedLook.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      update,
      { new: true }
    );

    if (!savedLook) {
      return res.status(404).json({ success: false, message: 'Saved look not found' });
    }

    res.json({
      success: true,
      message: 'Look updated',
      data: savedLook
    });
  } catch (error) {
    console.error('Update saved look error:', error);
    res.status(500).json({ success: false, message: 'Failed to update look' });
  }
});

// @desc    Delete a saved look
// @route   DELETE /api/saved-looks/:id
// @access  Private
router.delete('/:id', protect, [
  param('id').isMongoId()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const result = await SavedLook.removeLook(req.user._id, req.params.id);

    if (!result.removed) {
      return res.status(404).json({ success: false, message: 'Saved look not found' });
    }

    res.json({
      success: true,
      message: 'Look removed'
    });
  } catch (error) {
    console.error('Delete saved look error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete look' });
  }
});

// ─── GENERATION RATING ──────────────────────────────────────────────────────

// @desc    Rate a generation (1-5 stars + optional feedback)
// @route   POST /api/saved-looks/rate/:generationId
// @access  Private
router.post('/rate/:generationId', protect, [
  param('generationId').isMongoId(),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('feedback').optional().isString().isLength({ max: 500 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { rating, feedback } = req.body;

    const generation = await Generation.findOne({
      _id: req.params.generationId,
      user: req.user._id,
      status: 'completed'
    });

    if (!generation) {
      return res.status(404).json({
        success: false,
        message: 'Completed generation not found'
      });
    }

    // Update generation rating
    await generation.addRating(rating, feedback);

    // Update hairstyle's averageRating aggregate
    if (generation.hairstyle) {
      const ratingAgg = await Generation.aggregate([
        {
          $match: {
            hairstyle: generation.hairstyle,
            status: 'completed',
            rating: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 }
          }
        }
      ]);

      if (ratingAgg.length > 0) {
        await Hairstyle.findByIdAndUpdate(generation.hairstyle, {
          averageRating: Math.round(ratingAgg[0].avgRating * 10) / 10
        });
      }
    }

    // Sync rating to saved look snapshot if it exists
    await SavedLook.findOneAndUpdate(
      { user: req.user._id, generation: generation._id },
      { 'snapshot.rating': rating }
    );

    await Analytics.trackEvent('generation_rated', {
      generationId: generation._id,
      hairstyleId: generation.hairstyle,
      rating,
      hasFeedback: !!feedback
    }, req.user._id);

    res.json({
      success: true,
      message: 'Rating saved',
      data: { rating, feedback: feedback || null }
    });
  } catch (error) {
    console.error('Rate generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to save rating' });
  }
});

// ─── COMPARE MODE ───────────────────────────────────────────────────────────

// @desc    Get compare-mode data for up to 3 generations side-by-side
// @route   POST /api/saved-looks/compare
// @access  Private
router.post('/compare', protect, [
  body('generationIds')
    .isArray({ min: 2, max: 3 })
    .withMessage('Provide 2-3 generation IDs to compare'),
  body('generationIds.*').isMongoId()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { generationIds } = req.body;

    // Fetch generations that belong to this user and are completed
    const generations = await Generation.find({
      _id: { $in: generationIds },
      user: req.user._id,
      status: 'completed'
    }).populate('hairstyle', 'name category thumbnail price gender averageRating');

    if (generations.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 valid completed generations required for comparison'
      });
    }

    // Build comparison payload with transparent pricing
    const items = generations.map(gen => ({
      generationId: gen._id,
      createdAt: gen.createdAt,
      creditsUsed: gen.creditsUsed,
      processingTime: gen.processingTime,
      rating: gen.rating || null,
      feedback: gen.feedback || null,
      originalImage: gen.originalImage?.url || null,
      generatedImage: gen.generatedImage?.url || null,
      hairstyle: gen.hairstyle ? {
        id: gen.hairstyle._id,
        name: gen.hairstyle.name,
        category: gen.hairstyle.category,
        thumbnail: gen.hairstyle.thumbnail,
        price: gen.hairstyle.price,
        gender: gen.hairstyle.gender,
        averageRating: gen.hairstyle.averageRating
      } : null
    }));

    // Cost summary for the compared set
    const totalCreditsUsed = items.reduce((sum, i) => sum + (i.creditsUsed || 0), 0);

    await Analytics.trackEvent('compare_mode_used', {
      generationIds,
      count: items.length,
      totalCreditsUsed
    }, req.user._id);

    res.json({
      success: true,
      data: {
        items,
        summary: {
          count: items.length,
          totalCreditsUsed,
          averageRating: items.filter(i => i.rating).length > 0
            ? Math.round(items.filter(i => i.rating).reduce((s, i) => s + i.rating, 0) / items.filter(i => i.rating).length * 10) / 10
            : null
        }
      }
    });
  } catch (error) {
    console.error('Compare mode error:', error);
    res.status(500).json({ success: false, message: 'Failed to load comparison' });
  }
});

// @desc    Get recent completed generations eligible for comparison
// @route   GET /api/saved-looks/compare-candidates
// @access  Private
router.get('/compare-candidates', protect, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const candidates = await Generation.find({
      user: req.user._id,
      status: 'completed',
      'generatedImage.url': { $exists: true, $ne: null }
    })
      .populate('hairstyle', 'name category thumbnail price')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('_id createdAt generatedImage originalImage hairstyle rating creditsUsed');

    const items = candidates.map(gen => ({
      generationId: gen._id,
      createdAt: gen.createdAt,
      creditsUsed: gen.creditsUsed,
      rating: gen.rating || null,
      originalImage: gen.originalImage?.url || null,
      generatedImage: gen.generatedImage?.url || null,
      hairstyle: gen.hairstyle ? {
        id: gen.hairstyle._id,
        name: gen.hairstyle.name,
        category: gen.hairstyle.category,
        thumbnail: gen.hairstyle.thumbnail,
        price: gen.hairstyle.price
      } : null
    }));

    res.json({
      success: true,
      data: items,
      total: items.length
    });
  } catch (error) {
    console.error('Compare candidates error:', error);
    res.status(500).json({ success: false, message: 'Failed to load candidates' });
  }
});

module.exports = router;

// backend/routes/favorites.js
// Favorites API endpoints

const express = require('express');
const Favorite = require('../models/Favorite');
const Hairstyle = require('../models/Hairstyle');
const Generation = require('../models/Generation');
const Analytics = require('../models/Analytics');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Add item to favorites
// @route   POST /api/favorites
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.user._id;

    if (!targetType || !targetId) {
      return res.status(400).json({
        success: false,
        message: 'targetType and targetId are required'
      });
    }

    if (!['hairstyle', 'generation'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'targetType must be "hairstyle" or "generation"'
      });
    }

    // Get metadata for the target item
    let metadata = {};
    if (targetType === 'hairstyle') {
      const hairstyle = await Hairstyle.findById(targetId).select('name thumbnail category');
      if (!hairstyle) {
        return res.status(404).json({ success: false, message: 'Hairstyle not found' });
      }
      metadata = { name: hairstyle.name, thumbnail: hairstyle.thumbnail, category: hairstyle.category };
    } else if (targetType === 'generation') {
      const generation = await Generation.findById(targetId)
        .populate('hairstyle', 'name thumbnail category');
      if (!generation) {
        return res.status(404).json({ success: false, message: 'Generation not found' });
      }
      metadata = {
        name: generation.hairstyle?.name || 'Custom Style',
        thumbnail: generation.generatedImage?.url || generation.originalImage?.url,
        category: generation.hairstyle?.category || 'Custom'
      };
    }

    const result = await Favorite.addFavorite(userId, targetType, targetId, metadata);

    // Track analytics event
    await Analytics.trackEvent('favorite_added', {
      targetType,
      targetId,
      targetName: metadata.name
    }, userId);

    res.status(result.isNew ? 201 : 200).json({
      success: true,
      message: result.isNew ? 'Added to favorites' : 'Already in favorites',
      data: result.favorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add favorite'
    });
  }
});

// @desc    Remove item from favorites
// @route   DELETE /api/favorites
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.user._id;

    if (!targetType || !targetId) {
      return res.status(400).json({
        success: false,
        message: 'targetType and targetId are required'
      });
    }

    const result = await Favorite.removeFavorite(userId, targetType, targetId);

    // Track analytics event
    await Analytics.trackEvent('favorite_removed', {
      targetType,
      targetId
    }, userId);

    res.json({
      success: true,
      message: result.removed ? 'Removed from favorites' : 'Was not in favorites'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove favorite'
    });
  }
});

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, page = 1, limit = 20 } = req.query;

    const result = await Favorite.getUserFavorites(
      userId,
      type || null,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result.favorites,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get favorites'
    });
  }
});

// @desc    Get favorite IDs for quick UI lookup
// @route   GET /api/favorites/ids
// @access  Private
router.get('/ids', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'hairstyle' } = req.query;

    const ids = await Favorite.getFavoriteIds(userId, type);

    res.json({
      success: true,
      data: ids
    });
  } catch (error) {
    console.error('Get favorite IDs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get favorite IDs'
    });
  }
});

// @desc    Check if item is favorited
// @route   GET /api/favorites/check
// @access  Private
router.get('/check', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetType, targetId } = req.query;

    if (!targetType || !targetId) {
      return res.status(400).json({
        success: false,
        message: 'targetType and targetId are required'
      });
    }

    const isFavorited = await Favorite.isFavorited(userId, targetType, targetId);

    res.json({
      success: true,
      data: { isFavorited }
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check favorite status'
    });
  }
});

// @desc    Toggle favorite status
// @route   POST /api/favorites/toggle
// @access  Private
router.post('/toggle', protect, async (req, res) => {
  try {
    const { targetType, targetId } = req.body;
    const userId = req.user._id;

    if (!targetType || !targetId) {
      return res.status(400).json({
        success: false,
        message: 'targetType and targetId are required'
      });
    }

    const isFavorited = await Favorite.isFavorited(userId, targetType, targetId);

    if (isFavorited) {
      await Favorite.removeFavorite(userId, targetType, targetId);
      await Analytics.trackEvent('favorite_removed', { targetType, targetId }, userId);
      
      res.json({
        success: true,
        message: 'Removed from favorites',
        data: { isFavorited: false }
      });
    } else {
      // Get metadata
      let metadata = {};
      if (targetType === 'hairstyle') {
        const hairstyle = await Hairstyle.findById(targetId).select('name thumbnail category');
        if (hairstyle) {
          metadata = { name: hairstyle.name, thumbnail: hairstyle.thumbnail, category: hairstyle.category };
        }
      } else if (targetType === 'generation') {
        const generation = await Generation.findById(targetId).populate('hairstyle', 'name thumbnail category');
        if (generation) {
          metadata = {
            name: generation.hairstyle?.name || 'Custom Style',
            thumbnail: generation.generatedImage?.url || generation.originalImage?.url,
            category: generation.hairstyle?.category || 'Custom'
          };
        }
      }

      await Favorite.addFavorite(userId, targetType, targetId, metadata);
      await Analytics.trackEvent('favorite_added', { targetType, targetId, targetName: metadata.name }, userId);
      
      res.json({
        success: true,
        message: 'Added to favorites',
        data: { isFavorited: true }
      });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite'
    });
  }
});

module.exports = router;

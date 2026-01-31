// routes/watermark.js
const express = require('express');
const watermarkController = require('../controllers/watermarkController');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const Analytics = require('../models/Analytics');
const { exportLimit } = require('../middleware/rateLimit');

const router = express.Router();

/**
 * @route GET /api/watermark/export-status
 * @desc Check if user can do premium (clean) export
 * @access Protected
 */
router.get('/export-status', protect, catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('isPro subscription credits');
  
  const canExportClean = user.isPro || user.subscription?.status === 'active';
  
  res.json({
    success: true,
    data: {
      canExportClean,
      isPro: user.isPro,
      subscriptionStatus: user.subscription?.status || 'inactive',
      credits: user.credits
    }
  });
}));

/**
 * @route POST /api/watermark/export
 * @desc Export image - clean for pro, watermarked for free
 * @access Protected (with rate limit)
 */
router.post('/export', protect, exportLimit, catchAsync(async (req, res) => {
  const { imageUrl, hairstyleName } = req.body;
  
  if (!imageUrl) {
    return res.status(400).json({
      success: false,
      message: 'Image URL is required'
    });
  }

  const user = await User.findById(req.user.id).select('isPro subscription');
  const canExportClean = user.isPro || user.subscription?.status === 'active';

  // Track export event
  await Analytics.create({
    user: req.user.id,
    eventType: 'export_image',
    eventData: {
      hairstyleName,
      exportType: canExportClean ? 'clean' : 'watermarked',
      isPro: user.isPro
    }
  });

  if (canExportClean) {
    // Pro users get clean export (just return the URL directly)
    return res.json({
      success: true,
      data: {
        exportUrl: imageUrl,
        isClean: true,
        message: 'Premium clean export ready!'
      }
    });
  }

  // Free users get watermarked export
  // For now, we return the original with a flag that frontend should apply watermark
  // In production, you'd process the image server-side
  return res.json({
    success: true,
    data: {
      exportUrl: imageUrl,
      isClean: false,
      showWatermark: true,
      watermarkText: 'Made with Hair Studio AI',
      upsellMessage: 'Upgrade to Pro for watermark-free exports!',
      upgradeUrl: '/pricing'
    }
  });
}));

// This route creates animated premium watermark (for premium tier hairstyles)
router.post(
  '/create-premium',
  protect, // 👈 Ensures user is logged in
  watermarkController.createPremiumWatermark
);

module.exports = router;
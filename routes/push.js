// routes/push.js
// Push notification endpoints (admin + user token management)

const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const User = require('../models/User');
const PushLog = require('../models/PushLog');
const campaignService = require('../services/campaignService');
const catchAsync = require('../utils/catchAsync');

/**
 * @route POST /api/push/register-token
 * @desc Register or update FCM device token for current user
 * @access Protected
 */
router.post('/register-token', protect, catchAsync(async (req, res) => {
  const { deviceToken, platform } = req.body;
  
  if (!deviceToken) {
    return res.status(400).json({
      success: false,
      message: 'Device token is required'
    });
  }

  await User.findByIdAndUpdate(req.user.id, {
    deviceToken,
    devicePlatform: platform || 'unknown'
  });

  res.json({
    success: true,
    message: 'Device token registered'
  });
}));

/**
 * @route DELETE /api/push/unregister-token
 * @desc Remove device token (disable push notifications)
 * @access Protected
 */
router.delete('/unregister-token', protect, catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    $unset: { deviceToken: 1, devicePlatform: 1 }
  });

  res.json({
    success: true,
    message: 'Device token unregistered'
  });
}));

/**
 * @route GET /api/push/stats
 * @desc Get push notification stats for current user
 * @access Protected
 */
router.get('/stats', protect, catchAsync(async (req, res) => {
  const stats = await PushLog.getStats(req.user.id, 30);
  
  res.json({
    success: true,
    data: stats
  });
}));

/**
 * @route POST /api/push/test
 * @desc Send test push to current user (for debugging)
 * @access Protected
 */
router.post('/test', protect, catchAsync(async (req, res) => {
  const result = await campaignService.sendCampaign(req.user.id, 'welcome');
  
  res.json({
    success: result.success,
    messageId: result.messageId,
    error: result.error
  });
}));

// ============ ADMIN ENDPOINTS ============

/**
 * @route POST /api/push/admin/campaign
 * @desc Trigger a campaign manually (admin only)
 * @access Admin
 */
router.post('/admin/campaign', protect, catchAsync(async (req, res) => {
  // Simple admin check (you may want a proper restrictTo middleware)
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const { campaignType, userId, extra } = req.body;

  if (userId) {
    // Send to specific user
    const result = await campaignService.sendCampaign(userId, campaignType, extra);
    return res.json({
      success: result.success,
      result
    });
  }

  // Run batch campaign
  let result;
  switch (campaignType) {
    case 'streak_reminder':
      result = await campaignService.runStreakReminderCampaign();
      break;
    case 'credits_low':
      result = await campaignService.runLowCreditsCampaign();
      break;
    case 'new_drops':
      result = await campaignService.announceNewDrop(extra?.styleName);
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid campaign type for batch send'
      });
  }

  res.json({
    success: true,
    result
  });
}));

/**
 * @route GET /api/push/admin/logs
 * @desc Get push logs (admin only)
 * @access Admin
 */
router.get('/admin/logs', protect, catchAsync(async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  const { page = 1, limit = 50, campaignType, status } = req.query;
  
  const filter = {};
  if (campaignType) filter.campaignType = campaignType;
  if (status) filter.status = status;

  const logs = await PushLog.find(filter)
    .sort({ sentAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('user', 'name email');

  const total = await PushLog.countDocuments(filter);

  res.json({
    success: true,
    data: logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

module.exports = router;

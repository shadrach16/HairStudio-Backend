const express = require('express');
 
const { protect } = require('../middleware/auth'); 
const User = require('../models/User');
const { trackEvent } = require('../utils/analytics');

const router = express.Router();

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isPro: user.isPro,
        credits: user.totalCredits,
        subscription: user.subscription,
        subscriptionPlan: user.subscription?.plan || 'free',
        subscriptionExpiry: user.subscription?.endDate || null,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, preferences } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (preferences) user.preferences = preferences;

    await user.save();

    // Track profile update
    await trackEvent('profile_updated', {
      userId: user._id,
      changes: { name: !!name, preferences: !!preferences }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Get user statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const user = req.user;
    
    // Get generation count
    const Generation = require('../models/Generation');
    const generationCount = await Generation.countDocuments({ userId: user._id });
    const completedGenerations = await Generation.countDocuments({ 
      userId: user._id, 
      status: 'completed' 
    });

    // Get payment history count
    const Payment = require('../models/Payment');
    const paymentCount = await Payment.countDocuments({ 
      userId: user._id, 
      status: 'success' 
    });

    res.json({
      success: true,
      data: {
        totalGenerations: generationCount,
        completedGenerations,
        successRate: generationCount > 0 ? (completedGenerations / generationCount * 100).toFixed(1) : 0,
        totalPayments: paymentCount,
        memberSince: user.createdAt,
        lastActive: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics'
    });
  }
});

// Complete onboarding
router.post('/onboarding/complete', protect, async (req, res) => {
  try {
    const { version = 1, skipped = false } = req.body;
    const user = req.user;

    // Only update if this is a newer version or not yet completed
    if (!user.onboarding || user.onboarding.version < version) {
      user.onboarding = {
        version,
        completedAt: skipped ? null : new Date(),
        skippedAt: skipped ? new Date() : null
      };
      await user.save();

      // Track onboarding completion
      await trackEvent('onboarding_completed', {
        userId: user._id,
        version,
        skipped
      });
    }

    res.json({
      success: true,
      message: skipped ? 'Onboarding skipped' : 'Onboarding completed',
      data: {
        onboarding: user.onboarding
      }
    });

  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update onboarding status'
    });
  }
});

// Get onboarding status
router.get('/onboarding/status', protect, async (req, res) => {
  try {
    const user = req.user;
    const CURRENT_VERSION = 1;

    res.json({
      success: true,
      data: {
        hasCompleted: user.onboarding?.completedAt != null,
        hasSkipped: user.onboarding?.skippedAt != null,
        version: user.onboarding?.version || 0,
        needsOnboarding: !user.onboarding?.version || user.onboarding.version < CURRENT_VERSION
      }
    });

  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get onboarding status'
    });
  }
});

module.exports = router;
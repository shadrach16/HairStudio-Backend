// backend/routes/streaks.js
// Streak system for daily engagement rewards

const express = require('express');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const { protect } = require('../middleware/auth');
const creditLedger = require('../services/creditLedger');

const router = express.Router();

// Streak configuration
const STREAK_CONFIG = {
  // Credits awarded per streak milestone
  milestones: {
    3: 1,    // 3 days streak = 1 credit
    7: 3,    // 7 days streak = 3 credits
    14: 5,   // 14 days streak = 5 credits
    30: 10,  // 30 days streak = 10 credits
    60: 20,  // 60 days streak = 20 credits
    100: 50  // 100 days streak = 50 credits
  },
  // Grace period in hours (allow one day gap without breaking streak)
  gracePeriodHours: 36
};

// Helper: Check if two dates are on the same calendar day
function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

// Helper: Check if date1 is the day before date2
function isConsecutiveDay(previousDate, currentDate) {
  const prev = new Date(previousDate);
  const curr = new Date(currentDate);
  
  // Set both to start of day
  prev.setHours(0, 0, 0, 0);
  curr.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = curr.getTime() - prev.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  return diffDays === 1;
}

// Helper: Check if streak is still valid (within grace period)
function isStreakValid(lastStreakDate, gracePeriodHours) {
  if (!lastStreakDate) return false;
  
  const now = new Date();
  const lastDate = new Date(lastStreakDate);
  const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
  
  return diffHours <= gracePeriodHours;
}

// Helper: Calculate next milestone
function getNextMilestone(currentStreak) {
  const milestoneKeys = Object.keys(STREAK_CONFIG.milestones).map(Number).sort((a, b) => a - b);
  for (const milestone of milestoneKeys) {
    if (currentStreak < milestone) {
      return { days: milestone, credits: STREAK_CONFIG.milestones[milestone] };
    }
  }
  return null; // All milestones achieved
}

// @desc    Get streak status
// @route   GET /api/streaks/status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const now = new Date();
    let currentStreak = user.streak?.currentStreak || 0;
    const lastStreakDate = user.streak?.lastStreakDate;
    
    // Check if streak is still valid
    if (lastStreakDate && !isStreakValid(lastStreakDate, STREAK_CONFIG.gracePeriodHours)) {
      // Streak broken - reset
      currentStreak = 0;
    }
    
    // Check if already checked in today
    const alreadyCheckedInToday = lastStreakDate && isSameDay(lastStreakDate, now);
    
    // Calculate next milestone
    const nextMilestone = getNextMilestone(currentStreak);
    
    res.json({
      success: true,
      data: {
        currentStreak,
        longestStreak: user.streak?.longestStreak || 0,
        lastStreakDate,
        alreadyCheckedInToday,
        nextMilestone,
        milestones: STREAK_CONFIG.milestones
      }
    });
  } catch (error) {
    console.error('Get streak status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get streak status'
    });
  }
});

// @desc    Check in for the day (increment streak)
// @route   POST /api/streaks/checkin
// @access  Private
router.post('/checkin', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const now = new Date();
    const lastStreakDate = user.streak?.lastStreakDate;
    let currentStreak = user.streak?.currentStreak || 0;
    let creditsAwarded = 0;
    let milestonesHit = [];

    // Check if already checked in today
    if (lastStreakDate && isSameDay(lastStreakDate, now)) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today',
        data: {
          currentStreak,
          alreadyCheckedInToday: true
        }
      });
    }

    // Determine if streak continues or resets
    if (!lastStreakDate) {
      // First check-in ever
      currentStreak = 1;
    } else if (isConsecutiveDay(lastStreakDate, now)) {
      // Consecutive day - increment streak
      currentStreak += 1;
    } else if (isStreakValid(lastStreakDate, STREAK_CONFIG.gracePeriodHours)) {
      // Within grace period but not consecutive - increment anyway
      currentStreak += 1;
    } else {
      // Streak broken - reset to 1
      currentStreak = 1;
    }

    // Check for milestone rewards
    const previousStreak = user.streak?.currentStreak || 0;
    for (const [days, credits] of Object.entries(STREAK_CONFIG.milestones)) {
      const daysNum = parseInt(days);
      if (currentStreak >= daysNum && previousStreak < daysNum) {
        creditsAwarded += credits;
        milestonesHit.push({ days: daysNum, credits });
      }
    }

    // Award credits if any milestones hit
    if (creditsAwarded > 0) {
      const rewardResult = await creditLedger.creditUser({
        userId: user._id,
        amount: creditsAwarded,
        kind: 'streak_reward',
        source: 'daily_streak',
        reason: `Streak milestone reward for ${currentStreak} days`,
        description: `Milestones hit: ${milestonesHit.map((milestone) => milestone.days).join(', ')}`
      });
      user.credits = rewardResult.user.credits;
    }

    // Update streak data
    if (!user.streak) {
      user.streak = {};
    }
    user.streak.currentStreak = currentStreak;
    user.streak.lastStreakDate = now;
    user.streak.longestStreak = Math.max(user.streak.longestStreak || 0, currentStreak);

    await user.save();

    // Track analytics
    await Analytics.trackEvent('streak_checkin', {
      currentStreak,
      creditsAwarded,
      milestonesHit: milestonesHit.map(m => m.days)
    }, user._id);

    if (creditsAwarded > 0) {
      await Analytics.trackEvent('streak_milestone_reached', {
        milestones: milestonesHit,
        totalCreditsAwarded: creditsAwarded
      }, user._id);
    }

    res.json({
      success: true,
      message: creditsAwarded > 0 
        ? `Streak day ${currentStreak}! You earned ${creditsAwarded} bonus credits!`
        : `Streak day ${currentStreak}! Keep it going!`,
      data: {
        currentStreak,
        longestStreak: user.streak.longestStreak,
        creditsAwarded,
        milestonesHit,
        nextMilestone: getNextMilestone(currentStreak),
        totalCredits: user.credits
      }
    });
  } catch (error) {
    console.error('Streak check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in'
    });
  }
});

module.exports = router;

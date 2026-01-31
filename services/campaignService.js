// services/campaignService.js
// Campaign scheduler for automated push notifications

const User = require('../models/User');
const PushLog = require('../models/PushLog');
const PushProvider = require('./pushService');

// Campaign configurations with rate limits
const CAMPAIGNS = {
  welcome: {
    maxPerDay: 1,
    minIntervalHours: 24,
    getMessage: (user) => ({
      title: '👋 Welcome to Hair Studio!',
      body: `Hey ${user.name.split(' ')[0]}! You have ${user.credits} free credits to try any hairstyle. Start exploring!`,
      data: { screen: 'home', action: 'explore' }
    })
  },
  streak_reminder: {
    maxPerDay: 1,
    minIntervalHours: 20, // Don't spam if sent recently
    getMessage: (user) => {
      const streak = user.streak?.currentStreak || 0;
      if (streak > 0) {
        return {
          title: '🔥 Keep your streak alive!',
          body: `You're on a ${streak}-day streak! Check in today to keep it going and earn bonus credits.`,
          data: { screen: 'streak', action: 'checkin' }
        };
      }
      return {
        title: '✨ Start a streak today!',
        body: 'Check in daily to earn bonus credits. Day 3 = 1 credit, Day 7 = 3 credits!',
        data: { screen: 'streak', action: 'checkin' }
      };
    }
  },
  new_drops: {
    maxPerDay: 1,
    minIntervalHours: 48, // New styles don't come that often
    getMessage: (user, extra = {}) => ({
      title: '🆕 New Styles Just Dropped!',
      body: extra.styleName 
        ? `The "${extra.styleName}" style is now available. Be the first to try it!`
        : 'Fresh hairstyles just added to the collection. Come check them out!',
      data: { screen: 'gallery', action: 'new_styles' }
    })
  },
  credits_low: {
    maxPerDay: 1,
    minIntervalHours: 72, // Don't spam about credits
    getMessage: (user) => ({
      title: '⚡ Running low on credits?',
      body: `You have ${user.credits} credit${user.credits !== 1 ? 's' : ''} left. Watch an ad for +0.5 credits or upgrade for unlimited!`,
      data: { screen: 'pricing', action: 'upsell' }
    })
  },
  win_back: {
    maxPerDay: 1,
    minIntervalHours: 168, // Once a week max
    getMessage: (user) => ({
      title: '💇 We miss you!',
      body: `Hey ${user.name.split(' ')[0]}, it's been a while! Come back and see the new styles we've added.`,
      data: { screen: 'home', action: 'win_back' }
    })
  }
};

/**
 * Send a campaign push to a single user
 * @param {string} userId - User ObjectId
 * @param {string} campaignType - One of: welcome, streak_reminder, new_drops, credits_low, win_back
 * @param {Object} extra - Additional data for message template
 */
async function sendCampaign(userId, campaignType, extra = {}) {
  try {
    const campaign = CAMPAIGNS[campaignType];
    if (!campaign) {
      console.error(`Unknown campaign type: ${campaignType}`);
      return { success: false, error: 'unknown_campaign' };
    }

    // Get user with device token
    const user = await User.findById(userId).select('name email credits streak deviceToken preferences');
    if (!user) {
      return { success: false, error: 'user_not_found' };
    }

    // Check notification preferences
    if (user.preferences?.notifications === false) {
      return { success: false, error: 'notifications_disabled' };
    }

    // Check device token
    if (!user.deviceToken) {
      return { success: false, error: 'no_device_token' };
    }

    // Rate limit check
    const { allowed, reason } = await PushLog.canSendToUser(userId, campaignType, {
      maxPerDay: campaign.maxPerDay,
      minIntervalHours: campaign.minIntervalHours
    });

    if (!allowed) {
      console.log(`⏳ Push skipped for ${user.email}: ${reason}`);
      return { success: false, error: reason };
    }

    // Build message
    const payload = campaign.getMessage(user, extra);

    // Send push
    const result = await PushProvider.sendToDevice(user.deviceToken, payload);

    // Handle invalid token - remove it from user
    if (result.shouldRemoveToken) {
      await User.findByIdAndUpdate(userId, { $unset: { deviceToken: 1 } });
      console.log(`🗑️ Removed invalid token for user ${userId}`);
    }

    // Log the push
    await PushLog.logPush(userId, campaignType, payload, result);

    return result;
  } catch (error) {
    console.error(`Campaign send error (${campaignType}):`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger welcome push for new users (call after signup)
 */
async function sendWelcomePush(userId) {
  // Delay slightly to allow app to register device token
  setTimeout(() => sendCampaign(userId, 'welcome'), 5000);
}

/**
 * Find users who need streak reminders and send them
 * (Run this as a scheduled job, e.g., daily at 6 PM local)
 */
async function runStreakReminderCampaign() {
  console.log('🔔 Running streak reminder campaign...');
  
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Find users with active streaks who haven't checked in today
  const users = await User.find({
    deviceToken: { $exists: true, $ne: null },
    'preferences.notifications': { $ne: false },
    'streak.currentStreak': { $gte: 1 },
    'streak.lastStreakDate': { $lt: yesterday }
  }).select('_id').limit(100); // Process in batches

  let sent = 0;
  for (const user of users) {
    const result = await sendCampaign(user._id, 'streak_reminder');
    if (result.success) sent++;
  }

  console.log(`✅ Streak reminders sent: ${sent}/${users.length}`);
  return { total: users.length, sent };
}

/**
 * Find users with low credits and send upsell push
 * (Run periodically, respects rate limits)
 */
async function runLowCreditsCampaign() {
  console.log('💰 Running low credits campaign...');
  
  const users = await User.find({
    deviceToken: { $exists: true, $ne: null },
    'preferences.notifications': { $ne: false },
    credits: { $lte: 1, $gt: 0 },
    isPro: false
  }).select('_id').limit(50);

  let sent = 0;
  for (const user of users) {
    const result = await sendCampaign(user._id, 'credits_low');
    if (result.success) sent++;
  }

  console.log(`✅ Low credit pushes sent: ${sent}/${users.length}`);
  return { total: users.length, sent };
}

/**
 * Announce new style drops
 * @param {string} styleName - Name of new style
 */
async function announceNewDrop(styleName) {
  console.log(`📢 Announcing new drop: ${styleName}`);
  
  // Get users who opted into notifications
  const users = await User.find({
    deviceToken: { $exists: true, $ne: null },
    'preferences.notifications': { $ne: false }
  }).select('_id').limit(500);

  let sent = 0;
  for (const user of users) {
    const result = await sendCampaign(user._id, 'new_drops', { styleName });
    if (result.success) sent++;
  }

  console.log(`✅ New drop announced to ${sent} users`);
  return { total: users.length, sent };
}

module.exports = {
  sendCampaign,
  sendWelcomePush,
  runStreakReminderCampaign,
  runLowCreditsCampaign,
  announceNewDrop,
  CAMPAIGNS
};

// services/campaignService.js
// Campaign scheduler for automated push notifications

const User = require('../models/User');
const PushLog = require('../models/PushLog');
const PushProvider = require('./pushService');
const { generateNudges, personalize } = require('./aiNudgeService');

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
  },
  daily_nudge: {
    maxPerDay: 1,
    minIntervalHours: 20, // At most one AI nudge per ~day
    // Message text comes from the AI-generated pool, passed via extra.message.
    getMessage: (user, extra = {}) => {
      const base = extra.message || {
        title: '💇 Time for a new look?',
        body: 'Try a fresh hairstyle today and see if it suits you!'
      };
      const { title, body } = personalize(base, user.name);
      return { title, body, data: { screen: 'home', action: 'daily_nudge' } };
    }
  },
  daily_recommendation: {
    maxPerDay: 1,
    minIntervalHours: 20,
    // Personalized: extra.message is a style-filled template ({name} still to fill);
    // extra.data carries the recommended hairstyle id + the tap link.
    getMessage: (user, extra = {}) => {
      const base = extra.message || {
        title: '💇 A look picked for you',
        body: 'Come see a hairstyle we think suits you.'
      };
      const { title, body } = personalize(base, user.name);
      return {
        title,
        body,
        data: extra.data || { screen: 'home', action: 'daily_recommendation', link: '/' }
      };
    }
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

/**
 * Find inactive users and send win-back push
 * (Run periodically, targets users inactive for 5+ days)
 */
async function runWinBackCampaign() {
  console.log('🔄 Running win-back campaign...');

  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  const users = await User.find({
    deviceToken: { $exists: true, $ne: null },
    'preferences.notifications': { $ne: false },
    lastLogin: { $lt: fiveDaysAgo }
  }).select('_id').limit(100);

  let sent = 0;
  for (const user of users) {
    const result = await sendCampaign(user._id, 'win_back');
    if (result.success) sent++;
  }

  console.log(`✅ Win-back pushes sent: ${sent}/${users.length}`);
  return { total: users.length, sent };
}

/**
 * Daily AI-generated re-engagement nudge.
 * Generates a fresh pool of short messages via Gemini, then sends a random
 * one to each eligible user. Rate limits ensure at most one per user per day.
 * (Run once daily via cron — see scripts/sendDailyNudge.js)
 */
async function runDailyNudgeCampaign() {
  console.log('💬 Running daily AI nudge campaign...');

  // Generate the message pool once per run (single AI call, cheap).
  const pool = await generateNudges(15);
  console.log(`📝 Nudge pool size: ${pool.length}`);

  const users = await User.find({
    deviceToken: { $exists: true, $ne: null },
    'preferences.notifications': { $ne: false }
  }).select('_id').limit(1000);

  let sent = 0;
  for (const user of users) {
    const message = pool[Math.floor(Math.random() * pool.length)];
    const result = await sendCampaign(user._id, 'daily_nudge', { message });
    if (result.success) sent++;
  }

  console.log(`✅ Daily nudges sent: ${sent}/${users.length}`);
  return { total: users.length, sent, poolSize: pool.length };
}

/**
 * PERSONALIZED daily nudge: recommends a specific hairstyle to each user based on
 * their taste (recommendationService, cold-start-safe), fills an AI template with
 * that style, deep-links the tap to it, and falls back to a generic nudge if a
 * recommendation can't be made. One AI call per run for the templates.
 * (Run once daily via cron — see scripts/sendDailyNudge.js)
 */
async function runDailyRecommendationCampaign() {
  console.log('🎯 Running personalized daily recommendation campaign...');
  const { generateRecommendationTemplates, fillStyle, generateNudges } = require('./aiNudgeService');
  const recommendationService = require('./recommendationService');

  const templates = await generateRecommendationTemplates(10);
  const genericPool = await generateNudges(8); // fallback when no recommendation

  const users = await User.find({
    deviceToken: { $exists: true, $ne: null },
    'preferences.notifications': { $ne: false }
  }).select('_id name gender').limit(1000);

  let sent = 0;
  let personalized = 0;
  for (const user of users) {
    let message = null;
    let data = { screen: 'home', action: 'daily_recommendation', link: '/' };
    try {
      const recs = await recommendationService.getForYouRecommendations(user._id, {
        gender: user.gender || undefined,
        limit: 3
      });
      const top = Array.isArray(recs) ? recs.find((r) => r && r.name) : null;
      if (top) {
        const tpl = templates[Math.floor(Math.random() * templates.length)];
        message = fillStyle(tpl, { style: top.name, category: top.category });
        // Tap routes home; the app sets this hairstyle as the pending deep-link
        // target (contextual paywall) once it reads data.hairstyleId.
        data = { screen: 'home', action: 'daily_recommendation', link: '/', hairstyleId: String(top._id) };
        personalized++;
      }
    } catch (e) {
      console.warn(`[rec] failed for ${user._id}: ${e.message}`);
    }
    if (!message) {
      message = genericPool[Math.floor(Math.random() * genericPool.length)];
    }
    const result = await sendCampaign(user._id, 'daily_recommendation', { message, data });
    if (result.success) sent++;
  }

  console.log(`✅ Daily recommendations sent: ${sent}/${users.length} (${personalized} personalized)`);
  return { total: users.length, sent, personalized };
}

/**
 * Run all scheduled batch campaigns in sequence
 * Called by the /api/push/cron endpoint or an external scheduler
 */
async function runScheduledCampaigns() {
  const results = {};
  try {
    results.streak = await runStreakReminderCampaign();
  } catch (e) {
    results.streak = { error: e.message };
  }
  try {
    results.lowCredits = await runLowCreditsCampaign();
  } catch (e) {
    results.lowCredits = { error: e.message };
  }
  try {
    results.winBack = await runWinBackCampaign();
  } catch (e) {
    results.winBack = { error: e.message };
  }
  return results;
}

module.exports = {
  sendCampaign,
  sendWelcomePush,
  runStreakReminderCampaign,
  runLowCreditsCampaign,
  announceNewDrop,
  runWinBackCampaign,
  runDailyNudgeCampaign,
  runDailyRecommendationCampaign,
  runScheduledCampaigns,
  CAMPAIGNS
};

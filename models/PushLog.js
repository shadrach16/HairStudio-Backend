// models/PushLog.js
// Push notification logging for analytics and rate limiting

const mongoose = require('mongoose');

const pushLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  campaignType: {
    type: String,
    enum: ['welcome', 'streak_reminder', 'new_drops', 'credits_low', 'win_back', 'custom'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  body: {
    type: String,
    required: true,
    maxlength: 200
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'skipped'],
    default: 'sent'
  },
  messageId: String,
  error: String,
  sentAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for rate limiting queries
pushLogSchema.index({ user: 1, campaignType: 1, sentAt: -1 });

// Static methods for rate limiting
pushLogSchema.statics = {
  /**
   * Check if user can receive a push of this campaign type
   * @param {ObjectId} userId 
   * @param {string} campaignType 
   * @param {Object} limits - { maxPerDay: number, minIntervalHours: number }
   */
  async canSendToUser(userId, campaignType, limits = {}) {
    const { maxPerDay = 3, minIntervalHours = 4 } = limits;
    
    const now = new Date();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const intervalAgo = new Date(now - minIntervalHours * 60 * 60 * 1000);

    // Check daily limit
    const dailyCount = await this.countDocuments({
      user: userId,
      campaignType,
      status: 'sent',
      sentAt: { $gte: dayAgo }
    });

    if (dailyCount >= maxPerDay) {
      return { allowed: false, reason: 'daily_limit_reached' };
    }

    // Check minimum interval
    const recentPush = await this.findOne({
      user: userId,
      campaignType,
      status: 'sent',
      sentAt: { $gte: intervalAgo }
    });

    if (recentPush) {
      return { allowed: false, reason: 'too_soon' };
    }

    return { allowed: true };
  },

  /**
   * Log a push notification
   */
  async logPush(userId, campaignType, payload, result) {
    return this.create({
      user: userId,
      campaignType,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      status: result.success ? 'sent' : 'failed',
      messageId: result.messageId,
      error: result.error
    });
  },

  /**
   * Get push stats for analytics
   */
  async getStats(userId, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return this.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(userId),
          sentAt: { $gte: since }
        }
      },
      {
        $group: {
          _id: { campaignType: '$campaignType', status: '$status' },
          count: { $sum: 1 }
        }
      }
    ]);
  }
};

module.exports = mongoose.model('PushLog', pushLogSchema);

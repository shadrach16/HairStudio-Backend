const mongoose = require('mongoose');

 


const analyticsSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },  
  generationId: {
    type: String,
    index: true
  },  
  hairstyleId: {
    type: String,
    index: true
  },  
  creditsUsed: {
    type: String,
    index: true
  },
  properties: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    country: String,
    city: String,
    device: String,
    browser: String,
    os: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false // Using custom timestamp field
});

// Indexes for analytics queries
analyticsSchema.index({ eventName: 1, timestamp: -1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });
// G2: Collection & recommendation analytics queries
analyticsSchema.index({ eventName: 1, 'properties.collectionSlug': 1, timestamp: -1 });
analyticsSchema.index({ eventName: 1, 'properties.recommendationSource': 1, timestamp: -1 });

// Static method to track event
analyticsSchema.statics.trackEvent = function(eventName, properties = {}, userId = null, metadata = {}) {
  return this.create({
    eventName,
    userId,
    properties,
    metadata,
    sessionId: properties.sessionId || null
  });
};

// Static method to get event counts
analyticsSchema.statics.getEventCounts = function(startDate, endDate, eventNames = []) {
  const matchQuery = {
    timestamp: { $gte: startDate, $lte: endDate }
  };
  
  if (eventNames.length > 0) {
    matchQuery.eventName = { $in: eventNames };
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$eventName',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        eventName: '$_id',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get user funnel
analyticsSchema.statics.getUserFunnel = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        eventName: { $in: ['page_view', 'photo_uploaded', 'hairstyle_selected', 'generation_started', 'generation_completed'] }
      }
    },
    {
      $group: {
        _id: {
          userId: '$userId',
          eventName: '$eventName'
        }
      }
    },
    {
      $group: {
        _id: '$_id.eventName',
        uniqueUsers: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Static method to get daily active users
analyticsSchema.statics.getDailyActiveUsers = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        userId: { $ne: null }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        activeUsers: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { date: 1 } }
  ]);
};

// TTL index to automatically delete old analytics data (90 days)
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('Analytics', analyticsSchema);
// models/WebhookLog.js
// Webhook event logging for replay protection and debugging

const mongoose = require('mongoose');

const webhookLogSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['revenuecat', 'dodo', 'other'],
    required: true,
    index: true
  },
  eventId: {
    type: String,
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['received', 'processed', 'duplicate', 'failed', 'invalid'],
    default: 'received'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  payload: {
    type: mongoose.Schema.Types.Mixed
  },
  processingResult: {
    creditsGranted: Number,
    paymentId: mongoose.Schema.Types.ObjectId,
    error: String
  },
  metadata: {
    ip: String,
    userAgent: String,
    signature: String,
    signatureValid: Boolean
  },
  processedAt: Date,
  receivedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for fast duplicate checking
webhookLogSchema.index({ source: 1, eventId: 1 }, { unique: true });

// TTL index - keep logs for 90 days
webhookLogSchema.index({ receivedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

/**
 * Check if event was already processed (replay protection)
 */
webhookLogSchema.statics.isDuplicate = async function(source, eventId) {
  const existing = await this.findOne({ source, eventId });
  return !!existing;
};

/**
 * Log incoming webhook
 */
webhookLogSchema.statics.logIncoming = async function(source, eventId, eventType, payload, metadata = {}) {
  try {
    return await this.create({
      source,
      eventId,
      eventType,
      payload,
      metadata,
      status: 'received'
    });
  } catch (error) {
    // Duplicate key error means it's a replay
    if (error.code === 11000) {
      return { isDuplicate: true };
    }
    throw error;
  }
};

/**
 * Mark webhook as processed
 */
webhookLogSchema.statics.markProcessed = async function(source, eventId, result = {}) {
  return this.findOneAndUpdate(
    { source, eventId },
    {
      status: 'processed',
      processedAt: new Date(),
      processingResult: result
    },
    { new: true }
  );
};

/**
 * Mark webhook as failed
 */
webhookLogSchema.statics.markFailed = async function(source, eventId, error) {
  return this.findOneAndUpdate(
    { source, eventId },
    {
      status: 'failed',
      processedAt: new Date(),
      'processingResult.error': error
    },
    { new: true }
  );
};

/**
 * Get webhook stats for monitoring
 */
webhookLogSchema.statics.getStats = async function(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.aggregate([
    { $match: { receivedAt: { $gte: since } } },
    {
      $group: {
        _id: { source: '$source', status: '$status' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.source',
        statuses: {
          $push: { status: '$_id.status', count: '$count' }
        },
        total: { $sum: '$count' }
      }
    }
  ]);
};

module.exports = mongoose.model('WebhookLog', webhookLogSchema);

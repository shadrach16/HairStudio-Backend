const mongoose = require('mongoose');

const anomalySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const creditTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  kind: {
    type: String,
    enum: [
      'purchase',
      'spend',
      'refund',
      'ad_reward',
      'referral_reward',
      'streak_reward',
      'review_reward',
      'support_adjustment',
      'signup_bonus',
      'guest_credit_transfer',
      'subscription_grant',
      'subscription_expiry'
    ],
    required: true,
    index: true
  },
  direction: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  source: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['completed', 'flagged'],
    default: 'completed',
    index: true
  },
  reason: String,
  description: String,
  reference: {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    generation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Generation'
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    catalogItemId: String,
    providerTransactionId: String,
    correlationId: String
  },
  metadata: mongoose.Schema.Types.Mixed,
  anomalyFlags: [anomalySchema]
}, {
  timestamps: true
});

creditTransactionSchema.index({ user: 1, createdAt: -1 });
creditTransactionSchema.index({ user: 1, kind: 1, createdAt: -1 });
creditTransactionSchema.index({ 'reference.payment': 1 }, { sparse: true });
creditTransactionSchema.index({ 'reference.generation': 1 }, { sparse: true });
creditTransactionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);
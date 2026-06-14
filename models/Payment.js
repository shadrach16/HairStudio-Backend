const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['credit_pack', 'subscription'],
    required: true
  },
  itemId: {
    type: String,
    required: true // e.g., 'starter', 'pro', 'salon'
  },
  itemName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'NGN',
    enum: ['NGN', 'USD']
  },
  credits: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
revenueCat: {
    transactionId: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    eventId: { 
        type: String, 
        unique: true, 
        sparse: true 
    }
  },
  dodoPayment: {
    transactionId: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    eventId: { 
        type: String, 
        unique: true, 
        sparse: true 
    }
  },
  creditTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditTransaction'
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: String
  },
  failureReason: String,
  refundStatus: {
    type: String,
    enum: ['none', 'requested', 'processing', 'completed', 'rejected'],
    default: 'none'
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String,
  webhookData: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ type: 1 });

// Static method to get user payments
paymentSchema.statics.getUserPayments = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get revenue analytics
paymentSchema.statics.getRevenueAnalytics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'success',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          type: '$type'
        },
        totalAmount: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        totalCredits: { $sum: '$credits' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
};



module.exports = mongoose.model('Payment', paymentSchema);
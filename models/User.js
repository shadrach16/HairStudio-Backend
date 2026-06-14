// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
 

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
   deviceToken: {
    type: String  
  },
  devicePlatform: {
    type: String,
    enum: ['ios', 'android', 'web', 'unknown'],
    default: 'unknown'
  },
  // --- 2. ADDED REFERRAL FIELDS ---
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // ---------------------------------
  // Guest user fields (for "try before login" flow)
  isGuest: {
    type: Boolean,
    default: false
  },
  guestDeviceId: {
    type: String,
    unique: true,
    sparse: true
  },
  // ---------------------------------
  isPro: {
    type: Boolean,
    default: false
  },
  credits: {
    type: Number,
    default: 5, // Free trial credits
    min: 0
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'salon', 'basic_monthly', 'plus_monthly', 'pro_monthly'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due', 'expired'],
      default: 'inactive'
    },
    provider: {
      type: String,
      enum: ['none', 'revenuecat', 'dodo'],
      default: 'none'
    },
    providerSubscriptionId: {
      type: String,
      default: null
    },
    startDate: Date,
    endDate: Date,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    cancellationRequestedAt: {
      type: Date,
      default: null
    },
    creditsPerMonth: {
      type: Number,
      default: 0
    },
    rolloverCap: {
      type: Number,
      default: 0
    },
    walletCredits: {
      type: Number,
      default: 0
    },
    lastRefreshAt: {
      type: Date,
      default: null
    },
    nextRefreshAt: {
      type: Date,
      default: null
    },
    // C3: Billing issue tracking for grace period
    billingIssueDetectedAt: {
      type: Date,
      default: null
    },
    graceDeadline: {
      type: Date,
      default: null
    }
  },
  freeTrialUsed: {
    type: Number,
    default: 0,
    max: 5
  },
  freeTrialExpiry: {
    type: Date,
    default: () => new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    newsletter: {
      type: Boolean,
      default: true
    }
  },
  // Streak tracking for daily engagement
  streak: {
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastStreakDate: {
      type: Date,
      default: null
    }
  },
  // Rewarded ads tracking for daily caps
  rewardedAds: {
    lastRewardDate: {
      type: Date,
      default: null
    },
    rewardsToday: {
      type: Number,
      default: 0
    }
  },
  // Play Store review reward (one-time)
  hasClaimedReviewReward: {
    type: Boolean,
    default: false
  },
  reviewRewardClaimedAt: {
    type: Date,
    default: null
  },
  // Onboarding state
  onboarding: {
    version: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date,
      default: null
    },
    skippedAt: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ referralCode: 1 }); // 3. Added index for referral code
userSchema.index({ guestDeviceId: 1 }); // Guest device lookup

// --- 4. ADDED PRE-SAVE HOOK TO GENERATE REFERRAL CODE ---
userSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    const { nanoid } = await import('nanoid');
    this.referralCode = nanoid(10).toUpperCase().replace(/[-_]/g, 'A'); 
  }
  next();
});
// ----------------------------------------------------

// Virtual for remaining trial credits
userSchema.virtual('remainingTrialCredits').get(function() {
  const now = new Date();
  if (this.freeTrialExpiry && now < this.freeTrialExpiry) {
    return Math.max(0, 5 - this.freeTrialUsed);
  }
  return 0;
});

// Virtual for total available credits
userSchema.virtual('totalCredits').get(function() {
  return this.credits + this.remainingTrialCredits;
});

// Method to check if user can generate
userSchema.methods.canGenerate = function(requiredCredits = 1) {
  return this.totalCredits >= requiredCredits;
};

// Method to use credits
userSchema.methods.useCredits = function(amount = 1) {
  const trialCredits = this.remainingTrialCredits;
  
  if (trialCredits >= amount) {
    // Use trial credits first
    this.freeTrialUsed += amount;
  } else if (trialCredits > 0) {
    // Use remaining trial credits + regular credits
    const regularCreditsNeeded = amount - trialCredits;
    this.freeTrialUsed = 5; // Max out trial credits
    this.credits -= regularCreditsNeeded;
  } else {
    // Use regular credits only
    this.credits -= amount;
  }
  
  return this.save();
};

// Method to add credits
userSchema.methods.addCredits = function(amount) {
  this.credits += amount;
  return this.save();
};

// Method to check subscription status
userSchema.methods.hasActiveSubscription = function() {
  const sub = this.subscription || {};
  if (sub.status !== 'active') {
    return false;
  }

  if (sub.currentPeriodEnd) {
    return new Date() < new Date(sub.currentPeriodEnd);
  }

  if (sub.endDate) {
    return new Date() < new Date(sub.endDate);
  }

  return false;
};

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
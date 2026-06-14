const mongoose = require('mongoose');

const generationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hairstyle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hairstyle',
    required: true
  },
  originalImage: {
    url: {
      type: String,
      required: false
    },
    publicId: String
  },
  generatedImage: {
    url: String,
    publicId: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  creditsUsed: {
    type: Number,
    required: true,
    min: 0
  },
  replicateId: {
    type: String,
    unique: true,
    sparse: true
  },
  replicateStatus: {
    type: String,
    enum: ['starting', 'processing', 'succeeded', 'failed', 'canceled']
  },
  processingTime: {
    type: Number, // in seconds
    default: 0
  },
  errorMessage: {
    type: String
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceInfo: String
  },
  // A2: Prompt version tracking for quality analytics
  prompt: {
    family: {
      type: String,
      enum: ['low-cut', 'standard', 'braids-twists', 'locs', 'natural-textured', 'protective-install', 'legacy-low-cut', 'legacy-standard', null],
      default: null
    },
    version: {
      type: String,
      default: null
    },
    model: {
      type: String,   // e.g. "gemini-2.5-flash-image"
      default: null
    }
  },
  // A3: Input gate results — tracks whether the selfie passed quality checks
  inputGate: {
    passed: { type: Boolean, default: null },
    score: { type: Number, default: null },
    stage: { type: String, default: null },
    issues: [{ code: String, message: String }],
  },
  // A3: Hair region mask metadata for edit-centric generation
  maskData: {
    hairRegion: {
      top: Number, bottom: Number, left: Number, right: Number
    },
    currentHairState: {
      length: String, color: String, texture: String, coverage: String
    },
    hairlineBoundary: String,
    obstructions: [String],
    editDifficulty: String,
  },
  // A4: Generation mode — controls quality tier and pricing
  generationMode: {
    type: String,
    enum: ['standard', 'hd', 'pro'],
    default: 'standard'
  },
  // A4: Output quality scoring — assesses the generated result
  qualityScore: {
    score: { type: Number, default: null },
    passed: { type: Boolean, default: null },
    threshold: { type: Number, default: null },
    analysis: {
      identityPreservation: Number,
      posePreservation: Number,
      hairstyleAccuracy: Number,
      artifactScore: Number,
      backgroundPreservation: Number,
      overallNaturalness: Number,
    },
    defect: { type: String, default: null },
    defectSeverity: { type: String, enum: ['minor', 'moderate', 'severe', null], default: null },
    scoredAt: Date,
  },
  // A4: Retry tracking — auto-retry on quality failure
  retryCount: {
    type: Number,
    default: 0
  },
  retryOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Generation',
    default: null
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 500
  },
  ledger: {
    spendTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreditTransaction'
    },
    refundTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreditTransaction'
    },
    refundReason: String,
    refundedAt: Date
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
generationSchema.index({ user: 1, createdAt: -1 });
generationSchema.index({ hairstyle: 1 });
generationSchema.index({ status: 1 });
generationSchema.index({ replicateId: 1 });
generationSchema.index({ isPublic: 1, rating: -1 });
// A2: Prompt version analytics — compare quality outcomes across prompt families
generationSchema.index({ 'prompt.family': 1, 'prompt.version': 1, status: 1 });
// A4: Quality analytics — find low-quality generations by mode
generationSchema.index({ generationMode: 1, 'qualityScore.passed': 1, status: 1 });

// Method to increment download count
generationSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

// Method to add rating
generationSchema.methods.addRating = function(rating, feedback) {
  this.rating = rating;
  if (feedback) this.feedback = feedback;
  return this.save();
};

// Static method to get user generations
generationSchema.statics.getUserGenerations = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ user: userId })
    .populate('hairstyle', 'name thumbnail category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get public showcase
generationSchema.statics.getPublicShowcase = function(limit = 20) {
  return this.find({ 
    isPublic: true, 
    status: 'completed',
    rating: { $gte: 4 }
  })
    .populate('hairstyle', 'name category')
    .populate('user', 'name avatar')
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit);
};

// Pre-save middleware to calculate processing time
generationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.processingTime = Math.floor((Date.now() - this.createdAt.getTime()) / 1000);
  }
  next();
});

module.exports = mongoose.model('Generation', generationSchema);
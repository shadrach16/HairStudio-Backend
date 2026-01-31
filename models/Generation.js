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
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    maxlength: 500
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
const mongoose = require('mongoose');

// ─── G2: Style Collection Model ─────────────────────────────────────────────
// Curated and dynamic collections for discovery surfaces (trending, seasonal, editorial)

const collectionSchema = new mongoose.Schema({
  // Identity
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 60
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  emoji: {
    type: String,
    default: '✂️'
  },
  coverImage: {
    type: String,
    default: null
  },

  // Type: curated (manual picks) vs dynamic (query-based)
  type: {
    type: String,
    enum: ['curated', 'dynamic', 'trending', 'seasonal'],
    default: 'curated'
  },

  // For curated: explicit style IDs
  hairstyleIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hairstyle'
  }],

  // For dynamic: query filter stored as JSON
  dynamicFilter: {
    category: { type: String, default: null },
    gender: { type: String, default: null },
    minPopularity: { type: Number, default: null },
    maxPrice: { type: Number, default: null },
    attributes: { type: mongoose.Schema.Types.Mixed, default: null },
    sortBy: { type: String, default: '-popularity' },
    limit: { type: Number, default: 12 }
  },

  // Display
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },

  // Targeting
  targetGender: {
    type: String,
    enum: ['male', 'female', 'unisex', 'all'],
    default: 'all'
  },

  // Seasonal/temporal
  startsAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },

  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  clickCount: {
    type: Number,
    default: 0
  },
  conversionCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
collectionSchema.index({ isActive: 1, displayOrder: 1 });
collectionSchema.index({ slug: 1 }, { unique: true });
collectionSchema.index({ type: 1, isActive: 1 });
collectionSchema.index({ targetGender: 1, isActive: 1 });

// Instance method: resolve hairstyles (curated or dynamic)
collectionSchema.methods.resolveHairstyles = async function(limitOverride) {
  const Hairstyle = mongoose.model('Hairstyle');
  
  if (this.type === 'curated' && this.hairstyleIds.length > 0) {
    return Hairstyle.find({
      _id: { $in: this.hairstyleIds },
      isActive: true
    }).select('_id name thumbnail price category gender popularity generationCount averageRating attributes');
  }

  // Dynamic: build query from filter
  const query = { isActive: true };
  const filter = this.dynamicFilter || {};

  if (filter.category) query.category = filter.category;
  if (filter.gender) query.gender = { $in: [filter.gender, 'unisex'] };
  if (filter.minPopularity) query.popularity = { $gte: filter.minPopularity };
  if (filter.maxPrice) query.price = { $lte: filter.maxPrice };

  const limit = limitOverride || filter.limit || 12;
  const sortBy = filter.sortBy || '-popularity';

  return Hairstyle.find(query)
    .sort(sortBy)
    .limit(limit)
    .select('_id name thumbnail price category gender popularity generationCount averageRating attributes');
};

// Static: get active collections for a gender
collectionSchema.statics.getActiveCollections = function(gender = 'all') {
  const now = new Date();
  const query = {
    isActive: true,
    $or: [
      { startsAt: null },
      { startsAt: { $lte: now } }
    ]
  };

  // Filter expired
  query.$and = [
    { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }
  ];

  // Gender targeting
  if (gender && gender !== 'all') {
    query.targetGender = { $in: [gender, 'all'] };
  }

  return this.find(query).sort({ isPinned: -1, displayOrder: 1 });
};

module.exports = mongoose.model('Collection', collectionSchema);

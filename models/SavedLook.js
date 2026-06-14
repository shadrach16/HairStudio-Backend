// backend/models/SavedLook.js
// Saved Looks — curated generation results users save for barbershop reference

const mongoose = require('mongoose');

const savedLookSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  generation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Generation',
    required: true
  },
  // User-assigned title (defaults to hairstyle name)
  title: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  // Free-text notes (e.g. "show to barber", "try with fade")
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  // User-assigned tags for organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 30
  }],
  // Pin to top of collection
  isPinned: {
    type: Boolean,
    default: false
  },
  // Optional collection/folder grouping
  collection: {
    type: String,
    trim: true,
    maxlength: 50,
    default: 'default'
  },
  // Denormalized fields for fast listing (avoid joins)
  snapshot: {
    hairstyleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hairstyle'
    },
    hairstyleName: String,
    hairstyleCategory: String,
    originalImageUrl: String,
    generatedImageUrl: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    }
  }
}, {
  timestamps: true
});

// Prevent duplicate saves of the same generation
savedLookSchema.index({ user: 1, generation: 1 }, { unique: true });

// Fast listing sorted by pin + date
savedLookSchema.index({ user: 1, isPinned: -1, createdAt: -1 });

// Collection-based listing
savedLookSchema.index({ user: 1, collection: 1, createdAt: -1 });

// Tag-based search
savedLookSchema.index({ user: 1, tags: 1 });

// Static: save a look (idempotent upsert)
savedLookSchema.statics.saveLook = async function(userId, generationId, data = {}) {
  const { title, notes, tags, collection, snapshot } = data;

  return this.findOneAndUpdate(
    { user: userId, generation: generationId },
    {
      user: userId,
      generation: generationId,
      ...(title !== undefined && { title }),
      ...(notes !== undefined && { notes }),
      ...(tags !== undefined && { tags }),
      ...(collection !== undefined && { collection }),
      ...(snapshot && { snapshot })
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

// Static: remove a saved look
savedLookSchema.statics.removeLook = async function(userId, savedLookId) {
  const result = await this.findOneAndDelete({ _id: savedLookId, user: userId });
  return { removed: !!result };
};

// Static: get user's saved looks with pagination
savedLookSchema.statics.getUserLooks = async function(userId, options = {}) {
  const { collection, tag, page = 1, limit = 20 } = options;

  const query = { user: userId };
  if (collection) query.collection = collection;
  if (tag) query.tags = tag;

  const skip = (page - 1) * limit;

  const [looks, total] = await Promise.all([
    this.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    looks,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  };
};

// Static: get user's collections list
savedLookSchema.statics.getUserCollections = async function(userId) {
  const result = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$collection', count: { $sum: 1 }, latestAt: { $max: '$createdAt' } } },
    { $sort: { latestAt: -1 } },
    { $project: { collection: '$_id', count: 1, latestAt: 1, _id: 0 } }
  ]);
  return result;
};

module.exports = mongoose.model('SavedLook', savedLookSchema);

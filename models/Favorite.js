// backend/models/Favorite.js
// Favorites collection for saving hairstyles and generations

const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // What type of item is being favorited
  targetType: {
    type: String,
    enum: ['hairstyle', 'generation'],
    required: true
  },
  // Reference to the favorited item
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType' // Dynamic reference based on targetType
  },
  // Denormalized data for fast listing (avoid extra lookups)
  metadata: {
    name: String,
    thumbnail: String,
    category: String
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate favorites
favoriteSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

// Index for listing user favorites efficiently
favoriteSchema.index({ user: 1, createdAt: -1 });

// Static method to add a favorite (idempotent)
favoriteSchema.statics.addFavorite = async function(userId, targetType, targetId, metadata = {}) {
  try {
    const favorite = await this.findOneAndUpdate(
      { user: userId, targetType, targetId },
      { 
        user: userId, 
        targetType, 
        targetId,
        metadata 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return { success: true, favorite, isNew: favorite.createdAt === favorite.updatedAt };
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate - already favorited
      const existing = await this.findOne({ user: userId, targetType, targetId });
      return { success: true, favorite: existing, isNew: false };
    }
    throw error;
  }
};

// Static method to remove a favorite
favoriteSchema.statics.removeFavorite = async function(userId, targetType, targetId) {
  const result = await this.findOneAndDelete({ user: userId, targetType, targetId });
  return { success: true, removed: !!result };
};

// Static method to check if item is favorited
favoriteSchema.statics.isFavorited = async function(userId, targetType, targetId) {
  const favorite = await this.findOne({ user: userId, targetType, targetId });
  return !!favorite;
};

// Static method to get user's favorites with pagination
favoriteSchema.statics.getUserFavorites = async function(userId, targetType = null, page = 1, limit = 20) {
  const query = { user: userId };
  if (targetType) {
    query.targetType = targetType;
  }
  
  const skip = (page - 1) * limit;
  
  const [favorites, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    favorites,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  };
};

// Static method to get favorite IDs for quick lookup (for UI)
favoriteSchema.statics.getFavoriteIds = async function(userId, targetType) {
  const favorites = await this.find({ user: userId, targetType }).select('targetId').lean();
  return favorites.map(f => f.targetId.toString());
};

module.exports = mongoose.model('Favorite', favoriteSchema);

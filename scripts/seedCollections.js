// ─── G2: Seed Collections ─────────────────────────────────────────────────────
// Seeds curated and dynamic style collections for the discovery carousel

require('dotenv').config();
const mongoose = require('mongoose');
const Collection = require('../models/Collection');

const collections = [
  {
    name: 'Trending This Week',
    slug: 'trending-this-week',
    description: 'The most popular styles our community is rocking right now',
    emoji: '🔥',
    type: 'trending',
    displayOrder: 1,
    isPinned: true,
    targetGender: 'all',
    dynamicFilter: {
      sortBy: '-generationCount',
      limit: 12
    }
  },
  {
    name: 'Fresh Fades',
    slug: 'fresh-fades',
    description: 'Clean cuts and sharp fades for a polished look',
    emoji: '💈',
    type: 'dynamic',
    displayOrder: 2,
    targetGender: 'male',
    dynamicFilter: {
      category: 'Fades',
      sortBy: '-popularity',
      limit: 12
    }
  },
  {
    name: 'Protective Styles',
    slug: 'protective-styles',
    description: 'Keep your hair healthy while looking amazing',
    emoji: '🛡️',
    type: 'dynamic',
    displayOrder: 3,
    targetGender: 'all',
    dynamicFilter: {
      category: 'Protective',
      sortBy: '-popularity',
      limit: 12
    }
  },
  {
    name: 'Bold Braids',
    slug: 'bold-braids',
    description: 'Statement braiding styles from classic to creative',
    emoji: '✨',
    type: 'dynamic',
    displayOrder: 4,
    targetGender: 'all',
    dynamicFilter: {
      category: 'Braids',
      sortBy: '-popularity',
      limit: 12
    }
  },
  {
    name: 'Budget Friendly',
    slug: 'budget-friendly',
    description: 'Great styles that won\'t break the bank',
    emoji: '💰',
    type: 'dynamic',
    displayOrder: 5,
    targetGender: 'all',
    dynamicFilter: {
      maxPrice: 2,
      sortBy: '-popularity',
      limit: 12
    }
  },
  {
    name: 'Natural & Free',
    slug: 'natural-and-free',
    description: 'Embrace your natural texture with these beautiful styles',
    emoji: '🌿',
    type: 'dynamic',
    displayOrder: 6,
    targetGender: 'all',
    dynamicFilter: {
      category: 'Afros',
      sortBy: '-popularity',
      limit: 12
    }
  },
  {
    name: 'Loc Love',
    slug: 'loc-love',
    description: 'Stunning loc styles from starter to freeform',
    emoji: '🦁',
    type: 'dynamic',
    displayOrder: 7,
    targetGender: 'all',
    dynamicFilter: {
      category: 'Locs',
      sortBy: '-popularity',
      limit: 12
    }
  },
  {
    name: 'Low Cut & Clean',
    slug: 'low-cut-clean',
    description: 'Minimal, sharp, and effortlessly cool',
    emoji: '⚡',
    type: 'dynamic',
    displayOrder: 8,
    targetGender: 'male',
    dynamicFilter: {
      category: 'Low Cut',
      sortBy: '-popularity',
      limit: 12
    }
  }
];

async function seedCollections() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Upsert each collection by slug (idempotent)
    for (const col of collections) {
      await Collection.updateOne(
        { slug: col.slug },
        { $set: col },
        { upsert: true }
      );
      console.log(`  ✓ ${col.name}`);
    }

    console.log(`\nSeeded ${collections.length} collections`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedCollections();
}

module.exports = { seedCollections };

// models/Attribution.js
// Install/campaign attribution for the "Shad Hair Studio" content network.
// One row per install (deduped by installId). Records where an install came
// from (UTM/campaign/content) and how it was attributed (deep link, deferred
// install referrer, or first-launch URL).

const mongoose = require('mongoose');

const attributionSchema = new mongoose.Schema({
  // Client-generated stable id for the install/device (dedup key). First write wins.
  installId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // utm_source — e.g. "youtube"
  source: { type: String, index: true, default: null },
  // utm_medium — e.g. "video", "description", "community"
  medium: { type: String, default: null },
  // utm_campaign — the video id (the piece of content that drove the install)
  campaign: { type: String, index: true, default: null },
  // content — the artifact id (specific hairstyle / try-on result referenced)
  content: { type: String, index: true, default: null },
  // referral code, if the link also carried one
  ref: { type: String, default: null },
  platform: {
    type: String,
    enum: ['android', 'ios', 'web', 'unknown'],
    default: 'unknown',
    index: true
  },
  // How the attribution was captured
  method: {
    type: String,
    enum: ['deep_link', 'install_referrer', 'first_launch_url', 'manual'],
    default: 'first_launch_url'
  },
  // Linked user (may be null at first open, set once they sign in)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  // Raw Play Install Referrer string (for audit/debug)
  rawReferrer: { type: String, default: null },
  appVersion: { type: String, default: null },
  metadata: {
    userAgent: String,
    ipAddress: String,
    country: String
  },
  attributedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Installs-per-campaign style queries
attributionSchema.index({ campaign: 1, attributedAt: -1 });
attributionSchema.index({ source: 1, attributedAt: -1 });

/**
 * Record an install attribution, idempotently (first write per installId wins).
 * Returns { attribution, created }.
 */
attributionSchema.statics.recordInstall = async function (data) {
  const { installId } = data;
  if (!installId) throw new Error('installId is required');

  const existing = await this.findOne({ installId });
  if (existing) {
    // Don't overwrite the original attribution; just backfill userId if newly known.
    if (data.userId && !existing.userId) {
      existing.userId = data.userId;
      await existing.save();
    }
    return { attribution: existing, created: false };
  }

  const attribution = await this.create(data);
  return { attribution, created: true };
};

module.exports = mongoose.model('Attribution', attributionSchema);

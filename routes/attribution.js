// routes/attribution.js
// Install/campaign attribution for the content network.
//   POST /api/attribution/install     -> record install_attributed (idempotent)
//   GET  /api/attribution/share-link   -> build ONE shareable deep link w/ UTM
//   GET  /api/attribution/campaigns    -> installs-per-campaign (admin / cron)

const express = require('express');
const { body, validationResult } = require('express-validator');
const Attribution = require('../models/Attribution');
const Analytics = require('../models/Analytics');
const { optionalAuth } = require('../middleware/auth');
const { buildShareLink } = require('../services/deepLink');

const router = express.Router();

/**
 * POST /api/attribution/install
 * First-open attribution. Public (optionalAuth) — a fresh install may not be
 * signed in yet. Idempotent per installId (first attribution wins).
 */
router.post('/install', optionalAuth, [
  body('installId').isString().trim().isLength({ min: 6, max: 128 }),
  body('source').optional({ nullable: true }).isString(),
  body('medium').optional({ nullable: true }).isString(),
  body('campaign').optional({ nullable: true }).isString(),
  body('content').optional({ nullable: true }).isString(),
  body('ref').optional({ nullable: true }).isString(),
  body('platform').optional({ nullable: true }).isIn(['android', 'ios', 'web', 'unknown']),
  body('method').optional({ nullable: true }).isIn(['deep_link', 'install_referrer', 'first_launch_url', 'manual']),
  body('rawReferrer').optional({ nullable: true }).isString(),
  body('appVersion').optional({ nullable: true }).isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { installId, source, medium, campaign, content, ref, platform, method, rawReferrer, appVersion } = req.body;

    const { attribution, created } = await Attribution.recordInstall({
      installId,
      source: source || null,
      medium: medium || null,
      campaign: campaign || null,
      content: content || null,
      ref: ref || null,
      platform: platform || 'unknown',
      method: method || 'first_launch_url',
      rawReferrer: rawReferrer || null,
      appVersion: appVersion || null,
      userId: req.user?._id || null,
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    });

    if (created) {
      // Mirror into Analytics so it shows up in the existing funnels.
      Analytics.trackEvent('install_attributed', {
        source: attribution.source,
        campaign: attribution.campaign,
        content: attribution.content,
        platform: attribution.platform,
        method: attribution.method
      }, attribution.userId).catch(() => {});
    }

    return res.json({
      success: true,
      created,
      attribution: {
        source: attribution.source,
        campaign: attribution.campaign,
        content: attribution.content,
        ref: attribution.ref,
        platform: attribution.platform
      }
    });
  } catch (error) {
    console.error('[attribution] install error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to record attribution' });
  }
});

/**
 * GET /api/attribution/share-link
 * Given a hairstyle/result id (+ video id) -> ONE shareable https deep link with
 * UTM baked in, plus the custom-scheme and Play-Store-with-referrer variants.
 *   ?artifactId=<id>&videoId=<vid>&source=youtube&medium=video&ref=<code>
 */
router.get('/share-link', (req, res) => {
  const { artifactId, videoId, source, medium, ref } = req.query;
  if (!artifactId && !videoId) {
    return res.status(400).json({ success: false, message: 'artifactId or videoId is required' });
  }
  const link = buildShareLink({ artifactId, videoId, source, medium, ref });
  return res.json({ success: true, data: link });
});

/**
 * GET /api/attribution/campaigns
 * Installs-per-campaign read. Admin (req.user.isAdmin) or x-cron-secret.
 *   ?from=ISO&to=ISO&source=youtube
 */
router.get('/campaigns', optionalAuth, async (req, res) => {
  const cronSecret = req.headers['x-cron-secret'];
  const isAdmin = req.user?.isAdmin;
  if (!isAdmin && (!process.env.CRON_SECRET || cronSecret !== process.env.CRON_SECRET)) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const match = {};
    if (req.query.source) match.source = String(req.query.source);
    if (req.query.from || req.query.to) {
      match.attributedAt = {};
      if (req.query.from) match.attributedAt.$gte = new Date(req.query.from);
      if (req.query.to) match.attributedAt.$lte = new Date(req.query.to);
    }

    const byCampaign = await Attribution.aggregate([
      { $match: match },
      {
        $group: {
          _id: { campaign: '$campaign', source: '$source' },
          installs: { $sum: 1 },
          signedIn: { $sum: { $cond: [{ $ifNull: ['$userId', false] }, 1, 0] } },
          lastInstall: { $max: '$attributedAt' }
        }
      },
      {
        $project: {
          _id: 0,
          campaign: '$_id.campaign',
          source: '$_id.source',
          installs: 1,
          signedIn: 1,
          lastInstall: 1
        }
      },
      { $sort: { installs: -1 } }
    ]);

    const total = byCampaign.reduce((sum, c) => sum + c.installs, 0);
    return res.json({ success: true, data: { total, campaigns: byCampaign } });
  } catch (error) {
    console.error('[attribution] campaigns error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to read campaigns' });
  }
});

module.exports = router;

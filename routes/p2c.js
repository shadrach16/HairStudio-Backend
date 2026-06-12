// routes/p2c.js
// ── Photo2Calendar proxy ─────────────────────────────────────────────────────
// Isolated endpoints that let the Photo2Calendar app use this server's Gemini
// key WITHOUT shipping the key in the app bundle (which is how its old key
// leaked). Additive only — nothing here touches the hairstudio app's data.
//
//   POST /api/p2c/gemini       → transparent pass-through to Gemini
//   GET  /api/p2c/app-version  → version gate the app checks on launch

const express = require('express');
const rateLimit = require('express-rate-limit');
const { GoogleGenAI } = require('@google/genai');

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Optional shared secret. Set P2C_SHARED_KEY in env to enable; must match the
// app's VITE_GEMINI_PROXY_KEY. Light anti-abuse so the open endpoint can't be
// used to burn your Gemini quota. Leave unset to disable the check.
const SHARED_KEY = process.env.P2C_SHARED_KEY || '';

// App-version gate. Bump these via env (no code change) to force/notify updates.
// minBuild   → Android versionCodes below this are HARD-blocked until updated.
// latestBuild→ below this gets a soft, dismissible "update available" prompt.
const VERSION = {
  android: {
    minBuild: parseInt(process.env.P2C_ANDROID_MIN_BUILD || '11', 10),
    latestBuild: parseInt(process.env.P2C_ANDROID_LATEST_BUILD || '11', 10),
    storeUrl:
      process.env.P2C_ANDROID_STORE_URL ||
      'https://play.google.com/store/apps/details?id=com.waoapps.photo2calendar',
    message:
      process.env.P2C_UPDATE_MESSAGE ||
      'A new version of Photo2Calendar is available. Please update to keep scanning events.',
  },
};

// Per-IP limit on the expensive endpoint.
const geminiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 extractions / minute / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down.' },
});

router.get('/app-version', (req, res) => {
  const platform = String(req.query.platform || 'android').toLowerCase();
  res.json(VERSION[platform] || VERSION.android);
});

router.post('/gemini', geminiLimiter, async (req, res) => {
  if (SHARED_KEY && req.get('x-app-key') !== SHARED_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { model, contents, config } = req.body || {};
  if (!model || !Array.isArray(contents)) {
    return res.status(400).json({ error: 'Missing "model" or "contents".' });
  }

  try {
    // NOTE: the SDK reads generation settings from `config` (responseMimeType,
    // responseSchema, thinkingConfig live inside it) — NOT `generationConfig`.
    const result = await ai.models.generateContent({ model, contents, config });
    // Return only what the app reads — a stable, serializable shape.
    res.json({ candidates: result.candidates });
  } catch (err) {
    console.error('[p2c] Gemini error:', err?.message || err);
    res.status(502).json({ error: 'Upstream Gemini error' });
  }
});

module.exports = router;

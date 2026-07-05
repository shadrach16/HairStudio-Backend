// services/aiNudgeService.js
// Generates short, catchy re-engagement push messages using Gemini.
// One AI call produces a pool of messages per run; the daily campaign then
// assigns a random one per user. Falls back to a curated list if AI fails,
// so notifications always go out.

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Curated fallback pool — used if the AI call fails or returns nothing.
// Bodies may contain {name}; it is replaced with the user's first name
// (or "there" when no name is available).
const FALLBACK_NUDGES = [
  { title: '💇 Time for a new look?', body: 'Hey {name}, try a fresh hairstyle today and see if it suits you!' },
  { title: 'New hair, who dis?', body: 'Test a bold new style in seconds. Your perfect look is waiting, {name}.' },
  { title: '🔥 Switch up your style', body: 'Curious how braids or a fade would look on you? Find out now!' },
  { title: '💁 Have you done your hair today?', body: 'Come try a new style on your photo — it only takes a moment, {name}.' },
  { title: '🎨 Your next hairstyle awaits', body: 'Swipe through fresh styles and try one on instantly. Tap to start!' },
  { title: '😍 See the new you', body: 'A new cut could be your next favorite. Try it on before the salon, {name}!' },
  { title: 'Feeling a change?', body: 'Test drive a new hairstyle today and find the one that fits you best.' },
  { title: '🪞 Mirror, mirror...', body: 'Wondering what locs or twists would look like on you? Try them now!' },
  { title: '⚡ Quick style check', body: 'Hey {name}, see how a fresh hairstyle looks on you in seconds.' },
  { title: 'Glow up time', body: 'New week, new look? Try a hairstyle that turns heads, {name}.' },
  { title: '💖 Treat yourself', body: 'Play with bold new styles risk-free. Your next look is one tap away.' },
  { title: '🎭 Try before you cut', body: 'Not sure about that new style? See it on your own photo first, {name}.' },
  { title: 'Ready for a makeover?', body: 'Discover a hairstyle you’ll love. Tap in and try one today!' },
  { title: '💥 Bold choice incoming', body: 'Dare to try something different? Test a daring new look right now.' },
  { title: '👑 Own your look', body: 'Hey {name}, find the hairstyle that makes you feel like royalty.' },
];

const GEN_PROMPT = `You write short, catchy mobile push notifications for an AI hairstyle virtual try-on app.
Users upload a selfie and instantly see how different hairstyles (braids, fades, locs, twists, afros, weaves, modern cuts, etc.) look on them. Credits are used per try-on.

Write {COUNT} DIFFERENT re-engagement notifications that gently nudge inactive users to come back and try a new hairstyle today. Make them fun, warm, casual and varied in tone — some playful, some curious, some FOMO, some complimentary.

Rules:
- "title": max 40 characters. Optional ONE plain, relevant emoji (💇 💈 💁 😎) or none.
- NEVER use sparkle / generic-AI emojis: no ✨ 🌟 💫 🤩 🪄 🚀 💡. They look like generic AI slop.
- Write like a real person texting a friend — not a hype marketer. No "unleash/elevate/game-changer/screams you".
- "body": max 110 characters, friendly and inviting, ends with a light call to action.
- About half of the bodies should include the literal token {name} (it will be replaced with the user's first name). The other half should be generic (no {name}).
- No salon prices, no fake discounts, no guarantees, no spammy ALL CAPS, at most one emoji per field.
- Each message must be distinctly different — vary the hook and the wording.

Return ONLY a valid JSON array, no markdown fences, no commentary, in this exact shape:
[{ "title": "...", "body": "..." }, ...]`;

// Strip ```json ... ``` markdown fences some models wrap JSON in, and
// trim to the outermost array so JSON.parse always gets clean input.
function stripFences(text) {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const start = t.indexOf('[');
  const end = t.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    t = t.slice(start, end + 1);
  }
  return t;
}

/**
 * Generate a pool of nudge messages via Gemini.
 * @param {number} count - how many messages to request
 * @returns {Promise<Array<{title:string, body:string}>>}
 */
async function generateNudges(count = 15) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: GEN_PROMPT.replace('{COUNT}', String(count)) }],
      config: {
        responseMimeType: 'application/json',
        temperature: 1.0,
      },
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const parsed = JSON.parse(stripFences(text));
      const cleaned = (Array.isArray(parsed) ? parsed : [])
        .filter((m) => m && typeof m.title === 'string' && typeof m.body === 'string')
        .map((m) => ({ title: m.title.trim().slice(0, 60), body: m.body.trim().slice(0, 160) }))
        .filter((m) => m.title && m.body);

      if (cleaned.length >= 3) {
        console.log(`🤖 AI generated ${cleaned.length} nudge messages`);
        return cleaned;
      }
      console.warn('AI nudge output too small, using fallback pool');
    }
  } catch (err) {
    console.warn('AI nudge generation failed, using fallback pool:', err.message);
  }

  return FALLBACK_NUDGES;
}

/**
 * Personalize a message for a user (replaces {name} with first name).
 * @param {{title:string, body:string}} msg
 * @param {string} [fullName]
 */
function personalize(msg, fullName) {
  const first = (fullName || '').trim().split(/\s+/)[0] || 'there';
  return {
    title: msg.title.replace(/\{name\}/gi, first),
    body: msg.body.replace(/\{name\}/gi, first),
  };
}

// ─── Personalized recommendation nudges ─────────────────────────────────────
// Templates contain {style} (the recommended hairstyle name) and optionally
// {name}. {style} is filled per-user with their recommendation; {name} is filled
// later by personalize(). Keeps AI cost at one call per run.
const RECOMMENDATION_FALLBACK = [
  { title: 'Picked for you', body: '{name}, based on your looks we think you’ll love the {style}. Try it on your photo →' },
  { title: 'Your next look?', body: 'The {style} matches your style, {name}. See it on you in seconds.' },
  { title: 'We found your vibe', body: 'You’ve been into these looks — the {style} is calling. Tap to try it.' },
  { title: 'New idea for you', body: '{name}, imagine yourself in the {style}. One tap to see it.' },
  { title: 'Made for your face', body: 'The {style} could be your next favorite. Try it on your photo now.' },
  { title: 'Based on your taste', body: 'We lined up the {style} for you, {name}. Come see how it looks.' },
  { title: 'Fresh recommendation', body: 'Think the {style} is your next look? See it on you before you commit.' },
  { title: 'You + the {style}', body: '{name}, this one’s got your name on it. Try the {style} today.' },
];

const REC_PROMPT = `You write short, warm mobile push notifications for an AI hairstyle try-on app that RECOMMEND a specific hairstyle to a user based on their taste (like a friend suggesting a look).

Write {COUNT} DIFFERENT templates. Each has "title" and "body".

Rules:
- "title": max 38 characters. Optional ONE plain, relevant emoji (💇 💈 💁 😎) or none.
- NEVER use sparkle / generic-AI emojis: no ✨ 🌟 💫 🤩 🪄 🚀 💡. They look like generic AI slop.
- Write like a real person suggesting a look to a friend — not a hype marketer. No "unleash/elevate/game-changer/screams you".
- "body": max 110 characters, friendly and personal, ends with a light call to action.
- The body MUST contain the literal token {style} EXACTLY ONCE (it is replaced with the recommended hairstyle's name).
- About half the bodies should also contain the literal token {name} once (the user's first name).
- No prices, no ALL CAPS, at most one emoji per field. Each template clearly different.

Return ONLY a valid JSON array, no markdown fences: [{ "title": "...", "body": "..." }, ...]`;

/**
 * Generate a pool of recommendation message templates (each body contains {style}).
 * Falls back to a curated list. One AI call per run.
 */
async function generateRecommendationTemplates(count = 10) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: REC_PROMPT.replace('{COUNT}', String(count)) }],
      config: { responseMimeType: 'application/json', temperature: 1.0 },
    });
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const parsed = JSON.parse(stripFences(text));
      const cleaned = (Array.isArray(parsed) ? parsed : [])
        .filter((m) => m && typeof m.title === 'string' && typeof m.body === 'string' && /\{style\}/i.test(m.body))
        .map((m) => ({ title: m.title.trim().slice(0, 60), body: m.body.trim().slice(0, 160) }));
      if (cleaned.length >= 3) {
        console.log(`🤖 AI generated ${cleaned.length} recommendation templates`);
        return cleaned;
      }
    }
  } catch (err) {
    console.warn('AI recommendation templates failed, using fallback:', err.message);
  }
  return RECOMMENDATION_FALLBACK;
}

/** Fill {style}/{category} in a template (leaves {name} for personalize()). */
function fillStyle(msg, { style, category } = {}) {
  const s = (style || 'a fresh look').trim();
  return {
    title: msg.title.replace(/\{style\}/gi, s).replace(/\{category\}/gi, category || s),
    body: msg.body.replace(/\{style\}/gi, s).replace(/\{category\}/gi, category || s),
  };
}

module.exports = {
  generateNudges,
  personalize,
  FALLBACK_NUDGES,
  generateRecommendationTemplates,
  fillStyle,
};

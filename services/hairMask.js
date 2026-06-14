// A3: Hair Region Mask Service
// Detects the hair region via Gemini vision and produces bounding-box + semantic data
// that drives the edit-centric prompt construction.
//
// Since Gemini's image generation endpoint does not accept pixel-level masks,
// we Instead produce structured region metadata that:
//   1. Tells the edit prompt exactly WHERE the hair region is (bbox %)
//   2. Describes the CURRENT hair state (needed for smooth transitions)
//   3. Flags edge conditions (hat, headband, off-frame hair) for the prompt

const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── Mask analysis prompt ──────────────────────────────────────────────────

const MASK_ANALYSIS_PROMPT = `You are a hair region detection system for an AI hairstyle editing application.
Analyze this selfie photo and respond ONLY with valid JSON (no markdown, no code fences).

Detect and describe:
1. hairRegion: bounding box of the hair area as percentages of image dimensions
   - top (0-100): percentage from top of image where hair starts
   - bottom (0-100): percentage from top where hair ends
   - left (0-100): percentage from left where hair starts
   - right (0-100): percentage from left where hair ends
2. currentHairState: brief factual description of the person's current hair
   - length: "bald"|"very-short"|"short"|"medium"|"long"|"very-long"
   - color: primary hair color
   - texture: "straight"|"wavy"|"curly"|"coily"|"4c"
   - coverage: "full"|"thinning"|"receding"|"bald-top"|"partial"
3. faceRegion: bounding box of the face (same format) — used to define preservation zone
4. hairlineBoundary: description of the hairline shape — "straight"|"curved"|"receding"|"widows-peak"|"uneven"
5. obstructions: array of anything covering the hair region — e.g. ["hat","headband","hand","sunglasses-on-head"]
6. editDifficulty: "easy"|"medium"|"hard" — based on obstructions, angle, and current hair complexity

Example:
{"hairRegion":{"top":2,"bottom":55,"left":15,"right":85},"currentHairState":{"length":"short","color":"black","texture":"coily","coverage":"full"},"faceRegion":{"top":25,"bottom":85,"left":20,"right":80},"hairlineBoundary":"curved","obstructions":[],"editDifficulty":"easy"}`;

/**
 * Analyze the image to detect hair region and current hair state.
 * Returns structured metadata used by the edit-centric prompt builder.
 *
 * @param {Buffer} imageBuffer - The selfie image
 * @param {string} mimeType - MIME type of the image
 * @returns {Object} { success, hairRegion, currentHairState, faceRegion, ... }
 */
async function analyzeHairRegion(imageBuffer, mimeType) {
  try {
    const base64 = imageBuffer.toString('base64');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [
        { text: MASK_ANALYSIS_PROMPT },
        { inlineData: { mimeType, data: base64 } },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('A3 mask: empty Gemini response');
      return { success: false, error: 'empty_response' };
    }

    const data = JSON.parse(text);

    return {
      success: true,
      hairRegion: data.hairRegion || null,
      currentHairState: data.currentHairState || null,
      faceRegion: data.faceRegion || null,
      hairlineBoundary: data.hairlineBoundary || 'unknown',
      obstructions: data.obstructions || [],
      editDifficulty: data.editDifficulty || 'medium',
    };
  } catch (err) {
    console.error('A3 mask analysis error:', err.message);
    // Fail-open: return empty mask data so generation can still proceed
    return {
      success: false,
      error: err.message,
      hairRegion: null,
      currentHairState: null,
      faceRegion: null,
      hairlineBoundary: 'unknown',
      obstructions: [],
      editDifficulty: 'unknown',
    };
  }
}

module.exports = {
  analyzeHairRegion,
};

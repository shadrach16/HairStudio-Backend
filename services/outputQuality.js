// A4: Output Quality Scoring Service
// Analyzes generated images for identity preservation, artifacts, and overall quality.
// Used to gate whether the result is delivered or auto-retried.

const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── Configuration ──────────────────────────────────────────────────────────

const QUALITY_CONFIG = {
  // Minimum score to accept a generation (0-100)
  minAcceptScore: 35,
  // Maximum auto-retry attempts before giving up (default)
  maxRetries: 1,
  // Mode-specific quality thresholds
  modeThresholds: {
    standard: 35,
    hd: 45,
    pro: 55,
  },
  // A4: Per-mode retry budgets — premium modes get more attempts
  modeRetries: {
    standard: 1,
    hd: 2,
    pro: 3,
  },
  // A4: Partial refund on low-quality completion for premium modes
  lowQualityRefundPolicy: {
    standard: 0,       // No refund — delivered as-is
    hd: 0.5,           // 50% refund if quality below threshold
    pro: 1.0,          // Full refund if quality below threshold
  },
};

// ─── Quality analysis prompt ────────────────────────────────────────────────

const QUALITY_SCORE_PROMPT = `You are a quality assessor for an AI hairstyle generation application.
You will receive TWO images:
1. The ORIGINAL selfie (reference face)
2. The GENERATED result

Evaluate the generated image and respond ONLY with valid JSON (no markdown, no code fences).

Score these dimensions (each 0-100):

1. identityPreservation (number): Does the person in the generated image look like the same person? Same face shape, skin tone, facial features, expression? 100 = identical person, 0 = completely different person.
2. posePreservation (number): Is the head angle, neck position, and body orientation the same? 100 = identical pose, 0 = completely different.
3. hairstyleAccuracy (number): Does the generated hairstyle look like a real, well-executed hairstyle? Not glitchy, floating, or misplaced? 100 = perfect hairstyle, 0 = unrecognizable.
4. artifactScore (number): Freedom from visual artifacts like blurring, color bleeding, distortion, extra limbs/fingers, unnatural edges around hair. 100 = artifact-free, 0 = heavily corrupted.
5. backgroundPreservation (number): Is the background unchanged from the original? 100 = identical background, 0 = completely changed.
6. overallNaturalness (number): Does the result look like a real photograph? 100 = photorealistic, 0 = obviously AI-generated.
7. qualityScore (number 0-100): Single composite quality score.
8. passesQuality (boolean): Would you show this to a paying customer? True if the result is acceptable quality.
9. primaryDefect (string|null): The single worst quality issue, or null if acceptable.
10. defectSeverity (string|null): "minor"|"moderate"|"severe"|null

Example:
{"identityPreservation":85,"posePreservation":90,"hairstyleAccuracy":75,"artifactScore":80,"backgroundPreservation":95,"overallNaturalness":78,"qualityScore":82,"passesQuality":true,"primaryDefect":null,"defectSeverity":null}`;

/**
 * Score the quality of a generated image against the original selfie.
 *
 * @param {string} originalBase64 - Base64 of the original selfie
 * @param {string} originalMimeType - MIME type of the original
 * @param {string} generatedBase64 - Base64 of the generated image
 * @param {string} generatedMimeType - MIME type of the generated image
 * @param {string} generationMode - 'standard'|'hd'|'pro'
 * @returns {{ passed, score, analysis, defect? }}
 */
async function scoreOutput(originalBase64, originalMimeType, generatedBase64, generatedMimeType, generationMode = 'standard') {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        { text: QUALITY_SCORE_PROMPT },
        { text: 'ORIGINAL SELFIE:' },
        { inlineData: { mimeType: originalMimeType, data: originalBase64 } },
        { text: 'GENERATED RESULT:' },
        { inlineData: { mimeType: generatedMimeType, data: generatedBase64 } },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('A4 quality: empty Gemini response');
      // Fail-open — accept the image
      return { passed: true, score: 50, analysis: null, error: 'empty_response' };
    }

    const analysis = JSON.parse(text);
    const score = analysis.qualityScore ?? 50;
    const threshold = QUALITY_CONFIG.modeThresholds[generationMode] || QUALITY_CONFIG.minAcceptScore;
    const passed = score >= threshold && analysis.passesQuality !== false;

    return {
      passed,
      score,
      threshold,
      analysis: {
        identityPreservation: analysis.identityPreservation,
        posePreservation: analysis.posePreservation,
        hairstyleAccuracy: analysis.hairstyleAccuracy,
        artifactScore: analysis.artifactScore,
        backgroundPreservation: analysis.backgroundPreservation,
        overallNaturalness: analysis.overallNaturalness,
      },
      defect: analysis.primaryDefect || null,
      defectSeverity: analysis.defectSeverity || null,
    };
  } catch (err) {
    console.error('A4 quality scoring error:', err.message);
    // Fail-open
    return { passed: true, score: 50, analysis: null, error: err.message };
  }
}

module.exports = {
  scoreOutput,
  QUALITY_CONFIG,
};

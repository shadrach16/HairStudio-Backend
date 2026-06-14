// A3: Input Gate Service — validates selfie quality before generation
// Uses Gemini vision to score the image for face presence, quality, and suitability
// Runs BEFORE credits are deducted so poor inputs never consume credits.

const { GoogleGenAI } = require('@google/genai');
const sharp = require('sharp');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── Configuration ──────────────────────────────────────────────────────────

const INPUT_GATE_CONFIG = {
  minWidth: 256,
  minHeight: 256,
  maxWidth: 8192,
  maxHeight: 8192,
  maxFileSizeMB: 25,
  // Gemini-based scoring thresholds (0-100)
  minQualityScore: 40,
  // Allowed MIME types
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
};

// ─── Fast checks (no AI call) ───────────────────────────────────────────────

async function runFastChecks(imageBuffer, mimeType) {
  const issues = [];

  // 1. MIME type check
  if (!INPUT_GATE_CONFIG.allowedMimeTypes.includes(mimeType)) {
    issues.push({ code: 'INVALID_FORMAT', message: `Unsupported image format. Use JPEG, PNG, or WebP.` });
    return { passed: false, issues };
  }

  // 2. File size check
  const sizeMB = imageBuffer.length / (1024 * 1024);
  if (sizeMB > INPUT_GATE_CONFIG.maxFileSizeMB) {
    issues.push({ code: 'FILE_TOO_LARGE', message: `Image is ${sizeMB.toFixed(1)}MB. Maximum is ${INPUT_GATE_CONFIG.maxFileSizeMB}MB.` });
    return { passed: false, issues };
  }

  // 3. Dimensions check via sharp (fast — reads only headers)
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;

    if (!width || !height) {
      issues.push({ code: 'UNREADABLE_IMAGE', message: 'Could not read image dimensions.' });
      return { passed: false, issues };
    }

    if (width < INPUT_GATE_CONFIG.minWidth || height < INPUT_GATE_CONFIG.minHeight) {
      issues.push({
        code: 'TOO_SMALL',
        message: `Image is ${width}×${height}px. Minimum is ${INPUT_GATE_CONFIG.minWidth}×${INPUT_GATE_CONFIG.minHeight}px.`,
      });
    }

    if (width > INPUT_GATE_CONFIG.maxWidth || height > INPUT_GATE_CONFIG.maxHeight) {
      issues.push({
        code: 'TOO_LARGE',
        message: `Image is ${width}×${height}px. Maximum is ${INPUT_GATE_CONFIG.maxWidth}×${INPUT_GATE_CONFIG.maxHeight}px.`,
      });
    }

    return { passed: issues.length === 0, issues, dimensions: { width, height } };
  } catch (err) {
    issues.push({ code: 'CORRUPT_IMAGE', message: 'Image file appears to be corrupt or unreadable.' });
    return { passed: false, issues };
  }
}

// ─── AI-based quality scoring ───────────────────────────────────────────────

const GATE_ANALYSIS_PROMPT = `You are a selfie quality analyzer for a hairstyle try-on application.
Analyze this photo and respond ONLY with valid JSON (no markdown, no code fences).

Evaluate:
1. faceDetected (boolean): Is there exactly one clearly visible human face?
2. faceCount (number): How many distinct faces are in the image?
3. headVisible (boolean): Is the top/crown of the head at least partially visible? Be lenient — even if slightly cropped, if the forehead and hair area are visible, mark true.
4. isFrontOrSide (boolean): Is the face roughly front-facing or 3/4 profile (not from behind)?
5. isBlurry (boolean): Is the image too blurry for quality editing?
6. hasGoodLighting (boolean): Is the lighting adequate (not too dark/overexposed)?
7. isAppropriate (boolean): Is this an appropriate photo (no NSFW, no non-human subjects)?
8. qualityScore (number 0-100): Overall suitability for AI hairstyle editing.
9. primaryIssue (string|null): The single most impactful problem, or null if good.
10. suggestion (string|null): A short user-friendly tip to fix the primary issue, or null.

Example responses:
{"faceDetected":true,"faceCount":1,"headVisible":true,"isFrontOrSide":true,"isBlurry":false,"hasGoodLighting":true,"isAppropriate":true,"qualityScore":85,"primaryIssue":null,"suggestion":null}
{"faceDetected":false,"faceCount":0,"headVisible":false,"isFrontOrSide":false,"isBlurry":false,"hasGoodLighting":true,"isAppropriate":true,"qualityScore":5,"primaryIssue":"no_face","suggestion":"Take a clear selfie showing your face and the top of your head."}`;

async function runAIQualityCheck(imageBuffer, mimeType) {
  try {
    const base64 = imageBuffer.toString('base64');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [
        { text: GATE_ANALYSIS_PROMPT },
        { inlineData: { mimeType, data: base64 } },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('A3 gate: empty Gemini response');
      return { passed: true, score: 50, analysis: null, error: 'empty_response' };
    }

    const analysis = JSON.parse(text);

    // Determine pass/fail — LENIENT: only block truly unusable images
    const issues = [];

    if (!analysis.isAppropriate) {
      issues.push({ code: 'INAPPROPRIATE', message: 'This photo is not suitable for hairstyle generation.' });
    }

    // Only hard-block if NO face AND very low score — let borderline photos through
    if (!analysis.faceDetected && (analysis.qualityScore || 0) < 15) {
      issues.push({ code: 'NO_FACE', message: 'No face detected. Please take a clear selfie.' });
    }

    const score = analysis.qualityScore || 50;
    const passed = issues.length === 0;

    return {
      passed,
      score,
      analysis,
      issues,
      suggestion: analysis.suggestion || (issues[0]?.message || null),
    };
  } catch (err) {
    console.error('A3 gate AI check error:', err.message);
    // On AI failure, PASS to avoid blocking users (fail-open for availability)
    return { passed: true, score: 50, analysis: null, error: err.message };
  }
}

// ─── Main gate function ─────────────────────────────────────────────────────

/**
 * Run the full input gate pipeline.
 * Returns { passed, score, issues[], suggestion?, dimensions?, analysis? }
 *
 * If passed === false, generation should NOT proceed and no credits should be charged.
 */
async function validateInput(imageBuffer, mimeType) {
  // Stage 1: Fast local checks (dimensions, format, size)
  const fastResult = await runFastChecks(imageBuffer, mimeType);
  if (!fastResult.passed) {
    return {
      passed: false,
      score: 0,
      stage: 'fast_checks',
      issues: fastResult.issues,
      suggestion: fastResult.issues[0]?.message || 'Please use a different photo.',
      dimensions: fastResult.dimensions || null,
    };
  }

  // Stage 2: AI quality analysis (face detection, blur, lighting, content)
  const aiResult = await runAIQualityCheck(imageBuffer, mimeType);

  return {
    passed: aiResult.passed,
    score: aiResult.score,
    stage: aiResult.passed ? 'passed' : 'ai_quality',
    issues: aiResult.issues || [],
    suggestion: aiResult.suggestion || null,
    dimensions: fastResult.dimensions || null,
    analysis: aiResult.analysis || null,
  };
}

module.exports = {
  validateInput,
  runFastChecks,
  runAIQualityCheck,
  INPUT_GATE_CONFIG,
};

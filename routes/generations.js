const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { GoogleGenAI } = require('@google/genai');
const Generation = require('../models/Generation');
const Hairstyle = require('../models/Hairstyle');
const User = require('../models/User');
const {protect} = require('../middleware/auth');
const { trackEvent } = require('../utils/analytics');
const { analysis_prompt } = require('../prompts/all_prompts');
const { buildPrompt, buildEditPrompt, PROMPT_VERSION } = require('../prompts/promptFamilies');
const { validateInput } = require('../services/inputGate');
const { analyzeHairRegion } = require('../services/hairMask');
const { scoreOutput, QUALITY_CONFIG } = require('../services/outputQuality');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { generationLimit } = require('../middleware/rateLimit');
const subscriptionService = require('../services/subscriptionService');
const creditLedger = require('../services/creditLedger');

const router = express.Router();

// Gemini key pool: set GEMINI_API_KEY_POOL=key1,key2,... to spread image-gen load
// across keys (mitigates per-minute quota during bursts). Falls back to GEMINI_API_KEY.
const GEMINI_KEYS = (process.env.GEMINI_API_KEY_POOL || process.env.GEMINI_API_KEY || '')
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

const geminiClients = GEMINI_KEYS.map((key) => new GoogleGenAI({ apiKey: key }));
let geminiKeyCursor = 0;

// Round-robin next client (so consecutive calls hit different keys).
function nextGeminiClient() {
  if (!geminiClients.length) {
    throw new Error('No Gemini API key configured (GEMINI_API_KEY / GEMINI_API_KEY_POOL)');
  }
  const client = geminiClients[geminiKeyCursor % geminiClients.length];
  geminiKeyCursor += 1;
  return client;
}

// First client kept as `ai` for the existing (text) analyze-hairstyle path.
const ai = geminiClients[0] || new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


 function getMimeTypeFromBase64(base64String) {
  const match = base64String.match(/^data:(.*?);base64,/);
  if (!match || match.length < 2) {
    return null;
  }
  return match[1];
}


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
});



const HAIRSTYLE_ANALYSIS_PROMPT = analysis_prompt()

function parseRetryDelayMs(errorMessage = '') {
  const match = String(errorMessage).match(/Please retry in\s+([\d.]+)s/i);
  if (!match) return null;
  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  return Math.ceil(seconds * 1000);
}

function isQuotaError(errorMessage = '') {
  const msg = String(errorMessage);
  return /RESOURCE_EXHAUSTED|Too Many Requests|Quota exceeded|status:\s*429/i.test(msg);
}

async function refundGenerationCredits({ userId, generation, amount, reason, metadata = {} }) {
  const refundResult = await creditLedger.creditUser({
    userId,
    amount,
    kind: 'refund',
    source: 'generation_failure',
    reason,
    description: 'Automatic refund after generation failure',
    reference: {
      generation: generation._id,
      correlationId: String(generation._id)
    },
    metadata
  });

  generation.ledger = {
    ...(generation.ledger || {}),
    refundTransaction: refundResult.transaction._id,
    refundReason: reason,
    refundedAt: new Date()
  };

  return refundResult;
}




// New helper function for Gemini Hairstyle Analysis (similar to your existing one)
async function analyzeHairstyleWithGemini(imageBuffer, mimeType) {
  try {
    const model = 'gemini-3-flash-preview';
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    const response = await ai.models.generateContent({
        model: model,
         contents: [{ text: HAIRSTYLE_ANALYSIS_PROMPT }, imagePart], 
        generationConfig: {
          responseMimeType: 'application/text',
        },
    });


    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('AI analysis returned no text result');
    return text;

  } catch (error) {
    console.error('Gemini Hairstyle Analysis Error:', error);
    throw new Error('AI analysis service failed.');
  }
}


// --- A3: Standalone input validation endpoint ---
// @desc    Validate a selfie before generation (no credits consumed)
// @route   POST /api/generations/validate-input
// @access  Protected
router.post('/validate-input', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided.' });
    }

    const mimeType = req.file.mimetype;
    const result = await validateInput(req.file.buffer, mimeType);

    return res.status(result.passed ? 200 : 422).json({
      success: result.passed,
      score: result.score,
      stage: result.stage,
      issues: result.issues,
      suggestion: result.suggestion,
    });
  } catch (error) {
    console.error('Input validation error:', error);
    return res.status(500).json({ success: false, message: 'Validation service error.' });
  }
});


// --- 🌟 UPDATED ROUTE: Analyze & Generate Custom Hairstyle ---
// @desc    Analyze uploaded hairstyle image, create record, and start generation
// @route   POST /api/generations/analyze-hairstyle (Renamed to match user's reported URL)
// @access  Protected

const analyzeHairstyleUpload = upload.fields([
    { name: 'hairstyleImage', maxCount: 1 }, // Matches formData.append('hairstyleImage', ...)
    { name: 'userPhoto', maxCount: 1 },      // Matches formData.append('userPhoto', ...)
]);

router.post('/analyze-hairstyle', protect, analyzeHairstyleUpload, async (req, res) => {
    const CUSTOM_STYLE_PRICE = 3;
    
    try {
       const files = req.files;

        if (!files || !files.hairstyleImage || !files.userPhoto) {
            return res.status(400).json({ success: false, message: 'Both hairstyle image and user photo are required.' });
        }

const hairstyleFile = files.hairstyleImage[0]; 
        const userPhotoFile = files.userPhoto[0];
        
        const user = req.user;

        const hairstyleImageBuffer = hairstyleFile.buffer;
        const hairstyleMimeType = hairstyleFile.mimetype;
        
        const userPhotoBuffer = userPhotoFile.buffer;
        const userPhotoMimeType = userPhotoFile.mimetype;



        // 1. Check Credits (Charge for the full generation now)
        if (user.credits < CUSTOM_STYLE_PRICE) {
          return res.status(400).json({ success: false, message: 'Insufficient credits. Requires 3 credits.' });
        }

        // A3: Input gate on user's selfie photo, BEFORE consuming credits
        const gateResult = await validateInput(userPhotoBuffer, userPhotoMimeType);
        if (!gateResult.passed) {
          return res.status(422).json({
            success: false,
            code: 'INPUT_GATE_FAILED',
            message: gateResult.suggestion || 'Your selfie does not meet quality requirements.',
            issues: gateResult.issues,
            score: gateResult.score,
          });
        }

        // A3: Analyze hair region + perform AI hairstyle analysis in parallel
        const [maskResult, ai_description, originalImageUpload] = await Promise.all([
          analyzeHairRegion(userPhotoBuffer, userPhotoMimeType),
          analyzeHairstyleWithGemini(hairstyleImageBuffer, hairstyleMimeType),
          uploadToCloudinary(hairstyleImageBuffer, 'custom_hairstyles'),
        ]);

        // 4. Create the new Hairstyle record
        const newHairstyle = new Hairstyle({
            name: 'Custom Hairstyle from Analysis',
            category: 'Modern', 
            gender: 'unisex', 
            thumbnail: originalImageUpload.secure_url, 
            ai_description: ai_description,
            price: CUSTOM_STYLE_PRICE,
            isActive: false, 
            isCustom: true, 
            userId: req.user._id, 

        });
        await newHairstyle.save();

        // 5. Upload the user's original photo to Cloudinary (avoid storing base64 blobs in MongoDB)
        const originalUserPhotoUpload = await uploadToCloudinary(userPhotoBuffer, 'original_images');

        const generation = new Generation({
            user: user._id,
            hairstyle: newHairstyle._id, 
          'originalImage.url': originalUserPhotoUpload.secure_url,
          'originalImage.publicId': originalUserPhotoUpload.public_id,
            creditsUsed: CUSTOM_STYLE_PRICE,
            status: 'processing',
            // A3: Input gate and mask data
            inputGate: {
              passed: gateResult.passed,
              score: gateResult.score,
              stage: gateResult.stage,
              issues: gateResult.issues || [],
            },
            maskData: maskResult.success ? {
              hairRegion: maskResult.hairRegion,
              currentHairState: maskResult.currentHairState,
              hairlineBoundary: maskResult.hairlineBoundary,
              obstructions: maskResult.obstructions,
              editDifficulty: maskResult.editDifficulty,
            } : undefined,
            metadata: {
                userAgent: req.get('User-Agent'),
                ipAddress: req.ip,
                deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop',
                customHairstyleSource: 'analysis' 
            }
        });
        await generation.save();

        // 6. Deduct Credits & Respond to Client
        const customSpend = await creditLedger.debitUser({
          userId: user._id,
          amount: CUSTOM_STYLE_PRICE,
          kind: 'spend',
          source: 'custom_generation',
          reason: 'Custom hairstyle generation charge',
          description: 'Credit spend for custom hairstyle analysis and generation',
          reference: {
            generation: generation._id,
            correlationId: String(generation._id)
          },
          metadata: {
            hairstyleId: newHairstyle._id,
            deviceType: generation.metadata?.deviceType || 'unknown'
          }
        });

        generation.ledger = {
          ...(generation.ledger || {}),
          spendTransaction: customSpend.transaction._id
        };
        await generation.save();
   

        res.json({
            success: true,
            data: {
                generationId: generation._id,
                status: 'processing',
                ai_description: ai_description
            }
        });

        // 7. Process generation asynchronously with A4 quality scoring & auto-retry
        (async () => {
            const creditsCharged = CUSTOM_STYLE_PRICE;
            const maxAttempts = 1 + QUALITY_CONFIG.maxRetries;
            let attempt = 0;
            let lastResult = null;
            let lastQuality = null;

            try {
                const originalImageForGeneration = userPhotoBuffer;
                const originalMimeTypeForGeneration = userPhotoMimeType;

                while (attempt < maxAttempts) {
                  attempt++;
                  generation.retryCount = attempt - 1;

                  const result = await generateHairstyleWithGemini(
                      originalImageForGeneration,
                      newHairstyle,
                      originalMimeTypeForGeneration,
                      maskResult.success ? maskResult : null,
                      'standard'
                  );

                  if (result.promptMeta) {
                    generation.prompt = result.promptMeta;
                  }

                  if (!result.success) {
                    lastResult = result;
                    if (result.code === 'QUOTA_EXCEEDED') {
                      console.log('A4 custom: quota exceeded, skipping additional retries.');
                      break;
                    }
                    if (attempt < maxAttempts) continue;
                    break;
                  }

                  // A4: Score output quality
                  const originalBase64 = originalImageForGeneration.toString('base64');
                  const qualityResult = await scoreOutput(
                    originalBase64, originalMimeTypeForGeneration,
                    result.imageData, result.mimeType,
                    generation.generationMode || 'standard'
                  );
                  lastQuality = qualityResult;
                  lastResult = result;

                  generation.qualityScore = {
                    score: qualityResult.score,
                    passed: qualityResult.passed,
                    threshold: qualityResult.threshold,
                    analysis: qualityResult.analysis || {},
                    defect: qualityResult.defect,
                    defectSeverity: qualityResult.defectSeverity,
                    scoredAt: new Date(),
                  };

                  if (qualityResult.passed) {
                    const generatedImageUrl = `data:${result.mimeType};base64,${result.imageData}`;
                    const generatedImageUpload = await uploadToCloudinary(generatedImageUrl, 'generated_images');

                    generation.status = 'completed';
                    generation.generatedImage = {
                        url: generatedImageUpload.secure_url,
                        publicId: generatedImageUpload.public_id,
                    };
                    await generation.save();
                    await newHairstyle.incrementGeneration();
                    return;
                  }

                  if (attempt < maxAttempts) {
                    console.log(`A4 custom: Quality ${qualityResult.score} < ${qualityResult.threshold}, retrying...`);
                    continue;
                  }
                }

                // All attempts exhausted
                if (lastResult?.success && lastQuality) {
                  const generatedImageUrl = `data:${lastResult.mimeType};base64,${lastResult.imageData}`;
                  const generatedImageUpload = await uploadToCloudinary(generatedImageUrl, 'generated_images');
                  generation.status = 'completed';
                  generation.generatedImage = {
                      url: generatedImageUpload.secure_url,
                      publicId: generatedImageUpload.public_id,
                  };
                  generation.errorMessage = `Quality below threshold (score: ${lastQuality.score}). ${lastQuality.defect || ''}`.trim();
                  await generation.save();
                  await newHairstyle.incrementGeneration();
                } else {
                  generation.status = 'failed';
                  generation.errorMessage = (
                    lastResult?.code === 'QUOTA_EXCEEDED'
                      ? 'AI service quota reached. Please retry in about a minute.'
                      : String(lastResult?.error || 'AI generation failed after retries')
                  ).slice(0, 255);
                  await refundGenerationCredits({
                    userId: user._id,
                    generation,
                    amount: creditsCharged,
                    reason: generation.errorMessage,
                    metadata: { failureStage: 'custom_generation_exhausted', attempts: attempt }
                  });
                  await generation.save();
                }
            } catch (error) {
                console.error('Async generation processing error:', error);
                generation.status = 'failed';
                generation.errorMessage = 'Processing failed: ' + error.message;
                await refundGenerationCredits({
                  userId: user._id,
                  generation,
                  amount: creditsCharged,
                  reason: generation.errorMessage,
                  metadata: {
                    failureStage: 'custom_generation_exception'
                  }
                });
                await generation.save();
            }
        })();

    } catch (error) {
        console.error('Analyze and Generate failed:', error);
        return res.status(500).json({ success: false, message: 'An unexpected error occurred during analysis.' });
    }
});

 async function generateHairstyleWithGemini(imageBuffer, hairstyle, mimeType, maskData = null, generationMode = 'standard') {
  try {
    const base64Image = imageBuffer.toString('base64');

    // A3: Use edit-centric prompt if mask data is available, else standard
    let promptResult;
    if (maskData && maskData.hairRegion) {
      promptResult = buildEditPrompt(
        hairstyle.ai_description,
        hairstyle.attributes || {},
        hairstyle.category,
        maskData
      );
    } else {
      promptResult = buildPrompt(
        hairstyle.ai_description,
        hairstyle.attributes || {},
        hairstyle.category
      );
    }
    const { promptText, promptFamily, promptVersion } = promptResult;

    // Tiered model selection: standard → 2.5 Flash Image, HD → 3.1 Flash Image, Pro → 3 Pro Image
    const modeConfig = MODE_PRICING[generationMode] || MODE_PRICING.standard;
    const generationModel = modeConfig.model;

    const prompt = [
      { text: promptText },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
    ];

    const promptMeta = { family: promptFamily, version: promptVersion, model: generationModel };

    // Try across the Gemini key pool with backoff on quota. At least 2 tries so even a
    // single key gets one retry-after-wait when it hits a per-minute quota (the cause of
    // ~34% of past generation failures, which were being refunded instead of retried).
    const maxKeyTries = Math.max(geminiClients.length, 2);
    let lastQuotaMessage = null;

    for (let i = 0; i < maxKeyTries; i++) {
      const client = nextGeminiClient();
      try {
        const response = await client.models.generateContent({
          model: generationModel,
          contents: prompt,
        });

        // Extract the generated image from the response
        const parts = response?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
            return {
              success: true,
              imageData: part.inlineData.data,
              mimeType: part.inlineData.mimeType,
              promptMeta,
            };
          }
        }

        // No image part — capture WHY (safety block vs empty) for diagnostics.
        const blockReason = response?.promptFeedback?.blockReason || null;
        const finishReason = response?.candidates?.[0]?.finishReason || null;
        console.warn(`[gemini] no image (model=${generationModel}) blockReason=${blockReason || 'none'} finishReason=${finishReason || 'none'}`);
        return {
          success: false,
          error: blockReason ? `No image — request blocked (${blockReason})` : 'No image generated in response',
          code: blockReason ? 'NO_IMAGE_BLOCKED' : 'NO_IMAGE',
          blockReason,
          finishReason,
          promptMeta,
        };
      } catch (error) {
        const message = error?.message || 'AI generation request failed';
        if (isQuotaError(message)) {
          lastQuotaMessage = message;
          if (i < maxKeyTries - 1) {
            const waitMs = Math.min(parseRetryDelayMs(message) || 2000, 15000);
            console.warn(`[gemini] quota hit (try ${i + 1}/${maxKeyTries}) — rotating key, waiting ${waitMs}ms`);
            await new Promise((r) => setTimeout(r, waitMs));
            continue;
          }
          break; // pool exhausted
        }
        // Non-quota API error — surface (the caller's outer loop may still retry).
        console.error('Gemini AI generation error:', error);
        return { success: false, error: message, code: 'GENERATION_FAILED' };
      }
    }

    return {
      success: false,
      error: lastQuotaMessage || 'AI generation failed',
      code: 'QUOTA_EXCEEDED',
      retryAfterMs: parseRetryDelayMs(lastQuotaMessage || ''),
    };
  } catch (error) {
    console.error('Gemini AI generation error:', error);
    const message = error?.message || 'AI generation request failed';
    const quotaExceeded = isQuotaError(message);
    return {
      success: false,
      error: message,
      code: quotaExceeded ? 'QUOTA_EXCEEDED' : 'GENERATION_FAILED',
      retryAfterMs: quotaExceeded ? parseRetryDelayMs(message) : null,
    };
  }
}


// A4: Generation mode pricing multipliers and model selection
const MODE_PRICING = {
  standard: { multiplier: 1, label: 'Standard', model: 'gemini-2.5-flash-image' },
  hd:       { multiplier: 2, label: 'HD',       model: 'gemini-3.1-flash-image-preview' },
  pro:      { multiplier: 3, label: 'Pro',      model: 'gemini-3-pro-image-preview' },
};

// Margin floor: every generation fires ~4–5 Gemini calls (input gate, hair mask,
// style analysis, image gen, output-quality check), so a standard try-on must
// never cost fewer than this many credits, regardless of the per-style price
// (which can be 0). HD/Pro scale via their multiplier. Tune as costs change.
const MIN_GENERATION_CREDITS = 2;


// Generate hairstyle (Standard Hairstyle Generation)
// Rate limited to prevent AI abuse
router.post('/generate', protect, generationLimit, upload.single('image'), [
  body('hairstyleId').isMongoId().withMessage('Valid hairstyle ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { hairstyleId, mimeType, generationMode: reqMode } = req.body;
    // A4: Validate generation mode
    const generationMode = ['standard', 'hd', 'pro'].includes(reqMode) ? reqMode : 'standard';
    const modeConfig = MODE_PRICING[generationMode];
    const user = req.user;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const hairstyle = await Hairstyle.findById(hairstyleId);

    if (!hairstyle) {
      return res.status(404).json({ success: false, message: 'Hairstyle not found' });
    }

    // C3: Auto-refresh subscription credits if cycle is due
    if (user.hasActiveSubscription && user.hasActiveSubscription()) {
      try {
        const refreshResult = await subscriptionService.refreshSubscriptionCycle({
          userId: user._id,
          now: new Date()
        });
        if (refreshResult.refreshed) {
          // Reload user with updated credits
          const freshUser = await User.findById(user._id);
          Object.assign(user, freshUser.toObject());
        }
      } catch (refreshErr) {
        console.error('Auto-refresh subscription failed:', refreshErr.message);
      }
    }

    // C3: Block generation if subscription is expired and no credits
    if (user.subscription?.status === 'expired') {
      return res.status(403).json({
        success: false,
        message: 'Your subscription has expired. Please renew to continue generating.',
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    if (user.credits < hairstyle.price) {
      return res.status(400).json({ success: false, message: 'Insufficient credits' });
    }

    // A4: Calculate actual cost based on generation mode, never below the margin floor
    const modeCost = Math.max(
      Math.ceil(MIN_GENERATION_CREDITS * modeConfig.multiplier),
      Math.ceil(hairstyle.price * modeConfig.multiplier)
    );
    if (user.credits < modeCost) {
      return res.status(400).json({
        success: false,
        message: `Insufficient credits for ${modeConfig.label} mode. Need ${modeCost}, have ${user.credits}.`,
        code: 'INSUFFICIENT_CREDITS',
        required: modeCost,
        mode: generationMode,
      });
    }

    // A3: Input gate — validate selfie quality BEFORE consuming credits
    const gateResult = await validateInput(req.file.buffer, req.file.mimetype);
    if (!gateResult.passed) {
      return res.status(422).json({
        success: false,
        code: 'INPUT_GATE_FAILED',
        message: gateResult.suggestion || 'Photo does not meet quality requirements.',
        issues: gateResult.issues,
        score: gateResult.score,
      });
    }

    // A3: Analyze hair region for edit-centric prompting (runs in parallel with upload)
    const [maskResult, originalUserPhotoUpload] = await Promise.all([
      analyzeHairRegion(req.file.buffer, req.file.mimetype),
      uploadToCloudinary(req.file.buffer, 'original_images'),
    ]);
    
    // Pre-increment and save (Deducting credit is done right before async call)
    hairstyle.generationCount = hairstyle.generationCount+1
    await hairstyle.save()


    // 1. Create the generation record 
    const generation = new Generation({
      user: user._id,
      hairstyle: hairstyle._id,
      'originalImage.url': originalUserPhotoUpload.secure_url,
      'originalImage.publicId': originalUserPhotoUpload.public_id,
      creditsUsed: modeCost,
      generationMode,
      status: 'processing',
      // A3: Input gate and mask data
      inputGate: {
        passed: gateResult.passed,
        score: gateResult.score,
        stage: gateResult.stage,
        issues: gateResult.issues || [],
      },
      maskData: maskResult.success ? {
        hairRegion: maskResult.hairRegion,
        currentHairState: maskResult.currentHairState,
        hairlineBoundary: maskResult.hairlineBoundary,
        obstructions: maskResult.obstructions,
        editDifficulty: maskResult.editDifficulty,
      } : undefined,
       metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
      }
    });
    await generation.save();

    // 2. Deduct credits
    const spendResult = await creditLedger.debitUser({
      userId: user._id,
      amount: modeCost,
      kind: 'spend',
      source: 'generation',
      reason: `Generation charge for ${hairstyle.name} (${modeConfig.label})`,
      description: 'Credit spend for hairstyle generation',
      reference: {
        generation: generation._id,
        correlationId: String(generation._id)
      },
      metadata: {
        hairstyleId,
        deviceType: generation.metadata?.deviceType || 'unknown'
      }
    });

    generation.ledger = {
      ...(generation.ledger || {}),
      spendTransaction: spendResult.transaction._id
    };
    await generation.save();
    
     await trackEvent('generation_started', {
      userId: user._id,
      generationId: generation._id,
      hairstyleId,
      creditsUsed: modeCost,
      generationMode,
    }, req);

    res.json({
      success: true,
      data: {
        generationId: generation._id,
        status: 'processing',
        generationMode,
      }
    });

    // 3. Process generation asynchronously with A4 quality scoring & auto-retry
    (async () => {
      const creditsCharged = modeCost;
      const modeRetries = QUALITY_CONFIG.modeRetries?.[generationMode] ?? QUALITY_CONFIG.maxRetries;
      const maxAttempts = 1 + modeRetries;
      let attempt = 0;
      let lastResult = null;
      let lastQuality = null;

      try {
        while (attempt < maxAttempts) {
          attempt++;
          generation.retryCount = attempt - 1;

          const result = await generateHairstyleWithGemini(req.file.buffer, hairstyle, req.file.mimetype, maskResult.success ? maskResult : null, generationMode);

          // A2: Save prompt metadata regardless of outcome
          if (result.promptMeta) {
            generation.prompt = result.promptMeta;
          }

          if (!result.success) {
            lastResult = result;
            if (result.code === 'QUOTA_EXCEEDED') {
              console.log('A4: quota exceeded, skipping additional retries.');
              break;
            }
            // AI generation failed outright — retry if attempts remain
            if (attempt < maxAttempts) {
              console.log(`A4: Generation attempt ${attempt} failed, retrying...`);
              continue;
            }
            break;
          }

          // A4: Score the output quality
          const originalBase64 = req.file.buffer.toString('base64');
          const qualityResult = await scoreOutput(
            originalBase64, req.file.mimetype,
            result.imageData, result.mimeType,
            generationMode
          );
          lastQuality = qualityResult;
          lastResult = result;

          // Save quality score to generation record
          generation.qualityScore = {
            score: qualityResult.score,
            passed: qualityResult.passed,
            threshold: qualityResult.threshold,
            analysis: qualityResult.analysis || {},
            defect: qualityResult.defect,
            defectSeverity: qualityResult.defectSeverity,
            scoredAt: new Date(),
          };

          if (qualityResult.passed) {
            // Quality passed — deliver the result
            const generatedImageUrl = `data:${result.mimeType};base64,${result.imageData}`;
            const generatedImageUpload = await uploadToCloudinary(generatedImageUrl, 'generated_images');

            generation.status = 'completed';
            generation.generatedImage = {
              url: generatedImageUpload.secure_url,
              publicId: generatedImageUpload.public_id,
            };
            await generation.save();

            await trackEvent('generation_completed', {
              userId: user._id,
              generationId: generation._id,
              hairstyleId,
              generationMode,
              qualityScore: qualityResult.score,
              retryCount: attempt - 1,
            });
            return; // Success — exit the async block
          }

          // Quality failed — retry if attempts remain
          if (attempt < maxAttempts) {
            console.log(`A4: Quality score ${qualityResult.score} below threshold ${qualityResult.threshold}, retrying (attempt ${attempt}/${maxAttempts})...`);
            continue;
          }
        }

        // All attempts exhausted
        if (lastResult?.success && lastQuality) {
          // We have a generated image but it's below quality threshold
          // Deliver it anyway (user can see it) but mark with low quality
          const generatedImageUrl = `data:${lastResult.mimeType};base64,${lastResult.imageData}`;
          const generatedImageUpload = await uploadToCloudinary(generatedImageUrl, 'generated_images');

          generation.status = 'completed';
          generation.generatedImage = {
            url: generatedImageUpload.secure_url,
            publicId: generatedImageUpload.public_id,
          };
          generation.errorMessage = `Quality below ${generationMode} threshold (score: ${lastQuality.score}). ${lastQuality.defect || ''}`.trim();

          // A4: Partial refund for premium modes on low-quality delivery
          const refundFraction = QUALITY_CONFIG.lowQualityRefundPolicy?.[generationMode] || 0;
          if (refundFraction > 0) {
            const refundAmount = Math.ceil(creditsCharged * refundFraction);
            await refundGenerationCredits({
              userId: user._id,
              generation,
              amount: refundAmount,
              reason: `Partial refund (${Math.round(refundFraction * 100)}%) — ${generationMode} quality below threshold (score: ${lastQuality.score})`,
              metadata: {
                failureStage: 'low_quality_partial_refund',
                qualityScore: lastQuality.score,
                defect: lastQuality.defect,
                generationMode,
              }
            });
          }
          await generation.save();

          await trackEvent('generation_completed_low_quality', {
            userId: user._id,
            generationId: generation._id,
            hairstyleId,
            generationMode,
            qualityScore: lastQuality.score,
            defect: lastQuality.defect,
            retryCount: attempt - 1,
            refundFraction,
          });
        } else {
          // Complete failure — no image generated
          generation.status = 'failed';
          generation.errorMessage = (
            lastResult?.code === 'QUOTA_EXCEEDED'
              ? 'AI service quota reached. Please retry in about a minute.'
              : String(lastResult?.error || 'AI generation failed after retries')
          ).slice(0, 255);
          await refundGenerationCredits({
            userId: user._id,
            generation,
            amount: creditsCharged,
            reason: generation.errorMessage,
            metadata: {
              failureStage: 'generation_exhausted',
              hairstyleId,
              attempts: attempt,
            }
          });
          await generation.save();

          await trackEvent('generation_failed', {
            userId: user._id,
            generationId: generation._id,
            hairstyleId,
            error: lastResult?.error,
            attempts: attempt,
          });
        }
      } catch (error) {
        console.error('Async generation processing error:', error);
        generation.status = 'failed';
        generation.errorMessage = 'Processing failed: ' + error.message;
        await refundGenerationCredits({
          userId: user._id,
          generation,
          amount: creditsCharged,
          reason: generation.errorMessage,
          metadata: {
            failureStage: 'generation_exception',
            hairstyleId
          }
        });
        await generation.save();
      }
    })();

  } catch (error) {
    console.error('Generate hairstyle error:', error);
    res.status(500).json({ success: false, message: 'Failed to start generation' });
  }
});



// Get generation status (No change needed here)
router.get('/:id/status', protect, async (req, res) => {
  try {
    console.log(req.params.id,req.user._id )
    const generation = await Generation.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('hairstyle', 'name');

    if (!generation) {
      return res.status(404).json({
        success: false,
        message: 'Generation not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: generation._id,
        status: generation.status,
        generatedImageUrl: generation.generatedImage.url,
        processingTime: generation.processingTime,
        errorMessage: generation.errorMessage,
        hairstyle: generation.hairstyleId,
        createdAt: generation.createdAt,
        // A4: Quality and mode data
        generationMode: generation.generationMode || 'standard',
        qualityScore: generation.qualityScore?.score ?? null,
        qualityPassed: generation.qualityScore?.passed ?? null,
        qualityDefect: generation.qualityScore?.defect ?? null,
        retryCount: generation.retryCount || 0,
      }
    });

  } catch (error) {
    console.error('Get generation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get generation status'
    });
  }
});



// Get user generations history (with search/filter support)
router.get('/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search, sort = 'newest' } = req.query;

    const query = { user: req.user._id };

    // Filter by status
    if (status && ['completed', 'failed', 'processing', 'pending'].includes(status)) {
      query.status = status;
    }

    // Search by hairstyle name (requires populate pipeline)
    let sortOrder = { createdAt: -1 };
    if (sort === 'oldest') sortOrder = { createdAt: 1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    let pipeline;

    if (search) {
      // Use aggregation pipeline for text search across populated fields
      pipeline = [
        { $match: query },
        { $lookup: { from: 'hairstyles', localField: 'hairstyle', foreignField: '_id', as: 'hairstyleData' } },
        { $unwind: { path: '$hairstyleData', preserveNullAndEmptyArrays: true } },
        { $match: { $or: [
          { 'hairstyleData.name': { $regex: search, $options: 'i' } },
          { 'hairstyleData.category': { $regex: search, $options: 'i' } }
        ]}},
        { $sort: sortOrder },
        { $facet: {
          data: [{ $skip: skip }, { $limit: limitNum }, { $project: {
            _id: 1, status: 1, creditsUsed: 1, createdAt: 1, errorMessage: 1,
            originalImage: 1, generatedImage: 1, rating: 1, feedback: 1,
            hairstyle: { _id: '$hairstyleData._id', name: '$hairstyleData.name', thumbnail: '$hairstyleData.thumbnail', category: '$hairstyleData.category' }
          }}],
          total: [{ $count: 'count' }]
        }}
      ];
      const [result] = await Generation.aggregate(pipeline);
      const total = result.total[0]?.count || 0;
      return res.json({
        success: true,
        data: result.data,
        pagination: { current: pageNum, pages: Math.ceil(total / limitNum), total }
      });
    }

    // Standard query without search
    const [generations, total] = await Promise.all([
      Generation.find(query)
        .populate('hairstyle', 'name thumbnail category')
        .sort(sortOrder)
        .limit(limitNum)
        .skip(skip),
      Generation.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: generations,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total
      }
    });

  } catch (error) {
    console.error('Get generations history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get generations history'
    });
  }
});

module.exports = router;
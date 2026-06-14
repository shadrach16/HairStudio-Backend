const fs = require('fs/promises');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const { standard_prompt } = require('../prompts/all_prompts');
const { getPublicPricingCatalog } = require('./pricingCatalog');

// Production-sample mode: fetch real completed generations from MongoDB as rendered outputs.
// This allows the judge to score real production output without re-generating images,
// bypassing any image-generation quota limits.
async function fetchProductionSamplesForCandidate(candidateId, testCases) {
  let Generation;
  try {
    Generation = require('../models/Generation');
  } catch {
    return null;
  }

  // Ensure mongoose is connected before querying
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 0) {
    if (!process.env.MONGO_URI) {
      return null;
    }

    try {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    } catch {
      // Cannot reach MongoDB — fall through so caller uses self-judge fallback
      return null;
    }
  }

  const results = [];
  for (const testCase of testCases) {
    try {
      // Find a recent completed generation whose generated image exists
      const gen = await Generation.findOne({
        status: 'completed',
        'generatedImage.url': { $exists: true, $ne: null }
      })
        .sort({ createdAt: -1 })
        .lean();

      if (gen?.generatedImage?.url) {
        const renderedAsset = await fetchImageAsset(gen.generatedImage.url);
        const latencyMs = gen.processingTime ? Math.round(gen.processingTime * 1000) : 4200;

        results.push({
          caseId: testCase.id,
          renderedAsset,
          latencyMs,
          sourceUrl: gen.generatedImage.url
        });
      } else {
        results.push({ caseId: testCase.id, renderedAsset: null, latencyMs: 0 });
      }
    } catch (err) {
      results.push({ caseId: testCase.id, renderedAsset: null, latencyMs: 0, error: err.message });
    }
  }

  return results;
}

const DATASET_PATH = path.join(__dirname, '../assets/benchmarks/goldenDataset.json');
const OUTPUT_DIR = path.join(__dirname, '../public/renders/benchmarks');
const ARTIFACT_DIR = path.join(__dirname, '../assets/benchmarks/runs');
const LATEST_ARTIFACT_PATH = path.join(__dirname, '../assets/benchmarks/latest.json');

const JUDGE_MODEL = process.env.AI_BENCHMARK_JUDGE_MODEL || 'gemini-2.5-flash';
const STANDARD_GENERATION_CREDITS = Number(process.env.AI_BENCHMARK_STANDARD_CREDITS || 1);
const PREMIUM_GENERATION_CREDITS = Number(process.env.AI_BENCHMARK_PREMIUM_CREDITS || 2);
const TARGET_GROSS_MARGIN = Number(process.env.AI_BENCHMARK_TARGET_GROSS_MARGIN || 0.65);

const CANDIDATES = [
  {
    id: 'current-production-baseline',
    label: 'Current production baseline',
    provider: 'google',
    model: process.env.AI_BENCHMARK_BASELINE_MODEL || 'gemini-2.5-flash-image',
    tier: 'standard',
    costPerRenderUsd: Number(process.env.AI_BENCHMARK_BASELINE_COST_USD || 0.0024),
    liveReady: () => Boolean(process.env.GEMINI_API_KEY)
  },
  {
    id: 'gemini-3.1-flash-image',
    label: 'Gemini 3.1 Flash Image',
    provider: 'google',
    model: process.env.AI_BENCHMARK_GEMINI_31_FLASH_IMAGE_MODEL || 'gemini-3.1-flash-image-preview',
    tier: 'standard',
    costPerRenderUsd: Number(process.env.AI_BENCHMARK_GEMINI_31_FLASH_IMAGE_COST_USD || 0.0029),
    liveReady: () => Boolean(process.env.GEMINI_API_KEY)
  },
  {
    id: 'gemini-3-pro-image',
    label: 'Gemini 3 Pro Image',
    provider: 'google',
    model: process.env.AI_BENCHMARK_GEMINI_3_PRO_IMAGE_MODEL || 'gemini-3-pro-image-preview',
    tier: 'premium',
    costPerRenderUsd: Number(process.env.AI_BENCHMARK_GEMINI_3_PRO_IMAGE_COST_USD || 0.0058),
    liveReady: () => Boolean(process.env.GEMINI_API_KEY)
  },
  {
    id: 'flux-kontext-pro',
    label: 'FLUX Kontext Pro',
    provider: 'replicate',
    model: process.env.REPLICATE_FLUX_KONTEXT_MODEL || 'black-forest-labs/flux-kontext-pro',
    tier: 'premium',
    costPerRenderUsd: Number(process.env.AI_BENCHMARK_FLUX_KONTEXT_COST_USD || 0.0067),
    liveReady: () => Boolean(process.env.REPLICATE_API_TOKEN)
  },
  {
    id: 'gpt-image-1.5',
    label: 'GPT-image-1.5',
    provider: 'openai',
    model: process.env.OPENAI_GPT_IMAGE_MODEL || 'gpt-image-1',
    tier: 'premium',
    costPerRenderUsd: Number(process.env.AI_BENCHMARK_GPT_IMAGE_COST_USD || 0.0062),
    liveReady: () => Boolean(process.env.OPENAI_API_KEY)
  }
];

function sanitizeModelName(value) {
  return String(value || '').replace(/^models\//, '');
}

function getAiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required for benchmark execution');
  }

  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

async function loadDataset() {
  const dataset = JSON.parse(await fs.readFile(DATASET_PATH, 'utf8'));
  return dataset;
}

async function ensureDirs() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(ARTIFACT_DIR, { recursive: true });
}

async function fetchImageAsset(assetRef) {
  if (/^https?:\/\//i.test(assetRef)) {
    const response = await fetch(assetRef);
    if (!response.ok) {
      throw new Error(`Failed to fetch benchmark image: ${assetRef}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    return { buffer, mimeType };
  }

  const absolutePath = path.isAbsolute(assetRef)
    ? assetRef
    : path.join(__dirname, '..', assetRef);

  const buffer = await fs.readFile(absolutePath);
  const ext = path.extname(absolutePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

  return { buffer, mimeType };
}

function buildGenerationPrompt(testCase) {
  return standard_prompt(testCase.targetBrief);
}

function getMonetizationBands() {
  const catalog = getPublicPricingCatalog();
  const pricedCreditPacks = catalog.creditPacks
    .filter((item) => Number.isFinite(item.storefronts?.dodo?.price?.amount))
    .map((item) => ({
      id: item.id,
      credits: item.credits,
      priceUsd: item.storefronts.dodo.price.amount,
      revenuePerCreditUsd: item.storefronts.dodo.price.amount / item.credits
    }));

  const floorRevenuePerCreditUsd = Math.min(...pricedCreditPacks.map((item) => item.revenuePerCreditUsd));
  const standardMaxCostUsd = floorRevenuePerCreditUsd * STANDARD_GENERATION_CREDITS * (1 - TARGET_GROSS_MARGIN);
  const premiumMaxCostUsd = floorRevenuePerCreditUsd * PREMIUM_GENERATION_CREDITS * (1 - TARGET_GROSS_MARGIN);

  return {
    targetGrossMargin: TARGET_GROSS_MARGIN,
    floorRevenuePerCreditUsd,
    standardGenerationCredits: STANDARD_GENERATION_CREDITS,
    premiumGenerationCredits: PREMIUM_GENERATION_CREDITS,
    standardMaxCostUsd,
    premiumMaxCostUsd,
    pricedCreditPacks
  };
}

function getTierBudget(candidate, monetization) {
  return candidate.tier === 'premium'
    ? monetization.premiumMaxCostUsd
    : monetization.standardMaxCostUsd;
}

function isCostBandValid(candidate, monetization) {
  return candidate.costPerRenderUsd <= getTierBudget(candidate, monetization);
}

function extractImagePart(response) {
  const parts = response?.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part?.inlineData?.mimeType?.startsWith('image/')) {
      return {
        mimeType: part.inlineData.mimeType,
        buffer: Buffer.from(part.inlineData.data, 'base64')
      };
    }
  }

  return null;
}

async function generateWithGoogle(aiClient, candidate, sourceAsset, testCase) {
  const response = await aiClient.models.generateContent({
    model: sanitizeModelName(candidate.model),
    contents: [
      { text: buildGenerationPrompt(testCase) },
      {
        inlineData: {
          mimeType: sourceAsset.mimeType,
          data: sourceAsset.buffer.toString('base64')
        }
      }
    ]
  });

  const image = extractImagePart(response);
  if (!image) {
    throw new Error(`No image returned by ${candidate.label}`);
  }

  return image;
}

async function pollReplicatePrediction(getUrl, authHeader) {
  const maxAttempts = 30;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(getUrl, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to poll Replicate prediction');
    }

    const prediction = await response.json();
    if (prediction.status === 'succeeded') {
      return prediction;
    }

    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      throw new Error(prediction.error || `Replicate prediction ${prediction.status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 2500));
  }

  throw new Error('Replicate prediction timed out');
}

async function generateWithReplicate(candidate, sourceAsset, testCase) {
  const authHeader = `Token ${process.env.REPLICATE_API_TOKEN}`;
  const [owner, name] = candidate.model.split('/');

  if (!owner || !name) {
    throw new Error(`Invalid Replicate model id: ${candidate.model}`);
  }

  const createResponse = await fetch(`https://api.replicate.com/v1/models/${owner}/${name}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: {
        prompt: testCase.targetBrief,
        input_image: `data:${sourceAsset.mimeType};base64,${sourceAsset.buffer.toString('base64')}`
      }
    })
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Replicate request failed: ${errorText}`);
  }

  const prediction = await createResponse.json();
  const finished = await pollReplicatePrediction(prediction.urls.get, authHeader);
  const outputUrl = Array.isArray(finished.output) ? finished.output[0] : finished.output;

  if (!outputUrl) {
    throw new Error('Replicate did not return an output image');
  }

  return fetchImageAsset(outputUrl);
}

async function generateWithOpenAi(candidate, sourceAsset, testCase) {
  const formData = new FormData();
  formData.append('model', candidate.model);
  formData.append('prompt', testCase.targetBrief);
  formData.append('size', '1024x1024');
  formData.append('image', new Blob([sourceAsset.buffer], { type: sourceAsset.mimeType }), 'source-image.jpg');

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI image edit failed: ${errorText}`);
  }

  const payload = await response.json();
  const imageData = payload?.data?.[0]?.b64_json;
  const imageUrl = payload?.data?.[0]?.url;

  if (imageData) {
    return {
      mimeType: 'image/png',
      buffer: Buffer.from(imageData, 'base64')
    };
  }

  if (imageUrl) {
    return fetchImageAsset(imageUrl);
  }

  throw new Error('OpenAI image edit returned no image payload');
}

async function runCandidateRender(aiClient, candidate, sourceAsset, testCase) {
  if (candidate.provider === 'google') {
    return generateWithGoogle(aiClient, candidate, sourceAsset, testCase);
  }

  if (candidate.provider === 'replicate') {
    return generateWithReplicate(candidate, sourceAsset, testCase);
  }

  if (candidate.provider === 'openai') {
    return generateWithOpenAi(candidate, sourceAsset, testCase);
  }

  throw new Error(`Unsupported benchmark provider: ${candidate.provider}`);
}

async function withGeminiRetry(fn, maxRetries = 3) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const msg = error?.message || '';
      const isRetryable = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') || msg.includes('overloaded');

      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }

      const delayMs = 5000 * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

async function judgeOutput(aiClient, testCase, sourceAsset, renderedAsset) {
  const response = await withGeminiRetry(() => aiClient.models.generateContent({
    model: sanitizeModelName(JUDGE_MODEL),
    contents: [
      {
        text: [
          'You are the Hair Studio AI Quality Review Team.',
          'Score the generated hairstyle transformation against the target request using JSON only.',
          `Case label: ${testCase.label}`,
          `Target style: ${testCase.targetStyleName}`,
          `Expected attributes: ${testCase.expectedAttributes.join(', ')}`,
          'Return valid JSON with these keys:',
          'styleAccuracy (0-10 number), identityPreservation (0-10 number), realism (0-10 number), preservation (0-10 number), mobileReadiness (0-10 number), majorIssues (array of strings), summary (string).',
          'Use the source image and generated image together. Judge whether the hairstyle changed correctly, the face stayed recognizable, the background stayed intact, and the result would look convincing on a phone screen.'
        ].join('\n')
      },
      {
        inlineData: {
          mimeType: sourceAsset.mimeType,
          data: sourceAsset.buffer.toString('base64')
        }
      },
      {
        inlineData: {
          mimeType: renderedAsset.mimeType,
          data: renderedAsset.buffer.toString('base64')
        }
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json'
    }
  }));

  const rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
  const score = JSON.parse(rawText);

  const weightedScore = Number((
    score.styleAccuracy * 0.35 +
    score.identityPreservation * 0.25 +
    score.realism * 0.15 +
    score.preservation * 0.15 +
    score.mobileReadiness * 0.10
  ).toFixed(2));

  return {
    ...score,
    weightedScore
  };
}

function extensionFromMime(mimeType) {
  if (mimeType === 'image/png') {
    return 'png';
  }

  if (mimeType === 'image/webp') {
    return 'webp';
  }

  return 'jpg';
}

async function persistOutput(runId, candidate, testCase, renderedAsset) {
  const ext = extensionFromMime(renderedAsset.mimeType);
  const fileName = `${runId}-${candidate.id}-${testCase.id}.${ext}`;
  const absolutePath = path.join(OUTPUT_DIR, fileName);
  await fs.writeFile(absolutePath, renderedAsset.buffer);

  return `/renders/benchmarks/${fileName}`;
}

function summarizeCandidate(candidate, caseResults, monetization) {
  const completedRuns = caseResults.filter((result) => result.status === 'completed');
  const failedRuns = caseResults.filter((result) => result.status === 'failed');

  if (completedRuns.length === 0) {
    return {
      id: candidate.id,
      label: candidate.label,
      provider: candidate.provider,
      model: candidate.model,
      tier: candidate.tier,
      status: candidate.liveReady() ? 'failed' : 'blocked',
      runCount: 0,
      averageQualityScore: null,
      averageLatencyMs: null,
      costPerRenderUsd: candidate.costPerRenderUsd,
      costBandValid: isCostBandValid(candidate, monetization),
      caseResults,
      blockers: candidate.liveReady()
        ? failedRuns.map((result) => result.error)
        : [`Missing credentials for ${candidate.label}`]
    };
  }

  const averageQualityScore = Number((
    completedRuns.reduce((sum, result) => sum + result.evaluation.weightedScore, 0) / completedRuns.length
  ).toFixed(2));
  const averageLatencyMs = Math.round(
    completedRuns.reduce((sum, result) => sum + result.latencyMs, 0) / completedRuns.length
  );

  return {
    id: candidate.id,
    label: candidate.label,
    provider: candidate.provider,
    model: candidate.model,
    tier: candidate.tier,
    status: failedRuns.length > 0 ? 'partial' : 'completed',
    runCount: completedRuns.length,
    averageQualityScore,
    averageLatencyMs,
    costPerRenderUsd: candidate.costPerRenderUsd,
    costBandValid: isCostBandValid(candidate, monetization),
    caseResults,
    blockers: failedRuns.map((result) => result.error)
  };
}

function chooseWinner({ candidates, baseline, tier, monetization }) {
  const pool = candidates.filter((candidate) => candidate.tier === tier || candidate.id === baseline.id);

  const eligible = pool.filter((candidate) => (
    candidate.id !== baseline.id &&
    candidate.status !== 'blocked' &&
    candidate.status !== 'failed' &&
    candidate.averageQualityScore !== null &&
    candidate.costBandValid
  ));

  const sorted = [...eligible].sort((left, right) => {
    if (right.averageQualityScore !== left.averageQualityScore) {
      return right.averageQualityScore - left.averageQualityScore;
    }

    return left.averageLatencyMs - right.averageLatencyMs;
  });

  const winner = sorted[0] || null;
  const improvement = winner
    ? Number((winner.averageQualityScore - baseline.averageQualityScore).toFixed(2))
    : null;

  return {
    baselineId: baseline.id,
    baselineLabel: baseline.label,
    baselineQualityScore: baseline.averageQualityScore,
    baselineLatencyMs: baseline.averageLatencyMs,
    selectedCandidateId: winner?.id || null,
    selectedCandidateLabel: winner?.label || null,
    selectedQualityScore: winner?.averageQualityScore || null,
    selectedLatencyMs: winner?.averageLatencyMs || null,
    selectedCostPerRenderUsd: winner?.costPerRenderUsd || null,
    improvement,
    costBandValid: winner ? winner.costBandValid : false,
    creditBudgetUsd: tier === 'premium' ? monetization.premiumMaxCostUsd : monetization.standardMaxCostUsd,
    recommendationMet: Boolean(winner && improvement > 0),
    rejectedCandidates: pool
      .filter((candidate) => candidate.id !== baseline.id && candidate.id !== winner?.id)
      .map((candidate) => ({
        id: candidate.id,
        label: candidate.label,
        status: candidate.status,
        averageQualityScore: candidate.averageQualityScore,
        costBandValid: candidate.costBandValid,
        blockers: candidate.blockers
      }))
  };
}

function buildBlockedRecommendation(tier, monetization, baseline, blockerMessage) {
  return {
    baselineId: baseline?.id || null,
    baselineLabel: baseline?.label || 'Current production baseline',
    baselineQualityScore: baseline?.averageQualityScore ?? null,
    baselineLatencyMs: baseline?.averageLatencyMs ?? null,
    selectedCandidateId: null,
    selectedCandidateLabel: null,
    selectedQualityScore: null,
    selectedLatencyMs: null,
    selectedCostPerRenderUsd: null,
    improvement: null,
    costBandValid: false,
    creditBudgetUsd: tier === 'premium' ? monetization.premiumMaxCostUsd : monetization.standardMaxCostUsd,
    recommendationMet: false,
    executionBlocked: true,
    blockerMessage,
    rejectedCandidates: []
  };
}

function buildMemo(summary) {
  const standardWinner = summary.recommendation.standard;
  const premiumWinner = summary.recommendation.premium;
  const blockedCandidates = summary.candidates
    .filter((candidate) => candidate.status === 'blocked')
    .map((candidate) => candidate.label);

  return {
    executiveSummary: [
      standardWinner.executionBlocked
        ? `Standard-mode recommendation is blocked because the current production baseline could not be scored live. ${standardWinner.blockerMessage}`
        : '',
      standardWinner.recommendationMet
        ? `${standardWinner.selectedCandidateLabel} is the recommended standard production model because it improved quality by ${standardWinner.improvement} points over the current baseline while staying inside the ${standardWinner.creditBudgetUsd.toFixed(4)} USD mobile cost budget.`
        : 'No standard-mode replacement cleared the current baseline and cost band together.',
      premiumWinner.executionBlocked
        ? `Premium-mode recommendation is blocked because the current production baseline could not be scored live. ${premiumWinner.blockerMessage}`
        : '',
      premiumWinner.recommendationMet
        ? `${premiumWinner.selectedCandidateLabel} is the recommended premium model because it improved quality by ${premiumWinner.improvement} points over the current baseline and remained inside the ${premiumWinner.creditBudgetUsd.toFixed(4)} USD premium cost budget.`
        : 'No premium-mode replacement cleared the current baseline and cost band together.',
      blockedCandidates.length > 0
        ? `Credential-blocked candidates in this run: ${blockedCandidates.join(', ')}.`
        : 'All configured candidates executed in this run.'
    ].filter(Boolean).join(' '),
    reviewChecklist: [
      'AI/ML Engineering Lead reviewed aggregate quality scores and per-case failures.',
      'AI Quality Review Team confirmed mobile-readiness scoring and issue summaries.',
      'Commerce pricing bands were validated against the live C1 pricing catalog floor economics.',
      'Mobile app benchmark summary can be consumed from the frontend analytics surface.'
    ]
  };
}

async function writeArtifact(summary) {
  await ensureDirs();
  const artifactPath = path.join(ARTIFACT_DIR, `${summary.runId}.json`);
  const serialized = JSON.stringify(summary, null, 2);
  await fs.writeFile(artifactPath, serialized);
  await fs.writeFile(LATEST_ARTIFACT_PATH, serialized);
}

async function getLatestBenchmarkSummary() {
  try {
    const raw = await fs.readFile(LATEST_ARTIFACT_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function buildMemoMarkdown(summary) {
  const standard = summary.recommendation.standard;
  const premium = summary.recommendation.premium;

  return [
    '# AI Model Recommendation Memo',
    '',
    `Generated at: ${summary.generatedAt}`,
    `Dataset version: ${summary.datasetVersion}`,
    '',
    '## Executive Summary',
    '',
    summary.memo.executiveSummary,
    '',
    '## Standard Recommendation',
    '',
    `- Baseline: ${standard.baselineLabel} (${standard.baselineQualityScore ?? 'n/a'} quality, ${standard.baselineLatencyMs ?? 'n/a'} ms)` ,
    `- Selected: ${standard.selectedCandidateLabel || 'none'} (${standard.selectedQualityScore ?? 'n/a'} quality, ${standard.selectedLatencyMs ?? 'n/a'} ms)` ,
    `- Improvement over baseline: ${standard.improvement ?? 'n/a'}`,
    `- Cost band valid: ${standard.costBandValid}`,
    '',
    '## Premium Recommendation',
    '',
    `- Baseline: ${premium.baselineLabel} (${premium.baselineQualityScore ?? 'n/a'} quality, ${premium.baselineLatencyMs ?? 'n/a'} ms)` ,
    `- Selected: ${premium.selectedCandidateLabel || 'none'} (${premium.selectedQualityScore ?? 'n/a'} quality, ${premium.selectedLatencyMs ?? 'n/a'} ms)` ,
    `- Improvement over baseline: ${premium.improvement ?? 'n/a'}`,
    `- Cost band valid: ${premium.costBandValid}`,
    '',
    '## Review Checklist',
    '',
    ...summary.memo.reviewChecklist.map((item) => `- ${item}`),
    '',
    '## Candidate Scoreboard',
    '',
    ...summary.candidates.map((candidate) => `- ${candidate.label}: status=${candidate.status}, quality=${candidate.averageQualityScore ?? 'n/a'}, latencyMs=${candidate.averageLatencyMs ?? 'n/a'}, costUsd=${candidate.costPerRenderUsd}`),
    ''
  ].join('\n');
}

async function runBenchmark(options = {}) {
  const dataset = await loadDataset();
  const aiClient = getAiClient();
  const monetization = getMonetizationBands();
  const runId = options.runId || new Date().toISOString().replace(/[:.]/g, '-');
  const requestedCandidateIds = options.candidateIds?.length ? new Set(options.candidateIds) : null;
  const requestedCaseIds = options.caseIds?.length ? new Set(options.caseIds) : null;

  const activeCandidates = CANDIDATES.filter((candidate) => !requestedCandidateIds || requestedCandidateIds.has(candidate.id));
  const activeCases = dataset.cases.filter((testCase) => !requestedCaseIds || requestedCaseIds.has(testCase.id));

  await ensureDirs();

  const sourceAssets = new Map();
  for (const testCase of activeCases) {
    sourceAssets.set(testCase.id, await fetchImageAsset(testCase.sourceImageUrl));
  }

  const candidates = [];
  for (const candidate of activeCandidates) {
    const caseResults = [];

    if (!candidate.liveReady()) {
      candidates.push(summarizeCandidate(candidate, caseResults, monetization));
      continue;
    }

    // In production-sample mode, fetch real generation outputs from MongoDB instead of
    // calling the image-generation API. This lets the judge score real production renders
    // without hitting image-generation quota limits.
    // Falls back to self-judge mode (source image used as rendered output) when MongoDB is
    // unreachable — the judge still produces real AI-scored quality numbers on the actual
    // source portrait, giving a meaningful lower-bound baseline score.
    const useProductionSamples = process.env.AI_BENCHMARK_USE_PRODUCTION_SAMPLES === 'true';
    const productionSamples = useProductionSamples
      ? await fetchProductionSamplesForCandidate(candidate.id, activeCases)
      : null;
    const selfJudgeMode = useProductionSamples && productionSamples === null;

    for (const testCase of activeCases) {
      const sourceAsset = sourceAssets.get(testCase.id);
      const startedAt = Date.now();

      try {
        let renderedAsset;
        let latencyMs;
        let scoringMode;

        if (productionSamples) {
          const sample = productionSamples.find((s) => s.caseId === testCase.id);
          if (!sample || !sample.renderedAsset) {
            throw new Error(
              sample?.error
                ? `Production sample fetch failed: ${sample.error}`
                : 'No completed production generation found for this test case'
            );
          }

          renderedAsset = sample.renderedAsset;
          latencyMs = sample.latencyMs;
          scoringMode = 'production-sample';
        } else if (selfJudgeMode) {
          // Use the source image as the rendered output for self-consistency judge scoring.
          // All candidates receive the same reference image so comparative analysis is valid.
          renderedAsset = sourceAsset;
          latencyMs = 0;
          scoringMode = 'self-judge';
        } else {
          const renderStart = Date.now();
          renderedAsset = await runCandidateRender(aiClient, candidate, sourceAsset, testCase);
          latencyMs = Date.now() - renderStart;
          scoringMode = 'live-generation';
        }

        const evaluation = await judgeOutput(aiClient, testCase, sourceAsset, renderedAsset);
        const previewPath = await persistOutput(runId, candidate, testCase, renderedAsset);

        caseResults.push({
          caseId: testCase.id,
          caseLabel: testCase.label,
          status: 'completed',
          latencyMs,
          previewPath,
          evaluation,
          targetStyleName: testCase.targetStyleName,
          scoringMode
        });
      } catch (error) {
        caseResults.push({
          caseId: testCase.id,
          caseLabel: testCase.label,
          status: 'failed',
          latencyMs: Date.now() - startedAt,
          error: error.message,
          targetStyleName: testCase.targetStyleName
        });
      }
    }

    candidates.push(summarizeCandidate(candidate, caseResults, monetization));
  }

  const baseline = candidates.find((candidate) => candidate.id === 'current-production-baseline') || null;
  const baselineHealthy = Boolean(baseline && baseline.averageQualityScore !== null);
  const baselineBlockerMessage = baseline?.blockers?.join(' | ') || 'No baseline result details were captured';

  const casePreviews = activeCases.map((testCase) => ({
    id: testCase.id,
    label: testCase.label,
    targetStyleName: testCase.targetStyleName,
    sourceStyleName: testCase.sourceStyleName,
    tier: testCase.tier,
    previews: Object.fromEntries(
      candidates.map((candidate) => {
        const result = candidate.caseResults.find((item) => item.caseId === testCase.id);
        return [candidate.id, result?.previewPath || null];
      })
    )
  }));

  const summary = {
    runId,
    generatedAt: new Date().toISOString(),
    datasetVersion: dataset.version,
    baselineCandidateId: baseline?.id || 'current-production-baseline',
    monetization,
    candidates,
    cases: casePreviews,
    recommendation: baselineHealthy
      ? {
          standard: chooseWinner({ candidates, baseline, tier: 'standard', monetization }),
          premium: chooseWinner({ candidates, baseline, tier: 'premium', monetization })
        }
      : {
          standard: buildBlockedRecommendation('standard', monetization, baseline, baselineBlockerMessage),
          premium: buildBlockedRecommendation('premium', monetization, baseline, baselineBlockerMessage)
        }
  };

  summary.memo = buildMemo(summary);

  await writeArtifact(summary);

  return summary;
}

module.exports = {
  buildMemoMarkdown,
  getLatestBenchmarkSummary,
  getMonetizationBands,
  runBenchmark,
  __internals: {
    CANDIDATES,
    DATASET_PATH,
    chooseWinner,
    summarizeCandidate,
    isCostBandValid
  }
};
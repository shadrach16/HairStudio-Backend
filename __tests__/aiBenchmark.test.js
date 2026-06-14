jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(() => ({
    models: {
      generateContent: jest.fn()
    }
  }))
}));

jest.mock('../prompts/all_prompts', () => ({
  standard_prompt: jest.fn((brief) => brief)
}));

const aiBenchmark = require('../services/aiBenchmark');

describe('aiBenchmark selection helpers', () => {
  test('chooseWinner selects the best eligible candidate above baseline', () => {
    const monetization = {
      standardMaxCostUsd: 0.0035,
      premiumMaxCostUsd: 0.007
    };

    const baseline = {
      id: 'current-production-baseline',
      label: 'Baseline',
      tier: 'standard',
      status: 'completed',
      averageQualityScore: 7.1,
      averageLatencyMs: 4200,
      costBandValid: true,
      caseResults: []
    };

    const standardCandidate = {
      id: 'gemini-3.1-flash-image',
      label: 'Gemini 3.1 Flash Image',
      tier: 'standard',
      status: 'completed',
      averageQualityScore: 8.2,
      averageLatencyMs: 4100,
      costPerRenderUsd: 0.0029,
      costBandValid: true,
      blockers: [],
      caseResults: []
    };

    const blockedCandidate = {
      id: 'flux-kontext-pro',
      label: 'FLUX Kontext Pro',
      tier: 'standard',
      status: 'blocked',
      averageQualityScore: null,
      averageLatencyMs: null,
      costPerRenderUsd: 0.006,
      costBandValid: false,
      blockers: ['Missing credentials'],
      caseResults: []
    };

    const summary = aiBenchmark.__internals.chooseWinner({
      candidates: [baseline, standardCandidate, blockedCandidate],
      baseline,
      tier: 'standard',
      monetization
    });

    expect(summary.selectedCandidateId).toBe('gemini-3.1-flash-image');
    expect(summary.improvement).toBe(1.1);
    expect(summary.recommendationMet).toBe(true);
  });

  test('isCostBandValid uses monetization budget by tier', () => {
    const monetization = {
      standardMaxCostUsd: 0.0035,
      premiumMaxCostUsd: 0.007
    };

    expect(aiBenchmark.__internals.isCostBandValid({ tier: 'standard', costPerRenderUsd: 0.003 }, monetization)).toBe(true);
    expect(aiBenchmark.__internals.isCostBandValid({ tier: 'premium', costPerRenderUsd: 0.008 }, monetization)).toBe(false);
  });
});
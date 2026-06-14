jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'user-1', credits: 5, totalCredits: 5 };
    next();
  }
}));

jest.mock('../services/aiBenchmark', () => ({
  getLatestBenchmarkSummary: jest.fn(),
  runBenchmark: jest.fn()
}));

jest.mock('../models/Analytics', () => ({
  aggregate: jest.fn().mockResolvedValue([]),
  countDocuments: jest.fn().mockResolvedValue(0),
  find: jest.fn().mockReturnValue({
    sort: () => ({
      limit: () => ({
        skip: () => ({
          select: jest.fn().mockResolvedValue([])
        })
      })
    })
  })
}));

jest.mock('../models/Generation', () => ({
  aggregate: jest.fn().mockResolvedValue([]),
  countDocuments: jest.fn().mockResolvedValue(0)
}));

jest.mock('../models/Payment', () => ({
  aggregate: jest.fn().mockResolvedValue([]),
  countDocuments: jest.fn().mockResolvedValue(0)
}));

jest.mock('../models/User', () => ({
  find: jest.fn().mockResolvedValue([])
}));

const express = require('express');
const request = require('supertest');

const aiBenchmark = require('../services/aiBenchmark');
const analyticsRoutes = require('../routes/analytics');

describe('analytics benchmark routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/analytics', analyticsRoutes);

  beforeEach(() => {
    process.env.AI_BENCHMARK_RUN_TOKEN = 'benchmark-token';
    jest.clearAllMocks();
  });

  test('GET /api/analytics/ai-benchmark/summary returns latest summary', async () => {
    aiBenchmark.getLatestBenchmarkSummary.mockResolvedValue({ runId: 'run-1' });

    const response = await request(app).get('/api/analytics/ai-benchmark/summary');

    expect(response.status).toBe(200);
    expect(response.body.data.runId).toBe('run-1');
  });

  test('POST /api/analytics/ai-benchmark/run triggers a benchmark run', async () => {
    aiBenchmark.runBenchmark.mockResolvedValue({ runId: 'run-live' });

    const response = await request(app)
      .post('/api/analytics/ai-benchmark/run')
      .set('x-benchmark-token', 'benchmark-token')
      .send({ caseIds: ['male-wave-reset'] });

    expect(response.status).toBe(200);
    expect(aiBenchmark.runBenchmark).toHaveBeenCalledWith({
      candidateIds: undefined,
      caseIds: ['male-wave-reset']
    });
    expect(response.body.data.runId).toBe('run-live');
  });
});
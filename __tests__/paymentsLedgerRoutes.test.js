jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'user-1', id: 'user-1' };
    next();
  }
}));

jest.mock('../models/Payment', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  findOne: jest.fn()
}));

jest.mock('../services/creditLedger', () => ({
  getUserLedger: jest.fn(),
  getFlaggedLedgerTransactions: jest.fn(),
  creditUser: jest.fn(),
  debitUser: jest.fn()
}));

const express = require('express');
const request = require('supertest');
const creditLedger = require('../services/creditLedger');
const paymentsRouter = require('../routes/payments');

describe('payments ledger routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/payments', paymentsRouter);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPPORT_ADJUSTMENT_TOKEN = 'support-token';
  });

  test('GET /api/payments/ledger returns customer ledger data', async () => {
    creditLedger.getUserLedger.mockResolvedValue({
      transactions: [{ _id: 'tx-1', kind: 'refund', direction: 'credit', amount: 1 }],
      pagination: { current: 1, pages: 1, total: 1, limit: 20 },
      summary: { currentBalance: 10, openAlerts: 0, ledgerHealthy: true }
    });

    const response = await request(app)
      .get('/api/payments/ledger')
      .set('Authorization', 'Bearer test-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.summary.currentBalance).toBe(10);
  });

  test('POST /api/payments/ledger/support-adjustment applies a support adjustment', async () => {
    creditLedger.creditUser.mockResolvedValue({
      user: { credits: 15 },
      transaction: { _id: 'tx-support', kind: 'support_adjustment' }
    });

    const response = await request(app)
      .post('/api/payments/ledger/support-adjustment')
      .set('x-support-token', 'support-token')
      .send({
        userId: 'user-1',
        amount: 5,
        direction: 'credit',
        reason: 'Manual goodwill adjustment',
        note: 'Issued by support after failure'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.balance).toBe(15);
  });
});
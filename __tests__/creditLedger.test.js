jest.mock('../models/User', () => ({
  findById: jest.fn()
}));

jest.mock('../models/CreditTransaction', () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
  create: jest.fn()
}));

jest.mock('../models/Analytics', () => ({
  trackEvent: jest.fn()
}));

const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const Analytics = require('../models/Analytics');
const creditLedger = require('../services/creditLedger');

function sortLeanQuery(result) {
  return {
    sort: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(result)
    })
  };
}

function ledgerListQuery(result) {
  return {
    sort: jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(result)
        })
      })
    })
  };
}

describe('credit ledger service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('credits a purchase and records before and after balances', async () => {
    const user = {
      _id: 'user-1',
      credits: 5,
      save: jest.fn().mockResolvedValue(true)
    };

    const transaction = {
      _id: 'tx-1',
      anomalyFlags: [],
      status: 'completed',
      save: jest.fn().mockResolvedValue(true)
    };

    User.findById.mockResolvedValue(user);
    CreditTransaction.findOne.mockReturnValue(sortLeanQuery(null));
    CreditTransaction.create.mockResolvedValue(transaction);

    const result = await creditLedger.creditUser({
      userId: user._id,
      amount: 25,
      kind: 'purchase',
      source: 'revenuecat',
      reason: 'Purchase test'
    });

    expect(result.user.credits).toBe(30);
    expect(user.save).toHaveBeenCalled();
    expect(CreditTransaction.create).toHaveBeenCalledWith(expect.objectContaining({
      balanceBefore: 5,
      balanceAfter: 30,
      amount: 25,
      direction: 'credit',
      kind: 'purchase'
    }));
  });

  test('flags abnormal refund patterns', async () => {
    const user = {
      _id: 'user-2',
      credits: 2,
      save: jest.fn().mockResolvedValue(true)
    };

    const transaction = {
      _id: 'tx-refund',
      anomalyFlags: [],
      status: 'completed',
      save: jest.fn().mockResolvedValue(true)
    };

    User.findById.mockResolvedValue(user);
    CreditTransaction.findOne.mockReturnValue(sortLeanQuery({ balanceAfter: 2 }));
    CreditTransaction.find.mockReturnValue(sortLeanQuery([
      { amount: 2 },
      { amount: 2 },
      { amount: 2 }
    ]));
    CreditTransaction.create.mockResolvedValue(transaction);

    await creditLedger.creditUser({
      userId: user._id,
      amount: 2,
      kind: 'refund',
      source: 'generation_failure',
      reason: 'AI generation failed'
    });

    expect(transaction.status).toBe('flagged');
    expect(transaction.anomalyFlags.some((flag) => flag.code === 'refund_abuse_pattern')).toBe(true);
    expect(Analytics.trackEvent).toHaveBeenCalled();
  });

  test('builds ledger summary for customer history', async () => {
    User.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: 'user-3', credits: 12.5 })
    });
    CreditTransaction.find.mockReturnValue(ledgerListQuery([
      {
        _id: 'tx-1',
        kind: 'refund',
        direction: 'credit',
        amount: 1,
        balanceAfter: 12.5,
        createdAt: new Date().toISOString()
      }
    ]));
    CreditTransaction.countDocuments
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0);
    CreditTransaction.aggregate.mockResolvedValue([
      {
        totalSpent: 4,
        totalRefunded: 1,
        totalRewarded: 2,
        totalPurchased: 10
      }
    ]);
    CreditTransaction.findOne.mockReturnValue(sortLeanQuery({ balanceAfter: 12.5 }));

    const result = await creditLedger.getUserLedger({ userId: 'user-3', page: 1, limit: 20 });

    expect(result.summary.currentBalance).toBe(12.5);
    expect(result.summary.totalRefunded30d).toBe(1);
    expect(result.transactions).toHaveLength(1);
    expect(result.summary.ledgerHealthy).toBe(true);
  });
});
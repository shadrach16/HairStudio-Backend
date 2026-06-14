const User = require('../models/User');
const CreditTransaction = require('../models/CreditTransaction');
const Analytics = require('../models/Analytics');

const ROUNDING_FACTOR = 100;
const REFUND_ALERT_THRESHOLD_COUNT = 3;
const REFUND_ALERT_THRESHOLD_AMOUNT = 6;

function roundCredits(value) {
  return Math.round((Number(value) + Number.EPSILON) * ROUNDING_FACTOR) / ROUNDING_FACTOR;
}

function normalizeAmount(amount) {
  const normalized = roundCredits(amount);

  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error('Credit amount must be a positive number');
  }

  return normalized;
}

function buildAnomaly(code, severity, message) {
  return {
    code,
    severity,
    message,
    createdAt: new Date()
  };
}

async function trackLedgerAlert(userId, transaction, anomalyFlags) {
  if (!anomalyFlags.length) {
    return;
  }

  try {
    await Analytics.trackEvent('credit_ledger_alert', {
      transactionId: transaction._id,
      anomalyCodes: anomalyFlags.map((flag) => flag.code),
      kind: transaction.kind,
      source: transaction.source
    }, userId);
  } catch (error) {
    console.error('Failed to track credit ledger alert:', error.message);
  }
}

async function detectRefundAbuse(userId) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentRefunds = await CreditTransaction.find({
    user: userId,
    kind: 'refund',
    createdAt: { $gte: since }
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!recentRefunds.length) {
    return [];
  }

  const refundAmount = recentRefunds.reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
  const flags = [];

  if (recentRefunds.length >= REFUND_ALERT_THRESHOLD_COUNT) {
    flags.push(buildAnomaly(
      'refund_abuse_pattern',
      'high',
      `User has ${recentRefunds.length} refunds within the last 24 hours.`
    ));
  }

  if (refundAmount >= REFUND_ALERT_THRESHOLD_AMOUNT) {
    flags.push(buildAnomaly(
      'refund_volume_high',
      'medium',
      `Refunded ${refundAmount} credits within the last 24 hours.`
    ));
  }

  return flags;
}

async function detectLedgerMismatch(user, previousTransaction, currentTransaction) {
  const flags = [];

  if (previousTransaction && roundCredits(previousTransaction.balanceAfter) !== roundCredits(currentTransaction.balanceBefore)) {
    flags.push(buildAnomaly(
      'ledger_chain_mismatch',
      'high',
      'Ledger continuity mismatch detected between consecutive credit transactions.'
    ));
  }

  if (roundCredits(user.credits) !== roundCredits(currentTransaction.balanceAfter)) {
    flags.push(buildAnomaly(
      'ledger_balance_mismatch',
      'high',
      'Stored user credits do not match the ledger balance after this transaction.'
    ));
  }

  return flags;
}

async function applyCreditTransaction({
  userId,
  direction,
  amount,
  kind,
  source,
  reason,
  description,
  reference = {},
  metadata = {}
}) {
  const normalizedAmount = normalizeAmount(amount);
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found for credit transaction');
  }

  const previousTransaction = await CreditTransaction.findOne({ user: user._id })
    .sort({ createdAt: -1, _id: -1 })
    .lean();

  const balanceBefore = roundCredits(user.credits || 0);
  const walletBefore = roundCredits(user.subscription?.walletCredits || 0);
  const delta = direction === 'credit' ? normalizedAmount : -normalizedAmount;
  const balanceAfter = roundCredits(balanceBefore + delta);

  if (direction === 'debit' && balanceAfter < 0) {
    const error = new Error('Insufficient credits');
    error.code = 'INSUFFICIENT_CREDITS';
    throw error;
  }

  // Subscription wallet accounting:
  // - subscription grants increase wallet + total balance
  // - debits consume wallet first (up to amount)
  const isSubscriptionGrant = direction === 'credit' && kind === 'subscription_grant';
  const walletDebitAmount = direction === 'debit' ? Math.min(walletBefore, normalizedAmount) : 0;

  if (!user.subscription) {
    user.subscription = {};
  }

  if (isSubscriptionGrant) {
    user.subscription.walletCredits = roundCredits(walletBefore + normalizedAmount);
  } else if (direction === 'debit' && walletDebitAmount > 0) {
    user.subscription.walletCredits = roundCredits(walletBefore - walletDebitAmount);
  }

  user.credits = balanceAfter;
  await user.save();

  const walletAfter = roundCredits(user.subscription?.walletCredits || 0);

  const transaction = await CreditTransaction.create({
    user: user._id,
    kind,
    direction,
    amount: normalizedAmount,
    balanceBefore,
    balanceAfter,
    source,
    reason,
    description,
    reference,
    metadata,
    status: 'completed',
    anomalyFlags: []
  });

  transaction.metadata = {
    ...(transaction.metadata || {}),
    walletBefore,
    walletAfter,
    walletDebitAmount
  };
  await transaction.save();

  const anomalyFlags = [
    ...(await detectLedgerMismatch(user, previousTransaction, transaction)),
    ...(kind === 'refund' ? await detectRefundAbuse(user._id) : [])
  ];

  if (anomalyFlags.length) {
    transaction.anomalyFlags = anomalyFlags;
    transaction.status = 'flagged';
    await transaction.save();
    await trackLedgerAlert(user._id, transaction, anomalyFlags);
  }

  return {
    user,
    transaction
  };
}

async function creditUser(options) {
  return applyCreditTransaction({
    ...options,
    direction: 'credit'
  });
}

async function debitUser(options) {
  return applyCreditTransaction({
    ...options,
    direction: 'debit'
  });
}

async function getUserLedger({ userId, page = 1, limit = 20 }) {
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (currentPage - 1) * pageSize;

  const [user, transactions, total, summaryAggregate, flaggedCount, latestTransaction] = await Promise.all([
    User.findById(userId).lean(),
    CreditTransaction.find({ user: userId })
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    CreditTransaction.countDocuments({ user: userId }),
    CreditTransaction.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: {
            $sum: {
              $cond: [{ $eq: ['$direction', 'debit'] }, '$amount', 0]
            }
          },
          totalRefunded: {
            $sum: {
              $cond: [{ $eq: ['$kind', 'refund'] }, '$amount', 0]
            }
          },
          totalRewarded: {
            $sum: {
              $cond: [
                {
                  $in: ['$kind', ['ad_reward', 'referral_reward', 'streak_reward', 'signup_bonus', 'guest_credit_transfer', 'subscription_grant']]
                },
                '$amount',
                0
              ]
            }
          },
          totalPurchased: {
            $sum: {
              $cond: [{ $eq: ['$kind', 'purchase'] }, '$amount', 0]
            }
          }
        }
      }
    ]),
    CreditTransaction.countDocuments({ user: userId, status: 'flagged' }),
    CreditTransaction.findOne({ user: userId }).sort({ createdAt: -1, _id: -1 }).lean()
  ]);

  if (!user) {
    throw new Error('User not found for ledger lookup');
  }

  const summary = summaryAggregate[0] || {
    totalSpent: 0,
    totalRefunded: 0,
    totalRewarded: 0,
    totalPurchased: 0
  };

  return {
    transactions,
    pagination: {
      current: currentPage,
      pages: Math.ceil(total / pageSize),
      total,
      limit: pageSize
    },
    summary: {
      currentBalance: roundCredits(user.credits || 0),
      totalSpent30d: roundCredits(summary.totalSpent || 0),
      totalRefunded30d: roundCredits(summary.totalRefunded || 0),
      totalRewarded30d: roundCredits(summary.totalRewarded || 0),
      totalPurchased30d: roundCredits(summary.totalPurchased || 0),
      openAlerts: flaggedCount,
      ledgerHealthy: !latestTransaction || roundCredits(latestTransaction.balanceAfter) === roundCredits(user.credits || 0)
    }
  };
}

async function getFlaggedLedgerTransactions(limit = 50) {
  const maxResults = Math.min(100, Math.max(1, Number(limit) || 50));

  return CreditTransaction.find({ status: 'flagged' })
    .sort({ createdAt: -1, _id: -1 })
    .limit(maxResults)
    .lean();
}

module.exports = {
  applyCreditTransaction,
  creditUser,
  debitUser,
  getUserLedger,
  getFlaggedLedgerTransactions,
  roundCredits
};
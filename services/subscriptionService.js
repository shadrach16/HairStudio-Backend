const User = require('../models/User');
const creditLedger = require('./creditLedger');
const { findCatalogItemById } = require('./pricingCatalog');

const ROLLOVER_RATIO = 0.25;

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addInterval(date, interval = 'month', count = 1) {
  const d = new Date(date);
  if (interval === 'year') {
    d.setFullYear(d.getFullYear() + count);
    return d;
  }

  d.setMonth(d.getMonth() + count);
  return d;
}

function getPlan(planId) {
  const plan = findCatalogItemById('subscription', planId);
  if (!plan) {
    const error = new Error(`Unknown subscription plan: ${planId}`);
    error.code = 'UNKNOWN_PLAN';
    throw error;
  }

  return plan;
}

function buildSubscriptionSnapshot(user) {
  const sub = user.subscription || {};
  return {
    plan: sub.plan || 'free',
    status: sub.status || 'inactive',
    provider: sub.provider || 'none',
    providerSubscriptionId: sub.providerSubscriptionId || null,
    startDate: sub.startDate || null,
    endDate: sub.endDate || null,
    currentPeriodStart: sub.currentPeriodStart || null,
    currentPeriodEnd: sub.currentPeriodEnd || null,
    cancelAtPeriodEnd: Boolean(sub.cancelAtPeriodEnd),
    cancellationRequestedAt: sub.cancellationRequestedAt || null,
    creditsPerMonth: Number(sub.creditsPerMonth || 0),
    rolloverCap: Number(sub.rolloverCap || 0),
    walletCredits: Number(sub.walletCredits || 0),
    lastRefreshAt: sub.lastRefreshAt || null,
    nextRefreshAt: sub.nextRefreshAt || null,
    isActiveNow: typeof user.hasActiveSubscription === 'function' ? user.hasActiveSubscription() : false
  };
}

async function expireExcessWalletCredits(user, cap, reasonPrefix = 'Subscription rollover cap applied') {
  const wallet = Number(user.subscription?.walletCredits || 0);
  const overflow = Math.max(0, creditLedger.roundCredits(wallet - cap));

  if (overflow <= 0) {
    return null;
  }

  const result = await creditLedger.debitUser({
    userId: user._id,
    amount: overflow,
    kind: 'subscription_expiry',
    source: 'subscription_cycle',
    reason: reasonPrefix,
    description: `Expired ${overflow} wallet credits above rollover cap of ${cap}`,
    metadata: {
      rolloverCap: cap,
      walletBefore: wallet
    }
  });

  return result.transaction;
}

async function grantCycleCredits(user, plan, refreshAt = new Date(), reason = 'Subscription cycle grant') {
  const creditsPerCycle = Number(plan.creditsPerMonth || 0);
  if (creditsPerCycle <= 0) {
    const error = new Error(`Plan ${plan.id} has invalid creditsPerMonth`);
    error.code = 'INVALID_PLAN';
    throw error;
  }

  const rolloverCap = creditLedger.roundCredits(creditsPerCycle * ROLLOVER_RATIO);
  await expireExcessWalletCredits(user, rolloverCap);

  const grant = await creditLedger.creditUser({
    userId: user._id,
    amount: creditsPerCycle,
    kind: 'subscription_grant',
    source: 'subscription_cycle',
    reason,
    description: `${plan.name} cycle credit grant`,
    metadata: {
      planId: plan.id,
      creditsPerCycle,
      rolloverCap
    }
  });

  const refreshedUser = grant.user;
  refreshedUser.subscription = {
    ...(refreshedUser.subscription || {}),
    creditsPerMonth: creditsPerCycle,
    rolloverCap,
    lastRefreshAt: startOfDay(refreshAt),
    nextRefreshAt: addInterval(startOfDay(refreshAt), plan.interval || 'month', 1)
  };
  await refreshedUser.save();

  return {
    user: refreshedUser,
    transaction: grant.transaction
  };
}

async function activateSubscription({
  userId,
  planId,
  provider = 'revenuecat',
  providerSubscriptionId = null,
  activateAt = new Date(),
  skipCycleGrant = false
}) {
  const plan = getPlan(planId);
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found for subscription activation');
  }

  const periodStart = startOfDay(activateAt);
  const periodEnd = addInterval(periodStart, plan.interval || 'month', 1);

  user.isPro = true;
  user.subscription = {
    ...(user.subscription || {}),
    plan: plan.id,
    status: 'active',
    provider,
    providerSubscriptionId,
    startDate: periodStart,
    endDate: periodEnd,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    cancellationRequestedAt: null,
    creditsPerMonth: Number(plan.creditsPerMonth || 0)
  };

  await user.save();

  if (skipCycleGrant) {
    return {
      user,
      grantedCredits: 0,
      plan
    };
  }

  const grantResult = await grantCycleCredits(user, plan, periodStart, 'Subscription activation cycle grant');
  return {
    user: grantResult.user,
    grantedCredits: Number(plan.creditsPerMonth || 0),
    plan,
    grantTransaction: grantResult.transaction
  };
}

async function refreshSubscriptionCycle({ userId, now = new Date() }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found for subscription refresh');
  }

  if (!user.hasActiveSubscription()) {
    return {
      user,
      refreshed: false,
      reason: 'subscription_not_active'
    };
  }

  const plan = getPlan(user.subscription.plan);
  const nextRefreshAt = user.subscription.nextRefreshAt ? new Date(user.subscription.nextRefreshAt) : null;

  if (nextRefreshAt && now < nextRefreshAt) {
    return {
      user,
      refreshed: false,
      reason: 'refresh_not_due',
      nextRefreshAt
    };
  }

  const refreshMoment = startOfDay(now);
  const currentPeriodEnd = addInterval(refreshMoment, plan.interval || 'month', 1);

  user.subscription.currentPeriodStart = refreshMoment;
  user.subscription.currentPeriodEnd = currentPeriodEnd;
  user.subscription.endDate = currentPeriodEnd;
  await user.save();

  const grant = await grantCycleCredits(user, plan, refreshMoment, 'Subscription monthly refresh grant');

  return {
    user: grant.user,
    refreshed: true,
    grantedCredits: Number(plan.creditsPerMonth || 0),
    transaction: grant.transaction,
    nextRefreshAt: grant.user.subscription.nextRefreshAt
  };
}

async function cancelSubscription({ userId, requestedAt = new Date() }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found for subscription cancellation');
  }

  if (!user.subscription || user.subscription.status !== 'active') {
    return {
      user,
      cancelled: false,
      reason: 'subscription_not_active'
    };
  }

  user.subscription.cancelAtPeriodEnd = true;
  user.subscription.cancellationRequestedAt = requestedAt;
  await user.save();

  return {
    user,
    cancelled: true,
    cancelAtPeriodEnd: true,
    periodEnd: user.subscription.currentPeriodEnd || user.subscription.endDate || null
  };
}

async function restoreSubscription({ userId }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found for subscription restore');
  }

  if (!user.subscription || user.subscription.status !== 'active') {
    return {
      user,
      restored: false,
      reason: 'subscription_not_active'
    };
  }

  user.subscription.cancelAtPeriodEnd = false;
  user.subscription.cancellationRequestedAt = null;
  await user.save();

  return {
    user,
    restored: true
  };
}

async function terminateSubscription({ userId, terminatedAt = new Date(), reason = 'provider_cancellation' }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found for subscription termination');
  }

  user.subscription = {
    ...(user.subscription || {}),
    status: 'cancelled',
    cancelAtPeriodEnd: false,
    cancellationRequestedAt: terminatedAt,
    currentPeriodEnd: terminatedAt,
    endDate: terminatedAt,
    nextRefreshAt: null
  };
  user.isPro = false;
  await user.save();

  return {
    user,
    terminated: true,
    reason
  };
}

// C3: Mark subscription as past_due on billing failure
async function handleBillingIssue({ userId, detectedAt = new Date(), providerEvent = null }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found for billing issue');
  }

  if (!user.subscription || user.subscription.status !== 'active') {
    return { user, handled: false, reason: 'subscription_not_active' };
  }

  // Grace period: 7 days from detection before enforcement
  const graceDeadline = new Date(detectedAt);
  graceDeadline.setDate(graceDeadline.getDate() + 7);

  user.subscription.status = 'past_due';
  user.subscription.billingIssueDetectedAt = detectedAt;
  user.subscription.graceDeadline = graceDeadline;
  await user.save();

  return {
    user,
    handled: true,
    status: 'past_due',
    graceDeadline,
    providerEvent
  };
}

// C3: Resolve grace period — either payment recovered or grace expired
async function resolveGracePeriod({ userId, recovered = false }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.subscription?.status !== 'past_due') {
    return { user, resolved: false, reason: 'not_past_due' };
  }

  if (recovered) {
    // Payment recovered — restore active status
    user.subscription.status = 'active';
    user.subscription.billingIssueDetectedAt = null;
    user.subscription.graceDeadline = null;
    await user.save();
    return { user, resolved: true, action: 'recovered' };
  }

  // Grace expired — terminate
  return terminateSubscription({
    userId,
    reason: 'grace_period_expired'
  });
}

// C3: Change subscription plan (upgrade or downgrade)
async function changeSubscriptionPlan({ userId, newPlanId, provider = null }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found for plan change');
  }

  if (!user.subscription || !['active', 'past_due'].includes(user.subscription.status)) {
    return { user, changed: false, reason: 'no_active_subscription' };
  }

  const oldPlanId = user.subscription.plan;
  const newPlan = getPlan(newPlanId);
  const oldPlan = findCatalogItemById('subscription', oldPlanId);

  const isUpgrade = newPlan.creditsPerMonth > (oldPlan?.creditsPerMonth || 0);

  // Calculate prorated credit adjustment for upgrade
  let proratedCredits = 0;
  if (isUpgrade && user.subscription.currentPeriodEnd) {
    const now = new Date();
    const periodEnd = new Date(user.subscription.currentPeriodEnd);
    const periodStart = new Date(user.subscription.currentPeriodStart || now);
    const totalDays = Math.max(1, (periodEnd - periodStart) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, (periodEnd - now) / (1000 * 60 * 60 * 24));
    const ratio = remainingDays / totalDays;
    const creditDiff = newPlan.creditsPerMonth - (oldPlan?.creditsPerMonth || 0);
    proratedCredits = creditLedger.roundCredits(creditDiff * ratio);
  }

  // Update subscription plan
  user.subscription.plan = newPlan.id;
  user.subscription.creditsPerMonth = newPlan.creditsPerMonth;
  user.subscription.rolloverCap = creditLedger.roundCredits(newPlan.creditsPerMonth * ROLLOVER_RATIO);
  if (provider) {
    user.subscription.provider = provider;
  }
  await user.save();

  // Grant prorated credits for upgrades
  let grantTransaction = null;
  if (proratedCredits > 0) {
    const grant = await creditLedger.creditUser({
      userId: user._id,
      amount: proratedCredits,
      kind: 'subscription_grant',
      source: 'subscription_upgrade',
      reason: `Prorated upgrade from ${oldPlanId} to ${newPlan.id}`,
      description: `${proratedCredits} prorated credits for plan upgrade`,
      metadata: {
        oldPlanId,
        newPlanId: newPlan.id,
        proratedCredits,
        isUpgrade: true
      }
    });
    grantTransaction = grant.transaction;
  }

  return {
    user,
    changed: true,
    isUpgrade,
    oldPlan: { id: oldPlanId, creditsPerMonth: oldPlan?.creditsPerMonth || 0 },
    newPlan: { id: newPlan.id, creditsPerMonth: newPlan.creditsPerMonth },
    proratedCredits,
    grantTransaction
  };
}

// C3: Subscription analytics for churn/renewal tracking
async function getSubscriptionAnalytics({ days = 30 } = {}) {
  const Analytics = require('../models/Analytics');
  const Payment = require('../models/Payment');
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [
    totalActive,
    totalPastDue,
    totalCancelled,
    totalCancelPending,
    recentPayments,
    planDistribution
  ] = await Promise.all([
    User.countDocuments({ 'subscription.status': 'active' }),
    User.countDocuments({ 'subscription.status': 'past_due' }),
    User.countDocuments({ 'subscription.status': 'cancelled' }),
    User.countDocuments({ 'subscription.status': 'active', 'subscription.cancelAtPeriodEnd': true }),
    Payment.countDocuments({ type: 'subscription', createdAt: { $gte: since }, status: 'success' }),
    User.aggregate([
      { $match: { 'subscription.status': { $in: ['active', 'past_due'] } } },
      { $group: { _id: '$subscription.plan', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  // Calculate churn: cancelled in period / (active at start of period)
  const cancelledInPeriod = await User.countDocuments({
    'subscription.cancellationRequestedAt': { $gte: since }
  });

  const activeBase = totalActive + cancelledInPeriod; // approximate start-of-period active
  const churnRate = activeBase > 0
    ? Math.round((cancelledInPeriod / activeBase) * 10000) / 100
    : 0;

  // MRR estimate from plan distribution
  const planCreditsMap = {
    basic_monthly: 25,
    plus_monthly: 70,
    pro_monthly: 150
  };

  return {
    period: { days, since: since.toISOString() },
    subscribers: {
      active: totalActive,
      pastDue: totalPastDue,
      cancelled: totalCancelled,
      cancelPending: totalCancelPending
    },
    churn: {
      cancelledInPeriod,
      churnRatePercent: churnRate
    },
    renewals: {
      successfulInPeriod: recentPayments
    },
    planDistribution: planDistribution.map(p => ({
      plan: p._id,
      count: p.count,
      creditsPerMonth: planCreditsMap[p._id] || 0
    }))
  };
}

module.exports = {
  activateSubscription,
  refreshSubscriptionCycle,
  cancelSubscription,
  restoreSubscription,
  terminateSubscription,
  buildSubscriptionSnapshot,
  getPlan,
  handleBillingIssue,
  resolveGracePeriod,
  changeSubscriptionPlan,
  getSubscriptionAnalytics,
  ROLLOVER_RATIO
};

// backend/routes/payments.js
// Payment routes - provides endpoints for payment history and pricing plans
// Note: Actual payment processing happens via webhooks (RevenueCat, Dodo)

const express = require('express');
const Payment = require('../models/Payment');
const CreditTransaction = require('../models/CreditTransaction');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const creditLedger = require('../services/creditLedger');
const subscriptionService = require('../services/subscriptionService');
const {
  CATALOG_VERSION,
  catalogValidation,
  getPublicPricingCatalog,
  resolveCatalogItem,
  findCatalogItemById,
  findCatalogItemByStorefrontId
} = require('../services/pricingCatalog');

const router = express.Router();

function sendCatalog(res) {
  res.json({
    success: true,
    data: getPublicPricingCatalog()
  });
}

function requireSupportToken(req, res, next) {
  const expectedToken = process.env.SUPPORT_ADJUSTMENT_TOKEN;
  const providedToken = req.get('x-support-token');

  if (!expectedToken || providedToken !== expectedToken) {
    return res.status(403).json({
      success: false,
      message: 'Support token is required'
    });
  }

  return next();
}

// @desc    Get pricing plans (credit packs and subscriptions)
// @route   GET /api/payments/plans
// @access  Public
router.get('/plans', (req, res) => {
  sendCatalog(res);
});

// @desc    Get canonical pricing catalog
// @route   GET /api/payments/catalog
// @access  Public
router.get('/catalog', (req, res) => {
  sendCatalog(res);
});

// @desc    Get subscription plans from canonical catalog
// @route   GET /api/payments/subscriptions/plans
// @access  Public
router.get('/subscriptions/plans', (req, res) => {
  const catalog = getPublicPricingCatalog();
  res.json({
    success: true,
    data: {
      version: catalog.version,
      subscriptions: catalog.subscriptions
    }
  });
});

// @desc    Get current user subscription status
// @route   GET /api/payments/subscription/status
// @access  Private
router.get('/subscription/status', protect, async (req, res) => {
  try {
    const refreshed = await subscriptionService.refreshSubscriptionCycle({
      userId: req.user._id,
      now: new Date()
    });

    const snapshot = subscriptionService.buildSubscriptionSnapshot(refreshed.user);

    res.json({
      success: true,
      data: {
        ...snapshot,
        refreshedThisRequest: Boolean(refreshed.refreshed),
        refreshReason: refreshed.reason || null
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load subscription status'
    });
  }
});

// @desc    Cancel subscription at period end
// @route   POST /api/payments/subscription/cancel
// @access  Private
router.post('/subscription/cancel', protect, async (req, res) => {
  try {
    const result = await subscriptionService.cancelSubscription({
      userId: req.user._id,
      requestedAt: new Date()
    });

    if (!result.cancelled) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription to cancel'
      });
    }

    res.json({
      success: true,
      message: 'Subscription cancellation scheduled for period end',
      data: {
        subscription: subscriptionService.buildSubscriptionSnapshot(result.user)
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// @desc    Restore subscription auto-renew
// @route   POST /api/payments/subscription/restore
// @access  Private
router.post('/subscription/restore', protect, async (req, res) => {
  try {
    const result = await subscriptionService.restoreSubscription({ userId: req.user._id });

    if (!result.restored) {
      return res.status(400).json({
        success: false,
        message: 'No active subscription to restore'
      });
    }

    res.json({
      success: true,
      message: 'Subscription auto-renew restored',
      data: {
        subscription: subscriptionService.buildSubscriptionSnapshot(result.user)
      }
    });
  } catch (error) {
    console.error('Restore subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore subscription'
    });
  }
});

// @desc    Get user payment history
// @route   GET /api/payments/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('type itemName amount currency credits status createdAt');

    const total = await Payment.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: payments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history'
    });
  }
});

// @desc    Get customer-visible credit ledger
// @route   GET /api/payments/ledger
// @access  Private
router.get('/ledger', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await creditLedger.getUserLedger({
      userId: req.user._id,
      page,
      limit
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get credit ledger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load credit ledger'
    });
  }
});

// @desc    Get flagged ledger alerts for support staff
// @route   GET /api/payments/ledger/alerts
// @access  Internal support token
router.get('/ledger/alerts', requireSupportToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const alerts = await creditLedger.getFlaggedLedgerTransactions(limit);

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Get ledger alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load ledger alerts'
    });
  }
});

// @desc    Get a support view of a user ledger
// @route   GET /api/payments/ledger/support/:userId
// @access  Internal support token
router.get('/ledger/support/:userId', requireSupportToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await creditLedger.getUserLedger({
      userId: req.params.userId,
      page,
      limit
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get support ledger view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load support ledger view'
    });
  }
});

// @desc    Apply a support credit adjustment
// @route   POST /api/payments/ledger/support-adjustment
// @access  Internal support token
router.post('/ledger/support-adjustment', requireSupportToken, async (req, res) => {
  try {
    const { userId, amount, direction = 'credit', reason, note } = req.body;

    if (!userId || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message: 'userId, amount, and reason are required'
      });
    }

    const applyAdjustment = direction === 'debit' ? creditLedger.debitUser : creditLedger.creditUser;
    const result = await applyAdjustment({
      userId,
      amount,
      kind: 'support_adjustment',
      source: 'support_tool',
      reason,
      description: note,
      metadata: {
        actor: req.get('x-support-actor') || 'support'
      }
    });

    res.json({
      success: true,
      data: {
        transaction: result.transaction,
        balance: result.user.credits
      }
    });
  } catch (error) {
    console.error('Support adjustment error:', error);
    const statusCode = error.code === 'INSUFFICIENT_CREDITS' ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to apply support adjustment'
    });
  }
});

// @desc    Support activation endpoint for subscription lifecycle and webhook replay
// @route   POST /api/payments/subscription/activate
// @access  Internal support token
router.post('/subscription/activate', requireSupportToken, async (req, res) => {
  try {
    const { userId, planId, provider = 'revenuecat', providerSubscriptionId = null, skipCycleGrant = false } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({
        success: false,
        message: 'userId and planId are required'
      });
    }

    const plan = findCatalogItemById('subscription', planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: `Unknown subscription plan: ${planId}`
      });
    }

    const result = await subscriptionService.activateSubscription({
      userId,
      planId,
      provider,
      providerSubscriptionId,
      activateAt: new Date(),
      skipCycleGrant
    });

    res.json({
      success: true,
      message: 'Subscription activated successfully',
      data: {
        plan: {
          id: plan.id,
          name: plan.name,
          creditsPerMonth: plan.creditsPerMonth,
          interval: plan.interval
        },
        grantedCredits: result.grantedCredits,
        subscription: subscriptionService.buildSubscriptionSnapshot(result.user)
      }
    });
  } catch (error) {
    console.error('Support subscription activation error:', error);
    const statusCode = error.code === 'UNKNOWN_PLAN' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to activate subscription'
    });
  }
});

// @desc    Support manual refresh for a subscription cycle
// @route   POST /api/payments/subscription/refresh
// @access  Internal support token
router.post('/subscription/refresh', requireSupportToken, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const result = await subscriptionService.refreshSubscriptionCycle({ userId, now: new Date() });

    res.json({
      success: true,
      data: {
        refreshed: Boolean(result.refreshed),
        reason: result.reason || null,
        grantedCredits: result.grantedCredits || 0,
        subscription: subscriptionService.buildSubscriptionSnapshot(result.user)
      }
    });
  } catch (error) {
    console.error('Support subscription refresh error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to refresh subscription'
    });
  }
});

// @desc    Initialize payment (info only - actual payment via RevenueCat/Dodo)
// @route   POST /api/payments/initialize
// @access  Private
router.post('/initialize', protect, async (req, res) => {
  try {
    const { type, planId } = req.body;

    if (!type || !planId) {
      return res.status(400).json({
        success: false,
        message: 'Payment type and plan ID are required'
      });
    }

    const plan = resolveCatalogItem(type, planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Return plan info - actual purchase happens via RevenueCat (mobile) or Dodo (web)
    res.json({
      success: true,
      message: 'Use in-app purchase (RevenueCat) or web checkout (Dodo) to complete payment',
      data: {
        plan,
        catalogVersion: CATALOG_VERSION,
        catalogValidated: catalogValidation.isValid,
        paymentMethods: {
          mobile: plan.storefronts?.revenueCat ? 'RevenueCat (Google Play / App Store)' : null,
          web: plan.storefronts?.dodo ? 'Dodo Payments' : null
        }
      }
    });
  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment'
    });
  }
});

// @desc    Verify payment (for manual verification if needed)
// @route   POST /api/payments/verify
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
    }

    // Find payment by transaction ID
    const payment = await Payment.findOne({
      user: req.user._id,
      $or: [
        { 'revenueCat.transactionId': reference },
        { 'dodoPayment.transactionId': reference }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: {
        status: payment.status,
        credits: payment.credits,
        type: payment.type,
        createdAt: payment.createdAt
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

// @desc    Verify Google Play purchase
// @route   POST /api/payments/verify-google-play
// @access  Private
router.post('/verify-google-play', protect, async (req, res) => {
  try {
    const { productId, purchaseToken, packageName } = req.body;

    if (!productId || !purchaseToken) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and purchase token are required'
      });
    }

    // Note: Full Google Play verification requires the Google Play Developer API
    // This is a placeholder - actual verification happens via RevenueCat webhooks
    // RevenueCat handles the server-to-server verification automatically

    res.json({
      success: true,
      message: 'Purchase will be verified via RevenueCat webhook',
      data: {
        productId,
        status: 'pending_webhook'
      }
    });
  } catch (error) {
    console.error('Verify Google Play purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify purchase'
    });
  }
});

// ─── C3: Subscription Endpoints ──────────────────────────────────────────────

// @desc    Change subscription plan (upgrade/downgrade)
// @route   POST /api/payments/subscription/change-plan
// @access  Private
router.post('/subscription/change-plan', protect, async (req, res) => {
  try {
    const { newPlanId } = req.body;

    if (!newPlanId) {
      return res.status(400).json({
        success: false,
        message: 'newPlanId is required'
      });
    }

    const plan = findCatalogItemById('subscription', newPlanId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: `Unknown subscription plan: ${newPlanId}`
      });
    }

    const result = await subscriptionService.changeSubscriptionPlan({
      userId: req.user._id,
      newPlanId
    });

    if (!result.changed) {
      return res.status(400).json({
        success: false,
        message: result.reason || 'Cannot change plan'
      });
    }

    res.json({
      success: true,
      message: result.isUpgrade ? 'Subscription upgraded' : 'Subscription downgraded',
      data: {
        oldPlan: result.oldPlan,
        newPlan: result.newPlan,
        isUpgrade: result.isUpgrade,
        proratedCredits: result.proratedCredits,
        subscription: subscriptionService.buildSubscriptionSnapshot(result.user)
      }
    });
  } catch (error) {
    console.error('Change subscription plan error:', error);
    const statusCode = error.code === 'UNKNOWN_PLAN' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to change plan'
    });
  }
});

// @desc    Get subscription analytics (churn, renewal, plan distribution)
// @route   GET /api/payments/subscription/analytics
// @access  Internal support token
router.get('/subscription/analytics', requireSupportToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const analytics = await subscriptionService.getSubscriptionAnalytics({
      days: parseInt(days)
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Subscription analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load subscription analytics'
    });
  }
});

// @desc    Sync subscription state with provider (after restore purchases on device)
// @route   POST /api/payments/subscription/sync
// @access  Private
router.post('/subscription/sync', protect, async (req, res) => {
  try {
    const { providerSubscriptionId, planId, provider = 'revenuecat' } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'planId is required'
      });
    }

    const plan = findCatalogItemById('subscription', planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: `Unknown subscription plan: ${planId}`
      });
    }

    // SECURITY: never trust the client. Verify against RevenueCat that this user
    // actually holds an active subscription for this plan before activating/granting.
    // (Other providers settle via their own webhook, not this endpoint.)
    if (provider !== 'revenuecat') {
      return res.status(400).json({
        success: false,
        message: 'This endpoint only syncs RevenueCat subscriptions; other providers settle via webhook.'
      });
    }

    const rcProductId = plan.storefronts?.revenueCat?.productId;
    if (!rcProductId) {
      return res.status(400).json({
        success: false,
        message: 'Plan has no RevenueCat product configured'
      });
    }

    const REST_KEY = process.env.REVENUECAT_REST_API_KEY;
    if (!REST_KEY) {
      console.warn('[subscription/sync] REVENUECAT_REST_API_KEY not set — refusing to grant without verification');
      return res.status(503).json({
        success: false,
        message: 'Subscription verification is not configured. Please try again later or contact support.'
      });
    }
    if (typeof fetch !== 'function') {
      console.error('[subscription/sync] global fetch unavailable (requires Node 18+)');
      return res.status(503).json({ success: false, message: 'Verification temporarily unavailable' });
    }

    const rcRes = await fetch(`https://api.revenuecat.com/v1/subscribers/${req.user._id}`, {
      headers: { Authorization: `Bearer ${REST_KEY}` }
    });
    if (!rcRes.ok) {
      console.error('[subscription/sync] RevenueCat API error', rcRes.status);
      return res.status(502).json({ success: false, message: 'Could not verify subscription with the store' });
    }
    const rcData = await rcRes.json();
    const sub = rcData?.subscriber?.subscriptions?.[rcProductId];
    const isActive = !!sub && (!sub.expires_date || new Date(sub.expires_date).getTime() > Date.now());
    if (!isActive) {
      return res.status(403).json({
        success: false,
        message: 'No active subscription found for this plan on your account'
      });
    }

    // Check if user already has this subscription active
    const user = req.user;
    if (
      user.subscription?.status === 'active' &&
      user.subscription?.plan === planId
    ) {
      // Try refresh if due
      const refreshResult = await subscriptionService.refreshSubscriptionCycle({
        userId: user._id,
        now: new Date()
      });

      return res.json({
        success: true,
        message: 'Subscription already active, refreshed if due',
        data: {
          subscription: subscriptionService.buildSubscriptionSnapshot(refreshResult.user),
          refreshed: refreshResult.refreshed
        }
      });
    }

    // Activate or reactivate the subscription
    const result = await subscriptionService.activateSubscription({
      userId: user._id,
      planId,
      provider,
      providerSubscriptionId: providerSubscriptionId || sub.store_transaction_id || sub.original_purchase_date || null,
      activateAt: new Date(),
      skipCycleGrant: false
    });

    res.json({
      success: true,
      message: 'Subscription synced successfully',
      data: {
        subscription: subscriptionService.buildSubscriptionSnapshot(result.user),
        grantedCredits: result.grantedCredits
      }
    });
  } catch (error) {
    console.error('Subscription sync error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to sync subscription'
    });
  }
});

// @desc    Support: terminate subscription immediately
// @route   POST /api/payments/subscription/terminate
// @access  Internal support token
router.post('/subscription/terminate', requireSupportToken, async (req, res) => {
  try {
    const { userId, reason = 'support_termination' } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const result = await subscriptionService.terminateSubscription({
      userId,
      terminatedAt: new Date(),
      reason
    });

    res.json({
      success: true,
      message: 'Subscription terminated',
      data: {
        terminated: result.terminated,
        reason,
        subscription: subscriptionService.buildSubscriptionSnapshot(result.user)
      }
    });
  } catch (error) {
    console.error('Subscription termination error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to terminate subscription'
    });
  }
});

// @desc    Verify + grant a credit-pack purchase via RevenueCat's REST API.
//          Webhook-independent fallback: the client calls this after a successful
//          purchasePackage(). We NEVER trust the client's word — credits are granted
//          only for purchases RevenueCat confirms on the subscriber record, and the
//          grant is idempotent (deduped by store transaction id).
// @route   POST /api/payments/sync-purchase
// @access  Private
router.post('/sync-purchase', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    // Resolve the credit pack from the catalog (by RevenueCat product id, then by catalog id).
    const pack =
      findCatalogItemByStorefrontId('revenueCat', productId, 'credit_pack') ||
      findCatalogItemById('credit_pack', productId);

    if (!pack || !pack.credits) {
      return res.status(404).json({ success: false, message: `Unknown credit pack: ${productId}` });
    }

    const REST_KEY = process.env.REVENUECAT_REST_API_KEY;
    if (!REST_KEY) {
      // No key = we cannot verify. Do NOT grant on client trust. The webhook path
      // (once configured) will still deliver credits; surface a soft message.
      console.warn('[sync-purchase] REVENUECAT_REST_API_KEY not set — cannot verify; relying on webhook');
      return res.status(503).json({
        success: false,
        message: 'Credit delivery is being processed. If credits do not appear shortly, contact support.'
      });
    }

    if (typeof fetch !== 'function') {
      console.error('[sync-purchase] global fetch unavailable (requires Node 18+)');
      return res.status(503).json({ success: false, message: 'Verification temporarily unavailable' });
    }

    // The subscriber is keyed by our Mongo _id (set via Purchases.logIn on the client).
    const rcRes = await fetch(`https://api.revenuecat.com/v1/subscribers/${req.user._id}`, {
      headers: { Authorization: `Bearer ${REST_KEY}` }
    });

    if (!rcRes.ok) {
      console.error('[sync-purchase] RevenueCat API error', rcRes.status);
      return res.status(502).json({ success: false, message: 'Could not verify purchase with the store' });
    }

    const rcData = await rcRes.json();
    const purchases = rcData?.subscriber?.non_subscriptions?.[productId] || [];

    if (!purchases.length) {
      return res.status(404).json({ success: false, message: 'No matching purchase found on your account' });
    }

    let grantedCredits = 0;
    let newCount = 0;

    for (const purchase of purchases) {
      const txnId = purchase.store_transaction_id || purchase.id;
      if (!txnId) continue;

      // Idempotency: skip purchases already recorded (by webhook or a prior sync).
      const existing = await Payment.findOne({
        user: req.user._id,
        'revenueCat.transactionId': txnId
      });
      if (existing) continue;

      const payment = await Payment.create({
        user: req.user._id,
        type: 'credit_pack',
        itemId: pack.id,
        itemName: pack.name,
        amount: pack.price || 0,
        currency: 'USD',
        credits: pack.credits,
        status: 'success',
        revenueCat: { transactionId: txnId, eventId: purchase.id },
        webhookData: purchase,
        metadata: {
          source: 'rc_sync',
          catalogVersion: CATALOG_VERSION,
          providerProductId: productId
        }
      });

      const ledgerResult = await creditLedger.creditUser({
        userId: req.user._id,
        amount: pack.credits,
        kind: 'purchase',
        source: 'rc_sync',
        reason: `RevenueCat purchase for ${pack.name}`,
        description: pack.description,
        reference: {
          payment: payment._id,
          catalogItemId: pack.id,
          providerTransactionId: txnId
        },
        metadata: {
          catalogVersion: CATALOG_VERSION,
          providerProductId: productId
        }
      });

      payment.creditTransaction = ledgerResult.transaction._id;
      await payment.save();

      grantedCredits += pack.credits;
      newCount += 1;
    }

    const fresh = await User.findById(req.user._id).select('credits');

    return res.json({
      success: true,
      message: grantedCredits > 0 ? `Granted ${grantedCredits} credits` : 'Account already up to date',
      data: {
        grantedCredits,
        newPurchases: newCount,
        balance: fresh ? fresh.credits : undefined
      }
    });
  } catch (error) {
    console.error('Sync purchase error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to sync purchase' });
  }
});

module.exports = router;

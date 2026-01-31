// backend/routes/payments.js
// Payment routes - provides endpoints for payment history and pricing plans
// Note: Actual payment processing happens via webhooks (RevenueCat, Dodo)

const express = require('express');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Credit pack pricing - matches RevenueCat/Dodo product IDs
const CREDIT_PACKS = [
  {
    id: 'starter_5',
    name: 'Starter Pack',
    credits: 5,
    price: 2.99,
    currency: 'USD',
    popular: false,
    description: 'Perfect for trying out'
  },
  {
    id: 'popular_15',
    name: 'Popular Pack',
    credits: 15,
    price: 6.99,
    currency: 'USD',
    popular: true,
    description: 'Best value for regular users',
    savings: '22%'
  },
  {
    id: 'pro_50',
    name: 'Pro Pack',
    credits: 50,
    price: 19.99,
    currency: 'USD',
    popular: false,
    description: 'For power users',
    savings: '33%'
  },
  {
    id: 'salon_100',
    name: 'Salon Pack',
    credits: 100,
    price: 34.99,
    currency: 'USD',
    popular: false,
    description: 'Professional salon use',
    savings: '42%'
  }
];

// Subscription tiers (if applicable)
const SUBSCRIPTIONS = [
  {
    id: 'monthly_pro',
    name: 'Pro Monthly',
    creditsPerMonth: 30,
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: ['30 credits/month', 'Priority processing', 'No watermarks']
  }
];

// @desc    Get pricing plans (credit packs and subscriptions)
// @route   GET /api/payments/plans
// @access  Public
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    data: {
      creditPacks: CREDIT_PACKS,
      subscriptions: SUBSCRIPTIONS
    }
  });
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

    // Find the plan
    let plan = null;
    if (type === 'credit_pack') {
      plan = CREDIT_PACKS.find(p => p.id === planId);
    } else if (type === 'subscription') {
      plan = SUBSCRIPTIONS.find(p => p.id === planId);
    }

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
        paymentMethods: {
          mobile: 'RevenueCat (Google Play / App Store)',
          web: 'Dodo Payments'
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

module.exports = router;

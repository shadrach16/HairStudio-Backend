const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const Payment = require('../models/Payment');
const WebhookLog = require('../models/WebhookLog');
const Analytics = require('../models/Analytics');

const router = express.Router();

// --- CONFIGURATION ---

const CREDIT_PACKS = {
  'credits3': { id: 'credits3', name: 'Beginners Pack', credits: 3 },
  'credits10': { id: 'credits10', name: 'Novies Pack', credits: 10 },
  'credits25': { id: 'credits25', name: 'Starter Pack', credits: 25 },
  'credits100': { id: 'credits100', name: 'Essential Pack', credits: 100 },
  'credits250': { id: 'credits250', name: 'Stylist Pack', credits: 250 },
  'unlimited': { id: 'unlimited', name: 'Lifetime Access (VIP)', credits: 9999999 }, // Or handle as subscription
};
const DODO_CREDIT_PACKS = {
  'pdt_pfhTvWTjDJAIDqBe8r8Ab': { id: 'credits25', name: 'Starter Pack', credits: 25, price:'1.49' },
  'pdt_s6wp6uV54N8VlApn5MKqU': { id: 'credits100', name: 'Essential Pack', credits: 100, price:'5.89' },
  'pdt_P4zhEuGkXT30Kg3OKr9zM': { id: 'credits250', name: 'Stylist Pack', credits: 250, price:'12.48' },
  'pdt_NQ0vZ7eaMMMZJEEMiLHWz': { id: 'credits1000', name: 'VIP Pack', credits: 1000, price:'44.99' },
  'pdt_ZaJToyG0j8zfq1zbcDMUD': { id: 'credits1000', name: 'Premium Pack', credits: 10000, price:'100' },
};




const REVENUECAT_WEBHOOK_TOKEN = process.env.REVENUECAT_WEBHOOK_TOKEN;


// --- 1. RevenueCat Webhook Handler ---
// This route uses express.json() which we'll apply in server.js
router.post('/revenuecat', express.json(), async (req, res) => {
  // 1. Verify Authorization Header
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || token !== REVENUECAT_WEBHOOK_TOKEN) {
    console.warn('[RC Webhook] Unauthorized request');
    return res.status(401).send('Unauthorized');
  }

  const { event } = req.body;
  const eventId = event?.id || `rc_${Date.now()}`;

  // 2. Log incoming webhook and check for duplicates
  const logResult = await WebhookLog.logIncoming(
    'revenuecat',
    eventId,
    event?.type || 'unknown',
    req.body,
    { ip: req.ip, userAgent: req.get('User-Agent') }
  );

  if (logResult?.isDuplicate) {
    console.log(`[RC Webhook] Duplicate event ${eventId}, returning 200 OK`);
    return res.status(200).send('OK');
  }

  // 3. Acknowledge the event immediately
  res.status(200).send('OK');

  // 4. Process the event asynchronously
  try {
    const { app_user_id, product_id, transaction_id, id: event_id, price_in_purchased_currency, currency } = event;
    console.log('revenuelog', event.type, app_user_id, product_id);

    // 5. Find the user
    const user = await User.findById(app_user_id);
    if (!user) {
      console.error(`[RC Webhook] User not found: ${app_user_id}`);
      await WebhookLog.markFailed('revenuecat', eventId, 'User not found');
      return;
    }

    // 6. Get credit pack details
    const pack = CREDIT_PACKS[product_id];
    if (!pack || !pack.credits) {
      console.error(`[RC Webhook] Credit pack not found or has 0 credits: ${product_id}`);
      await WebhookLog.markFailed('revenuecat', eventId, 'Invalid product');
      return;
    }

    // 7. Grant Credits & Log Payment
    await user.addCredits(pack.credits);

    const payment = await Payment.create({
      user: user._id,
      type: 'credit_pack',
      itemId: product_id,
      itemName: pack.name,
      amount: price_in_purchased_currency,
      currency: currency || 'USD',
      credits: pack.credits,
      status: 'success',
      revenueCat: {
        transactionId: transaction_id,
        eventId: event_id
      },
      webhookData: event
    });

    // 8. Track analytics
    await Analytics.trackEvent('purchase_completed', {
      source: 'revenuecat',
      productId: product_id,
      credits: pack.credits,
      amount: price_in_purchased_currency,
      currency: currency || 'USD'
    }, user._id);

    // 9. Mark webhook as processed
    await WebhookLog.markProcessed('revenuecat', eventId, {
      creditsGranted: pack.credits,
      paymentId: payment._id
    });

    console.log(`[RC Webhook] Success: User ${user.email} credited with ${pack.credits} credits.`);

  } catch (error) {
    console.error(`[RC Webhook] Error processing event: ${error.message}`, error);
    await WebhookLog.markFailed('revenuecat', eventId, error.message);
  }
});



// --- 2. Dodo Webhook Handler ---
// This route uses express.json() which we'll apply in server.js
router.post('/dodo', express.json(), async (req, res) => {
  const eventId = req.body.data?.payment_id || `dodo_${Date.now()}`;

  // 1. Log incoming webhook and check for duplicates
  const logResult = await WebhookLog.logIncoming(
    'dodo',
    eventId,
    'payment',
    req.body,
    { ip: req.ip, userAgent: req.get('User-Agent') }
  );

  if (logResult?.isDuplicate) {
    console.log(`[Dodo Webhook] Duplicate event ${eventId}, returning 200 OK`);
    return res.status(200).send('OK');
  }

  // 2. Acknowledge the event immediately
  res.status(200).send('OK');

  // 3. Process the event asynchronously
  try {
    const app_user_id = req.body.data.customer.email;
    const product_id = req.body.data.product_cart[0].product_id;
    const transaction_id = req.body.data.payment_id;
    const price_in_purchased_currency = req.body.data.settlement_amount;
    const currency = req.body.data.settlement_currency;

    // 4. Find the user
    const user = await User.findOne({ email: app_user_id });
    if (!user) {
      console.error(`[Dodo Webhook] User not found: ${app_user_id}`);
      await WebhookLog.markFailed('dodo', eventId, 'User not found');
      return;
    }

    // 5. Get credit pack details
    const pack = DODO_CREDIT_PACKS[product_id];
    if (!pack || !pack.credits) {
      console.error(`[Dodo Webhook] Credit pack not found or has 0 credits: ${product_id}`);
      await WebhookLog.markFailed('dodo', eventId, 'Invalid product');
      return;
    }

    // 6. Grant Credits & Log Payment
    await user.addCredits(pack.credits);

    const payment = await Payment.create({
      user: user._id,
      type: 'credit_pack',
      itemId: product_id,
      itemName: pack.name,
      amount: price_in_purchased_currency,
      currency: currency || 'USD',
      credits: pack.credits,
      status: 'success',
      dodoPayment: {
        transactionId: transaction_id,
        eventId: eventId
      },
      webhookData: req.body.data
    });

    // 7. Track analytics
    await Analytics.trackEvent('purchase_completed', {
      source: 'dodo',
      productId: product_id,
      credits: pack.credits,
      amount: price_in_purchased_currency,
      currency: currency || 'USD'
    }, user._id);

    // 8. Mark webhook as processed
    await WebhookLog.markProcessed('dodo', eventId, {
      creditsGranted: pack.credits,
      paymentId: payment._id
    });

    console.log(`[Dodo Webhook] Success: User ${user.email} credited with ${pack.credits} credits.`);

  } catch (error) {
    console.error(`[Dodo Webhook] Error processing event: ${error.message}`, error);
    await WebhookLog.markFailed('dodo', eventId, error.message);
  }
});


module.exports = router;
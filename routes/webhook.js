const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const Payment = require('../models/Payment');
const WebhookLog = require('../models/WebhookLog');
const Analytics = require('../models/Analytics');
const creditLedger = require('../services/creditLedger');
const subscriptionService = require('../services/subscriptionService');
const {
  CATALOG_VERSION,
  findCatalogItemByStorefrontId
} = require('../services/pricingCatalog');

const router = express.Router();
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

  // 4. Process the event asynchronously with event-type routing (C3)
  try {
    const { app_user_id, product_id, transaction_id, id: event_id, price_in_purchased_currency, currency } = event;
    const eventType = event.type;
    console.log('[RC Webhook] Event:', eventType, app_user_id, product_id);

    // 5. Find the user
    const user = await User.findById(app_user_id);
    if (!user) {
      console.error(`[RC Webhook] User not found: ${app_user_id}`);
      await WebhookLog.markFailed('revenuecat', eventId, 'User not found');
      return;
    }

    // C3: Route by RevenueCat event type
    // Subscription lifecycle events
    const SUBSCRIPTION_EVENTS = [
      'INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE',
      'CANCELLATION', 'UNCANCELLATION', 'EXPIRATION',
      'BILLING_ISSUE_DETECTED', 'SUBSCRIBER_ALIAS'
    ];

    const isSubscriptionLifecycleEvent = SUBSCRIPTION_EVENTS.includes(eventType);

    // Resolve product
    const pack = findCatalogItemByStorefrontId('revenueCat', product_id, 'credit_pack');
    const subscriptionPlan = findCatalogItemByStorefrontId('revenueCat', product_id, 'subscription');

    // --- C3: Subscription lifecycle event routing ---
    if (isSubscriptionLifecycleEvent || subscriptionPlan) {
      switch (eventType) {
        case 'INITIAL_PURCHASE':
        case 'RENEWAL': {
          if (!subscriptionPlan) {
            // Non-subscription initial purchase (credit pack) — handled below
            break;
          }

          const isRenewal = eventType === 'RENEWAL';

          if (isRenewal && user.subscription?.status === 'active') {
            // Refresh the cycle instead of re-activating
            const refresh = await subscriptionService.refreshSubscriptionCycle({
              userId: user._id,
              now: new Date()
            });

            await Payment.create({
              user: user._id,
              type: 'subscription',
              itemId: subscriptionPlan.id,
              itemName: subscriptionPlan.name,
              amount: price_in_purchased_currency || 0,
              currency: currency || 'USD',
              credits: refresh.grantedCredits || 0,
              status: 'success',
              revenueCat: { transactionId: transaction_id, eventId: event_id },
              webhookData: event,
              metadata: {
                source: 'revenuecat',
                eventType,
                catalogVersion: CATALOG_VERSION,
                providerProductId: product_id,
                subscriptionPlanId: subscriptionPlan.id
              }
            });

            await Analytics.trackEvent('subscription_renewed', {
              source: 'revenuecat',
              planId: subscriptionPlan.id,
              grantedCredits: refresh.grantedCredits || 0,
              amount: price_in_purchased_currency || 0,
              currency: currency || 'USD'
            }, user._id);

            await WebhookLog.markProcessed('revenuecat', eventId, {
              eventType, renewed: true,
              planId: subscriptionPlan.id,
              creditsGranted: refresh.grantedCredits || 0
            });

            console.log(`[RC Webhook] Renewal processed: ${subscriptionPlan.id} for ${user.email}`);
            return;
          }

          // Initial purchase or reactivation
          const subActivation = await subscriptionService.activateSubscription({
            userId: user._id,
            planId: subscriptionPlan.id,
            provider: 'revenuecat',
            providerSubscriptionId: transaction_id || event_id,
            activateAt: new Date(),
            skipCycleGrant: false
          });

          const payment = await Payment.create({
            user: user._id,
            type: 'subscription',
            itemId: subscriptionPlan.id,
            itemName: subscriptionPlan.name,
            amount: price_in_purchased_currency || 0,
            currency: currency || 'USD',
            credits: subActivation.grantedCredits || 0,
            status: 'success',
            revenueCat: { transactionId: transaction_id, eventId: event_id },
            webhookData: event,
            metadata: {
              source: 'revenuecat',
              eventType,
              catalogVersion: CATALOG_VERSION,
              providerProductId: product_id,
              subscriptionPlanId: subscriptionPlan.id,
              providerSubscriptionId: transaction_id || event_id
            }
          });

          await Analytics.trackEvent('subscription_activated', {
            source: 'revenuecat',
            eventType,
            planId: subscriptionPlan.id,
            grantedCredits: subActivation.grantedCredits || 0,
            amount: price_in_purchased_currency || 0,
            currency: currency || 'USD'
          }, user._id);

          await WebhookLog.markProcessed('revenuecat', eventId, {
            eventType,
            subscriptionActivated: true,
            planId: subscriptionPlan.id,
            paymentId: payment._id,
            creditsGranted: subActivation.grantedCredits || 0
          });

          console.log(`[RC Webhook] ${eventType}: ${subscriptionPlan.id} for ${user.email}`);
          return;
        }

        case 'PRODUCT_CHANGE': {
          if (!subscriptionPlan) break;

          const changeResult = await subscriptionService.changeSubscriptionPlan({
            userId: user._id,
            newPlanId: subscriptionPlan.id,
            provider: 'revenuecat'
          });

          await Analytics.trackEvent('subscription_plan_changed', {
            source: 'revenuecat',
            oldPlan: changeResult.oldPlan?.id,
            newPlan: subscriptionPlan.id,
            isUpgrade: changeResult.isUpgrade,
            proratedCredits: changeResult.proratedCredits || 0
          }, user._id);

          await WebhookLog.markProcessed('revenuecat', eventId, {
            eventType,
            planChanged: true,
            oldPlan: changeResult.oldPlan?.id,
            newPlan: subscriptionPlan.id,
            isUpgrade: changeResult.isUpgrade
          });

          console.log(`[RC Webhook] Plan changed to ${subscriptionPlan.id} for ${user.email}`);
          return;
        }

        case 'CANCELLATION': {
          const cancelResult = await subscriptionService.cancelSubscription({
            userId: user._id,
            requestedAt: new Date()
          });

          await Analytics.trackEvent('subscription_cancelled', {
            source: 'revenuecat',
            planId: user.subscription?.plan,
            cancelAtPeriodEnd: cancelResult.cancelAtPeriodEnd,
            periodEnd: cancelResult.periodEnd
          }, user._id);

          await WebhookLog.markProcessed('revenuecat', eventId, {
            eventType, cancelled: cancelResult.cancelled
          });

          console.log(`[RC Webhook] Cancellation for ${user.email}`);
          return;
        }

        case 'UNCANCELLATION': {
          const restoreResult = await subscriptionService.restoreSubscription({
            userId: user._id
          });

          await Analytics.trackEvent('subscription_uncancelled', {
            source: 'revenuecat',
            planId: user.subscription?.plan
          }, user._id);

          await WebhookLog.markProcessed('revenuecat', eventId, {
            eventType, restored: restoreResult.restored
          });

          console.log(`[RC Webhook] Uncancellation for ${user.email}`);
          return;
        }

        case 'EXPIRATION': {
          const termResult = await subscriptionService.terminateSubscription({
            userId: user._id,
            terminatedAt: new Date(),
            reason: 'provider_expiration'
          });

          await Analytics.trackEvent('subscription_expired', {
            source: 'revenuecat',
            planId: user.subscription?.plan
          }, user._id);

          await WebhookLog.markProcessed('revenuecat', eventId, {
            eventType, terminated: termResult.terminated
          });

          console.log(`[RC Webhook] Expiration for ${user.email}`);
          return;
        }

        case 'BILLING_ISSUE_DETECTED': {
          const billingResult = await subscriptionService.handleBillingIssue({
            userId: user._id,
            detectedAt: new Date(),
            providerEvent: eventType
          });

          await Analytics.trackEvent('subscription_billing_issue', {
            source: 'revenuecat',
            planId: user.subscription?.plan,
            graceDeadline: billingResult.graceDeadline
          }, user._id);

          await WebhookLog.markProcessed('revenuecat', eventId, {
            eventType, handled: billingResult.handled, graceDeadline: billingResult.graceDeadline
          });

          console.log(`[RC Webhook] Billing issue detected for ${user.email}`);
          return;
        }

        case 'SUBSCRIBER_ALIAS': {
          // No action needed — RevenueCat alias event
          await WebhookLog.markProcessed('revenuecat', eventId, { eventType, action: 'ignored' });
          console.log(`[RC Webhook] Subscriber alias event for ${user.email}`);
          return;
        }

        default:
          break;
      }
    }

    // --- Credit pack purchase (non-subscription) ---
    if (!pack || !pack.credits) {
      console.error(`[RC Webhook] Catalog item not found for product: ${product_id}`);
      await WebhookLog.markFailed('revenuecat', eventId, 'Invalid product');
      return;
    }

    const payment = await Payment.create({
      user: user._id,
      type: 'credit_pack',
      itemId: pack.id,
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

    const ledgerResult = await creditLedger.creditUser({
      userId: user._id,
      amount: pack.credits,
      kind: 'purchase',
      source: 'revenuecat',
      reason: `RevenueCat purchase for ${pack.name}`,
      description: pack.description,
      reference: {
        payment: payment._id,
        catalogItemId: pack.id,
        providerTransactionId: transaction_id,
        correlationId: event_id
      },
      metadata: {
        catalogVersion: CATALOG_VERSION,
        providerProductId: product_id,
        amount: price_in_purchased_currency,
        currency: currency || 'USD'
      }
    });

    payment.creditTransaction = ledgerResult.transaction._id;
    payment.metadata = {
      source: 'revenuecat',
      catalogVersion: CATALOG_VERSION,
      providerProductId: product_id,
      ledgerTransactionId: ledgerResult.transaction._id
    };
    await payment.save();

    await Analytics.trackEvent('purchase_completed', {
      source: 'revenuecat',
      productId: product_id,
      credits: pack.credits,
      amount: price_in_purchased_currency,
      currency: currency || 'USD'
    }, user._id);

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

    // 5. Resolve product by type (credit pack or subscription)
    const pack = findCatalogItemByStorefrontId('dodo', product_id, 'credit_pack');
    const subscriptionPlan = findCatalogItemByStorefrontId('dodo', product_id, 'subscription');

    if (!pack && !subscriptionPlan) {
      console.error(`[Dodo Webhook] Catalog item not found: ${product_id}`);
      await WebhookLog.markFailed('dodo', eventId, 'Invalid product');
      return;
    }

    if (subscriptionPlan) {
      const subActivation = await subscriptionService.activateSubscription({
        userId: user._id,
        planId: subscriptionPlan.id,
        provider: 'dodo',
        providerSubscriptionId: transaction_id || eventId,
        activateAt: new Date(),
        skipCycleGrant: false
      });

      const payment = await Payment.create({
        user: user._id,
        type: 'subscription',
        itemId: subscriptionPlan.id,
        itemName: subscriptionPlan.name,
        amount: price_in_purchased_currency || 0,
        currency: currency || 'USD',
        credits: subActivation.grantedCredits || 0,
        status: 'success',
        dodoPayment: {
          transactionId: transaction_id,
          eventId: eventId
        },
        webhookData: req.body.data,
        metadata: {
          source: 'dodo',
          catalogVersion: CATALOG_VERSION,
          providerProductId: product_id,
          subscriptionPlanId: subscriptionPlan.id,
          providerSubscriptionId: transaction_id || eventId
        }
      });

      await Analytics.trackEvent('subscription_activated', {
        source: 'dodo',
        planId: subscriptionPlan.id,
        providerProductId: product_id,
        grantedCredits: subActivation.grantedCredits || 0,
        amount: price_in_purchased_currency || 0,
        currency: currency || 'USD'
      }, user._id);

      await WebhookLog.markProcessed('dodo', eventId, {
        subscriptionActivated: true,
        planId: subscriptionPlan.id,
        paymentId: payment._id,
        creditsGranted: subActivation.grantedCredits || 0
      });

      console.log(`[Dodo Webhook] Subscription activated: ${subscriptionPlan.id} for ${user.email}`);
      return;
    }

    if (!pack || !pack.credits) {
      console.error(`[Dodo Webhook] Credit pack not found or has 0 credits: ${product_id}`);
      await WebhookLog.markFailed('dodo', eventId, 'Invalid product');
      return;
    }

    const payment = await Payment.create({
      user: user._id,
      type: 'credit_pack',
      itemId: pack.id,
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

    const ledgerResult = await creditLedger.creditUser({
      userId: user._id,
      amount: pack.credits,
      kind: 'purchase',
      source: 'dodo',
      reason: `Dodo purchase for ${pack.name}`,
      description: pack.description,
      reference: {
        payment: payment._id,
        catalogItemId: pack.id,
        providerTransactionId: transaction_id,
        correlationId: eventId
      },
      metadata: {
        catalogVersion: CATALOG_VERSION,
        providerProductId: product_id,
        amount: price_in_purchased_currency,
        currency: currency || 'USD'
      }
    });

    payment.creditTransaction = ledgerResult.transaction._id;

    payment.metadata = {
      source: 'dodo',
      catalogVersion: CATALOG_VERSION,
      providerProductId: product_id,
      ledgerTransactionId: ledgerResult.transaction._id
    };
    await payment.save();

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
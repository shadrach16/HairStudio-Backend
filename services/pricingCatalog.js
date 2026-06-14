const DODO_CHECKOUT_BASE_URL = 'https://checkout.dodopayments.com/buy';
const CATALOG_VERSION = '2026-04-20.1';

const creditPacks = [
  {
    id: 'credits3',
    type: 'credit_pack',
    name: 'Beginners Pack',
    description: 'Quick starter pack for a few first try-ons.',
    credits: 3,
    displayLabel: '3 credits',
    displayOrder: 10,
    storefronts: {
      revenueCat: {
        productId: 'credits3'
      }
    }
  },
  {
    id: 'credits10',
    type: 'credit_pack',
    name: 'Novies Pack',
    description: 'Great for trying more looks before committing to a larger bundle.',
    credits: 10,
    displayLabel: '10 credits',
    displayOrder: 20,
    storefronts: {
      revenueCat: {
        productId: 'credits10'
      }
    }
  },
  {
    id: 'credits25',
    type: 'credit_pack',
    name: 'Starter Pack',
    description: 'Style-ready starter bundle for consistent experimentation.',
    credits: 25,
    displayLabel: '25 credits',
    displayOrder: 30,
    storefronts: {
      revenueCat: {
        productId: 'credits25'
      },
      dodo: {
        productId: 'pdt_pfhTvWTjDJAIDqBe8r8Ab',
        checkoutBaseUrl: DODO_CHECKOUT_BASE_URL,
        price: {
          amount: 1.49,
          currency: 'USD',
          formatted: '$1.49'
        }
      }
    }
  },
  {
    id: 'credits100',
    type: 'credit_pack',
    name: 'Essential Pack',
    description: 'Best value for regular users who want enough credits to keep exploring.',
    credits: 100,
    displayLabel: '100 credits',
    displayOrder: 40,
    popular: true,
    savings: 'Best value',
    storefronts: {
      revenueCat: {
        productId: 'credits100'
      },
      dodo: {
        productId: 'pdt_s6wp6uV54N8VlApn5MKqU',
        checkoutBaseUrl: DODO_CHECKOUT_BASE_URL,
        price: {
          amount: 5.89,
          currency: 'USD',
          formatted: '$5.89'
        }
      }
    }
  },
  {
    id: 'credits250',
    type: 'credit_pack',
    name: 'Stylist Pack',
    description: 'Power pack for creators and frequent styling sessions.',
    credits: 250,
    displayLabel: '250 credits',
    displayOrder: 50,
    savings: 'Power user',
    storefronts: {
      revenueCat: {
        productId: 'credits250'
      },
      dodo: {
        productId: 'pdt_P4zhEuGkXT30Kg3OKr9zM',
        checkoutBaseUrl: DODO_CHECKOUT_BASE_URL,
        price: {
          amount: 12.48,
          currency: 'USD',
          formatted: '$12.48'
        }
      }
    }
  },
  {
    id: 'credits1000',
    type: 'credit_pack',
    name: 'VIP Pack',
    description: 'High-volume bundle for heavy usage and large sessions.',
    credits: 1000,
    displayLabel: '1000 credits',
    displayOrder: 60,
    storefronts: {
      dodo: {
        productId: 'pdt_NQ0vZ7eaMMMZJEEMiLHWz',
        checkoutBaseUrl: DODO_CHECKOUT_BASE_URL,
        price: {
          amount: 44.99,
          currency: 'USD',
          formatted: '$44.99'
        }
      }
    }
  },
  {
    id: 'credits10000',
    type: 'credit_pack',
    name: 'Premium Pack',
    description: 'Ultimate bundle for very high-volume or commercial usage.',
    credits: 10000,
    displayLabel: '10000 credits',
    displayOrder: 70,
    savings: 'Best bulk rate',
    storefronts: {
      dodo: {
        productId: 'pdt_ZaJToyG0j8zfq1zbcDMUD',
        checkoutBaseUrl: DODO_CHECKOUT_BASE_URL,
        // Floored at ~$0.04/credit so even the bulk tier stays above AI cost.
        price: {
          amount: 399.99,
          currency: 'USD',
          formatted: '$399.99'
        }
      }
    }
  }
];

const subscriptions = [
  // Annual plans lead (best LTV). NOTE: create matching products `plus_annual` and
  // `pro_annual` in the RevenueCat dashboard (and add them to the current Offering),
  // and enable the intro free trial on `plus_annual`, for these to be purchasable.
  {
    id: 'plus_annual',
    type: 'subscription',
    name: 'Plus Annual',
    description: 'Our best value — a full year of styling, billed annually.',
    displayOrder: 10,
    interval: 'year',
    creditsPerMonth: 70,
    displayLabel: '840 credits / year (70 a month)',
    popular: true,
    recommended: true,
    trialDays: 3,
    savings: 'Save 40%',
    storefronts: {
      revenueCat: {
        productId: 'plus_annual'
      }
    }
  },
  {
    id: 'pro_annual',
    type: 'subscription',
    name: 'Pro Annual',
    description: 'High-volume yearly plan for power users, billed annually.',
    displayOrder: 20,
    interval: 'year',
    creditsPerMonth: 150,
    displayLabel: '1,800 credits / year (150 a month)',
    savings: 'Save 40%',
    storefronts: {
      revenueCat: {
        productId: 'pro_annual'
      }
    }
  },
  {
    id: 'basic_monthly',
    type: 'subscription',
    name: 'Basic Monthly',
    description: 'Monthly starter subscription for frequent try-ons.',
    displayOrder: 30,
    interval: 'month',
    creditsPerMonth: 25,
    displayLabel: '25 credits / month',
    savings: 'Starter',
    storefronts: {
      revenueCat: {
        productId: 'basic_monthly'
      }
    }
  },
  {
    id: 'plus_monthly',
    type: 'subscription',
    name: 'Plus Monthly',
    description: 'Balanced monthly plan for heavy style experimentation.',
    displayOrder: 40,
    interval: 'month',
    creditsPerMonth: 70,
    displayLabel: '70 credits / month',
    storefronts: {
      revenueCat: {
        productId: 'plus_monthly'
      }
    }
  },
  {
    id: 'pro_monthly',
    type: 'subscription',
    name: 'Pro Monthly',
    description: 'High-volume monthly plan with premium workflow allowance.',
    displayOrder: 50,
    interval: 'month',
    creditsPerMonth: 150,
    displayLabel: '150 credits / month',
    storefronts: {
      revenueCat: {
        productId: 'pro_monthly'
      }
    }
  }
];

function getCollection(type) {
  return type === 'subscription' ? subscriptions : creditPacks;
}

function validateCatalog() {
  const errors = [];
  const warnings = [];
  const seenInternalIds = new Set();
  const seenStorefrontIds = {
    revenueCat: new Set(),
    dodo: new Set()
  };

  for (const item of [...creditPacks, ...subscriptions]) {
    if (!item.id) {
      errors.push('Catalog item is missing an internal id.');
      continue;
    }

    if (seenInternalIds.has(item.id)) {
      errors.push(`Duplicate internal catalog id detected: ${item.id}`);
    }
    seenInternalIds.add(item.id);

    if (item.type === 'credit_pack' && (!Number.isFinite(item.credits) || item.credits <= 0)) {
      errors.push(`Credit pack ${item.id} must declare a positive credit amount.`);
    }

    if (item.type === 'subscription') {
      if (!Number.isFinite(item.creditsPerMonth) || item.creditsPerMonth <= 0) {
        errors.push(`Subscription ${item.id} must declare a positive creditsPerMonth value.`);
      }

      if (!item.interval || !['month', 'year'].includes(item.interval)) {
        errors.push(`Subscription ${item.id} must declare a valid interval (month/year).`);
      }
    }

    const storefronts = item.storefronts || {};

    if (!storefronts.revenueCat && !storefronts.dodo) {
      warnings.push(`Catalog item ${item.id} is not purchasable on any active storefront.`);
    }

    if (storefronts.revenueCat?.productId) {
      if (seenStorefrontIds.revenueCat.has(storefronts.revenueCat.productId)) {
        errors.push(`Duplicate RevenueCat product id detected: ${storefronts.revenueCat.productId}`);
      }
      seenStorefrontIds.revenueCat.add(storefronts.revenueCat.productId);
    }

    if (storefronts.dodo?.productId) {
      if (seenStorefrontIds.dodo.has(storefronts.dodo.productId)) {
        errors.push(`Duplicate Dodo product id detected: ${storefronts.dodo.productId}`);
      }
      seenStorefrontIds.dodo.add(storefronts.dodo.productId);

      if (!storefronts.dodo.price || !Number.isFinite(storefronts.dodo.price.amount)) {
        errors.push(`Dodo storefront mapping for ${item.id} is missing a valid price.`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings
  };
}

const catalogValidation = validateCatalog();

if (!catalogValidation.isValid) {
  throw new Error(`Invalid pricing catalog configuration: ${catalogValidation.errors.join('; ')}`);
}

function cloneCatalogItem(item) {
  return JSON.parse(JSON.stringify(item));
}

function getPublicPricingCatalog() {
  return {
    version: CATALOG_VERSION,
    paymentMethods: {
      mobile: 'RevenueCat (Google Play / App Store)',
      web: 'Dodo Payments'
    },
    creditPacks: creditPacks.map(cloneCatalogItem),
    subscriptions: subscriptions.map(cloneCatalogItem),
    validation: catalogValidation
  };
}

function findCatalogItemById(type, id) {
  return getCollection(type).find((item) => item.id === id) || null;
}

function findCatalogItemByStorefrontId(provider, storefrontId, type = 'credit_pack') {
  const providerKey = provider === 'revenuecat' ? 'revenueCat' : provider;
  return getCollection(type).find((item) => item.storefronts?.[providerKey]?.productId === storefrontId) || null;
}

function resolveCatalogItem(type, identifier) {
  return (
    findCatalogItemById(type, identifier) ||
    findCatalogItemByStorefrontId('revenueCat', identifier, type) ||
    findCatalogItemByStorefrontId('dodo', identifier, type)
  );
}

module.exports = {
  CATALOG_VERSION,
  catalogValidation,
  getPublicPricingCatalog,
  findCatalogItemById,
  findCatalogItemByStorefrontId,
  resolveCatalogItem
};
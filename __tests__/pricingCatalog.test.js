const express = require('express');
const request = require('supertest');

const paymentsRouter = require('../routes/payments');
const {
  catalogValidation,
  findCatalogItemByStorefrontId,
  getPublicPricingCatalog,
  resolveCatalogItem
} = require('../services/pricingCatalog');

describe('pricing catalog service', () => {
  test('catalog validation passes', () => {
    expect(catalogValidation.isValid).toBe(true);
    expect(catalogValidation.errorCount).toBe(0);
  });

  test('RevenueCat and Dodo product ids resolve to the same internal ids', () => {
    expect(findCatalogItemByStorefrontId('revenueCat', 'credits25', 'credit_pack')?.id).toBe('credits25');
    expect(findCatalogItemByStorefrontId('dodo', 'pdt_pfhTvWTjDJAIDqBe8r8Ab', 'credit_pack')?.id).toBe('credits25');
    expect(resolveCatalogItem('credit_pack', 'credits100')?.id).toBe('credits100');
  });

  test('public catalog exposes versioned source-of-truth data', () => {
    const catalog = getPublicPricingCatalog();
    expect(catalog.version).toBeTruthy();
    expect(Array.isArray(catalog.creditPacks)).toBe(true);
    expect(catalog.creditPacks.length).toBeGreaterThan(0);
    expect(catalog.validation.isValid).toBe(true);
  });
});

describe('payments catalog routes', () => {
  const app = express();
  app.use('/api/payments', paymentsRouter);

  test('GET /api/payments/catalog returns canonical catalog', async () => {
    const response = await request(app).get('/api/payments/catalog');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.validation.isValid).toBe(true);
    expect(response.body.data.creditPacks.some((pack) => pack.id === 'credits25')).toBe(true);
  });

  test('GET /api/payments/plans remains backward compatible', async () => {
    const response = await request(app).get('/api/payments/plans');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.creditPacks.some((pack) => pack.storefronts?.dodo?.productId === 'pdt_pfhTvWTjDJAIDqBe8r8Ab')).toBe(true);
  });
});
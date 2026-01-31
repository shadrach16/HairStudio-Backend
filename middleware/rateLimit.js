// middleware/rateLimit.js
// Rate limiting middleware with different tiers for different endpoints

const rateLimit = require('express-rate-limit');
const Analytics = require('../models/Analytics');

/**
 * Log rate limit hit for abuse monitoring
 */
const logRateLimitHit = async (req, endpoint) => {
  try {
    await Analytics.trackEvent('rate_limit_hit', {
      endpoint,
      ip: req.ip,
      userId: req.user?.id,
      userAgent: req.get('User-Agent')
    }, req.user?.id);
  } catch (error) {
    console.error('Failed to log rate limit hit:', error);
  }
};

/**
 * Standard API rate limit (general endpoints)
 * 100 requests per minute per IP
 */
const standardLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logRateLimitHit(req, 'standard');
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: 60
    });
  }
});

/**
 * Auth rate limit (login, signup, password reset)
 * 10 requests per 15 minutes per IP
 */
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logRateLimitHit(req, 'auth');
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: 900
    });
  }
});

/**
 * Generation rate limit (expensive AI operations)
 * 20 requests per 5 minutes per user/IP
 */
const generationLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    message: 'Generation limit reached. Please wait before trying again.',
    retryAfter: 300
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logRateLimitHit(req, 'generation');
    res.status(429).json({
      success: false,
      message: 'Generation limit reached. Please wait before trying again.',
      retryAfter: 300
    });
  }
});

/**
 * Reward/credit grant rate limit (prevent abuse)
 * 10 requests per hour per user
 */
const rewardLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    message: 'Reward limit reached. Please try again later.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logRateLimitHit(req, 'reward');
    res.status(429).json({
      success: false,
      message: 'Reward limit reached. Please try again later.',
      retryAfter: 3600
    });
  }
});

/**
 * Guest session rate limit (prevent bot abuse)
 * 5 guest sessions per hour per IP
 */
const guestLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) => req.ip,
  message: {
    success: false,
    message: 'Too many guest sessions. Please sign in or try again later.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logRateLimitHit(req, 'guest');
    res.status(429).json({
      success: false,
      message: 'Too many guest sessions. Please sign in or try again later.',
      retryAfter: 3600
    });
  }
});

/**
 * Export rate limit (prevent mass downloads)
 * 30 exports per hour per user
 */
const exportLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    message: 'Export limit reached. Please try again later.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logRateLimitHit(req, 'export');
    res.status(429).json({
      success: false,
      message: 'Export limit reached. Please try again later.',
      retryAfter: 3600
    });
  }
});

/**
 * Webhook rate limit (protect from replay attacks)
 * 100 requests per minute per source
 */
const webhookLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  keyGenerator: (req) => req.get('X-Webhook-Source') || req.ip,
  message: 'Too many webhook requests',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  standardLimit,
  authLimit,
  generationLimit,
  rewardLimit,
  guestLimit,
  exportLimit,
  webhookLimit
};

const express = require('express');
const { body, validationResult } = require('express-validator');
const Analytics = require('../models/Analytics');
const Generation = require('../models/Generation');
const Payment = require('../models/Payment');
const User = require('../models/User');
const {protect} = require('../middleware/auth');
const aiBenchmark = require('../services/aiBenchmark');

const router = express.Router();

function requireBenchmarkToken(req, res, next) {
  const expectedToken = process.env.AI_BENCHMARK_RUN_TOKEN;
  const providedToken = req.get('x-benchmark-token');

  if (!expectedToken || providedToken !== expectedToken) {
    return res.status(403).json({
      success: false,
      message: 'Benchmark token is required'
    });
  }

  return next();
}

// Track event
router.post('/track', [
  body('eventName').notEmpty().withMessage('Event name is required'),
  body('eventData').optional().isObject(),
  body('sessionId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { eventName, eventData = {}, sessionId } = req.body;

    const analyticsEvent = new Analytics({
      userId: req.user?._id || null,
      eventName,
      eventData,
      sessionId,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      referrer: req.get('Referer'),
      page: eventData.page || req.get('Referer'),
      timestamp: new Date()
    });

    await analyticsEvent.save();

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track event'
    });
  }
});

// Get user analytics dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query; // days
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get user's generation stats
    const generationStats = await Generation.aggregate([
      { $match: { user: userId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user's payment stats
    const paymentStats = await Payment.aggregate([
      { $match: { user: userId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get daily activity
    const dailyActivity = await Analytics.aggregate([
      { $match: { userId, timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          events: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get popular hairstyles for this user
    const popularHairstyles = await Generation.aggregate([
      { $match: { user: userId, createdAt: { $gte: startDate } } },
      { $lookup: { from: 'hairstyles', localField: 'hairstyle', foreignField: '_id', as: 'hairstyleDoc' } },
      { $unwind: '$hairstyleDoc' },
      {
        $group: {
          _id: '$hairstyle',
          name: { $first: '$hairstyleDoc.name' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get total stats
    const totalGenerations = await Generation.countDocuments({ user: userId });
    const totalPayments = await Payment.countDocuments({ user: userId, status: 'success' });
    const totalSpent = await Payment.aggregate([
      { $match: { user: userId, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        period: parseInt(period),
        totals: {
          generations: totalGenerations,
          payments: totalPayments,
          spent: totalSpent[0]?.total || 0,
          credits: req.user.totalCredits
        },
        generationStats,
        paymentStats,
        dailyActivity,
        popularHairstyles
      }
    });

  } catch (error) {
    console.error('Get analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics data'
    });
  }
});

// Get user activity timeline
router.get('/timeline', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const events = await Analytics.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('eventName eventData timestamp');

    const total = await Analytics.countDocuments({ userId });

    res.json({
      success: true,
      data: events,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get activity timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity timeline'
    });
  }
});

// Get latest AI benchmark summary
router.get('/ai-benchmark/summary', async (req, res) => {
  try {
    const summary = await aiBenchmark.getLatestBenchmarkSummary();

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'No AI benchmark summary has been generated yet'
      });
    }

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get AI benchmark summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load AI benchmark summary'
    });
  }
});

// Run AI benchmark selection workflow
router.post('/ai-benchmark/run', requireBenchmarkToken, async (req, res) => {
  try {
    const { candidateIds, caseIds } = req.body || {};
    const summary = await aiBenchmark.runBenchmark({ candidateIds, caseIds });

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Run AI benchmark error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to run AI benchmark'
    });
  }
});

// ==================== FUNNEL & COHORT ANALYTICS (ADMIN) ====================

/**
 * @route GET /api/analytics/funnel
 * @desc Get activation funnel metrics
 * @access Admin (or add restrictTo('admin') middleware)
 */
router.get('/funnel', protect, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    // Define funnel stages
    const funnelStages = [
      'user_registered',
      'photo_uploaded',
      'hairstyle_selected',
      'generation_started',
      'generation_completed',
      'export_image',
      'purchase_completed'
    ];

    // Get unique users at each stage
    const funnelData = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          eventName: { $in: funnelStages }
        }
      },
      {
        $group: {
          _id: {
            eventName: '$eventName',
            userId: '$userId'
          }
        }
      },
      {
        $group: {
          _id: '$_id.eventName',
          uniqueUsers: { $sum: 1 }
        }
      }
    ]);

    // Build ordered funnel
    const funnel = funnelStages.map((stage, index) => {
      const stageData = funnelData.find(d => d._id === stage) || { uniqueUsers: 0 };
      const prevStage = index > 0 ? funnelStages[index - 1] : null;
      const prevData = prevStage ? (funnelData.find(d => d._id === prevStage) || { uniqueUsers: 0 }) : null;
      
      return {
        stage,
        users: stageData.uniqueUsers,
        conversionRate: prevData && prevData.uniqueUsers > 0 
          ? ((stageData.uniqueUsers / prevData.uniqueUsers) * 100).toFixed(1)
          : index === 0 ? '100.0' : '0.0',
        dropoff: prevData 
          ? prevData.uniqueUsers - stageData.uniqueUsers 
          : 0
      };
    });

    res.json({
      success: true,
      data: {
        period: { days: parseInt(days), startDate, endDate },
        funnel,
        summary: {
          totalRegistered: funnel[0]?.users || 0,
          totalConverted: funnel[funnel.length - 1]?.users || 0,
          overallConversion: funnel[0]?.users > 0 
            ? ((funnel[funnel.length - 1]?.users / funnel[0]?.users) * 100).toFixed(2) 
            : '0'
        }
      }
    });

  } catch (error) {
    console.error('Get funnel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get funnel data'
    });
  }
});

/**
 * @route GET /api/analytics/retention
 * @desc Get D1, D7, D30 retention cohorts
 * @access Admin
 */
router.get('/retention', protect, async (req, res) => {
  try {
    const { cohortDays = 30 } = req.query;
    
    // Get users registered in the last N days, grouped by registration date
    const cohortStart = new Date(Date.now() - parseInt(cohortDays) * 24 * 60 * 60 * 1000);
    
    // Get all users registered in the period
    const registeredUsers = await User.find({
      createdAt: { $gte: cohortStart }
    }).select('_id createdAt');

    const cohorts = {};
    
    for (const user of registeredUsers) {
      const cohortDate = user.createdAt.toISOString().split('T')[0];
      if (!cohorts[cohortDate]) {
        cohorts[cohortDate] = {
          date: cohortDate,
          registered: 0,
          d1: 0,
          d7: 0,
          d30: 0
        };
      }
      cohorts[cohortDate].registered++;
    }

    // Calculate retention for each cohort
    for (const cohortDate of Object.keys(cohorts)) {
      const cohortUsers = registeredUsers
        .filter(u => u.createdAt.toISOString().split('T')[0] === cohortDate)
        .map(u => u._id);
      
      const cohortDateObj = new Date(cohortDate);
      
      // D1 retention (active 1 day after signup)
      const d1Start = new Date(cohortDateObj.getTime() + 1 * 24 * 60 * 60 * 1000);
      const d1End = new Date(cohortDateObj.getTime() + 2 * 24 * 60 * 60 * 1000);
      const d1Active = await Analytics.distinct('userId', {
        userId: { $in: cohortUsers },
        timestamp: { $gte: d1Start, $lt: d1End }
      });
      cohorts[cohortDate].d1 = d1Active.length;
      
      // D7 retention
      const d7Start = new Date(cohortDateObj.getTime() + 7 * 24 * 60 * 60 * 1000);
      const d7End = new Date(cohortDateObj.getTime() + 8 * 24 * 60 * 60 * 1000);
      const d7Active = await Analytics.distinct('userId', {
        userId: { $in: cohortUsers },
        timestamp: { $gte: d7Start, $lt: d7End }
      });
      cohorts[cohortDate].d7 = d7Active.length;
      
      // D30 retention
      const d30Start = new Date(cohortDateObj.getTime() + 30 * 24 * 60 * 60 * 1000);
      const d30End = new Date(cohortDateObj.getTime() + 31 * 24 * 60 * 60 * 1000);
      const d30Active = await Analytics.distinct('userId', {
        userId: { $in: cohortUsers },
        timestamp: { $gte: d30Start, $lt: d30End }
      });
      cohorts[cohortDate].d30 = d30Active.length;
    }

    // Convert to array and calculate rates
    const cohortArray = Object.values(cohorts).map(c => ({
      ...c,
      d1Rate: c.registered > 0 ? ((c.d1 / c.registered) * 100).toFixed(1) : '0.0',
      d7Rate: c.registered > 0 ? ((c.d7 / c.registered) * 100).toFixed(1) : '0.0',
      d30Rate: c.registered > 0 ? ((c.d30 / c.registered) * 100).toFixed(1) : '0.0'
    })).sort((a, b) => b.date.localeCompare(a.date));

    // Calculate averages
    const avgD1 = cohortArray.length > 0 
      ? (cohortArray.reduce((sum, c) => sum + parseFloat(c.d1Rate), 0) / cohortArray.length).toFixed(1)
      : '0.0';
    const avgD7 = cohortArray.length > 0 
      ? (cohortArray.reduce((sum, c) => sum + parseFloat(c.d7Rate), 0) / cohortArray.length).toFixed(1)
      : '0.0';
    const avgD30 = cohortArray.length > 0 
      ? (cohortArray.reduce((sum, c) => sum + parseFloat(c.d30Rate), 0) / cohortArray.length).toFixed(1)
      : '0.0';

    res.json({
      success: true,
      data: {
        cohorts: cohortArray,
        averages: {
          d1: avgD1,
          d7: avgD7,
          d30: avgD30
        }
      }
    });

  } catch (error) {
    console.error('Get retention error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get retention data'
    });
  }
});

/**
 * @route GET /api/analytics/revenue
 * @desc Get revenue metrics
 * @access Admin
 */
router.get('/revenue', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    // Daily revenue
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 },
          credits: { $sum: '$credits' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by product
    const revenueByProduct = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$itemId',
          name: { $first: '$itemName' },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Totals
    const totals = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          avgOrderValue: { $avg: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period: { days: parseInt(days), startDate },
        dailyRevenue,
        revenueByProduct,
        totals: totals[0] || { totalRevenue: 0, totalTransactions: 0, avgOrderValue: 0 }
      }
    });

  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue data'
    });
  }
});

/**
 * @route GET /api/analytics/events
 * @desc Get event counts for period
 * @access Admin
 */
router.get('/events', protect, async (req, res) => {
  try {
    const { days = 7, events } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    const endDate = new Date();
    
    const eventNames = events ? events.split(',') : [];
    const eventCounts = await Analytics.getEventCounts(startDate, endDate, eventNames);

    res.json({
      success: true,
      data: {
        period: { days: parseInt(days), startDate, endDate },
        events: eventCounts
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get event data'
    });
  }
});

/**
 * @route GET /api/analytics/dau
 * @desc Get daily active users
 * @access Admin
 */
router.get('/dau', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const dauData = await Analytics.getDailyActiveUsers(startDate, endDate);

    res.json({
      success: true,
      data: {
        period: { days: parseInt(days), startDate, endDate },
        dau: dauData
      }
    });

  } catch (error) {
    console.error('Get DAU error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get DAU data'
    });
  }
});

// ==================== A4: QUALITY & COST ANALYTICS ====================

/**
 * @route GET /api/analytics/quality
 * @desc A4: Quality metrics dashboard — mode distribution, pass rates, retry stats, defects
 * @access Admin / Authenticated
 */
router.get('/quality', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    // Mode distribution + quality pass rates
    const modeStats = await Generation.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $in: ['completed', 'failed'] } } },
      {
        $group: {
          _id: { mode: '$generationMode', status: '$status' },
          count: { $sum: 1 },
          avgQuality: { $avg: '$qualityScore.score' },
          qualityPassed: { $sum: { $cond: ['$qualityScore.passed', 1, 0] } },
          qualityFailed: { $sum: { $cond: [{ $eq: ['$qualityScore.passed', false] }, 1, 0] } },
          totalCredits: { $sum: '$creditsUsed' },
          avgRetries: { $avg: '$retryCount' },
        }
      },
      { $sort: { '_id.mode': 1 } }
    ]);

    // Build per-mode summary
    const modes = {};
    for (const stat of modeStats) {
      const mode = stat._id.mode || 'standard';
      if (!modes[mode]) {
        modes[mode] = { mode, completed: 0, failed: 0, totalCredits: 0, avgQuality: 0, qualityPassRate: 0, avgRetries: 0, qualityPassed: 0, qualityFailed: 0 };
      }
      const m = modes[mode];
      if (stat._id.status === 'completed') {
        m.completed = stat.count;
        m.avgQuality = Math.round((stat.avgQuality || 0) * 10) / 10;
        m.qualityPassed = stat.qualityPassed;
        m.qualityFailed = stat.qualityFailed;
        m.avgRetries = Math.round((stat.avgRetries || 0) * 100) / 100;
      } else {
        m.failed = stat.count;
      }
      m.totalCredits += stat.totalCredits || 0;
    }

    // Calculate pass rates
    for (const m of Object.values(modes)) {
      const total = m.qualityPassed + m.qualityFailed;
      m.qualityPassRate = total > 0 ? Math.round((m.qualityPassed / total) * 1000) / 10 : 0;
      m.successRate = (m.completed + m.failed) > 0
        ? Math.round((m.completed / (m.completed + m.failed)) * 1000) / 10
        : 0;
    }

    // Top defects
    const topDefects = await Generation.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          'qualityScore.defect': { $ne: null }
        }
      },
      {
        $group: {
          _id: { defect: '$qualityScore.defect', severity: '$qualityScore.defectSeverity' },
          count: { $sum: 1 },
          avgScore: { $avg: '$qualityScore.score' },
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Daily quality trend
    const dailyQuality = await Generation.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed',
          'qualityScore.score': { $ne: null }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          avgScore: { $avg: '$qualityScore.score' },
          count: { $sum: 1 },
          passed: { $sum: { $cond: ['$qualityScore.passed', 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$qualityScore.passed', false] }, 1, 0] } },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Overall generation success rate (after retries)
    const overallStats = await Generation.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          totalCreditsSpent: { $sum: '$creditsUsed' },
          avgProcessingTime: { $avg: '$processingTime' },
          totalRetries: { $sum: '$retryCount' },
        }
      }
    ]);

    const overall = overallStats[0] || { total: 0, completed: 0, failed: 0, totalCreditsSpent: 0, avgProcessingTime: 0, totalRetries: 0 };
    overall.successRate = overall.total > 0 ? Math.round((overall.completed / overall.total) * 1000) / 10 : 0;

    // Revenue by mode (cost analytics)
    const costByMode = await Generation.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: '$generationMode',
          totalCredits: { $sum: '$creditsUsed' },
          count: { $sum: 1 },
          avgCredits: { $avg: '$creditsUsed' },
        }
      },
      { $sort: { totalCredits: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        period: { days: parseInt(days), startDate },
        overall,
        modes: Object.values(modes),
        costByMode: costByMode.map(c => ({
          mode: c._id || 'standard',
          totalCredits: c.totalCredits,
          count: c.count,
          avgCreditsPerGen: Math.round((c.avgCredits || 0) * 100) / 100,
        })),
        topDefects: topDefects.map(d => ({
          defect: d._id.defect,
          severity: d._id.severity,
          count: d.count,
          avgScore: Math.round((d.avgScore || 0) * 10) / 10,
        })),
        dailyQuality: dailyQuality.map(d => ({
          date: d._id,
          avgScore: Math.round((d.avgScore || 0) * 10) / 10,
          count: d.count,
          passRate: d.count > 0 ? Math.round((d.passed / d.count) * 1000) / 10 : 0,
        })),
      }
    });

  } catch (error) {
    console.error('Get quality analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to get quality data' });
  }
});

/**
 * @route GET /api/analytics/quality/modes
 * @desc A4: Quick mode-only breakdown for mobile dashboard cards
 * @access Authenticated
 */
router.get('/quality/modes', protect, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const stats = await Generation.aggregate([
      { $match: { user: req.user._id, createdAt: { $gte: startDate }, status: { $in: ['completed', 'failed'] } } },
      {
        $group: {
          _id: '$generationMode',
          count: { $sum: 1 },
          avgScore: { $avg: '$qualityScore.score' },
          passed: { $sum: { $cond: ['$qualityScore.passed', 1, 0] } },
          creditsUsed: { $sum: '$creditsUsed' },
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        modes: stats.map(s => ({
          mode: s._id || 'standard',
          count: s.count,
          avgScore: Math.round((s.avgScore || 0) * 10) / 10,
          passRate: s.count > 0 ? Math.round((s.passed / s.count) * 1000) / 10 : 0,
          creditsUsed: s.creditsUsed,
        }))
      }
    });
  } catch (error) {
    console.error('Get mode stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to get mode stats' });
  }
});

// ==================== G2: COLLECTION & RECOMMENDATION ANALYTICS ====================

/**
 * @route GET /api/analytics/collections
 * @desc Get per-collection performance metrics (CTR, conversion rate)
 * @access Protected
 */
router.get('/collections', protect, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 30, 90);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get collection events from Analytics (canonical source per review)
    const [shelfViews, detailViews, conversions] = await Promise.all([
      // Shelf views: how many times each collection was shown
      Analytics.aggregate([
        { $match: { eventName: 'collection_shelf_viewed', timestamp: { $gte: startDate } } },
        { $unwind: '$properties.collectionSlugs' },
        { $group: { _id: '$properties.collectionSlugs', views: { $sum: 1 }, uniqueUsers: { $addToSet: '$userId' } } },
        { $project: { slug: '$_id', views: 1, uniqueUsers: { $size: '$uniqueUsers' } } }
      ]),
      // Detail views (clicks into a collection)
      Analytics.aggregate([
        { $match: { eventName: 'collection_detail_viewed', timestamp: { $gte: startDate } } },
        { $group: { _id: '$properties.collectionSlug', clicks: { $sum: 1 } } },
        { $project: { slug: '$_id', clicks: 1 } }
      ]),
      // Conversions (user selected a hairstyle from collection)
      Analytics.aggregate([
        { $match: { eventName: 'collection_conversion', timestamp: { $gte: startDate } } },
        { $group: { _id: '$properties.collectionSlug', conversions: { $sum: 1 } } },
        { $project: { slug: '$_id', conversions: 1 } }
      ])
    ]);

    // Merge into per-collection metrics
    const Collection = require('../models/Collection');
    const collections = await Collection.find({ isActive: true }).select('name slug emoji type').lean();

    const metrics = collections.map(col => {
      const sv = shelfViews.find(s => s.slug === col.slug) || { views: 0, uniqueUsers: 0 };
      const dv = detailViews.find(d => d.slug === col.slug) || { clicks: 0 };
      const cv = conversions.find(c => c.slug === col.slug) || { conversions: 0 };

      const ctr = sv.views > 0 ? (dv.clicks / sv.views * 100) : 0;
      const conversionRate = dv.clicks > 0 ? (cv.conversions / dv.clicks * 100) : 0;

      return {
        name: col.name,
        slug: col.slug,
        emoji: col.emoji,
        type: col.type,
        views: sv.views,
        uniqueViewers: sv.uniqueUsers,
        clicks: dv.clicks,
        conversions: cv.conversions,
        ctr: parseFloat(ctr.toFixed(1)),
        conversionRate: parseFloat(conversionRate.toFixed(1))
      };
    });

    // Sort by views descending
    metrics.sort((a, b) => b.views - a.views);

    res.json({
      success: true,
      data: {
        period: { days, startDate, endDate: new Date() },
        collections: metrics,
        summary: {
          totalViews: metrics.reduce((s, m) => s + m.views, 0),
          totalClicks: metrics.reduce((s, m) => s + m.clicks, 0),
          totalConversions: metrics.reduce((s, m) => s + m.conversions, 0),
          avgCtr: metrics.length > 0
            ? parseFloat((metrics.reduce((s, m) => s + m.ctr, 0) / metrics.length).toFixed(1))
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Get collection analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to get collection analytics' });
  }
});

/**
 * @route GET /api/analytics/recommendations
 * @desc Get recommendation performance by source and variant
 * @access Protected
 */
router.get('/recommendations', protect, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 30, 90);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Aggregate recommendation_served events by source and variant
    const recMetrics = await Analytics.aggregate([
      { $match: { eventName: 'recommendation_served', timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            source: '$properties.recommendationSource',
            variant: '$properties.variant'
          },
          impressions: { $sum: 1 },
          totalItemsServed: { $sum: '$properties.count' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          source: '$_id.source',
          variant: '$_id.variant',
          impressions: 1,
          totalItemsServed: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { impressions: -1 } }
    ]);

    // Aggregate by source only (for totals)
    const bySource = {};
    recMetrics.forEach(m => {
      if (!bySource[m.source]) {
        bySource[m.source] = { source: m.source, impressions: 0, totalItemsServed: 0, variants: [] };
      }
      bySource[m.source].impressions += m.impressions;
      bySource[m.source].totalItemsServed += m.totalItemsServed;
      bySource[m.source].variants.push({
        variant: m.variant,
        impressions: m.impressions,
        uniqueUsers: m.uniqueUsers
      });
    });

    res.json({
      success: true,
      data: {
        period: { days, startDate, endDate: new Date() },
        bySource: Object.values(bySource),
        totalImpressions: recMetrics.reduce((s, m) => s + m.impressions, 0)
      }
    });
  } catch (error) {
    console.error('Get recommendation analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to get recommendation analytics' });
  }
});

module.exports = router;
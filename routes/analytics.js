const express = require('express');
const { body, validationResult } = require('express-validator');
const Analytics = require('../models/Analytics');
const Generation = require('../models/Generation');
const Payment = require('../models/Payment');
const User = require('../models/User');
const {protect} = require('../middleware/auth');

const router = express.Router();

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
      { $match: { userId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user's payment stats
    const paymentStats = await Payment.aggregate([
      { $match: { userId, createdAt: { $gte: startDate } } },
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
      { $match: { userId, createdAt: { $gte: startDate } } },
      { $lookup: { from: 'hairstyles', localField: 'hairstyleId', foreignField: '_id', as: 'hairstyle' } },
      { $unwind: '$hairstyle' },
      {
        $group: {
          _id: '$hairstyleId',
          name: { $first: '$hairstyle.name' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get total stats
    const totalGenerations = await Generation.countDocuments({ userId });
    const totalPayments = await Payment.countDocuments({ userId, status: 'success' });
    const totalSpent = await Payment.aggregate([
      { $match: { userId, status: 'success' } },
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

module.exports = router;
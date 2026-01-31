const express = require('express');
const Hairstyle = require('../models/Hairstyle');
const { optionalAuth } = require('../middleware/auth');
const Analytics = require('../models/Analytics');

const router = express.Router();

// @desc    Get all hairstyles
// @route   GET /api/hairstyles
// @access  Public
// @desc    Get all hairstyles
// @route   GET /api/hairstyles
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      category,
      gender,
      feature,
      search,
      page = 1,
      limit = 20,
      sort = 'popularity',
      type = 'default'
    } = req.query;

    const filters = { isActive: true };
    const orConditions = [];
    const isCustom = type === 'custom';


  if (isCustom) {
      // Must be authenticated and only see their own custom styles
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required to view custom hairstyles.'
        });
      }
      filters.isCustom = true;
      filters.userId = req.user._id; // Filter by the authenticated user's ID
      filters.isActive = false;

    } else {
      filters.isActive = true;
    }



   if (!isCustom && category && category !== 'All') {
      filters.category = category;
    }

 

    if (!isCustom && gender && gender !== 'All') {
      if (gender === 'unisex') {
        filters.gender = 'unisex'; // More specific filter if only unisex is chosen
      } else {
        // Find the selected gender OR unisex
        orConditions.push({
          $or: [
            { gender: gender.toLowerCase() },
            { gender: 'unisex' }
          ]
        });
      }
    }


 


        if ( !isCustom && feature && feature !== 'Latest') {
      if (feature === 'Basic') {
      orConditions.push({
          $or: [
            { price: 1 }, 
          ]
        });


      } else if (feature === 'Trending') {
      
       orConditions.push({
          $or: [
            { price: 2 },
            { price: 3 },
          ]
        });

      } else {
  orConditions.push({
          $or: [
            { price: 4 },
            { price: 5 },
          ]
        });

      }
    }



    // Search functionality
  if (search) {
      // Find matches in any of these fields
      orConditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
          { culturalOrigin: { $regex: search, $options: 'i' } }
        ]
      });
    }

    // If we have multiple $or conditions, they must all be met ($and)
    if (orConditions.length > 0) {
      filters.$and = (filters.$and || []).concat(orConditions);
    }

    // Sorting
    let sortOptions = {};
    if (sort === 'popularity') sortOptions = { popularity: -1, createdAt: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };
    else if (sort === 'name') sortOptions = { name: 1 };
    else if (sort === 'price') sortOptions = { price: 1 };

    console.log('filters',JSON.stringify(filters))

    const total = await Hairstyle.countDocuments(filters);
    const limitNum = parseInt(limit);
    const totalPages = Math.ceil(total / limitNum);

    // Ensure page is valid
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;
    
    const hairstyles = await Hairstyle.find(filters)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // console.log('hairstyles',hairstyles)

    res.status(200).json({
      status: 'success',
      results: hairstyles.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total,
        pages: totalPages
      },
      data: { hairstyles }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get single hairstyle
// @route   GET /api/hairstyles/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const hairstyle = await Hairstyle.findById(req.params.id);

    if (!hairstyle || !hairstyle.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Hairstyle not found'
      });
    }

    // Track hairstyle view
    if (req.user) {
      await Analytics.trackEvent('hairstyle_viewed', {
        hairstyle_id: hairstyle._id,
        hairstyle_name: hairstyle.name,
        category: hairstyle.category
      }, req.user.id);
    }

    res.status(200).json({
      status: 'success',
      data: { hairstyle }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get popular hairstyles
// @route   GET /api/hairstyles/popular/:limit?
// @access  Public
router.get('/popular/:limit?', async (req, res, next) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    
    const hairstyles = await Hairstyle.getPopular(limit);

    res.status(200).json({
      status: 'success',
      results: hairstyles.length,
      data: { hairstyles }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get featured hairstyles for mobile quick picks
// @route   GET /api/hairstyles/featured
// @access  Public
router.get('/featured', async (req, res, next) => {
  try {
    // Get a mix of popular, new, and affordable styles for quick mobile browsing
    const [popular, newest, affordable] = await Promise.all([
      // Top 4 popular
      Hairstyle.find({ isActive: true })
        .sort({ popularity: -1 })
        .limit(4)
        .select('_id name thumbnail price category gender tags'),
      // 4 newest
      Hairstyle.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(4)
        .select('_id name thumbnail price category gender tags'),
      // 4 affordable (price 1-2)
      Hairstyle.find({ isActive: true, price: { $lte: 2 } })
        .sort({ popularity: -1 })
        .limit(4)
        .select('_id name thumbnail price category gender tags')
    ]);

    // Deduplicate by ID
    const seen = new Set();
    const dedupe = (arr) => arr.filter(h => {
      const id = h._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    const featured = {
      trending: dedupe(popular),
      newArrivals: dedupe(newest),
      budgetFriendly: dedupe(affordable)
    };

    res.status(200).json({
      status: 'success',
      data: featured
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get hairstyle categories
// @route   GET /api/hairstyles/meta/categories
// @access  Public
router.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await Hairstyle.distinct('category', { isActive: true });
    
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await Hairstyle.countDocuments({ 
          category, 
          isActive: true 
        });
        return { name: category, count };
      })
    );

    res.status(200).json({
      status: 'success',
      data: { categories: categoriesWithCounts }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search hairstyles
// @route   POST /api/hairstyles/search
// @access  Public
router.post('/search', optionalAuth, async (req, res, next) => {
  try {
    const { query, filters = {}, page = 1, limit = 20 } = req.body;

    const hairstyles = await Hairstyle.search(query, filters);
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = hairstyles.slice(skip, skip + parseInt(limit));

    // Track search
    if (req.user) {
      await Analytics.trackEvent('hairstyles_searched', {
        query,
        filters,
        results_count: hairstyles.length
      }, req.user.id);
    }

    res.status(200).json({
      status: 'success',
      results: paginatedResults.length,
      total: hairstyles.length,
      data: { hairstyles: paginatedResults }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
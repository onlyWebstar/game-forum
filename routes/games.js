// routes/games.js
const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   GET /api/games
// @desc    Get all games with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      genre,
      platform,
      sort = 'recent',
      page = 1,
      limit = 20,
      featured
    } = req.query;

    const query = { isActive: true };

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (genre) {
      query.genres = genre;
    }
    if (platform) {
      query.platforms = platform;
    }
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sort
    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { postsCount: -1, followersCount: -1 };
        break;
      case 'rating':
        sortOption = { metacriticScore: -1 };
        break;
      case 'title':
        sortOption = { title: 1 };
        break;
      case 'oldest':
        sortOption = { releaseDate: 1 };
        break;
      case 'recent':
      default:
        sortOption = { releaseDate: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [games, total] = await Promise.all([
      Game.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('addedBy', 'username avatar')
        .lean(),
      Game.countDocuments(query)
    ]);

    res.json({
      success: true,
      games,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/games/:id
// @desc    Get game by ID or slug
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findOne({
      $or: [
        { _id: req.params.id },
        { slug: req.params.id }
      ],
      isActive: true
    }).populate('addedBy', 'username avatar role');

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    // Increment views
    game.viewsCount += 1;
    await game.save();

    res.json({
      success: true,
      game
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/games
// @desc    Create a new game
// @access  Private (Admin only)
router.post('/', [
  protect,
  authorize('admin'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('coverImage').isURL().withMessage('Valid cover image URL is required'),
  body('developer').trim().notEmpty().withMessage('Developer is required'),
  body('releaseDate').isISO8601().withMessage('Valid release date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const gameData = {
      ...req.body,
      addedBy: req.user._id
    };

    const game = await Game.create(gameData);

    res.status(201).json({
      success: true,
      game
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A game with this title already exists'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/games/:id
// @desc    Update a game
// @access  Private (Admin only)
router.put('/:id', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    const allowedUpdates = [
      'title', 'coverImage', 'bannerImage', 'screenshots', 'description',
      'shortDescription', 'developer', 'publisher', 'releaseDate', 'genres',
      'platforms', 'metacriticScore', 'officialWebsite', 'tags', 'isFeatured'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        game[field] = req.body[field];
      }
    });

    await game.save();

    res.json({
      success: true,
      game
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/games/:id
// @desc    Delete a game (soft delete)
// @access  Private (Admin only)
router.delete('/:id', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    game.isActive = false;
    await game.save();

    res.json({
      success: true,
      message: 'Game deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/games/:id/stats
// @desc    Get game statistics
// @access  Public
router.get('/:id/stats', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    res.json({
      success: true,
      stats: {
        postsCount: game.postsCount,
        followersCount: game.followersCount,
        viewsCount: game.viewsCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
// routes/posts.js
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Game = require('../models/Game');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   GET /api/posts
// @desc    Get all posts with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      game,
      author,
      postType,
      tags,
      search,
      sort = 'recent',
      page = 1,
      limit = 20,
      featured,
      pinned
    } = req.query;

    const query = { isDeleted: false };

    // Filters
    if (game) query.game = game;
    if (author) query.author = author;
    if (postType) query.postType = postType;
    if (tags) query.tags = { $in: tags.split(',') };
    if (featured === 'true') query.isFeatured = true;
    if (pinned === 'true') query.isPinned = true;

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Sort
    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { likesCount: -1, commentsCount: -1 };
        break;
      case 'trending':
        sortOption = { lastActivityAt: -1, viewsCount: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'recent':
      default:
        sortOption = { isPinned: -1, lastActivityAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'username avatar role level')
        .populate('game', 'title coverImage slug')
        .lean(),
      Post.countDocuments(query)
    ]);

    res.json({
      success: true,
      posts,
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

// @route   GET /api/posts/:id
// @desc    Get post by ID with comments
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar role level badges')
      .populate('game', 'title coverImage slug developer platforms');

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views
    post.viewsCount += 1;
    await post.save();

    res.json({
      success: true,
      post
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', [
  protect,
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('content').trim().isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
  body('game').isMongoId().withMessage('Valid game ID is required'),
  body('postType').isIn(['discussion', 'review', 'guide', 'question']).withMessage('Invalid post type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, game, postType, tags, images } = req.body;

    // Verify game exists
    const gameExists = await Game.findById(game);
    if (!gameExists) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    const post = await Post.create({
      title,
      content,
      game,
      postType,
      tags: tags || [],
      images: images || [],
      author: req.user._id
    });
    // Update game and user stats
    await Promise.all([
      Game.findByIdAndUpdate(game, { $inc: { postsCount: 1 } }),
      User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1, experience: 10 } })
    ]);

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar role')
      .populate('game', 'title coverImage slug');

    res.status(201).json({
      success: true,
      post: populatedPost
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const allowedUpdates = ['title', 'content', 'tags', 'images', 'postType'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        post[field] = req.body[field];
      }
    });

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'username avatar role')
      .populate('game', 'title coverImage slug');

    res.json({
      success: true,
      post: updatedPost
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post (soft delete)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership or admin/moderator
    if (post.author.toString() !== req.user._id.toString() && 
        !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    post.isDeleted = true;
    post.deletedAt = new Date();
    post.deletedBy = req.user._id;
    await post.save();

    // Update game and user stats
    await Promise.all([
      Game.findByIdAndUpdate(post.game, { $inc: { postsCount: -1 } }),
      User.findByIdAndUpdate(post.author, { $inc: { postsCount: -1 } })
    ]);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/posts/:id/pin
// @desc    Pin/unpin a post
// @access  Private (Moderator/Admin)
router.put('/:id/pin', [protect, authorize('moderator', 'admin')], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({
      success: true,
      post,
      message: post.isPinned ? 'Post pinned' : 'Post unpinned'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/posts/:id/lock
// @desc    Lock/unlock a post
// @access  Private (Moderator/Admin)
router.put('/:id/lock', [protect, authorize('moderator', 'admin')], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.isLocked = !post.isLocked;
    await post.save();
    res.json({
      success: true,
      post,
      message: post.isLocked ? 'Post locked' : 'Post unlocked'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
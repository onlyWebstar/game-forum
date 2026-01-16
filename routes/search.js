// routes/search.js
const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');
const Post = require('../models/Post');

// @route   GET /api/search
// @desc    Global search across games, users, and posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { q, type = 'all', limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchLimit = parseInt(limit);
    const results = {
      games: [],
      users: [],
      posts: []
    };

    // Search games
    if (type === 'all' || type === 'games') {
      results.games = await Game.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { developer: { $regex: q, $options: 'i' } }
        ],
        isActive: true
      })
        .select('title coverImage developer genres platforms slug')
        .limit(searchLimit)
        .lean();
    }

    // Search users
    if (type === 'all' || type === 'users') {
      results.users = await User.find({
        username: { $regex: q, $options: 'i' },
        isActive: true
      })
        .select('username avatar role level')
        .limit(searchLimit)
        .lean();
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      results.posts = await Post.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } }
        ],
        isDeleted: false
      })
        .populate('author', 'username avatar')
        .populate('game', 'title coverImage slug')
        .select('title content postType likesCount commentsCount createdAt')
        .limit(searchLimit)
        .sort({ createdAt: -1 })
        .lean();
    }

    res.json({
      success: true,
      query: q,
      results
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
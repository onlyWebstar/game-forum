// routes/stats.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Game = require('../models/Game');

// @route   GET /api/stats
// @desc    Site-wide totals + most active games (forum sidebar, homepage stats)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const [users, posts, comments, games, activeGames] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Post.countDocuments({ isDeleted: false }),
      Comment.countDocuments({ isDeleted: false }),
      Game.countDocuments({ isActive: true }),
      Game.find({ isActive: true })
        .sort({ postsCount: -1, viewsCount: -1 })
        .limit(5)
        .select('title coverImage slug postsCount')
        .lean()
    ]);

    res.json({
      success: true,
      stats: { users, posts, comments, games },
      activeGames
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
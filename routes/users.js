// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   GET /api/users/:username
// @desc    Get user profile by username
// @access  Public
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
      isActive: true
    })
      .populate('favoriteGames', 'title coverImage slug')
      .select('-password -googleId -discordId -email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        avatar: user.getAvatarUrl(),
        bio: user.bio,
        role: user.role,
        level: user.level,
        experience: user.experience,
        badges: user.badges,
        favoriteGames: user.favoriteGames,
        postsCount: user.postsCount,
        commentsCount: user.commentsCount,
        likesReceived: user.likesReceived,
        createdAt: user.createdAt,
        lastSeen: user.lastSeen
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  protect,
  body('username').optional().trim().isLength({ min: 3, max: 30 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('avatar').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, bio, avatar } = req.body;
    const user = await User.findById(req.user._id);

    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.getAvatarUrl(),
        bio: user.bio,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/:username/posts
// @desc    Get user's posts
// @access  Public
router.get('/:username/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find({ author: user._id, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('game', 'title coverImage slug')
        .lean(),
      Post.countDocuments({ author: user._id, isDeleted: false })
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

// @route   GET /api/users/:username/comments
// @desc    Get user's comments
// @access  Public
router.get('/:username/comments', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [comments, total] = await Promise.all([
      Comment.find({ author: user._id, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('post', 'title')
        .lean(),
      Comment.countDocuments({ author: user._id, isDeleted: false })
    ]);

    res.json({
      success: true,
      comments,
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

// @route   PUT /api/users/favorites/:gameId
// @desc    Add/remove game from favorites
// @access  Private
router.put('/favorites/:gameId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const gameId = req.params.gameId;

    const index = user.favoriteGames.indexOf(gameId);

    if (index === -1) {
      // Add to favorites
      user.favoriteGames.push(gameId);
      await user.save();
      
      return res.json({
        success: true,
        message: 'Game added to favorites',
        favorited: true
      });
    } else {
      // Remove from favorites
      user.favoriteGames.splice(index, 1);
      await user.save();
      
      return res.json({
        success: true,
        message: 'Game removed from favorites',
        favorited: false
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {
      username: { $regex: q, $options: 'i' },
      isActive: true
    };

    const [users, total] = await Promise.all([
      User.find(query)
        .select('username avatar role level badges postsCount commentsCount')
        .sort({ postsCount: -1, commentsCount: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users: users.map(user => ({
        ...user,
        avatar: user.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(user.username)}`
      })),
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

// @route   GET /api/users/leaderboard
// @desc    Get top users by various metrics
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { metric = 'experience', limit = 100 } = req.query;

    let sortField = {};
    switch (metric) {
      case 'posts':
        sortField = { postsCount: -1 };
        break;
      case 'comments':
        sortField = { commentsCount: -1 };
        break;
      case 'likes':
        sortField = { likesReceived: -1 };
        break;
      case 'level':
        sortField = { level: -1, experience: -1 };
        break;
      case 'experience':
      default:
        sortField = { experience: -1 };
    }

    const users = await User.find({ isActive: true })
      .select('username avatar role level experience badges postsCount commentsCount likesReceived')
      .sort(sortField)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      users: users.map(user => ({
        ...user,
        avatar: user.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(user.username)}`
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private (Admin)
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
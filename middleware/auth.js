// routes/auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { protect } = require('../middleware/auth'); // Add this import
const router = express.Router();

// ... (keep existing register and login routes) ...

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
// ADD protect middleware here!
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          bio: user.bio,
          favoriteGames: user.favoriteGames,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
});

module.exports = router;
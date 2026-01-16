// routes/likes.js
const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   POST /api/likes
// @desc    Like or dislike a post/comment
// @access  Private
router.post('/', [
  protect,
  body('targetType').isIn(['Post', 'Comment']).withMessage('Invalid target type'),
  body('targetId').isMongoId().withMessage('Valid target ID is required'),
  body('value').isIn([1, -1]).withMessage('Value must be 1 (like) or -1 (dislike)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { targetType, targetId, value } = req.body;

    // Verify target exists
    const Model = targetType === 'Post' ? Post : Comment;
    const target = await Model.findById(targetId);
    
    if (!target || target.isDeleted) {
      return res.status(404).json({
        success: false,
        message: `${targetType} not found`
      });
    }

    // Check if user already liked/disliked
    const existingLike = await Like.findOne({
      user: req.user._id,
      targetType,
      targetId
    });

    let message = '';
    let likesChange = 0;
    let dislikesChange = 0;

    if (existingLike) {
      if (existingLike.value === value) {
        // Remove like/dislike
        await existingLike.deleteOne();
        likesChange = value === 1 ? -1 : 0;
        dislikesChange = value === -1 ? -1 : 0;
        message = value === 1 ? 'Like removed' : 'Dislike removed';
      } else {
        // Change from like to dislike or vice versa
        existingLike.value = value;
        await existingLike.save();
        likesChange = value === 1 ? 1 : -1;
        dislikesChange = value === -1 ? 1 : -1;
        message = value === 1 ? 'Changed to like' : 'Changed to dislike';
      }
    } else {
      // Create new like/dislike
      await Like.create({
        user: req.user._id,
        targetType,
        targetId,
        value
      });
      likesChange = value === 1 ? 1 : 0;
      dislikesChange = value === -1 ? 1 : 0;
      message = value === 1 ? 'Liked' : 'Disliked';
    }

    // Update target stats
    const updateObj = {};
    if (likesChange !== 0) updateObj.likesCount = likesChange;
    if (dislikesChange !== 0) updateObj.dislikesCount = dislikesChange;

    if (Object.keys(updateObj).length > 0) {
      await Model.findByIdAndUpdate(targetId, { $inc: updateObj });
    }

    // Update author's likes received count
    if (likesChange !== 0) {
      await User.findByIdAndUpdate(target.author, {
        $inc: { likesReceived: likesChange }
      });
    }

    // Get updated target
    const updatedTarget = await Model.findById(targetId);

    res.json({
      success: true,
      message,
      data: {
        likesCount: updatedTarget.likesCount,
        dislikesCount: updatedTarget.dislikesCount,
        userLikeValue: existingLike && existingLike.value === value ? null : value
      }
    });
    } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate like entry'
      });
    }
    res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/likes/check
// @desc    Check if user has liked/disliked targets
// @access  Private
router.get('/check', protect, async (req, res) => {
  try {
    const { targetIds, targetType } = req.query;

    if (!targetIds || !targetType) {
      return res.status(400).json({
        success: false,
        message: 'targetIds and targetType are required'
      });
    }

    const ids = targetIds.split(',');

    const likes = await Like.find({
      user: req.user._id,
      targetType,
      targetId: { $in: ids }
    }).lean();
    // Create a map of targetId -> value
    const likeMap = {};
    likes.forEach(like => {
      likeMap[like.targetId.toString()] = like.value;
    });

    res.json({
      success: true,
      likes: likeMap
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/likes/user/:userId
// @desc    Get user's liked posts/comments
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { targetType, page = 1, limit = 20 } = req.query;
    const userId = req.params.userId;

    const query = {
      user: userId,
      value: 1 // Only likes, not dislikes
    };

    if (targetType) {
      query.targetType = targetType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [likes, total] = await Promise.all([
      Like.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate({
          path: 'targetId',
          populate: [
            { path: 'author', select: 'username avatar' },
            { path: 'game', select: 'title coverImage slug' }
          ]
        })
        .lean(),
      Like.countDocuments(query)
    ]);

    res.json({
      success: true,
      likes,
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

// @route   DELETE /api/likes/:targetType/:targetId
// @desc    Remove like/dislike
// @access  Private
router.delete('/:targetType/:targetId', protect, async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    if (!['Post', 'Comment'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid target type'
      });
    }

    const like = await Like.findOne({
      user: req.user._id,
      targetType,
      targetId
    });

    if (!like) {
      return res.status(404).json({
        success: false,
        message: 'Like not found'
      });
    }

    const value = like.value;
    await like.deleteOne();

    // Update target stats
    const Model = targetType === 'Post' ? Post : Comment;
    const updateObj = value === 1 ? { likesCount: -1 } : { dislikesCount: -1 };
    
    await Model.findByIdAndUpdate(targetId, { $inc: updateObj });

    // Update author's likes received count
    if (value === 1) {
      const target = await Model.findById(targetId);
      if (target) {
        await User.findByIdAndUpdate(target.author, {
          $inc: { likesReceived: -1 }
        });
      }
    }

    res.json({
      success: true,
      message: 'Like removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
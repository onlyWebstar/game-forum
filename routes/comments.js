// routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   GET /api/comments
// @desc    Get comments for a post
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { postId, parentComment, page = 1, limit = 50 } = req.query;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const query = {
      post: postId,
      isDeleted: false
    };

    // Filter for top-level or nested comments
    if (parentComment) {
      query.parentComment = parentComment;
    } else {
      query.parentComment = null;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'username avatar role level badges')
        .lean(),
      Comment.countDocuments(query)
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

// @route   POST /api/comments
// @desc    Add a comment to a post
// @access  Private
router.post('/', [
  protect,
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content must be 1-5000 characters'),
  body('postId').isMongoId().withMessage('Valid post ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { content, postId, parentCommentId } = req.body;

    // Verify post exists and is not locked
    const post = await Post.findById(postId);
    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'This post is locked and cannot accept new comments'
      });
    }

    let depth = 0;
    let parentComment = null;

    // Handle nested comments
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }

      depth = parentComment.depth + 1;
      if (depth > 5) {
        return res.status(400).json({
          success: false,
          message: 'Maximum nesting depth reached'
        });
      }
    }

    const comment = await Comment.create({
      content,
      post: postId,
      author: req.user._id,
      parentComment: parentCommentId || null,
      depth
    });

    // Update post stats
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
      lastActivityAt: new Date()
    });

    // Update parent comment replies count
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { repliesCount: 1 }
      });
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { commentsCount: 1, experience: 5 }
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username avatar role level badges');

    res.status(201).json({
      success: true,
      comment: populatedComment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', [
  protect,
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Content must be 1-5000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('author', 'username avatar role level');

    res.json({
      success: true,
      comment: updatedComment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment (soft delete)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership or moderator/admin
    if (comment.author.toString() !== req.user._id.toString() && 
        !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.deletedBy = req.user._id;
    await comment.save();

    // Update post stats
    await Post.findByIdAndUpdate(comment.post, {
      $inc: { commentsCount: -1 }
    });

    // Update parent comment replies count
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $inc: { repliesCount: -1 }
      });
    }

    // Update user stats
    await User.findByIdAndUpdate(comment.author, {
      $inc: { commentsCount: -1 }
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/comments/:postId/tree
// @desc    Get nested comment tree for a post
// @access  Public
router.get('/:postId/tree', async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      isDeleted: false
    })
      .sort({ createdAt: 1 })
      .populate('author', 'username avatar role level badges')
      .lean();

    // Build comment tree
    const commentMap = new Map();
    const rootComments = [];

    // First pass: create map of all comments
    comments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment._id.toString(), comment);
    });

    // Second pass: build tree structure
    comments.forEach(comment => {
      if (comment.parentComment) {
        const parent = commentMap.get(comment.parentComment.toString());
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    res.json({
      success: true,
      comments: rootComments,
      total: comments.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
// routes/notifications.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// @route   GET /api/notifications
// @desc    My notifications (newest first). ?unread=true for unread only
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 50);

    const query = { recipient: req.user._id };
    if (req.query.unread === 'true') query.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('actor', 'username avatar')
        .populate('post', 'title isDeleted')
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ recipient: req.user._id, isRead: false })
    ]);

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Just the number, for the badge in the menu (polled)
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all my notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    // timestamps:false so marking as read doesn't reorder the list
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } },
      { timestamps: false }
    );
    res.json({ success: true, count: 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark one notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }

    await Notification.updateOne(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { isRead: true } },
      { timestamps: false }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete one of my notifications
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }

    await Notification.deleteOne({ _id: req.params.id, recipient: req.user._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
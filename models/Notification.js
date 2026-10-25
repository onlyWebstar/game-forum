// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Who receives it
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Who caused it
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['comment', 'reply', 'post_like', 'comment_like'],
    required: true
  },
  // The post to open when the notification is clicked
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  // The comment involved (the new comment/reply, or the liked comment)
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Listing + unread counts
notificationSchema.index({ recipient: 1, isRead: 1, updatedAt: -1 });
// Finding an existing like notification to bump or remove
notificationSchema.index({ recipient: 1, actor: 1, type: 1, post: 1, comment: 1 });
// Old notifications clean themselves up after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('Notification', notificationSchema);
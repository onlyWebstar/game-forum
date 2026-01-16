// models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    enum: [
      'post_created',
      'post_updated',
      'post_deleted',
      'comment_created',
      'comment_deleted',
      'like_added',
      'like_removed',
      'game_added',
      'user_registered',
      'profile_updated'
    ],
    required: true
  },
  targetType: {
    type: String,
    enum: ['Post', 'Comment', 'Game', 'User'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ activityType: 1, createdAt: -1 });
activitySchema.index({ targetType: 1, targetId: 1 });
activitySchema.index({ createdAt: -1 });

// Static method to log activity
activitySchema.statics.logActivity = async function(data) {
  try {
    await this.create(data);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Static method to get user activity
activitySchema.statics.getUserActivity = async function(userId, limit = 20) {
  return await this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('targetId')
    .lean();
};

// Static method to get recent activity
activitySchema.statics.getRecentActivity = async function(limit = 50) {
  return await this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'username avatar')
    .populate('targetId')
    .lean();
};

module.exports = mongoose.model('Activity', activitySchema);
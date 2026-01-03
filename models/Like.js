const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    required: true,
    enum: ['Post', 'Comment']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  likeType: {
    type: String,
    enum: ['like', 'dislike'],
    default: 'like'
  }
}, {
  timestamps: true
});

// Compound index to ensure user can only like/dislike a target once
likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

// Index for efficient queries
likeSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('Like', likeSchema);
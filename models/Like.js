// models/Like.js
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['Post', 'Comment'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  value: {
    type: Number,
    enum: [1, -1], // 1 for like, -1 for dislike
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one like per user per target
likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
likeSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('Like', likeSchema);
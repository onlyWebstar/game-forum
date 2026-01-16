const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  postType: {
    type: String,
    enum: ['discussion', 'review', 'guide', 'question'],
    default: 'discussion'
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: String,
    caption: String
  }],
  // Engagement
  viewsCount: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  dislikesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  // Moderation
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Flags/Reports
  flagsCount: {
    type: Number,
    default: 0
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastActivityAt on save
postSchema.pre('save', function(next) {
  if (this.isModified('commentsCount')) {
    this.lastActivityAt = new Date();
  }
  next();
});

// Indexes
postSchema.index({ author: 1 });
postSchema.index({ game: 1 });
postSchema.index({ postType: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ lastActivityAt: -1 });
postSchema.index({ isPinned: -1, lastActivityAt: -1 });
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', postSchema);
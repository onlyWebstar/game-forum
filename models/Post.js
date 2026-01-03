const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
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
    enum: ['discussion', 'review', 'guide', 'news', 'question'],
    default: 'discussion'
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    validate: {
      validator: function(value) {
        // Rating is only required for review posts
        if (this.postType === 'review') {
          return value >= 1 && value <= 10;
        }
        return true;
      },
      message: 'Rating between 1-10 is required for reviews'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
postSchema.index({ game: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ postType: 1 });

// Virtual for like count
postSchema.virtual('likeCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'targetId',
  count: true
});

// Virtual for comment count
postSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  count: true
});

// Enable virtuals
postSchema.set('toJSON', { virtuals: true });

// Middleware to increment view count
postSchema.methods.incrementViews = async function() {
  this.viewCount += 1;
  await this.save();
};

module.exports = mongoose.model('Post', postSchema);
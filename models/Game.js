const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Game title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Game description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  developer: {
    type: String,
    required: [true, 'Developer name is required'],
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  releaseDate: {
    type: Date,
    required: [true, 'Release date is required']
  },
  genres: [{
    type: String,
    trim: true
  }],
  platforms: [{
    type: String,
    enum: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile', 'Other']
  }],
  coverImage: {
    type: String,
    default: '/images/default-game-cover.jpg'
  },
  screenshots: [{
    type: String
  }],
  officialWebsite: {
    type: String,
    trim: true
  },
  metacriticScore: {
    type: Number,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search functionality
gameSchema.index({ title: 'text', description: 'text' });

// Virtual for post count
gameSchema.virtual('postCount', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'game',
  count: true
});

// Enable virtuals in JSON output
gameSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Game', gameSchema);
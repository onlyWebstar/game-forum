// models/Game.js
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  coverImage: {
    type: String,
    required: true
  },
  bannerImage: {
    type: String
  },
  screenshots: [{
    url: String,
    caption: String
  }],
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  developer: {
    type: String,
    required: true
  },
  publisher: {
    type: String
  },
  releaseDate: {
    type: Date,
    required: true
  },
  genres: [{
    type: String,
    enum: ['Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing', 'Puzzle', 'Horror', 'FPS', 'MMORPG', 'Indie', 'Fighting', 'Platformer', 'Battle Royale']
  }],
  platforms: [{
    type: String,
    enum: ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One', 'Nintendo Switch', 'Mobile', 'VR']
  }],
  metacriticScore: {
    type: Number,
    min: 0,
    max: 100
  },
  officialWebsite: {
    type: String
  },
  tags: [{
    type: String
  }],
  // Stats
  postsCount: {
    type: Number,
    default: 0
  },
  followersCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate slug from title
gameSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Indexes
gameSchema.index({ title: 'text', description: 'text' });
gameSchema.index({ slug: 1 });
gameSchema.index({ genres: 1 });
gameSchema.index({ platforms: 1 });
gameSchema.index({ releaseDate: -1 });
gameSchema.index({ metacriticScore: -1 });
gameSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Game', gameSchema);
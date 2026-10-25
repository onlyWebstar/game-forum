// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String
  },
  emailVerificationExpires: {
    type: Date
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.discordId;
    }
  },
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?background=6366f1&color=fff&name='
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  // OAuth IDs
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  discordId: {
    type: String,
    sparse: true,
    unique: true
  },
  // Gamification
  level: {
    type: Number,
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  },
  badges: [{
    name: String,
    icon: String,
    earnedAt: Date
  }],
  // Preferences
  favoriteGames: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game'
  }],
  // Stats
  postsCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  likesReceived: {
    type: Number,
    default: 0
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  // Which in-app notifications this user wants
  notificationSettings: {
    comments: { type: Boolean, default: true },   // comments on my posts
    replies: { type: Boolean, default: true },    // replies to my comments
    likes: { type: Boolean, default: true }       // likes on my posts/comments
  },
  // Who can see what on this user's profile page
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'members', 'private'],
      default: 'public'
    },
    showEmail: { type: Boolean, default: false },
    showActivity: { type: Boolean, default: true }
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate avatar URL with username
userSchema.methods.getAvatarUrl = function() {
  if (this.avatar && !this.avatar.includes('ui-avatars.com')) {
    return this.avatar;
  }
  return `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(this.username)}`;
};

// Virtuals
userSchema.virtual('profileUrl').get(function() {
  return `/profile/${this.username}`;
});

// Indexes: username, email, googleId and discordId are already indexed by
// their `unique: true` definitions above, so they are not repeated here.

module.exports = mongoose.model('User', userSchema);
// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const defaultAvatar = (username) =>
  `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(username)}`;

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getPaging = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

// The settings as the frontend sees them (explicit, with defaults)
const settingsPayload = (user) => ({
  notificationSettings: {
    comments: user.notificationSettings?.comments !== false,
    replies: user.notificationSettings?.replies !== false,
    likes: user.notificationSettings?.likes !== false
  },
  privacy: {
    profileVisibility: user.privacy?.profileVisibility || 'public',
    showEmail: !!user.privacy?.showEmail,
    showActivity: user.privacy?.showActivity !== false
  }
});

/**
 * Decide what a viewer may see of a profile.
 * - The owner and staff (admin/moderator) can see everything.
 * - 'private'  -> nobody else can see the profile.
 * - 'members'  -> only logged-in users.
 * - showActivity=false hides the posts/comments lists and last-seen time.
 */
const getAccess = (profileUser, viewer) => {
  const isOwner = !!viewer && String(viewer._id) === String(profileUser._id);
  const isStaff = !!viewer && ['admin', 'moderator'].includes(viewer.role);
  const visibility = profileUser.privacy?.profileVisibility || 'public';

  let canViewProfile = true;
  let reason = null;
  if (!isOwner && !isStaff) {
    if (visibility === 'private') {
      canViewProfile = false;
      reason = 'private';
    } else if (visibility === 'members' && !viewer) {
      canViewProfile = false;
      reason = 'members';
    }
  }

  const activityShared = profileUser.privacy?.showActivity !== false;
  const canViewActivity = canViewProfile && (isOwner || isStaff || activityShared);

  return { isOwner, isStaff, canViewProfile, canViewActivity, reason };
};

/* ------------------------------------------------------------------
   STATIC ROUTES - these MUST be declared before '/:username',
   otherwise Express treats "leaderboard" / "search" as a username.
------------------------------------------------------------------- */

// @route   GET /api/users/search
// @desc    Search users by username
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const { page, limit, skip } = getPaging(req.query);
    const query = {
      username: { $regex: escapeRegex(q.trim()), $options: 'i' },
      isActive: true
    };

    const [users, total] = await Promise.all([
      User.find(query)
        .select('username avatar role level badges postsCount commentsCount')
        .sort({ postsCount: -1, commentsCount: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users: users.map((u) => ({ ...u, avatar: u.avatar || defaultAvatar(u.username) })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Top users by metric (also used by the admin Users tab)
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { metric = 'experience' } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    const sorts = {
      posts: { postsCount: -1 },
      comments: { commentsCount: -1 },
      likes: { likesReceived: -1 },
      level: { level: -1, experience: -1 },
      experience: { experience: -1 }
    };

    const [users, total] = await Promise.all([
      User.find({ isActive: true })
        .select('username avatar role level experience badges postsCount commentsCount likesReceived createdAt')
        .sort(sorts[metric] || sorts.experience)
        .limit(limit)
        .lean(),
      User.countDocuments({ isActive: true })
    ]);

    res.json({
      success: true,
      total,
      users: users.map((u) => ({ ...u, avatar: u.avatar || defaultAvatar(u.username) }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/settings
// @desc    My notification + privacy settings
// @access  Private
router.get('/settings', protect, async (req, res) => {
  res.json({ success: true, ...settingsPayload(req.user) });
});

// @route   PUT /api/users/settings
// @desc    Update my notification and/or privacy settings
// @access  Private
router.put('/settings', [
  protect,
  body('notificationSettings.comments').optional().isBoolean().withMessage('comments must be true or false'),
  body('notificationSettings.replies').optional().isBoolean().withMessage('replies must be true or false'),
  body('notificationSettings.likes').optional().isBoolean().withMessage('likes must be true or false'),
  body('privacy.profileVisibility')
    .optional()
    .isIn(['public', 'members', 'private'])
    .withMessage('profileVisibility must be public, members or private'),
  body('privacy.showEmail').optional().isBoolean().withMessage('showEmail must be true or false'),
  body('privacy.showActivity').optional().isBoolean().withMessage('showActivity must be true or false')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { notificationSettings = {}, privacy = {} } = req.body;
    const user = await User.findById(req.user._id);

    ['comments', 'replies', 'likes'].forEach((key) => {
      if (typeof notificationSettings[key] === 'boolean') {
        user.set(`notificationSettings.${key}`, notificationSettings[key]);
      }
    });

    if (privacy.profileVisibility) {
      user.set('privacy.profileVisibility', privacy.profileVisibility);
    }
    ['showEmail', 'showActivity'].forEach((key) => {
      if (typeof privacy[key] === 'boolean') {
        user.set(`privacy.${key}`, privacy[key]);
      }
    });

    await user.save();

    res.json({ success: true, ...settingsPayload(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    Update own profile (username, bio, avatar)
// @access  Private
router.put('/profile', [
  protect,
  body('username')
    .optional()
    .trim()
    .matches(/^[a-zA-Z0-9_]{3,30}$/)
    .withMessage('Username must be 3-30 characters: letters, numbers and underscores only'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be 500 characters or less'),
  body('avatar').optional({ checkFalsy: true }).isURL().withMessage('Avatar must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { username, bio, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (username && username !== user.username) {
      const taken = await User.findOne({ username, _id: { $ne: user._id } });
      if (taken) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
      user.username = username;
    }

    if (bio !== undefined) user.bio = bio;

    // Empty avatar resets to the generated default
    if (avatar !== undefined) user.avatar = avatar || defaultAvatar(user.username);

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.getAvatarUrl(),
        bio: user.bio,
        role: user.role,
        emailVerified: user.emailVerified,
        level: user.level,
        experience: user.experience
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/change-password
// @desc    Change own password
// @access  Private
router.put('/change-password', [
  protect,
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Your account uses Google/Discord sign-in and has no password to change'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/users/favorites/:gameId
// @desc    Add/remove a game from favorites
// @access  Private
router.put('/favorites/:gameId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { gameId } = req.params;

    const index = user.favoriteGames.findIndex((id) => id.toString() === gameId);

    if (index === -1) {
      user.favoriteGames.push(gameId);
    } else {
      user.favoriteGames.splice(index, 1);
    }
    await user.save();

    res.json({
      success: true,
      favorited: index === -1,
      message: index === -1 ? 'Game added to favorites' : 'Game removed from favorites'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/users/account
// @desc    Deactivate own account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate a user (admin only)
// @access  Private (Admin)
router.delete('/:id', [protect, authorize('admin')], async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account from the dashboard'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ------------------------------------------------------------------
   DYNAMIC ROUTES - keep these last.
   optionalAuth tells us who is looking (if anyone) so privacy
   settings can be enforced.
------------------------------------------------------------------- */

// @route   GET /api/users/:username
// @desc    Profile, filtered by the owner's privacy settings
// @access  Public (respects privacy)
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
      isActive: true
    }).populate('favoriteGames', 'title coverImage slug');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const access = getAccess(user, req.user);

    // Restricted: reveal only who this is, and why they can't see more
    if (!access.canViewProfile) {
      return res.json({
        success: true,
        restricted: true,
        reason: access.reason,
        user: {
          id: user._id,
          username: user.username,
          avatar: user.getAvatarUrl()
        }
      });
    }

    const profile = {
      id: user._id,
      username: user.username,
      avatar: user.getAvatarUrl(),
      bio: user.bio,
      role: user.role,
      level: user.level,
      experience: user.experience,
      badges: user.badges,
      favoriteGames: user.favoriteGames,
      postsCount: user.postsCount,
      commentsCount: user.commentsCount,
      likesReceived: user.likesReceived,
      createdAt: user.createdAt,
      canViewActivity: access.canViewActivity
    };

    if (access.canViewActivity) profile.lastSeen = user.lastSeen;
    if (user.privacy?.showEmail) profile.email = user.email;

    res.json({ success: true, user: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/:username/posts
// @desc    A user's posts (hidden if they keep activity private)
// @access  Public (respects privacy)
router.get('/:username/posts', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username, isActive: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const access = getAccess(user, req.user);
    if (!access.canViewProfile) {
      return res.status(403).json({ success: false, message: 'This profile is not available' });
    }

    const { page, limit, skip } = getPaging(req.query);

    if (!access.canViewActivity) {
      return res.json({
        success: true,
        hidden: true,
        posts: [],
        pagination: { page, limit, total: 0, pages: 0 }
      });
    }

    const query = { author: user._id, isDeleted: false };

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('game', 'title coverImage slug')
        .lean(),
      Post.countDocuments(query)
    ]);

    res.json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/users/:username/comments
// @desc    A user's comments (hidden if they keep activity private)
// @access  Public (respects privacy)
router.get('/:username/comments', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username, isActive: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const access = getAccess(user, req.user);
    if (!access.canViewProfile) {
      return res.status(403).json({ success: false, message: 'This profile is not available' });
    }

    const { page, limit, skip } = getPaging(req.query);

    if (!access.canViewActivity) {
      return res.json({
        success: true,
        hidden: true,
        comments: [],
        pagination: { page, limit, total: 0, pages: 0 }
      });
    }

    const query = { author: user._id, isDeleted: false };

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('post', 'title')
        .lean(),
      Comment.countDocuments(query)
    ]);

    res.json({
      success: true,
      comments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
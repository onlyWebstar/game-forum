// services/notifications.js
const Notification = require('../models/Notification');
const User = require('../models/User');

// Which user setting controls which notification type
const SETTING_FOR_TYPE = {
  comment: 'comments',
  reply: 'replies',
  post_like: 'likes',
  comment_like: 'likes'
};

const LIKE_TYPES = ['post_like', 'comment_like'];

/**
 * Create a notification. Never throws: a notification problem must not break
 * the comment/like that triggered it.
 */
exports.notify = async ({ recipient, actor, type, post, comment = null }) => {
  try {
    if (!recipient || !actor || String(recipient) === String(actor)) return; // never notify yourself

    const recipientUser = await User.findById(recipient).select('isActive notificationSettings');
    if (!recipientUser || !recipientUser.isActive) return;

    // Respect the recipient's notification settings (default: on)
    const setting = SETTING_FOR_TYPE[type];
    if (recipientUser.notificationSettings && recipientUser.notificationSettings[setting] === false) {
      return;
    }

    const filter = { recipient, actor, type, post, comment };

    if (LIKE_TYPES.includes(type)) {
      // One notification per liker per item. Liking again bumps it back to unread.
      await Notification.findOneAndUpdate(
        filter,
        { $set: { isRead: false } },
        { upsert: true, setDefaultsOnInsert: true }
      );
    } else {
      // Every comment/reply is its own notification
      await Notification.create(filter);
    }
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

/**
 * Remove a like notification (the like was taken back or turned into a dislike).
 */
exports.removeNotification = async ({ recipient, actor, type, post, comment = null }) => {
  try {
    await Notification.deleteOne({ recipient, actor, type, post, comment });
  } catch (error) {
    console.error('Failed to remove notification:', error.message);
  }
};
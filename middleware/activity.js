// middleware/activity.js
const Activity = require('../models/Activity');

// Middleware to log activity
exports.logActivity = (activityType, targetType) => {
  return async (req, res, next) => {
    // Store original json function
    const originalJson = res.json;

    // Override json function
    res.json = function(data) {
      // If successful operation, log activity
      if (data.success && req.user) {
        const targetId = data.post?._id || data.comment?._id || data.game?._id || req.params.id;
        
        if (targetId) {
          Activity.logActivity({
            user: req.user._id,
            activityType,
            targetType,
            targetId,
            metadata: {
              title: data.post?.title || data.comment?.content?.substring(0, 50) || data.game?.title,
              url: req.originalUrl
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
          });
        }
      }

      // Call original json function
      return originalJson.call(this, data);
    };

    next();
  };
};
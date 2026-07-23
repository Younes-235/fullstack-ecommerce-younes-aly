const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ action, user, targetId, details = {} }) => {
  try {
    await ActivityLog.create({
      action,
      performedBy: {
        userId: user?.id || user?._id || 'SYSTEM',
        email: user?.email || 'N/A',
        role: user?.role || 'N/A',
      },
      targetEntity: {
        type: 'PRODUCT',
        id: String(targetId),
      },
      details,
    });
  } catch (error) {
    console.error('Failed to save activity log:', error.message);
  }
};

module.exports = logActivity;
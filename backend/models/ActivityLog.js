// models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'PRODUCT_CREATED',
        'PRODUCT_UPDATED',
        'PRODUCT_DELETED',
        'USER_REGISTERED',
        'ORDER_PLACED',
        'ORDER_STATUS_UPDATED'
      ],
    },
    performedBy: {
      userId: { type: String, required: true },
      email: { type: String },
      role: { type: String },
    },
    targetEntity: {
      type: { type: String, enum: ['PRODUCT', 'USER', 'ORDER'] },
      id: { type: String, required: true },
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
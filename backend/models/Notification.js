const mongoose = require('mongoose');

// Standalone Notification model for system-wide or broadcast notifications
const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['voting_start', 'voting_end', 'announcement', 'result', 'system'],
      default: 'system',
    },
    target: {
      type: String,
      enum: ['all', 'voters', 'candidates', 'admins'],
      default: 'all',
    },
    // Optional link to specific entity
    refModel: { type: String, enum: ['Schedule', 'Announcement', 'Vote'] },
    refId: { type: mongoose.Schema.Types.ObjectId },
    // Track per-user reads (for broadcast notifs)
    readBy: [{ type: mongoose.Schema.Types.ObjectId, refPath: 'target' }],
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
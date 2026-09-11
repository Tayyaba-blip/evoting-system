const User = require('../models/User');
const Admin = require('../models/Admin');
const Candidate = require('../models/Candidate');

// Helper to get the right model
const getModel = (role) => {
  if (role === 'admin') return Admin;
  if (role === 'candidate') return Candidate;
  return User;
};

// @desc    Get notifications for logged-in user
// @route   GET /api/notifications
// @access  Protected (voter/admin/candidate)
const getNotifications = async (req, res) => {
  try {
    const Model = getModel(req.user.role);
    const doc = await Model.findById(req.user._id).select('notifications');
    if (!doc) return res.status(404).json({ success: false, message: 'User not found' });

    const sorted = [...(doc.notifications || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const unreadCount = sorted.filter((n) => !n.read).length;

    res.json({ success: true, notifications: sorted, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:notifId/read
// @access  Protected
const markAsRead = async (req, res) => {
  try {
    const Model = getModel(req.user.role);
    await Model.updateOne(
      { _id: req.user._id, 'notifications._id': req.params.notifId },
      { $set: { 'notifications.$.read': true } }
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Protected
const markAllAsRead = async (req, res) => {
  try {
    const Model = getModel(req.user.role);
    await Model.updateOne(
      { _id: req.user._id },
      { $set: { 'notifications.$[].read': true } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:notifId
// @access  Protected
const deleteNotification = async (req, res) => {
  try {
    const Model = getModel(req.user.role);
    await Model.updateOne(
      { _id: req.user._id },
      { $pull: { notifications: { _id: req.params.notifId } } }
    );
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Send notification to all voters (admin only)
// @route   POST /api/notifications/broadcast
// @access  Admin
const broadcastNotification = async (req, res) => {
  try {
    const { message, target } = req.body; // target: 'voters' | 'candidates' | 'all'

    const notification = { message, read: false, createdAt: new Date() };

    if (target === 'voters' || target === 'all') {
      await User.updateMany({}, { $push: { notifications: notification } });
    }
    if (target === 'candidates' || target === 'all') {
      await Candidate.updateMany({}, { $push: { notifications: notification } });
    }

    res.json({ success: true, message: 'Notification broadcast successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  broadcastNotification,
};
const User = require('../models/User');

// @desc    Get voter profile
// @route   GET /api/voter/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc    Update voter profile
// @route   PUT /api/voter/profile
const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.files?.profileImage) updates.profileImage = `/uploads/${req.files.profileImage[0].filename}`;
    if (req.files?.cnicFrontImage) updates.cnicFrontImage = `/uploads/${req.files.cnicFrontImage[0].filename}`;
    if (req.files?.cnicBackImage) updates.cnicBackImage = `/uploads/${req.files.cnicBackImage[0].filename}`;
    if (req.body.faceDescriptor) updates.faceDescriptor = JSON.parse(req.body.faceDescriptor);

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc    Get voter notifications
// @route   GET /api/voter/notifications
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json({ success: true, notifications: user.notifications.sort((a, b) => b.createdAt - a.createdAt) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// @desc    Mark notification as read
// @route   PUT /api/voter/notifications/:notifId/read
const markNotificationRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id, 'notifications._id': req.params.notifId },
      { $set: { 'notifications.$.read': true } }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getProfile, updateProfile, getNotifications, markNotificationRead };
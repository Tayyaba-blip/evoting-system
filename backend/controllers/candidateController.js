const Candidate = require('../models/Candidate');

const getProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user._id).select('-password').populate('party', 'name abbreviation flag');
    res.json({ success: true, candidate });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getNotifications = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user._id).select('notifications');
    res.json({ success: true, notifications: candidate.notifications.sort((a, b) => b.createdAt - a.createdAt) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const markNotificationRead = async (req, res) => {
  try {
    await Candidate.updateOne(
      { _id: req.user._id, 'notifications._id': req.params.notifId },
      { $set: { 'notifications.$.read': true } }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getVoteCount = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user._id).select('totalVotes name electionType');
    res.json({ success: true, candidate });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getProfile, getNotifications, markNotificationRead, getVoteCount };
// const Candidate = require('../models/Candidate');

// const getProfile = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.user._id).select('-password').populate('party', 'name abbreviation flag');
//     res.json({ success: true, candidate });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const getNotifications = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.user._id).select('notifications');
//     res.json({ success: true, notifications: candidate.notifications.sort((a, b) => b.createdAt - a.createdAt) });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const markNotificationRead = async (req, res) => {
//   try {
//     await Candidate.updateOne(
//       { _id: req.user._id, 'notifications._id': req.params.notifId },
//       { $set: { 'notifications.$.read': true } }
//     );
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const getVoteCount = async (req, res) => {
//   try {
//     const candidate = await Candidate.findById(req.user._id).select('totalVotes name electionType');
//     res.json({ success: true, candidate });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// module.exports = { getProfile, getNotifications, markNotificationRead, getVoteCount };
const Candidate = require('../models/Candidate');

const getProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user._id)
      .select('-password')
      .populate('party', 'name abbreviation flag');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      candidate
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// UPDATE CANDIDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user._id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Only fields that the candidate is allowed to edit
    const allowedFields = [
      'name',
      'constituency',
      'tehsil',
      'city',
      'province'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        candidate[field] = req.body[field];
      }
    });

    // New candidate photo
    if (req.file) {
      candidate.photo = `/uploads/${req.file.filename}`;
    }

    await candidate.save();

    const updatedCandidate = await Candidate.findById(candidate._id)
      .select('-password')
      .populate('party', 'name abbreviation flag');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      candidate: updatedCandidate
    });

  } catch (err) {
    console.error('UPDATE CANDIDATE PROFILE ERROR:', err);

    res.status(500).json({
      success: false,
      message: err.message || 'Failed to update profile'
    });
  }
};


const getNotifications = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user._id)
      .select('notifications');

    res.json({
      success: true,
      notifications: candidate.notifications.sort(
        (a, b) => b.createdAt - a.createdAt
      )
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const markNotificationRead = async (req, res) => {
  try {
    await Candidate.updateOne(
      {
        _id: req.user._id,
        'notifications._id': req.params.notifId
      },
      {
        $set: {
          'notifications.$.read': true
        }
      }
    );

    res.json({
      success: true
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const getVoteCount = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user._id)
      .select('totalVotes name electionType');

    res.json({
      success: true,
      candidate
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


module.exports = {
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationRead,
  getVoteCount
};
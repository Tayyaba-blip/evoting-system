// const express = require('express');
// const router = express.Router();
// const protect = require('../middleware/auth');
// const { getProfile,  updateProfile, getNotifications, markNotificationRead, getVoteCount } = require('../controllers/candidateController');

// const cand = protect(['candidate']);

// router.get('/profile', cand, getProfile);
// router.put('/profile', cand, updateProfile);
// router.get('/notifications', cand, getNotifications);
// router.put('/notifications/:notifId/read', cand, markNotificationRead);
// router.get('/votes', cand, getVoteCount);

// module.exports = router;
const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth');
const upload = require('../middleware/upload');

const {
  getProfile,
  updateProfile,
  getNotifications,
  markNotificationRead,
  getVoteCount
} = require('../controllers/candidateController');

const cand = protect(['candidate']);

// Profile
router.get('/profile', cand, getProfile);
router.put('/profile', cand, upload.single('photo'), updateProfile);

// Notifications
router.get('/notifications', cand, getNotifications);
router.put('/notifications/:notifId/read', cand, markNotificationRead);

// Votes
router.get('/votes', cand, getVoteCount);

module.exports = router;
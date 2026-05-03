const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getProfile, getNotifications, markNotificationRead, getVoteCount } = require('../controllers/candidateController');

const cand = protect(['candidate']);

router.get('/profile', cand, getProfile);
router.get('/notifications', cand, getNotifications);
router.put('/notifications/:notifId/read', cand, markNotificationRead);
router.get('/votes', cand, getVoteCount);

module.exports = router;
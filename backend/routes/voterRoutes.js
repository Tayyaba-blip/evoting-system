const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getProfile, updateProfile, getNotifications, markNotificationRead } = require('../controllers/voterController');

const voter = protect(['voter']);

router.get('/profile', voter, getProfile);
router.put('/profile', voter, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'cnicFrontImage', maxCount: 1 },
  { name: 'cnicBackImage', maxCount: 1 }
]), updateProfile);
router.get('/notifications', voter, getNotifications);
router.put('/notifications/:notifId/read', voter, markNotificationRead);

module.exports = router;
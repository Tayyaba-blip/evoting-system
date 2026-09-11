const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  broadcastNotification,
} = require('../controllers/notificationController');

// All protected routes
router.get('/', protect(['voter', 'admin', 'candidate']), getNotifications);
router.put('/read-all', protect(['voter', 'admin', 'candidate']), markAllAsRead);
router.put('/:notifId/read', protect(['voter', 'admin', 'candidate']), markAsRead);
router.delete('/:notifId', protect(['voter', 'admin', 'candidate']), deleteNotification);

// Admin only — broadcast to all users
router.post('/broadcast', protect(['admin']), broadcastNotification);

module.exports = router;
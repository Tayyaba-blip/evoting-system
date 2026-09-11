const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  createSchedule,
  getSchedules,
  getActiveSchedule,
  getScheduleById,
  updateSchedule,
  endSchedule,
  deleteSchedule,
} = require('../controllers/scheduleController');

// Public
router.get('/active', getActiveSchedule);

// Admin
router.get('/', protect(['admin']), getSchedules);
router.get('/:id', protect(['admin']), getScheduleById);
router.post('/', protect(['admin']), createSchedule);
router.put('/:id', protect(['admin']), updateSchedule);
router.patch('/:id/end', protect(['admin']), endSchedule);
router.delete('/:id', protect(['admin']), deleteSchedule);

module.exports = router;
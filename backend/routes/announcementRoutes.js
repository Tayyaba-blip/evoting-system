const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  createAnnouncement,
  getAnnouncements,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncement,
} = require('../controllers/announcementController');

const admin = protect(['admin']);

// Public — for showing banners on landing/register pages
router.get('/', getAnnouncements); // ?page=landing or ?page=register

// Admin only
router.get('/all', admin, getAllAnnouncements);
router.get('/:id', admin, getAnnouncementById);
router.post('/', admin, createAnnouncement);
router.put('/:id', admin, updateAnnouncement);
router.patch('/:id/toggle', admin, toggleAnnouncement);
router.delete('/:id', admin, deleteAnnouncement);

module.exports = router;
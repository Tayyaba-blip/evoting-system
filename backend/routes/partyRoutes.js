const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createParty,
  getParties,
  getPartyById,
  updateParty,
  deleteParty,
  getIndependentCandidates,
} = require('../controllers/partyController');

// Public
router.get('/', getParties);
router.get('/independent', getIndependentCandidates);
router.get('/:id', getPartyById);

// Admin only
router.post('/', protect(['admin']), upload.single('flag'), createParty);
router.put('/:id', protect(['admin']), upload.single('flag'), updateParty);
router.delete('/:id', protect(['admin']), deleteParty);

module.exports = router;
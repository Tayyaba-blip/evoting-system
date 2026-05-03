const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createParty, getParties, getPartyById, updateParty, deleteParty,
  createCandidate, getCandidates, deleteCandidate,
  getVoters,
  createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement,
  createSchedule, getSchedules, getActiveSchedule, updateSchedule, deleteSchedule
} = require('../controllers/adminController');

const admin = protect(['admin']);

// Parties
router.get('/parties', getParties);
router.get('/parties/:id', getPartyById);
router.post('/parties', admin, upload.single('flag'), createParty);
router.put('/parties/:id', admin, upload.single('flag'), updateParty);
router.delete('/parties/:id', admin, deleteParty);

// Candidates
router.get('/candidates', getCandidates);
router.post('/candidates', admin, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'symbol', maxCount: 1 }]), createCandidate);
router.delete('/candidates/:id', admin, deleteCandidate);

// Voters
router.get('/voters', admin, getVoters);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', admin, createAnnouncement);
router.put('/announcements/:id', admin, updateAnnouncement);
router.delete('/announcements/:id', admin, deleteAnnouncement);

// Schedule
router.get('/schedule', getSchedules);
router.get('/schedule/active', getActiveSchedule);
router.post('/schedule', admin, createSchedule);
router.put('/schedule/:id', admin, updateSchedule);
router.delete('/schedule/:id', admin, deleteSchedule);

module.exports = router;
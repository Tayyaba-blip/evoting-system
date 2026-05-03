const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { castVote, getCandidatesForVoter, getVoteStats, getElectionHistory } = require('../controllers/voteController');

router.post('/cast', protect(['voter']), castVote);
router.get('/candidates/:electionType', protect(['voter']), getCandidatesForVoter);
router.get('/stats', protect(['admin']), getVoteStats);
router.get('/history', protect(['admin']), getElectionHistory);

module.exports = router;
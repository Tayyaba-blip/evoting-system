const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const Party = require('../models/Party');
const Schedule = require('../models/Schedule');
const { addVoteBlock, verifyChain } = require('../services/blockchainService');

// @desc    Cast a vote
// @route   POST /api/vote/cast
// @access  Voter
const castVote = async (req, res) => {
  try {
    const { candidateId, electionType } = req.body;
    const voterId = req.user._id;

    // Check active schedule
    const now = new Date();
    const schedule = await Schedule.findOne({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    });
    if (!schedule) return res.status(400).json({ success: false, message: 'Voting is not currently active.' });

    // Check if already voted for this election type
    const voter = await User.findById(voterId);
    if (electionType === 'MNA' && voter.hasVotedMNA)
      return res.status(400).json({ success: false, message: 'You have already voted for MNA.' });
    if (electionType === 'MPA' && voter.hasVotedMPA)
      return res.status(400).json({ success: false, message: 'You have already voted for MPA.' });

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found.' });
    if (candidate.electionType !== electionType)
      return res.status(400).json({ success: false, message: 'Candidate election type mismatch.' });
    if (candidate.tehsil !== voter.tehsil)
      return res.status(400).json({ success: false, message: 'You can only vote for candidates in your tehsil.' });

    // Create blockchain block for the vote
    const voteData = {
      voterId: voterId.toString(),
      candidateId: candidateId.toString(),
      electionType,
      tehsil: voter.tehsil,
      province: voter.province,
      timestamp: Date.now()
    };
    const block = await addVoteBlock(voteData);

    // Record vote
    const vote = await Vote.create({
      voterId, candidateId, electionType,
      tehsil: voter.tehsil, province: voter.province,
      blockHash: block.hash
    });

    // Update candidate vote count
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { totalVotes: 1 } });
    if (candidate.party) {
      await Party.findByIdAndUpdate(candidate.party, { $inc: { totalVotes: 1 } });
    }

    // Mark voter as voted
    const update = {};
    if (electionType === 'MNA') update.hasVotedMNA = true;
    if (electionType === 'MPA') update.hasVotedMPA = true;
    await User.findByIdAndUpdate(voterId, update);

    res.json({ success: true, message: `${electionType} vote cast successfully!`, blockHash: block.hash });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get candidates for voter's tehsil
// @route   GET /api/vote/candidates/:electionType
// @access  Voter
const getCandidatesForVoter = async (req, res) => {
  try {
    const voter = await User.findById(req.user._id);
    const { electionType } = req.params;
    const candidates = await Candidate.find({
      tehsil: voter.tehsil,
      electionType
    }).populate('party', 'name abbreviation flag');
    res.json({ success: true, candidates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get vote statistics
// @route   GET /api/vote/stats
// @access  Admin
const getVoteStats = async (req, res) => {
  try {
    const parties = await Party.find().lean();
    const candidates = await Candidate.find().populate('party', 'name abbreviation').lean();

    const mnaVotes = candidates.filter(c => c.electionType === 'MNA');
    const mpaVotes = candidates.filter(c => c.electionType === 'MPA');

    const partyStats = await Promise.all(parties.map(async (party) => {
      const partyCandidates = candidates.filter(c => c.party && c.party._id.toString() === party._id.toString());
      const mnaTotal = partyCandidates.filter(c => c.electionType === 'MNA').reduce((s, c) => s + c.totalVotes, 0);
      const mpaTotal = partyCandidates.filter(c => c.electionType === 'MPA').reduce((s, c) => s + c.totalVotes, 0);
      return { ...party, mnaVotes: mnaTotal, mpaVotes: mpaTotal, totalVotes: mnaTotal + mpaTotal };
    }));

    const isChainValid = await verifyChain();
    const totalVotesCast = await Vote.countDocuments();

    res.json({
      success: true,
      stats: { partyStats, mnaVotes, mpaVotes, totalVotesCast, isChainValid }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get election history / results
// @route   GET /api/vote/history
// @access  Admin
const getElectionHistory = async (req, res) => {
  try {
    const provinces = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'AJK'];
    const results = {};

    for (const province of provinces) {
      const mnaWinner = await Candidate.findOne({ province, electionType: 'MNA' })
        .sort({ totalVotes: -1 }).populate('party', 'name abbreviation flag').lean();
      const mpaWinner = await Candidate.findOne({ province, electionType: 'MPA' })
        .sort({ totalVotes: -1 }).populate('party', 'name abbreviation flag').lean();
      results[province] = { mnaWinner, mpaWinner };
    }

    const overallWinner = await Party.findOne().sort({ totalVotes: -1 }).lean();
    res.json({ success: true, results, overallWinner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { castVote, getCandidatesForVoter, getVoteStats, getElectionHistory };
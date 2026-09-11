const Party = require('../models/Party');
const Candidate = require('../models/Candidate');

// @desc    Create a party
// @route   POST /api/parties
// @access  Admin
const createParty = async (req, res) => {
  try {
    const { name, abbreviation, leaderName, foundedYear, history, isIndependent } = req.body;
    const flag = req.file ? `/uploads/${req.file.filename}` : null;

    const existing = await Party.findOne({ name });
    if (existing)
      return res.status(400).json({ success: false, message: 'Party with this name already exists.' });

    const party = await Party.create({
      name,
      abbreviation,
      leaderName,
      foundedYear: foundedYear ? Number(foundedYear) : undefined,
      history,
      flag,
      isIndependent: isIndependent === 'true' || isIndependent === true,
    });

    res.status(201).json({ success: true, party });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all parties
// @route   GET /api/parties
// @access  Public
const getParties = async (req, res) => {
  try {
    const parties = await Party.find().sort({ name: 1 }).lean();

    // Attach candidate counts
    const partiesWithCount = await Promise.all(
      parties.map(async (party) => {
        const candidateCount = await Candidate.countDocuments({ party: party._id });
        return { ...party, candidateCount };
      })
    );

    res.json({ success: true, parties: partiesWithCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single party with its candidates
// @route   GET /api/parties/:id
// @access  Public
const getPartyById = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) return res.status(404).json({ success: false, message: 'Party not found' });

    const candidates = await Candidate.find({ party: party._id })
      .select('name photo electionType constituency tehsil city province totalVotes symbol')
      .lean();

    res.json({ success: true, party, candidates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update party
// @route   PUT /api/parties/:id
// @access  Admin
const updateParty = async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) update.flag = `/uploads/${req.file.filename}`;
    if (update.foundedYear) update.foundedYear = Number(update.foundedYear);
    if (update.isIndependent !== undefined)
      update.isIndependent = update.isIndependent === 'true' || update.isIndependent === true;

    const party = await Party.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!party) return res.status(404).json({ success: false, message: 'Party not found' });
    res.json({ success: true, party });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete party
// @route   DELETE /api/parties/:id
// @access  Admin
const deleteParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndDelete(req.params.id);
    if (!party) return res.status(404).json({ success: false, message: 'Party not found' });

    // Unlink candidates from deleted party
    await Candidate.updateMany({ party: req.params.id }, { $set: { party: null } });

    res.json({ success: true, message: 'Party deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get independent candidates (no party)
// @route   GET /api/parties/independent/candidates
// @access  Public
const getIndependentCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({ party: null })
      .select('name photo electionType constituency tehsil city province totalVotes symbol')
      .lean();
    res.json({ success: true, candidates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createParty,
  getParties,
  getPartyById,
  updateParty,
  deleteParty,
  getIndependentCandidates,
};
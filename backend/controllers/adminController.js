const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Party = require('../models/Party');
const Announcement = require('../models/Announcement');
const Schedule = require('../models/Schedule');
const { candidateWelcomeEmail, votingStartEmail } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

// Parties
const createParty = async (req, res) => {
  try {
    const { name, abbreviation, leaderName, foundedYear, history, isIndependent } = req.body;
    const flag = req.file ? `/uploads/${req.file.filename}` : null;
    const party = await Party.create({ name, abbreviation, leaderName, foundedYear, history, flag, isIndependent: isIndependent === 'true' });
    res.status(201).json({ success: true, party });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getParties = async (req, res) => {
  try {
    const parties = await Party.find().lean();
    res.json({ success: true, parties });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getPartyById = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) return res.status(404).json({ success: false, message: 'Party not found' });
    const candidates = await Candidate.find({ party: party._id }).lean();
    res.json({ success: true, party, candidates });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateParty = async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) update.flag = `/uploads/${req.file.filename}`;
    const party = await Party.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, party });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteParty = async (req, res) => {
  try {
    await Party.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Party deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Candidates
const createCandidate = async (req, res) => {
  try {
    const { name, email, constituency, tehsil, city, province, electionType, cnic, party } = req.body;
    const photo = req.files?.photo ? `/uploads/${req.files.photo[0].filename}` : null;
    const symbol = req.files?.symbol ? `/uploads/${req.files.symbol[0].filename}` : null;

    const existing = await Candidate.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Candidate already exists.' });

    const tempPassword = uuidv4().slice(0, 10) + 'Aa1!';
    const candidate = await Candidate.create({
      name, email, password: tempPassword, tempPassword, constituency,
      tehsil, city, province, electionType, cnic,
      party: party && party !== 'independent' ? party : null,
      photo, symbol, mustChangePassword: true
    });

    await candidateWelcomeEmail(email, name, tempPassword);
    res.status(201).json({ success: true, candidate });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().populate('party', 'name abbreviation').lean();
    res.json({ success: true, candidates });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteCandidate = async (req, res) => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Candidate deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Voters
const getVoters = async (req, res) => {
  try {
    const voters = await User.find().select('-password -faceDescriptor').lean();
    res.json({ success: true, voters });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Announcements
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, displayOn } = req.body;
    const announcement = await Announcement.create({ title, message, displayOn, createdBy: req.user._id });
    res.status(201).json({ success: true, announcement });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getAnnouncements = async (req, res) => {
  try {
    const { page } = req.query;
    const query = page ? { displayOn: page } : {};
    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, announcement });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Voting Schedule
const createSchedule = async (req, res) => {
  try {
    const { title, startTime, endTime, description, electionType } = req.body;
    const schedule = await Schedule.create({
      title, startTime, endTime, description, electionType,
      isActive: true, createdBy: req.user._id
    });

    // Notify all voters and candidates
    const voters = await User.find({}, 'email firstName');
    const candidates = await Candidate.find({}, 'email name');

    const allEmails = [
      ...voters.map(v => ({ email: v.email, name: v.firstName })),
      ...candidates.map(c => ({ email: c.email, name: c.name }))
    ];

    // Send emails in background (don't block response)
    Promise.all(allEmails.map(({ email, name }) =>
      votingStartEmail(email, name, startTime, endTime).catch(console.error)
    ));

    // Add notification to all users
    await User.updateMany({}, {
      $push: { notifications: { message: `🗳️ Voting has started! Vote from ${new Date(startTime).toLocaleString()} to ${new Date(endTime).toLocaleString()}` } }
    });
    await Candidate.updateMany({}, {
      $push: { notifications: { message: `🗳️ Voting has started! Ends at ${new Date(endTime).toLocaleString()}` } }
    });

    res.status(201).json({ success: true, schedule });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ createdAt: -1 });
    res.json({ success: true, schedules });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getActiveSchedule = async (req, res) => {
  try {
    const now = new Date();
    const schedule = await Schedule.findOne({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now }
    });
    res.json({ success: true, schedule, isActive: !!schedule });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, schedule });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Schedule deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = {
  createParty, getParties, getPartyById, updateParty, deleteParty,
  createCandidate, getCandidates, deleteCandidate,
  getVoters,
  createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement,
  createSchedule, getSchedules, getActiveSchedule, updateSchedule, deleteSchedule
};
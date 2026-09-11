const Schedule  = require('../models/Schedule');
const User      = require('../models/User');
const Candidate = require('../models/Candidate');

// @desc    Create voting schedule
// @route   POST /api/schedule
// @access  Admin
const createSchedule = async (req, res) => {
  try {
    const { title, startTime, endTime, description, electionType } = req.body;

    // ── Validate required fields ──────────────────────────────────────────────
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Schedule title is required.' });
    }
    if (!startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Start time and end time are required.' });
    }

    const start = new Date(startTime);
    const end   = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format for start or end time.' });
    }
    if (start >= end) {
      return res.status(400).json({ success: false, message: 'End time must be after start time.' });
    }

    // ── Create the schedule ───────────────────────────────────────────────────
    const schedule = await Schedule.create({
      title: title.trim(),
      startTime: start,
      endTime:   end,
      description: description || '',
      electionType: electionType || 'Both',
      isActive: true,
      createdBy: req.user._id,
    });

    // ── Push in-app notifications to all voters and candidates ────────────────
    const notifMsg = `🗳️ Voting has started! "${schedule.title}" — Vote from ${start.toLocaleString()} to ${end.toLocaleString()}`;
    await User.updateMany({}, { $push: { notifications: { message: notifMsg, read: false, createdAt: new Date() } } });
    await Candidate.updateMany({}, { $push: { notifications: { message: notifMsg, read: false, createdAt: new Date() } } });

    res.status(201).json({ success: true, schedule });
  } catch (err) {
    console.error('[scheduleController] createSchedule error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all schedules
// @route   GET /api/schedule
// @access  Admin / Public
const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get currently active schedule
// @route   GET /api/schedule/active
// @access  Public
const getActiveSchedule = async (req, res) => {
  try {
    const now = new Date();
    const schedule = await Schedule.findOne({
      isActive: true,
      isEnded: false,
      startTime: { $lte: now },
      endTime: { $gte: now },
    });
    res.json({ success: true, schedule, isActive: !!schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single schedule by ID
// @route   GET /api/schedule/:id
// @access  Admin
const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('createdBy', 'name email');
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update schedule
// @route   PUT /api/schedule/:id
// @access  Admin
const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, schedule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    End/close a schedule
// @route   PATCH /api/schedule/:id/end
// @access  Admin
const endSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { isActive: false, isEnded: true },
      { new: true }
    );
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

    const notifMsg = `🔒 Voting has ended for "${schedule.title}". Results will be announced shortly.`;
    await User.updateMany({}, { $push: { notifications: { message: notifMsg, read: false, createdAt: new Date() } } });
    await Candidate.updateMany({}, { $push: { notifications: { message: notifMsg, read: false, createdAt: new Date() } } });

    res.json({ success: true, schedule, message: 'Voting schedule ended and results finalized.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedule/:id
// @access  Admin
const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createSchedule,
  getSchedules,
  getActiveSchedule,
  getScheduleById,
  updateSchedule,
  endSchedule,
  deleteSchedule,
};
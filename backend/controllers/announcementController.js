const Announcement = require('../models/Announcement');

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Admin
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, displayOn } = req.body;
    const announcement = await Announcement.create({
      title,
      message,
      displayOn: Array.isArray(displayOn) ? displayOn : [displayOn],
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all announcements (optionally filter by page)
// @route   GET /api/announcements?page=landing
// @access  Public
const getAnnouncements = async (req, res) => {
  try {
    const { page } = req.query;
    const query = { isActive: true };
    if (page) query.displayOn = page;
    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all announcements for admin management
// @route   GET /api/announcements/all
// @access  Admin
const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Admin
const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement)
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Admin
const updateAnnouncement = async (req, res) => {
  try {
    const { title, message, displayOn, isActive } = req.body;
    const update = { title, message, isActive };
    if (displayOn) update.displayOn = Array.isArray(displayOn) ? displayOn : [displayOn];

    const announcement = await Announcement.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!announcement)
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Admin
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement)
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Toggle announcement active status
// @route   PATCH /api/announcements/:id/toggle
// @access  Admin
const toggleAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement)
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    announcement.isActive = !announcement.isActive;
    await announcement.save();
    res.json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncement,
};
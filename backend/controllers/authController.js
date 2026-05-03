const User = require('../models/User');
const Admin = require('../models/Admin');
const Candidate = require('../models/Candidate');
const CnicDummy = require('../models/CnicDummy');
const generateToken = require('../utils/generateToken');
const generateOtp = require('../utils/generateOtp');
const { compareFaceDescriptors } = require('../services/faceService');
const { otpEmail } = require('../services/emailService');

// @desc    Register voter
// @route   POST /api/auth/register
// @access  Public
const registerVoter = async (req, res) => {
  try {
    const {
      firstName, middleName, lastName, cnicNumber, cnicExpiry,
      dateOfBirth, gender, address, district, city, area, tehsil,
      province, password, faceDescriptor
    } = req.body;

    // Check CNIC exists in dummy collection
    const cnicRecord = await CnicDummy.findOne({ cnicNumber });
    if (!cnicRecord) {
      return res.status(400).json({ success: false, message: 'CNIC not found in national database. Please verify your CNIC.' });
    }

    // Check if already registered
    if (cnicRecord.isRegistered) {
      return res.status(400).json({ success: false, message: 'This CNIC is already registered as a voter.' });
    }

    // Verify CNIC details match
    if (cnicRecord.firstName.toLowerCase() !== firstName.toLowerCase() ||
        cnicRecord.lastName.toLowerCase() !== lastName.toLowerCase()) {
      return res.status(400).json({ success: false, message: 'CNIC details do not match national records.' });
    }

    const existing = await User.findOne({ cnicNumber });
    if (existing) return res.status(400).json({ success: false, message: 'Voter already registered with this CNIC.' });

    const profileImage = req.files?.profileImage ? `/uploads/${req.files.profileImage[0].filename}` : null;
    const cnicFrontImage = req.files?.cnicFrontImage ? `/uploads/${req.files.cnicFrontImage[0].filename}` : null;
    const cnicBackImage = req.files?.cnicBackImage ? `/uploads/${req.files.cnicBackImage[0].filename}` : null;

    const user = await User.create({
      firstName, middleName, lastName, cnicNumber, cnicExpiry,
      dateOfBirth, gender, address, district, city, area, tehsil,
      province, password, profileImage, cnicFrontImage, cnicBackImage,
      faceDescriptor: faceDescriptor ? JSON.parse(faceDescriptor) : [],
      isVerified: true
    });

    // Mark CNIC as registered
    await CnicDummy.findOneAndUpdate({ cnicNumber }, { isRegistered: true });

    const token = generateToken(user._id, 'voter');
    res.status(201).json({
      success: true,
      message: 'Voter registered successfully!',
      token,
      user: {
        id: user._id, firstName: user.firstName, lastName: user.lastName,
        cnicNumber: user.cnicNumber, role: 'voter', tehsil: user.tehsil,
        profileImage: user.profileImage, faceDescriptor: user.faceDescriptor
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Login voter
// @route   POST /api/auth/voter-login
// @access  Public
const voterLogin = async (req, res) => {
  try {
    const { cnicNumber, password, liveDescriptor } = req.body;
    const user = await User.findOne({ cnicNumber });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid CNIC or password.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid CNIC or password.' });

    // Face verification at login
    if (liveDescriptor && user.faceDescriptor && user.faceDescriptor.length > 0) {
      const result = compareFaceDescriptors(user.faceDescriptor, liveDescriptor);
      if (!result.match) {
        return res.status(401).json({ success: false, message: 'Face verification failed. Please ensure you are the registered voter.' });
      }
    }

    const token = generateToken(user._id, 'voter');
    res.json({
      success: true,
      token,
      user: {
        id: user._id, firstName: user.firstName, lastName: user.lastName,
        cnicNumber: user.cnicNumber, role: 'voter', tehsil: user.tehsil,
        province: user.province, profileImage: user.profileImage,
        faceDescriptor: user.faceDescriptor, hasVotedMNA: user.hasVotedMNA,
        hasVotedMPA: user.hasVotedMPA, gender: user.gender,
        city: user.city, district: user.district, address: user.address
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Login admin
// @route   POST /api/auth/admin-login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const token = generateToken(admin._id, 'admin');
    res.json({
      success: true,
      token,
      user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Login candidate
// @route   POST /api/auth/candidate-login
// @access  Public
const candidateLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await Candidate.findOne({ email }).populate('party', 'name abbreviation');
    if (!candidate) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const isMatch = await candidate.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const token = generateToken(candidate._id, 'candidate');
    res.json({
      success: true,
      token,
      mustChangePassword: candidate.mustChangePassword,
      user: {
        id: candidate._id, name: candidate.name, email: candidate.email,
        role: 'candidate', party: candidate.party, electionType: candidate.electionType,
        constituency: candidate.constituency, tehsil: candidate.tehsil,
        photo: candidate.photo, totalVotes: candidate.totalVotes,
        mustChangePassword: candidate.mustChangePassword
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Change candidate password
// @route   PUT /api/auth/change-password
// @access  Candidate
const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const candidate = await Candidate.findById(req.user._id);
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });
    candidate.password = newPassword;
    candidate.mustChangePassword = false;
    candidate.tempPassword = null;
    await candidate.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Forgot password (candidate)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const candidate = await Candidate.findOne({ email });
    if (!candidate) return res.status(404).json({ success: false, message: 'No candidate found with this email.' });

    const otp = generateOtp();
    candidate.resetOtp = otp;
    candidate.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await candidate.save({ validateBeforeSave: false });

    await otpEmail(email, otp);
    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const candidate = await Candidate.findOne({ email, resetOtp: otp });
    if (!candidate) return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    if (candidate.resetOtpExpiry < Date.now()) return res.status(400).json({ success: false, message: 'OTP has expired.' });

    candidate.password = newPassword;
    candidate.resetOtp = undefined;
    candidate.resetOtpExpiry = undefined;
    candidate.mustChangePassword = false;
    await candidate.save();
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Verify face descriptor
// @route   POST /api/auth/verify-face
// @access  Voter
const verifyFace = async (req, res) => {
  try {
    const { liveDescriptor } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.faceDescriptor || user.faceDescriptor.length === 0) {
      return res.json({ success: true, match: true, message: 'No stored descriptor' });
    }
    const result = compareFaceDescriptors(user.faceDescriptor, liveDescriptor);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Protected
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = {
  registerVoter, voterLogin, adminLogin, candidateLogin,
  changePassword, forgotPassword, resetPassword, verifyFace, getMe
};
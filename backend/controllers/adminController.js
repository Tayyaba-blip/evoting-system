// const User = require('../models/User');
// const Candidate = require('../models/Candidate');
// const Party = require('../models/Party');
// const Announcement = require('../models/Announcement');
// const Schedule = require('../models/Schedule');
// const { candidateWelcomeEmail, votingStartEmail } = require('../services/emailService');
// const { v4: uuidv4 } = require('uuid');

// // Parties
// const createParty = async (req, res) => {
//   try {
//     const { name, abbreviation, leaderName, foundedYear, history, isIndependent } = req.body;
//     const flag = req.file ? `/uploads/${req.file.filename}` : null;
//     const party = await Party.create({ name, abbreviation, leaderName, foundedYear, history, flag, isIndependent: isIndependent === 'true' });
//     res.status(201).json({ success: true, party });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const getParties = async (req, res) => {
//   try {
//     const parties = await Party.find().lean();
//     res.json({ success: true, parties });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const getPartyById = async (req, res) => {
//   try {
//     const party = await Party.findById(req.params.id);
//     if (!party) return res.status(404).json({ success: false, message: 'Party not found' });
//     const candidates = await Candidate.find({ party: party._id }).lean();
//     res.json({ success: true, party, candidates });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const updateParty = async (req, res) => {
//   try {
//     const update = { ...req.body };
//     if (req.file) update.flag = `/uploads/${req.file.filename}`;
//     const party = await Party.findByIdAndUpdate(req.params.id, update, { new: true });
//     res.json({ success: true, party });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const deleteParty = async (req, res) => {
//   try {
//     await Party.findByIdAndDelete(req.params.id);
//     res.json({ success: true, message: 'Party deleted' });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// // Candidates
// const createCandidate = async (req, res) => {
//   try {
//     const { name, email, constituency, tehsil, city, province, electionType, cnic, party } = req.body;
//     const photo = req.files?.photo ? `/uploads/${req.files.photo[0].filename}` : null;
//     const symbol = req.files?.symbol ? `/uploads/${req.files.symbol[0].filename}` : null;

//     const existing = await Candidate.findOne({ email });
//     if (existing) return res.status(400).json({ success: false, message: 'Candidate already exists.' });

//     const tempPassword = uuidv4().slice(0, 10) + 'Aa1!';
//     const candidate = await Candidate.create({
//       name, email, password: tempPassword, tempPassword, constituency,
//       tehsil, city, province, electionType, cnic,
//       party: party && party !== 'independent' ? party : null,
//       photo, symbol, mustChangePassword: true
//     });

//     await candidateWelcomeEmail(email, name, tempPassword);
//     res.status(201).json({ success: true, candidate });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const getCandidates = async (req, res) => {
//   try {
//     const candidates = await Candidate.find().populate('party', 'name abbreviation').lean();
//     res.json({ success: true, candidates });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const deleteCandidate = async (req, res) => {
//   try {
//     await Candidate.findByIdAndDelete(req.params.id);
//     res.json({ success: true, message: 'Candidate deleted' });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// // Voters
// const getVoters = async (req, res) => {
//   try {
//     const voters = await User.find().select('-password -faceDescriptor').lean();
//     res.json({ success: true, voters });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// // Announcements
// const createAnnouncement = async (req, res) => {
//   try {
//     const { title, message, displayOn } = req.body;
//     const announcement = await Announcement.create({ title, message, displayOn, createdBy: req.user._id });
//     res.status(201).json({ success: true, announcement });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const getAnnouncements = async (req, res) => {
//   try {
//     const { page } = req.query;
//     const query = page ? { displayOn: page } : {};
//     const announcements = await Announcement.find(query).sort({ createdAt: -1 });
//     res.json({ success: true, announcements });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const updateAnnouncement = async (req, res) => {
//   try {
//     const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json({ success: true, announcement });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const deleteAnnouncement = async (req, res) => {
//   try {
//     await Announcement.findByIdAndDelete(req.params.id);
//     res.json({ success: true, message: 'Announcement deleted' });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// // Voting Schedule
// const createSchedule = async (req, res) => {
//   try {
//     const { title, startTime, endTime, description, electionType } = req.body;
//     const schedule = await Schedule.create({
//       title, startTime, endTime, description, electionType,
//       isActive: true, createdBy: req.user._id
//     });

//     // Notify all voters and candidates
//     const voters = await User.find({}, 'email firstName');
//     const candidates = await Candidate.find({}, 'email name');

//     const allEmails = [
//       ...voters.map(v => ({ email: v.email, name: v.firstName })),
//       ...candidates.map(c => ({ email: c.email, name: c.name }))
//     ];

//     // Send emails in background (don't block response)
//     Promise.all(allEmails.map(({ email, name }) =>
//       votingStartEmail(email, name, startTime, endTime).catch(console.error)
//     ));

//     // Add notification to all users
//     await User.updateMany({}, {
//       $push: { notifications: { message: `🗳️ Voting has started! Vote from ${new Date(startTime).toLocaleString()} to ${new Date(endTime).toLocaleString()}` } }
//     });
//     await Candidate.updateMany({}, {
//       $push: { notifications: { message: `🗳️ Voting has started! Ends at ${new Date(endTime).toLocaleString()}` } }
//     });

//     res.status(201).json({ success: true, schedule });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const getSchedules = async (req, res) => {
//   try {
//     const schedules = await Schedule.find().sort({ createdAt: -1 });
//     res.json({ success: true, schedules });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const getActiveSchedule = async (req, res) => {
//   try {
//     const now = new Date();
//     const schedule = await Schedule.findOne({
//       isActive: true,
//       startTime: { $lte: now },
//       endTime: { $gte: now }
//     });
//     res.json({ success: true, schedule, isActive: !!schedule });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const updateSchedule = async (req, res) => {
//   try {
//     const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json({ success: true, schedule });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// const deleteSchedule = async (req, res) => {
//   try {
//     await Schedule.findByIdAndDelete(req.params.id);
//     res.json({ success: true, message: 'Schedule deleted' });
//   } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// module.exports = {
//   createParty, getParties, getPartyById, updateParty, deleteParty,
//   createCandidate, getCandidates, deleteCandidate,
//   getVoters,
//   createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement,
//   createSchedule, getSchedules, getActiveSchedule, updateSchedule, deleteSchedule
// };
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Party = require('../models/Party');
const Announcement = require('../models/Announcement');
const Schedule = require('../models/Schedule');

const {
  candidateWelcomeEmail,
  votingStartEmail
} = require('../services/emailService');

const { v4: uuidv4 } = require('uuid');


// =====================================================
// PARTIES
// =====================================================

const createParty = async (req, res) => {
  try {
    const {
      name,
      abbreviation,
      leaderName,
      foundedYear,
      history,
      isIndependent
    } = req.body;

    const flag = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const party = await Party.create({
      name,
      abbreviation,
      leaderName,
      foundedYear,
      history,
      flag,
      isIndependent: isIndependent === 'true'
    });

    return res.status(201).json({
      success: true,
      party
    });

  } catch (err) {
    console.error('CREATE PARTY ERROR:', err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const getParties = async (req, res) => {
  try {
    const parties = await Party.find().lean();

    return res.json({
      success: true,
      parties
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const getPartyById = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);

    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Party not found'
      });
    }

    const candidates = await Candidate.find({
      party: party._id
    }).lean();

    return res.json({
      success: true,
      party,
      candidates
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const updateParty = async (req, res) => {
  try {
    const update = {
      ...req.body
    };

    if (req.file) {
      update.flag = `/uploads/${req.file.filename}`;
    }

    const party = await Party.findByIdAndUpdate(
      req.params.id,
      update,
      {
        new: true
      }
    );

    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Party not found'
      });
    }

    return res.json({
      success: true,
      party
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const deleteParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndDelete(req.params.id);

    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Party not found'
      });
    }

    return res.json({
      success: true,
      message: 'Party deleted'
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =====================================================
// CANDIDATES
// =====================================================

const createCandidate = async (req, res) => {
  try {
    const {
      name,
      email,
      constituency,
      tehsil,
      city,
      province,
      electionType,
      cnic,
      party
    } = req.body;

    // -------------------------------------------------
    // Basic validation
    // -------------------------------------------------

    if (
      !name ||
      !email ||
      !constituency ||
      !tehsil ||
      !city ||
      !province ||
      !electionType
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required candidate information.'
      });
    }

    // -------------------------------------------------
    // Normalize email
    // -------------------------------------------------

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // -------------------------------------------------
    // Prevent duplicate candidate
    // -------------------------------------------------

    const existingCandidate = await Candidate.findOne({
      email: normalizedEmail
    });

    if (existingCandidate) {
      return res.status(409).json({
        success: false,
        message: 'A candidate with this email already exists.'
      });
    }

    // -------------------------------------------------
    // Uploaded files
    // -------------------------------------------------

    const photo = req.files?.photo?.[0]
      ? `/uploads/${req.files.photo[0].filename}`
      : null;

    const symbol = req.files?.symbol?.[0]
      ? `/uploads/${req.files.symbol[0].filename}`
      : null;

    // -------------------------------------------------
    // Generate temporary password
    // -------------------------------------------------

    const tempPassword =
      uuidv4().replace(/-/g, '').slice(0, 10) + 'Aa1!';

    // -------------------------------------------------
    // Create candidate
    // -------------------------------------------------

    const candidate = await Candidate.create({
      name,
      email: normalizedEmail,

      // If your Candidate model hashes passwords in
      // pre('save'), it will hash this automatically.
      password: tempPassword,

      // Used for your current temporary-password system.
      tempPassword,

      constituency,
      tehsil,
      city,
      province,
      electionType,
      cnic,

      party:
        party &&
        party !== 'independent'
          ? party
          : null,

      photo,
      symbol,

      mustChangePassword: true
    });

    console.log(
      `Candidate created successfully: ${candidate._id}`
    );

    // -------------------------------------------------
    // EMAIL
    // -------------------------------------------------
    // IMPORTANT:
    // Email failure must NOT turn candidate creation
    // into a failed request.
    // -------------------------------------------------

    let emailSent = false;

    try {
      await candidateWelcomeEmail(
        normalizedEmail,
        name,
        tempPassword
      );

      emailSent = true;

      console.log(
        `Welcome email sent successfully to ${normalizedEmail}`
      );

    } catch (emailError) {
      console.error(
        `Candidate ${candidate._id} was created, but email failed:`,
        emailError.message
      );

      // Do NOT throw here.
      // Candidate creation already succeeded.
    }

    // -------------------------------------------------
    // Safe candidate response
    // -------------------------------------------------

    const safeCandidate = candidate.toObject();

    delete safeCandidate.password;
    delete safeCandidate.tempPassword;

    // -------------------------------------------------
    // Successful response
    // -------------------------------------------------

    return res.status(201).json({
      success: true,

      message: emailSent
        ? 'Candidate created successfully and welcome email sent.'
        : 'Candidate created successfully, but the welcome email could not be sent.',

      candidate: safeCandidate,
      emailSent
    });

  } catch (err) {
    console.error('CREATE CANDIDATE ERROR:', err);

    // Extra MongoDB duplicate protection
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A candidate with this email already exists.'
      });
    }

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        'Failed to create candidate.'
    });
  }
};


const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .select('-password -tempPassword')
      .populate(
        'party',
        'name abbreviation'
      )
      .lean();

    return res.json({
      success: true,
      candidates
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const deleteCandidate = async (req, res) => {
  try {
    const candidate =
      await Candidate.findByIdAndDelete(
        req.params.id
      );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    return res.json({
      success: true,
      message: 'Candidate deleted'
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =====================================================
// VOTERS
// =====================================================

const getVoters = async (req, res) => {
  try {
    const voters = await User.find()
      .select('-password -faceDescriptor')
      .lean();

    return res.json({
      success: true,
      voters
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =====================================================
// ANNOUNCEMENTS
// =====================================================

const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      message,
      displayOn
    } = req.body;

    const announcement =
      await Announcement.create({
        title,
        message,
        displayOn,
        createdBy: req.user._id
      });

    return res.status(201).json({
      success: true,
      announcement
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const getAnnouncements = async (req, res) => {
  try {
    const { page } = req.query;

    const query = page
      ? { displayOn: page }
      : {};

    const announcements =
      await Announcement.find(query)
        .sort({
          createdAt: -1
        });

    return res.json({
      success: true,
      announcements
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const updateAnnouncement = async (req, res) => {
  try {
    const announcement =
      await Announcement.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true
        }
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    return res.json({
      success: true,
      announcement
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const deleteAnnouncement = async (req, res) => {
  try {
    const announcement =
      await Announcement.findByIdAndDelete(
        req.params.id
      );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    return res.json({
      success: true,
      message: 'Announcement deleted'
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =====================================================
// VOTING SCHEDULE
// =====================================================

const createSchedule = async (req, res) => {
  try {
    const {
      title,
      startTime,
      endTime,
      description,
      electionType
    } = req.body;

    const schedule = await Schedule.create({
      title,
      startTime,
      endTime,
      description,
      electionType,
      isActive: true,
      createdBy: req.user._id
    });

    // Get voters and candidates
    const voters = await User.find(
      {},
      'email firstName'
    );

    const candidates = await Candidate.find(
      {},
      'email name'
    );

    const allEmails = [
      ...voters.map((v) => ({
        email: v.email,
        name: v.firstName
      })),

      ...candidates.map((c) => ({
        email: c.email,
        name: c.name
      }))
    ];

    // Send emails without blocking schedule creation
    Promise.allSettled(
      allEmails.map(({ email, name }) =>
        votingStartEmail(
          email,
          name,
          startTime,
          endTime
        )
      )
    ).then((results) => {
      const failed = results.filter(
        (result) =>
          result.status === 'rejected'
      );

      if (failed.length > 0) {
        console.error(
          `${failed.length} voting notification email(s) failed.`
        );
      }
    });

    // Add voter notifications
    await User.updateMany(
      {},
      {
        $push: {
          notifications: {
            message:
              `Voting has started! Vote from ${new Date(
                startTime
              ).toLocaleString()} to ${new Date(
                endTime
              ).toLocaleString()}`
          }
        }
      }
    );

    // Add candidate notifications
    await Candidate.updateMany(
      {},
      {
        $push: {
          notifications: {
            message:
              `Voting has started! Ends at ${new Date(
                endTime
              ).toLocaleString()}`
          }
        }
      }
    );

    return res.status(201).json({
      success: true,
      schedule
    });

  } catch (err) {
    console.error(
      'CREATE SCHEDULE ERROR:',
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .sort({
        createdAt: -1
      });

    return res.json({
      success: true,
      schedules
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const getActiveSchedule = async (req, res) => {
  try {
    const now = new Date();

    const schedule =
      await Schedule.findOne({
        isActive: true,

        startTime: {
          $lte: now
        },

        endTime: {
          $gte: now
        }
      });

    return res.json({
      success: true,
      schedule,
      isActive: !!schedule
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const updateSchedule = async (req, res) => {
  try {
    const schedule =
      await Schedule.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true
        }
      );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    return res.json({
      success: true,
      schedule
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


const deleteSchedule = async (req, res) => {
  try {
    const schedule =
      await Schedule.findByIdAndDelete(
        req.params.id
      );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    return res.json({
      success: true,
      message: 'Schedule deleted'
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createParty,
  getParties,
  getPartyById,
  updateParty,
  deleteParty,

  createCandidate,
  getCandidates,
  deleteCandidate,

  getVoters,

  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,

  createSchedule,
  getSchedules,
  getActiveSchedule,
  updateSchedule,
  deleteSchedule
};
// const express = require('express');
// const router = express.Router();
// const upload = require('../middleware/upload');
// const protect = require('../middleware/auth');
// const {
//   registerVoter, voterLogin, adminLogin, candidateLogin,
//   changePassword, forgotPassword, resetPassword, verifyFace, getMe
// } = require('../controllers/authController');

// router.post('/register', upload.fields([
//   { name: 'profileImage', maxCount: 1 },
//   { name: 'cnicFrontImage', maxCount: 1 },
//   { name: 'cnicBackImage', maxCount: 1 }
// ]), registerVoter);

// router.post('/voter-login', voterLogin);
// router.post('/admin-login', adminLogin);
// router.post('/candidate-login', candidateLogin);
// router.put('/change-password', protect(['candidate']), changePassword);
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password', resetPassword);
// router.post('/verify-face', protect(['voter']), verifyFace);
// router.get('/me', protect(['voter', 'admin', 'candidate']), getMe);

// module.exports = router;

// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const protect = require('../middleware/auth');

const {
  registerVoter,
  voterLogin,
  adminLogin,
  candidateLogin,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyFace,
  getMe
} = require('../controllers/authController');

const registerUpload = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'cnicFrontImage', maxCount: 1 },
  { name: 'cnicBackImage', maxCount: 1 }
]);

router.post('/register', (req, res, next) => {
  registerUpload(req, res, (err) => {
    if (err) {
      console.error('MULTER ERROR:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.'
      });
    }

    next();
  });
}, registerVoter);

router.post('/voter-login', voterLogin);
router.post('/admin-login', adminLogin);
router.post('/candidate-login', candidateLogin);
router.put('/change-password', protect(['candidate']), changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-face', protect(['voter']), verifyFace);
router.get('/me', protect(['voter', 'admin', 'candidate']), getMe);

module.exports = router;
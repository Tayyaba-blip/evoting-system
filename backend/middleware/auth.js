const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Candidate = require('../models/Candidate');

const protect = (roles = []) => async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.role === 'admin') user = await Admin.findById(decoded.id).select('-password');
    else if (decoded.role === 'candidate') user = await Candidate.findById(decoded.id).select('-password');
    else user = await User.findById(decoded.id).select('-password');

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (roles.length && !roles.includes(decoded.role))
      return res.status(403).json({ success: false, message: 'Access forbidden' });

    req.user = { ...user.toObject(), role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

module.exports = protect;
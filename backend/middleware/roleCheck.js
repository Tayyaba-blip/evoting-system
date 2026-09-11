// @desc  Role-based access control middleware
// Usage: router.get('/path', protect, roleCheck('admin'), handler)
//        router.get('/path', protect, roleCheck('voter', 'admin'), handler)

const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

// Shorthand guards
const isAdmin = roleCheck('admin');
const isVoter = roleCheck('voter');
const isCandidate = roleCheck('candidate');
const isAdminOrCandidate = roleCheck('admin', 'candidate');
const isVoterOrAdmin = roleCheck('voter', 'admin');

module.exports = { roleCheck, isAdmin, isVoter, isCandidate, isAdminOrCandidate, isVoterOrAdmin };
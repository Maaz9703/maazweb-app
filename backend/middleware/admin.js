/**
 * Admin middleware - restrict access to admin users only
 * Must be used after auth middleware
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
};

module.exports = admin;

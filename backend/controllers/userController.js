const User = require('../models/User');

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard stats (Admin)
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
const getStats = async (req, res, next) => {
  try {
    const Order = require('../models/Order');

    const [totalUsers, totalOrders, ordersResult] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = ordersResult[0]?.totalRevenue || 0;
    const completedOrders = ordersResult[0]?.count || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue,
        completedOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getStats };

const User = require('../models/User');
const Order = require('../models/Order');
const TailorProfile = require('../models/TailorProfile');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
};

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalTailors = await User.countDocuments({ role: 'tailor' }); // Users with role tailor
    // Or check TailorProfile count:
    const activeShops = await TailorProfile.countDocuments();

    const totalOrders = await Order.countDocuments();

    // Calculate "Revenue" (Sum of prices of completed orders, or just all orders for MVP)
    const orders = await Order.find({ status: { $in: ['accepted', 'completed'] } });
    const totalRevenue = orders.reduce((acc, order) => acc + (order.price || 0), 0);

    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    res.json({
        totalUsers,
        totalTailors: activeShops,
        totalOrders,
        totalRevenue,
        pendingOrders
    });
};

module.exports = {
    getAllUsers,
    getPlatformStats,
};

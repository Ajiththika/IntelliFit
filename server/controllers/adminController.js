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

// @desc    Get all pending role requests
// @route   GET /api/admin/role-requests
// @access  Private/Admin
const getRoleRequests = async (req, res) => {
    const users = await User.find({ roleRequest: { $ne: null } }).select('-password');
    res.json(users);
};

// @desc    Approve or Reject role request
// @route   PUT /api/admin/role-requests/:id
// @access  Private/Admin
const updateRoleStatus = async (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'
    const user = await User.findById(req.params.id);

    if (user && user.roleRequest) {
        if (status === 'approved') {
            if (!user.allowedRoles.includes(user.roleRequest)) {
                user.allowedRoles.push(user.roleRequest);
            }
            // Optionally auto-switch them? No, let them switch.
        }

        // Clear request regardless of approval/rejection
        user.roleRequest = null;

        await user.save();
        res.json({ message: `Role request ${status}` });
    } else {
        res.status(404);
        throw new Error('User or request not found');
    }
};

module.exports = {
    getAllUsers,
    getPlatformStats,
    getRoleRequests,
    updateRoleStatus,
};

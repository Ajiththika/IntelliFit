const User = require('../models/User');
const Order = require('../models/Order');
const TailorProfile = require('../models/TailorProfile');
const AuditLog = require('../models/AuditLog');

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
    const totalAdmins = await User.countDocuments({ role: { $in: ['admin', 'superadmin'] } });
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
        totalAdmins,
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
        }

        const roleRequested = user.roleRequest;
        user.roleRequest = null;
        await user.save();

        // Log Action
        await AuditLog.create({
            admin: req.user._id,
            action: status === 'approved' ? 'APPROVE_ROLE' : 'REJECT_ROLE',
            targetUser: user._id,
            details: `Role request for ${roleRequested} was ${status}`
        });

        res.json({ message: `Role request ${status}` });
    } else {
        res.status(404);
        throw new Error('User or request not found');
    }
};

// @desc    Suspend or Activate User
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
const suspendUser = async (req, res) => {
    const { isActive } = req.body; // true = activate, false = suspend
    const user = await User.findById(req.params.id);

    if (user) {
        user.isActive = isActive;
        await user.save();

        await AuditLog.create({
            admin: req.user._id,
            action: isActive ? 'ACTIVATE_USER' : 'SUSPEND_USER',
            targetUser: user._id,
            details: `User account status set to ${isActive ? 'Active' : 'Suspended'}`
        });

        res.json({ message: `User ${isActive ? 'activated' : 'suspended'}` });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Get Audit Logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
    const logs = await AuditLog.find({})
        .populate('admin', 'name email')
        .populate('targetUser', 'name email')
        .sort('-createdAt')
        .limit(100);
    res.json(logs);
};

module.exports = {
    getAllUsers,
    getPlatformStats,
    getRoleRequests,
    updateRoleStatus,
    suspendUser,
    getAuditLogs
};

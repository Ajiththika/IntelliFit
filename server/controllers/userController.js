const User = require('../models/User');
const TailorProfile = require('../models/TailorProfile');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        let profileData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            allowedRoles: user.allowedRoles,
            roleRequest: user.roleRequest,
            phone: user.phone,
            avatar: user.avatar,
            isPremium: user.isPremium,
        };

        if (user.role === 'tailor') {
            const tailorProfile = await TailorProfile.findOne({ user: user._id });
            if (tailorProfile) {
                profileData = { ...profileData, whatsappNumber: tailorProfile.whatsappNumber };
            }
        }

        res.json(profileData);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.avatar = req.body.avatar || user.avatar;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        let responseData = {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            allowedRoles: updatedUser.allowedRoles,
            roleRequest: updatedUser.roleRequest,
            phone: updatedUser.phone,
            avatar: updatedUser.avatar,
            isPremium: updatedUser.isPremium,
            token: generateToken(updatedUser._id),
        };



        res.json(responseData);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Request a role change
// @route   POST /api/users/request-role
// @access  Private
const requestRoleChange = async (req, res) => {
    const { role } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        if (!['tailor', 'admin', 'superadmin'].includes(role)) {
            res.status(400);
            throw new Error('Invalid role requested');
        }

        user.roleRequest = role;
        const updatedUser = await user.save();

        res.json({
            message: 'Role request submitted',
            roleRequest: updatedUser.roleRequest,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Switch to a different allowed role
// @route   POST /api/users/switch-role
// @access  Private
const switchRole = async (req, res) => {
    const { role } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        if (!user.allowedRoles.includes(role)) {
            res.status(400);
            throw new Error('Role not allowed');
        }

        user.role = role;
        const updatedUser = await user.save();

        res.json({
            message: `Switched to ${role}`,
            role: updatedUser.role,
            allowedRoles: updatedUser.allowedRoles,
            token: generateToken(updatedUser._id), // New token probably needed if claims change, though we fetch user from DB usually
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    requestRoleChange,
    switchRole,
};

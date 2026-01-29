const User = require('../models/User');
const TailorProfile = require('../models/TailorProfile');
const Order = require('../models/Order');
const SizeProfile = require('../models/SizeProfile');
const Review = require('../models/Review');
const AuditLog = require('../models/AuditLog');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
// @desc    Get user profile
// @route   GET /api/users/profile
// @route   GET /api/users/me
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // Fetch Size Profile Link
        const sizeProfile = await SizeProfile.findOne({ user: user._id }, 'status _id');

        // Calculate Completeness
        let filledFields = 0;
        const totalFields = 6; // name, email, phone, city, avatar, sizeProfile

        if (user.name) filledFields++;
        if (user.email) filledFields++;
        if (user.phone) filledFields++;
        if (user.city) filledFields++;
        if (user.avatar) filledFields++;
        if (sizeProfile) filledFields++;

        const completeness = Math.round((filledFields / totalFields) * 100);

        let profileData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            allowedRoles: user.allowedRoles,
            roleRequest: user.roleRequest,
            phone: user.phone,
            city: user.city,
            preferences: user.preferences,
            avatar: user.avatar,
            isPremium: user.isPremium,
            sizeProfile: sizeProfile ? { id: sizeProfile._id, status: sizeProfile.status } : null,
            completeness,
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
// @route   PATCH /api/users/me
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.city = req.body.city || user.city;
        user.avatar = req.body.avatar || user.avatar;

        if (req.body.preferences) {
            // Merge preferences shallowly or deep? 
            // For now, doing a safe merge for known keys to avoid overwriting with incomplete obj if client sends partial
            user.preferences = {
                ...user.preferences,
                ...req.body.preferences,
                notifications: { ...user.preferences?.notifications, ...req.body.preferences?.notifications },
                fashion: { ...user.preferences?.fashion, ...req.body.preferences?.fashion }
            };
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        // Recalculate completeness for response
        const sizeProfile = await SizeProfile.findOne({ user: user._id }, 'status _id');
        let filledFields = 0;
        const totalFields = 6;
        if (updatedUser.name) filledFields++;
        if (updatedUser.email) filledFields++;
        if (updatedUser.phone) filledFields++;
        if (updatedUser.city) filledFields++;
        if (updatedUser.avatar) filledFields++;
        if (sizeProfile) filledFields++;
        const completeness = Math.round((filledFields / totalFields) * 100);

        let responseData = {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            allowedRoles: updatedUser.allowedRoles,
            roleRequest: updatedUser.roleRequest,
            phone: updatedUser.phone,
            city: updatedUser.city,
            preferences: updatedUser.preferences,
            avatar: updatedUser.avatar,
            isPremium: updatedUser.isPremium,
            sizeProfile: sizeProfile ? { id: sizeProfile._id, status: sizeProfile.status } : null,
            completeness,
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
        if (!['tailor', 'admin'].includes(role)) {
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

// @desc    Toggle favorite tailor
// @route   POST /api/users/favorites
// @access  Private
const toggleFavorite = async (req, res) => {
    const { tailorId } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        if (user.favorites.includes(tailorId)) {
            user.favorites = user.favorites.filter(id => id.toString() !== tailorId);
        } else {
            user.favorites.push(tailorId);
        }
        await user.save();

        // Return updated favorites populated
        const updatedUser = await User.findById(req.user._id).populate('favorites', 'businessName specializations coverImage');
        res.json(updatedUser.favorites);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = async (req, res) => {
    const user = await User.findById(req.user._id).populate('favorites', 'businessName specializations coverImage userId');
    if (user) {
        res.json(user.favorites);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Export my data (GDPR)
// @route   GET /api/users/export-data
// @access  Private
const exportUserData = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const sizeProfile = await SizeProfile.findOne({ user: req.user._id });
    const orders = await Order.find({ customer: req.user._id });
    const reviews = await Review.find({ customer: req.user._id });

    // Tailor Data if applicable
    let tailorProfile = null;
    if (user.role === 'tailor') {
        tailorProfile = await TailorProfile.findOne({ user: req.user._id });
    }

    res.json({
        user,
        sizeProfile,
        tailorProfile,
        orders,
        reviews,
        exportedAt: new Date()
    });
};

// @desc    Delete my account (GDPR - Right to Erasure)
// @route   DELETE /api/users/delete-account
// @access  Private
const deleteUserAccount = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // 1. Delete Biometric Data (Hard Delete)
        await SizeProfile.deleteOne({ user: user._id });

        // 2. Anonymize User Record (Soft Delete / Scrub PII)
        // We keep the ID so Orders don't break, but data is gone.
        user.name = 'Deleted User';
        user.email = `deleted_${user._id}@intelifit.local`; // Unique placeholder
        user.password = await bcrypt.hash(Math.random().toString(36), 10); // Unusable password
        user.phone = null;
        user.avatar = null;
        user.favorites = [];
        user.isActive = false;

        // If tailor, remove public profile
        if (user.role === 'tailor') {
            await TailorProfile.deleteOne({ user: user._id });
        }

        await user.save();

        // 3. Log Audit
        await AuditLog.create({
            admin: user._id, // Self-action
            action: 'DELETE_USER',
            targetUser: user._id,
            details: 'User requested account deletion (Right to Erasure)'
        });

        res.json({ message: 'Account deleted and PII removed.' });
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
    toggleFavorite,
    getFavorites,
    exportUserData,
    deleteUserAccount
};

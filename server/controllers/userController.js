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
            phone: updatedUser.phone,
            avatar: updatedUser.avatar,
            isPremium: updatedUser.isPremium,
            token: generateToken(updatedUser._id),
        };

        // If user is a tailor, update their Whatsapp number in TailorProfile
        if (user.role === 'tailor' && req.body.whatsappNumber) {
            const tailorProfile = await TailorProfile.findOne({ user: user._id });
            if (tailorProfile) {
                tailorProfile.whatsappNumber = req.body.whatsappNumber;
                await tailorProfile.save();
                responseData.whatsappNumber = tailorProfile.whatsappNumber;
            }
        }

        res.json(responseData);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
};

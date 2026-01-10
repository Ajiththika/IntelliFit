const TailorProfile = require('../models/TailorProfile');
const User = require('../models/User');

// @desc    Create or update tailor profile
// @route   POST /api/tailors
// @access  Private (Tailor only)
const createOrUpdateProfile = async (req, res) => {
    const {
        businessName,
        bio,
        specializations,
        experienceYears,
        location,
        pricing
    } = req.body;

    const profileFields = {
        user: req.user._id,
        businessName,
        bio,
        specializations: specializations ? specializations.split(',').map(s => s.trim()) : [],
        experienceYears,
        location,
        pricing
    };

    let profile = await TailorProfile.findOne({ user: req.user._id });

    if (profile) {
        // Update
        profile = await TailorProfile.findOneAndUpdate(
            { user: req.user._id },
            { $set: profileFields },
            { new: true }
        );
        return res.json(profile);
    }

    // Create
    profile = new TailorProfile(profileFields);
    await profile.save();
    res.json(profile);
};

// @desc    Get all tailors
// @route   GET /api/tailors
// @access  Public
const getTailors = async (req, res) => {
    try {
        const profiles = await TailorProfile.find().populate('user', 'name email');
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get tailor by ID
// @route   GET /api/tailors/:id
// @access  Public
const getTailorById = async (req, res) => {
    try {
        const profile = await TailorProfile.findById(req.params.id).populate('user', 'name email');

        if (!profile) {
            return res.status(404).json({ message: 'Tailor not found' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Tailor not found' });
        }
        res.status(500).send('Server Error');
    }
};

module.exports = {
    createOrUpdateProfile,
    getTailors,
    getTailorById
};

const SizeProfile = require('../models/SizeProfile');
const { estimateMeasurements } = require('../utils/sizeUtils');

// @desc    Generate size profile
// @route   POST /api/size/generate
// @access  Private
const generateSize = async (req, res) => {
    const { gender, height, weight, age, wristSize, fitPreference } = req.body;

    if (!gender || !height || !weight || !age) {
        res.status(400).json({ message: 'Please provide all required fields' });
        return;
    }

    // Calculate sizes
    const estimation = estimateMeasurements({
        gender,
        height,
        weight,
        age,
        wristSize,
        fitPreference,
    });

    // Check if profile exists
    let profile = await SizeProfile.findOne({ user: req.user._id });

    if (profile) {
        // Update existing
        profile.gender = gender;
        profile.height = height;
        profile.weight = weight;
        profile.age = age;
        profile.wristSize = wristSize;
        profile.fitPreference = fitPreference;
        profile.calculatedSizes = estimation.measurements;
        profile.confidenceScore = estimation.confidence;

        const updatedProfile = await profile.save();
        res.json(updatedProfile);
    } else {
        // Create new
        const newProfile = await SizeProfile.create({
            user: req.user._id,
            gender,
            height,
            weight,
            age,
            wristSize,
            fitPreference,
            calculatedSizes: estimation.measurements,
            confidenceScore: estimation.confidence,
        });
        res.status(201).json(newProfile);
    }
};

// @desc    Get user size profile
// @route   GET /api/size/profile
// @access  Private
const getSizeProfile = async (req, res) => {
    const profile = await SizeProfile.findOne({ user: req.user._id });
    res.json(profile || null);
};

module.exports = {
    generateSize,
    getSizeProfile,
};

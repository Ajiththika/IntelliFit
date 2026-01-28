const SizeProfile = require('../models/SizeProfile');
const { estimateMeasurements } = require('../utils/sizeUtils');
const { trackEvent } = require('../utils/analytics');

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

    // Analytics Context
    const analyticsProps = {
        gender,
        confidence: estimation.confidence,
        fit: fitPreference
    };

    // Check if profile exists
    let profile = await SizeProfile.findOne({ user: req.user._id });

    if (profile) {
        // Push current state to history before update
        if (profile.calculatedSizes) {
            profile.history.push({
                measurements: profile.calculatedSizes,
                source: 'AI_GENERATED', // Or preserve previous source if we tracked it? For now, we are replacing, so this record becomes history.
                timestamp: new Date()
            });
        }

        // Update existing
        profile.gender = gender;
        profile.height = height;
        profile.weight = weight;
        profile.age = age;
        profile.wristSize = wristSize;
        profile.fitPreference = fitPreference;
        profile.calculatedSizes = estimation.measurements;
        profile.measurementMeta = estimation.measurementMeta;
        profile.confidenceScore = estimation.confidence;
        profile.status = 'AI_GENERATED';

        const updatedProfile = await profile.save();
        trackEvent('SIZE_GENERATED', req.user._id, { ...analyticsProps, action: 'update' }, req);
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
            measurementMeta: estimation.measurementMeta,
            confidenceScore: estimation.confidence,
            status: 'AI_GENERATED',
            history: [{
                measurements: estimation.measurements,
                source: 'AI_GENERATED',
                timestamp: new Date(),
                note: 'Initial Generation'
            }]
        });
        trackEvent('SIZE_GENERATED', req.user._id, { ...analyticsProps, action: 'create' }, req);
        res.status(201).json(newProfile);
    }
};

// @desc    Update measurements manually
// @route   PUT /api/size/manual
// @access  Private
const updateManualMeasurements = async (req, res) => {
    const { measurements } = req.body;

    const profile = await SizeProfile.findOne({ user: req.user._id });

    if (profile) {
        // Push current state to history
        if (profile.calculatedSizes) {
            profile.history.push({
                measurements: profile.calculatedSizes,
                source: 'MANUAL_EDIT', // The state getting saved to history was what it was BEFORE this edit.
                timestamp: new Date()
            });
        }

        profile.calculatedSizes = { ...profile.calculatedSizes, ...measurements };

        // Update metadata for changed fields
        if (!profile.measurementMeta) profile.measurementMeta = new Map();

        Object.keys(measurements).forEach(key => {
            profile.measurementMeta.set(key, {
                confidence: 100,
                source: 'MANUAL'
            });
        });

        profile.status = 'VERIFIED';

        // Add a history entry for the NEW manual state as well? 
        // Typically history is "past". We update the current "live" one.
        // But for tracking, maybe we want to know *that* a manual edit happened.
        // Let's rely on the previous logic: history stores what was replaced.

        const updatedProfile = await profile.save();
        res.json(updatedProfile);
    } else {
        res.status(404).json({ message: 'Profile not found. Please generate sizes first.' });
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
    updateManualMeasurements,
};

const SizeProfile = require('../models/SizeProfile');
const { estimateMeasurements } = require('../utils/sizeUtils');
const { trackEvent } = require('../utils/analytics');

// @desc    Generate size profile
// @route   POST /api/size/generate
// @access  Private
// @desc    Generate size estimation (Dry Run)
// @route   POST /api/size/generate
// @access  Private
const generateSizing = async (req, res) => {
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

    // Return the estimation without saving
    res.json(estimation);
};

// @desc    Save or Overwrite size profile
// @route   POST /api/size/save
// @access  Private
const saveSizeProfile = async (req, res) => {
    const { gender, height, weight, age, wristSize, fitPreference, bodyMeasurements, garmentMeasurements, confidence, measurementMeta, warnings } = req.body;

    // Check if profile exists
    let profile = await SizeProfile.findOne({ user: req.user._id });

    // Analytics Context
    const analyticsProps = { gender, confidence, fit: fitPreference };

    if (profile) {
        // Push current state to history before update
        if (profile.garmentMeasurements) {
            profile.history.push({
                bodyMeasurements: profile.bodyMeasurements,
                garmentMeasurements: profile.garmentMeasurements,
                source: profile.status === 'VERIFIED' ? 'MANUAL_EDIT' : 'AI_GENERATED',
                timestamp: new Date(),
                note: 'Archived before new generation save'
            });
        }

        // Update existing
        profile.gender = gender;
        profile.height = height;
        profile.weight = weight;
        profile.age = age;
        profile.wristSize = wristSize;
        profile.fitPreference = fitPreference;
        profile.bodyMeasurements = bodyMeasurements;
        profile.garmentMeasurements = garmentMeasurements;
        profile.measurementMeta = measurementMeta;
        profile.confidenceScore = confidence;
        profile.warnings = warnings || [];
        profile.status = 'AI_GENERATED';

        const updatedProfile = await profile.save();
        trackEvent('SIZE_SAVED', req.user._id, { ...analyticsProps, action: 'update' }, req);
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
            bodyMeasurements,
            garmentMeasurements,
            measurementMeta,
            confidenceScore: confidence,
            warnings: warnings || [],
            status: 'AI_GENERATED',
            history: [] // Initial creation, no history yet
        });
        trackEvent('SIZE_SAVED', req.user._id, { ...analyticsProps, action: 'create' }, req);
        res.status(201).json(newProfile);
    }
};

// @desc    Update measurements manually (Patch)
// @route   PATCH /api/size/update
// @access  Private
const updateSizeProfile = async (req, res) => {
    // Allows updating garmentMeasurements, bodyMeasurements, or fitPreference
    const { garmentMeasurements, bodyMeasurements } = req.body;

    const profile = await SizeProfile.findOne({ user: req.user._id });

    if (!profile) {
        return res.status(404).json({ message: 'Profile not found.' });
    }

    // Push current state to history
    profile.history.push({
        bodyMeasurements: profile.bodyMeasurements,
        garmentMeasurements: profile.garmentMeasurements,
        source: 'MANUAL_EDIT',
        timestamp: new Date(),
        note: 'User manual update'
    });

    if (garmentMeasurements) {
        profile.garmentMeasurements = { ...profile.garmentMeasurements, ...garmentMeasurements };
    }
    if (bodyMeasurements) {
        profile.bodyMeasurements = { ...profile.bodyMeasurements, ...bodyMeasurements };
    }

    profile.status = 'VERIFIED';

    // Decrease confidence for manually edited fields? Or set to 100?
    // Usually manual = 100% confidence it's what the user wants.
    // Update meta...
    if (!profile.measurementMeta) profile.measurementMeta = new Map();

    const updates = { ...garmentMeasurements, ...bodyMeasurements };
    Object.keys(updates).forEach(key => {
        // We don't distinguish body vs garment in simple meta map currently, 
        // relying on unique keys or shared keys (both have chest).
        // For MVP, just marking the key as MANUAL.
        profile.measurementMeta.set(key, {
            confidence: 100,
            source: 'MANUAL'
        });
    });

    const updatedProfile = await profile.save();
    trackEvent('SIZE_UPDATED', req.user._id, { action: 'manual_edit' }, req);
    res.json(updatedProfile);
};

// @desc    Get size profile history
// @route   GET /api/size/history
// @access  Private
const getSizeHistory = async (req, res) => {
    const profile = await SizeProfile.findOne({ user: req.user._id }, 'history');
    if (profile) {
        res.json(profile.history.sort((a, b) => b.timestamp - a.timestamp));
    } else {
        res.status(404).json({ message: 'Profile not found' });
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
    generateSizing,
    saveSizeProfile,
    updateSizeProfile,
    getSizeProfile,
    getSizeHistory
};

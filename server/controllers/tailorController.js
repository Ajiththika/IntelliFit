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
        pricing,
        portfolioImages,
        whatsappNumber
    } = req.body;

    // Build profile object dynamically to support partial updates
    const profileFields = {};
    if (businessName !== undefined) profileFields.businessName = businessName;
    if (bio !== undefined) profileFields.bio = bio;
    if (experienceYears !== undefined) profileFields.experienceYears = experienceYears;
    if (location !== undefined) profileFields.location = location;
    if (whatsappNumber !== undefined) profileFields.whatsappNumber = whatsappNumber;
    if (pricing !== undefined) profileFields.pricing = pricing;
    if (pricing !== undefined) profileFields.pricing = pricing;
    if (portfolioImages !== undefined) profileFields.portfolioImages = portfolioImages;

    // Geo Update
    const { lat, lng } = req.body;
    if (lat && lng) {
        profileFields.loc = {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
        };
    }

    if (specializations !== undefined) {
        profileFields.specializations = Array.isArray(specializations)
            ? specializations
            : specializations.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Always ensure user is set for query/creation
    // Note: We use $set so we don't need to pass all fields if updating
    // But for creation we need required fields. Models validation will handle that.

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
    // Create
    profileFields.user = req.user._id;
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

const Order = require('../models/Order');
const Review = require('../models/Review');

// ... existing functions ... 

// @desc    Get tailor dashboard stats
// @route   GET /api/tailors/dashboard/stats
// @access  Private (Tailor only)
const getTailorDashboardStats = async (req, res) => {
    try {
        const tailorProfile = await TailorProfile.findOne({ user: req.user._id });
        if (!tailorProfile) {
            return res.status(404).json({ message: 'Tailor profile not found' });
        }

        // 1. Order Stats
        const orders = await Order.find({ tailor: tailorProfile._id });

        const completedOrders = orders.filter(o => o.status === 'completed');
        const activeOrders = orders.filter(o => ['pending', 'accepted', 'in_progress', 'fitting_review'].includes(o.status));

        const totalRevenue = completedOrders.reduce((acc, order) => acc + (order.price || 0), 0);

        // 2. Review Stats
        const reviews = await Review.find({ tailor: tailorProfile._id });
        const avgRating = reviews.length > 0
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        // 3. Monthly Earnings (Simple calc for last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const monthlyRevenue = completedOrders
            .filter(o => new Date(o.updatedAt) >= thirtyDaysAgo)
            .reduce((acc, order) => acc + (order.price || 0), 0);

        res.json({
            totalOrders: orders.length,
            completedCount: completedOrders.length,
            activeCount: activeOrders.length,
            totalRevenue,
            monthlyRevenue,
            avgRating,
            reviewCount: reviews.length,
            recentOrders: orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get nearby tailors
// @route   GET /api/tailors/nearby
// @access  Public
const getNearbyTailors = async (req, res) => {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ message: 'Please provide latitude and longitude' });
    }

    const radiusKm = radius ? parseFloat(radius) : 10;
    const radiusRadians = radiusKm / 6378.1; // Earth radius in km

    try {
        const tailors = await TailorProfile.find({
            loc: {
                $geoWithin: {
                    $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusRadians]
                }
            }
        }).populate('user', 'name avatar');

        // Privacy: Do NOT return exact coordinates. Return approx distance.
        const tailorsWithDistance = tailors.map(tailor => {
            const tObj = tailor.toObject();
            if (tObj.loc && tObj.loc.coordinates) {
                delete tObj.loc;
                const dist = getDistanceFromLatLonInKm(lat, lng, tailor.loc.coordinates[1], tailor.loc.coordinates[0]);
                tObj.distanceKm = parseFloat(dist.toFixed(1));
            }
            return tObj;
        });

        tailorsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

        res.json(tailorsWithDistance);
    } catch (error) {
        console.error("Geo search failed", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

module.exports = {
    createOrUpdateProfile,
    getTailors,
    getTailorById,
    getTailorDashboardStats,
    getNearbyTailors
};

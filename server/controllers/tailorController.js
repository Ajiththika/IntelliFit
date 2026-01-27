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

    const profileFields = {
        user: req.user._id,
        businessName,
        bio,
        specializations: specializations ? (Array.isArray(specializations) ? specializations : specializations.split(',').map(s => s.trim())) : [],
        experienceYears,
        location,
        pricing,
        portfolioImages,
        whatsappNumber
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

module.exports = {
    createOrUpdateProfile,
    getTailors,
    getTailorById,
    getTailorDashboardStats
};

const Review = require('../models/Review');
const TailorProfile = require('../models/TailorProfile');
const Order = require('../models/Order');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Ensure user owns the order
    if (order.customer.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to review this order');
    }

    // Check if already reviewed (handled by DB index, but good to check)
    const alreadyReviewed = await Review.findOne({ order: orderId });
    if (alreadyReviewed) {
        res.status(400);
        throw new Error('Order already reviewed');
    }

    const review = await Review.create({
        customer: req.user._id,
        tailor: order.tailor,
        order: orderId,
        rating: Number(rating),
        comment,
    });

    if (review) {
        // Update Tailor's average rating
        const reviews = await Review.find({ tailor: order.tailor });
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        const tailorProfile = await TailorProfile.findById(order.tailor);
        tailorProfile.rating = avgRating;
        tailorProfile.reviewsCount = reviews.length;
        await tailorProfile.save();

        res.status(201).json(review);
    } else {
        res.status(400);
        throw new Error('Invalid review data');
    }
};

// @desc    Get reviews for a tailor
// @route   GET /api/reviews/:tailorId
// @access  Public
const getTailorReviews = async (req, res) => {
    const reviews = await Review.find({ tailor: req.params.tailorId }).populate('customer', 'name avatar');
    res.json(reviews);
};

module.exports = {
    createReview,
    getTailorReviews,
};

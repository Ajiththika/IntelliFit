const Review = require('../models/Review');
const Order = require('../models/Order');
const TailorProfile = require('../models/TailorProfile');

// @desc    Create new review
// @route   POST /api/orders/:orderId/review
// @access  Private (Customer)
const createReview = async (req, res) => {
    const { rating, fitAccuracy, quality, comment } = req.body;
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify ownership and status
        if (order.customer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to review this order' });
        }

        if (order.status !== 'completed') {
            return res.status(400).json({ message: 'Order must be completed before reviewing' });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ order: orderId });
        if (existingReview) {
            return res.status(400).json({ message: 'Order already reviewed' });
        }

        const review = await Review.create({
            customer: req.user._id,
            tailor: order.tailor,
            order: orderId,
            rating,
            fitAccuracy,
            quality,
            comment
        });

        // Update Tailor Aggregates
        const stats = await Review.aggregate([
            { $match: { tailor: order.tailor } },
            {
                $group: {
                    _id: '$tailor',
                    avgRating: { $avg: '$rating' },
                    avgFit: { $avg: '$fitAccuracy' },
                    avgQuality: { $avg: '$quality' },
                    count: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            await TailorProfile.findByIdAndUpdate(order.tailor, {
                rating: stats[0].avgRating,
                reviewsCount: stats[0].count,
                metrics: {
                    fitAccuracy: stats[0].avgFit,
                    quality: stats[0].avgQuality
                }
            });
        }

        res.status(201).json(review);
    } catch (error) {
        console.error("Review creation failed", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get reviews for a tailor
// @route   GET /api/tailors/:id/reviews
// @access  Public
const getTailorReviews = async (req, res) => {
    try {
        // req.params.id is the tailor ID from the route /api/tailors/:id/reviews
        // BUT wait, is the route definition in tailorRoutes or reviewRoutes?
        // If it's /api/tailors/:id/reviews, it should likely be in tailorRoutes.
        // OR I can make /api/reviews/tailor/:id. The user requested GET /api/tailors/:id/reviews.

        // Let's implement logic here and hook it up appropriately.

        // We need to resolve the TailorProfile ID from the User ID? Or is :id the TailorProfile ID?
        // In previous turns, :id usually refers to the TailorProfile ID directly in public profile calls.

        const reviews = await Review.find({ tailor: req.params.id })
            .populate('customer', 'name avatar')
            .sort('-createdAt');

        res.json(reviews);
    } catch (error) {
        console.error("Fetch reviews failed", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createReview,
    getTailorReviews
};

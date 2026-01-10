const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        tailor: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'TailorProfile',
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Order',
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent user from reviewing the same order twice
reviewSchema.index({ order: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

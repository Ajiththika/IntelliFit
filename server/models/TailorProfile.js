const mongoose = require('mongoose');

const tailorProfileSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            unique: true,
        },
        businessName: {
            type: String,
            required: true,
        },
        bio: {
            type: String,
            required: true,
        },
        whatsappNumber: {
            type: String,
            required: false,
        },
        specializations: [{
            type: String, // e.g., 'Suits', 'Dresses', 'Alterations'
        }],
        experienceYears: {
            type: Number,
            default: 0,
        },
        location: {
            type: String, // Simple string for MVP (City, Country)
            required: true,
        },
        pricing: {
            type: String, // e.g., '$$' or 'Starts at $50'
        },
        rating: {
            type: Number,
            default: 0,
        },
        reviewsCount: {
            type: Number,
            default: 0,
        },
        portfolioImages: [{
            type: String, // URLs
        }],
    },
    {
        timestamps: true,
    }
);

const TailorProfile = mongoose.model('TailorProfile', tailorProfileSchema);

module.exports = TailorProfile;

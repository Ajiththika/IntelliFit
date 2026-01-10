const mongoose = require('mongoose');

const sizeProfileSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            unique: true, // One profile per user for MVP
        },
        gender: {
            type: String,
            required: true,
            enum: ['male', 'female', 'other'],
        },
        height: {
            type: Number, // in cm
            required: true,
        },
        weight: {
            type: Number, // in kg
            required: true,
        },
        age: {
            type: Number,
            required: true,
        },
        wristSize: {
            type: Number, // in cm, optional
        },
        fitPreference: {
            type: String,
            enum: ['slim', 'regular', 'loose'],
            default: 'regular',
        },
        calculatedSizes: {
            chest: Number,
            waist: Number,
            hip: Number,
            shoulder: Number,
            sleeve: Number,
            inseam: Number,
            neck: Number,
        },
        confidenceScore: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const SizeProfile = mongoose.model('SizeProfile', sizeProfileSchema);

module.exports = SizeProfile;

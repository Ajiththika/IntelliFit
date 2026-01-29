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
        bodyMeasurements: {
            chest: Number,
            waist: Number,
            hip: Number,
            shoulder: Number,
            sleeve: Number,
            inseam: Number,
            neck: Number,
            thigh: Number,
        },
        garmentMeasurements: {
            chest: Number,
            waist: Number,
            hip: Number,
            shoulder: Number,
            sleeve: Number,
            inseam: Number,
            neck: Number,
            thigh: Number,
        },
        stylePreferences: {
            preferredColors: [String],
            fabricSensitivities: [String],
            typicalSize: String,
        },
        history: [{
            timestamp: { type: Date, default: Date.now },
            bodyMeasurements: Object,
            garmentMeasurements: Object,
            source: { type: String, enum: ['AI_GENERATED', 'MANUAL_EDIT'], default: 'AI_GENERATED' },
            note: String
        }],
        confidenceScore: {
            type: Number,
            default: 0,
        },
        warnings: [String],
        status: {
            type: String,
            enum: ['DRAFT', 'AI_GENERATED', 'VERIFIED'],
            default: 'DRAFT'
        },
        measurementMeta: {
            type: Map,
            of: new mongoose.Schema({
                confidence: Number, // 0-100
                source: { type: String, enum: ['AI', 'MANUAL'], default: 'AI' }
            }, { _id: false })
        },
    },
    {
        timestamps: true,
    }
);

const SizeProfile = mongoose.model('SizeProfile', sizeProfileSchema);

module.exports = SizeProfile;

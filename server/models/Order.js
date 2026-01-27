const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
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
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'in_progress', 'fitting_review', 'completed', 'cancelled', 'disputed'],
            default: 'pending',
        },
        statusHistory: [{
            status: String,
            changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            timestamp: { type: Date, default: Date.now },
            note: String
        }],
        sizeProfileSnapshot: {
            measurements: Object,
            confidence: Number,
            source: String, // e.g. 'AI_GENERATED', 'VERIFIED'
            meta: Object // Detailed confidence map
        },
        garmentType: {
            type: String,
            required: true,
        },
        instructions: {
            type: String,
        },
        price: {
            type: Number,
            required: true,
        },
        designAttachments: [{
            url: String,
            type: String, // 'image', 'document'
            uploadedAt: { type: Date, default: Date.now }
        }],
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

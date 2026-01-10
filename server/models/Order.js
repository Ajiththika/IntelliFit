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
        sizeProfileSnapshot: {
            type: Object, // Store copy of measurements at time of order
            required: true,
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
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

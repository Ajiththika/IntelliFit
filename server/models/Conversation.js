const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: false // Can be pre-order inquiry
    },
    lastMessage: {
        content: String,
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: Date
    },
    unreadCounts: {
        type: Map,
        of: Number,
        default: {} // Keyed by userId
    }
}, { timestamps: true });

// Ensure unique conversation between two users for a specific order (or null order)
// Actually, generic inquiry (null order) -> multiple? Or single?
// Let's assume single generic inquiry thread per user-tailor pair, 
// AND separate threads for specific orders.
conversationSchema.index({ participants: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);

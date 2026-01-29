const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isRedacted: {
        type: Boolean,
        default: false
    },
    flags: [{
        type: String,
        enum: ['PHONE_DETECTED', 'EMAIL_DETECTED', 'LINK_DETECTED', 'PROFANITY']
    }]
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);

const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // The user associated with the transaction (payer or payee)
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        type: {
            type: String,
            required: true,
            enum: ['PAYMENT', 'REFUND', 'PAYOUT'],
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'usd'
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            default: 'stripe',
        },
        stripePaymentIntentId: {
            type: String,
        },
        metadata: {
            type: Map,
            of: String
        },
        description: String
    },
    {
        timestamps: true,
    }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

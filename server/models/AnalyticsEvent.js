const mongoose = require('mongoose');

const analyticsEventSchema = mongoose.Schema(
    {
        eventName: {
            type: String,
            required: true,
            index: true
        },
        distinctId: {
            type: String, // userId or anonymousId
            required: true,
            index: true
        },
        properties: {
            type: Map,
            of: mongoose.Schema.Types.Mixed
        },
        context: {
            userAgent: String,
            ip: String,
            source: String // e.g. 'client', 'server'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true, // CreatedAt, UpdatedAt
    }
);

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

module.exports = AnalyticsEvent;

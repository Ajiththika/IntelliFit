const AnalyticsEvent = require('../models/AnalyticsEvent');

/**
 * Track an analytics event
 * @param {string} eventName - Name of the event (e.g., 'ORDER_CREATED')
 * @param {string} userId - User ID related to the event
 * @param {object} properties - Additional metadata
 * @param {object} req - Express request object (optional, for context)
 */
const trackEvent = async (eventName, userId, properties = {}, req = null) => {
    try {
        const context = {};

        if (req) {
            context.userAgent = req.headers['user-agent'];
            context.ip = req.ip;
            context.source = 'server';
        }

        await AnalyticsEvent.create({
            eventName,
            distinctId: userId,
            properties,
            context
        });

        console.log(`[Analytics] Tracked: ${eventName} for ${userId}`);
    } catch (error) {
        console.error('[Analytics] Error tracking event:', error);
        // Fail silently to not block main thread flow
    }
};

module.exports = { trackEvent };

const express = require('express');
const router = express.Router();
const {
    createCheckoutSession,
    createOrderCheckoutSession,
    mockPaymentSuccess,
    releaseFunds
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/create-order-session', protect, createOrderCheckoutSession);
router.post('/mock-success', protect, mockPaymentSuccess);
router.post('/release-funds', protect, authorize('admin'), releaseFunds);

module.exports = router;

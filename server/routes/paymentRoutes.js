const express = require('express');
const router = express.Router();
const { createCheckoutSession, mockPaymentSuccess } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/mock-success', protect, mockPaymentSuccess);

module.exports = router;

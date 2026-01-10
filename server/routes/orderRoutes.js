const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getShopOrders,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/shop-orders', protect, authorize('tailor', 'admin'), getShopOrders);
router.put('/:id/status', protect, authorize('tailor', 'admin'), updateOrderStatus);

module.exports = router;

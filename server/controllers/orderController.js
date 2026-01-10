const Order = require('../models/Order');
const SizeProfile = require('../models/SizeProfile');
const TailorProfile = require('../models/TailorProfile');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (User)
const createOrder = async (req, res) => {
    const { tailorId, garmentType, instructions, price } = req.body;

    if (!tailorId || !garmentType || !price) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get user measurements
    const sizeProfile = await SizeProfile.findOne({ user: req.user._id });
    if (!sizeProfile) {
        return res.status(400).json({ message: 'No size profile found. Please generate measurements first.' });
    }

    // Verify tailor exists
    const tailor = await TailorProfile.findById(tailorId);
    if (!tailor) {
        return res.status(404).json({ message: 'Tailor not found' });
    }

    const order = await Order.create({
        customer: req.user._id,
        tailor: tailorId,
        sizeProfileSnapshot: sizeProfile.calculatedSizes,
        garmentType,
        instructions,
        price,
    });

    res.status(201).json(order);
};

// @desc    Get logged in user orders (Customer view)
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ customer: req.user._id })
        .populate('tailor', 'businessName')
        .sort('-createdAt');
    res.json(orders);
};

// @desc    Get shop orders (Tailor view)
// @route   GET /api/orders/shop-orders
// @access  Private (Tailor)
const getShopOrders = async (req, res) => {
    // Find tailor profile for logged in user
    const tailorProfile = await TailorProfile.findOne({ user: req.user._id });
    if (!tailorProfile) {
        return res.status(404).json({ message: 'Tailor profile not found' });
    }

    const orders = await Order.find({ tailor: tailorProfile._id })
        .populate('customer', 'name email')
        .sort('-createdAt');
    res.json(orders);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Tailor/Admin)
const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    // Verify ownership (Tailor)
    const tailorProfile = await TailorProfile.findOne({ user: req.user._id });

    if (req.user.role !== 'admin' && (!tailorProfile || order.tailor.toString() !== tailorProfile._id.toString())) {
        return res.status(401).json({ message: 'Not authorized to update this order' });
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
};

module.exports = {
    createOrder,
    getMyOrders,
    getShopOrders,
    updateOrderStatus
};

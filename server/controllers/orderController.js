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
        sizeProfileSnapshot: {
            measurements: sizeProfile.calculatedSizes,
            confidence: sizeProfile.confidenceScore,
            source: sizeProfile.status,
            meta: sizeProfile.measurementMeta
        },
        garmentType,
        instructions,
        price,
        statusHistory: [{
            status: 'pending',
            changedBy: req.user._id,
            note: 'Order Created'
        }]
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
// @access  Private (Tailor/Admin/User for cancellation)
const updateOrderStatus = async (req, res) => {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    // Role Verification
    const isTailor = await TailorProfile.findOne({ user: req.user._id, _id: order.tailor });
    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isTailor && !isCustomer && !isAdmin) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    // STATE MACHINE VALIDATION
    const allowedTransitions = {
        'pending': ['accepted', 'rejected', 'cancelled'],
        'accepted': ['in_progress', 'cancelled'], // Cancelled only by agreement or admin usually
        'in_progress': ['fitting_review', 'completed', 'disputed'],
        'fitting_review': ['in_progress', 'completed'],
        'completed': ['disputed'], // Post-completion dispute
        'cancelled': [],
        'rejected': [],
        'disputed': ['in_progress', 'completed', 'cancelled'] // Resolution paths
    };

    // Allow cancelling if pending and user is customer
    if (isCustomer && status === 'cancelled' && order.status === 'pending') {
        // Allowed
    } else if (!isAdmin && !allowedTransitions[order.status]?.includes(status)) {
        return res.status(400).json({
            message: `Invalid status transition from ${order.status} to ${status}`
        });
    }

    // Update State
    const previousStatus = order.status;
    order.status = status;
    order.statusHistory.push({
        status: status,
        changedBy: req.user._id,
        note: note || `Status changed from ${previousStatus} to ${status}`
    });

    const updatedOrder = await order.save();
    res.json(updatedOrder);
};

module.exports = {
    createOrder,
    getMyOrders,
    getShopOrders,
    updateOrderStatus
};

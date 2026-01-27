const Stripe = require('stripe');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const Transaction = require('../models/Transaction');
const Order = require('../models/Order');

// ... existing setup (Stripe, User) ...

// @desc    Create Stripe Checkout Session for Order
// @route   POST /api/payment/create-order-session
// @access  Private
const createOrderCheckoutSession = async (req, res) => {
    const { orderId } = req.body;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Calculate Commission (e.g., 15%)
        const commissionRate = 0.15;
        const commission = Math.round(order.price * commissionRate);
        const tailorAmount = order.price - commission;

        // Save intended commission to order
        order.commission = commission;
        await order.save();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: req.user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Order #${order._id}`,
                            description: `${order.garmentType} - Custom Fit`,
                        },
                        unit_amount: Math.round(order.price * 100), // cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.protocol}://localhost:5173/dashboard/orders/${order._id}?payment_success=true`,
            cancel_url: `${req.protocol}://localhost:5173/dashboard/orders/${order._id}?canceled=true`,
            metadata: {
                orderId: order._id.toString(),
                userId: req.user._id.toString(),
                type: 'ORDER_PAYMENT',
                commission: commission.toString(),
                tailorAmount: tailorAmount.toString()
            },
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment session creation failed' });
    }
};

// @desc    Mock Webhook for testing
// @route   POST /api/payment/mock-success
// @access  Private (For demo purposes)
const mockPaymentSuccess = async (req, res) => {
    const { type, orderId } = req.body; // Pass type='ORDER_PAYMENT' for orders

    if (type === 'ORDER_PAYMENT' && orderId) {
        const order = await Order.findById(orderId);
        if (order) {
            order.paymentStatus = 'escrow';
            order.paymentIntentId = `pi_mock_${Date.now()}`;
            await order.save();

            // Create Transaction Record (Incoming)
            await Transaction.create({
                user: req.user._id,
                order: order._id,
                type: 'PAYMENT',
                amount: order.price,
                status: 'completed',
                stripePaymentIntentId: order.paymentIntentId,
                description: `Payment for Order #${order._id}`,
                metadata: {
                    commission: order.commission
                }
            });

            return res.json({ message: 'Order payment successful (Mock)' });
        }
        return res.status(404).json({ message: 'Order not found' });
    }

    const user = await User.findById(req.user._id);
    if (user) {
        user.isPremium = true;
        await user.save();
        res.json({ message: 'User upgraded to Premium (Mock)' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
}

// @desc    Release funds to tailor (Payout)
// @route   POST /api/payment/release-funds
// @access  Private (Admin Only for manual release, or system trigger)
const releaseFunds = async (req, res) => {
    const { orderId } = req.body;
    try {
        const order = await Order.findById(orderId).populate('tailor');

        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.status !== 'completed') return res.status(400).json({ error: 'Order must be completed' });
        if (order.paymentStatus !== 'escrow') return res.status(400).json({ error: 'Funds not in escrow or already paid' });

        const payoutAmount = order.price - order.commission;

        // Mock Payout Logic
        // In real Stripe: stripe.transfers.create(...)

        order.paymentStatus = 'paid';
        await order.save();

        // Log Payout Transaction
        await Transaction.create({
            user: order.tailor.user, // The tailor User ID (assuming TailorProfile has user ref)
            order: order._id,
            type: 'PAYOUT',
            amount: payoutAmount,
            status: 'completed',
            description: `Payout for Order #${order._id}`,
            metadata: {
                revenue: payoutAmount,
                platformFee: order.commission
            }
        });

        res.json({ message: 'Funds released to tailor', payoutAmount });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Release funds failed' });
    }
}


module.exports = {
    createCheckoutSession,
    createOrderCheckoutSession,
    mockPaymentSuccess,
    releaseFunds
};

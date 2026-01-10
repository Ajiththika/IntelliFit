const Stripe = require('stripe');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// @desc    Create Stripe Checkout Session
// @route   POST /api/payment/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: req.user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'IntelliFit Premium',
                            description: 'Advanced Style Recommendations & Priority Booking',
                        },
                        unit_amount: 1999, // $19.99
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.protocol}://localhost:5174/dashboard?premium_success=true`,
            cancel_url: `${req.protocol}://localhost:5174/dashboard/premium?canceled=true`,
            metadata: {
                userId: req.user._id.toString(),
            },
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment session creation failed' });
    }
};

// @desc    Mock Webhook for testing (Since we can't easily do real webhooks on localhost without ngrok)
// @route   POST /api/payment/mock-success
// @access  Private (For demo purposes)
const mockPaymentSuccess = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.isPremium = true;
        await user.save();
        res.json({ message: 'User upgraded to Premium (Mock)' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
}

module.exports = {
    createCheckoutSession,
    mockPaymentSuccess
};

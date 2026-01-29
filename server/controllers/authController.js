const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { trackEvent } = require('../utils/analytics');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (user.isActive === false) {
            return res.status(403).json({ message: 'Account is suspended. Contact support.' });
        }

        trackEvent('USER_LOGGED_IN', user._id, { role: user.role }, req);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    // Validate role is allowed (prevent admin creation via public API)
    const allowedRoles = ['customer', 'tailor'];
    const userRole = (role && allowedRoles.includes(role)) ? role : 'customer';

    const user = await User.create({
        name,
        email,
        password,
        role: userRole,
    });

    if (user) {
        trackEvent('USER_REGISTERED', user._id, { role: user.role, source: 'web' }, req);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

module.exports = {
    authUser,
    registerUser,
};

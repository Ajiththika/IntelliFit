const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const verify = async () => {
    try {
        await connectDB();

        console.log('Checking User: tailor@example.com');
        const user = await User.findOne({ email: 'tailor@example.com' });

        if (!user) {
            console.log('User NOT FOUND');
        } else {
            console.log('User Found:', user._id);
            console.log('Stored Hash:', user.password);

            const isMatch = await user.matchPassword('password123');
            console.log('Password "password123" Match Result:', isMatch);

            if (!isMatch) {
                // Try comparing with plain text just in case seeding failed to hash (unlikely with create() but possible if hook failed)
                if (user.password === 'password123') {
                    console.log('WARNING: Password is stored as PLAIN TEXT');
                }
            }
        }
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

verify();

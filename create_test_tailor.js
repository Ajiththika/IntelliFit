const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require(path.join(__dirname, 'server', 'models', 'User.js'));
const TailorProfile = require(path.join(__dirname, 'server', 'models', 'TailorProfile.js'));

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const createTestTailor = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'tailor@test.com';
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name: 'Test Tailor',
                email,
                password: 'password123',
                role: 'tailor',
            });
            console.log('Test Tailor user created');
        } else {
            console.log('Test Tailor user already exists');
            user.role = 'tailor';
            await user.save();
        }

        let profile = await TailorProfile.findOne({ user: user._id });
        if (!profile) {
            await TailorProfile.create({
                user: user._id,
                businessName: 'Test Tailor Cuts',
                bio: 'Expert in suits and formal wear.',
                location: 'Test City',
                specializations: ['Suits', 'Shirts'],
                pricing: 'Starts at $100',
                portfolioImages: [] // Empty initially
            });
            console.log('Tailor Profile created');
        } else {
            console.log('Tailor Profile already exists');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createTestTailor();

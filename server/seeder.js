const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const TailorProfile = require('./models/TailorProfile');
const Order = require('./models/Order');
const Review = require('./models/Review');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Order.deleteMany();
        await Review.deleteMany();
        await TailorProfile.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed...');

        const users = await User.insertMany([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123', // Will be hashed by pre-save? WAIT. insertMany might NOT trigger pre-save hooks depending on mongoose version/options!
                role: 'admin',
                isActive: true
            },
            {
                name: 'John Tailor',
                email: 'tailor@example.com',
                password: 'password123',
                role: 'tailor',
                isActive: true
            },
            {
                name: 'Jane Customer',
                email: 'user@example.com',
                password: 'password123',
                role: 'customer',
                isActive: true
            }
        ]);

        // Note: insertMany does NOT trigger save middleware in Mongoose! 
        // We must create them individually or use create() which loops and triggers save (hash).
        // Let's redo this loop to be safe.

        await User.deleteMany(); // Clear again just to be sure we don't have dupes from above if it worked partially

        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
            isActive: true
        });

        const tailorUser = await User.create({
            name: 'John Tailor',
            email: 'tailor@example.com',
            password: 'password123',
            role: 'tailor',
            isActive: true
        });

        const customerUser = await User.create({
            name: 'Jane Customer',
            email: 'user@example.com',
            password: 'password123',
            role: 'customer',
            isActive: true
        });

        // Create Tailor Profile
        await TailorProfile.create({
            user: tailorUser._id,
            businessName: "John's Custom Suits",
            bio: "Expert filtering fitting specialist with 20 years experience.",
            location: "New York, NY",
            experienceYears: 20,
            specializations: ["Suits", "Alterations"],
            pricing: [
                { serviceName: "Custom Suit", startingPrice: 500, description: "Full canvas suit" },
                { serviceName: "Alteration", startingPrice: 50, description: "Basic hem" }
            ],
            loc: {
                type: 'Point',
                coordinates: [-74.006, 40.7128] // NY
            }
        });

        console.log('Data Imported!');
        console.log('-----------------------------------');
        console.log('Admin:   admin@example.com / password123');
        console.log('Tailor:  tailor@example.com / password123');
        console.log('User:    user@example.com / password123');
        console.log('-----------------------------------');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    // destroyData(); // Implementation omitted for brevity
} else {
    importData();
}

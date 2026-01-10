const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require(path.join(__dirname, 'server', 'models', 'User.js'));

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminExists = await User.findOne({ email: 'admin@test.com' });

        if (adminExists) {
            console.log('Admin user already exists');
            adminExists.role = 'admin'; // Ensure role is admin
            await adminExists.save();
            console.log('Updated existing user to admin');
        } else {
            const user = await User.create({
                name: 'Admin User',
                email: 'admin@test.com',
                password: 'password123',
                role: 'admin',
            });
            console.log('Admin user created');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createAdmin();

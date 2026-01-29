const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config(); // defaults to .env in current dir

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const setupAdmin = async () => {
    await connectDB();

    const email = 'ajiththika17@gmail.com';
    const password = 'Ajie5317';

    try {
        let user = await User.findOne({ email });

        if (user) {
            console.log('User found. Updating roles...');
            user.role = 'admin';
            const roles = new Set([...user.allowedRoles, 'customer', 'admin']);
            user.allowedRoles = Array.from(roles);

            // To ensure password matches what the user gave (in case it was different before), 
            // we can re-set it. The pre-save hook will hash it.
            user.password = password;

            await user.save();
            console.log('User updated to Admin successfully');
        } else {
            console.log('User not found. Creating new Admin...');
            user = await User.create({
                name: 'Main Admin',
                email,
                password,
                role: 'admin',
                allowedRoles: ['customer', 'admin'],
                isPremium: true
            });
            console.log('Admin created successfully');
        }

    } catch (error) {
        console.error('Error setting up admin:', error);
    } finally {
        mongoose.disconnect();
        process.exit();
    }
};

setupAdmin();

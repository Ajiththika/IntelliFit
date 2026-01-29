const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['customer', 'tailor', 'admin'],
            default: 'customer',
        },
        allowedRoles: {
            type: [String],
            default: ['customer'],
        },
        roleRequest: {
            type: String,
            enum: ['tailor', 'admin'],
            default: null,
        },
        phone: {
            type: String,
        },
        avatar: {
            type: String,
            default: '',
        },
        isPremium: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        subscriptionId: {
            type: String,
        },
        favorites: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TailorProfile'
        }],
        // Optional: Add profile fields or reference a profile model
    },
    {
        timestamps: true,
    }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;

const mongoose = require('mongoose');

const OutfitReferenceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    imageUrl: {
        type: String,
        required: [true, 'Please add an image URL']
    },
    category: {
        type: String,
        enum: ['Casual', 'Formal', 'Business', 'Party', 'Traditional', 'Athleisure'],
        default: 'Casual'
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Unisex'],
        default: 'Unisex'
    },
    // We will map detected skin brightness to these buckets
    recommendedSkinTones: [{
        type: String,
        enum: ['Light', 'Medium', 'Dark']
    }],
    recommendedUndertones: [{
        type: String,
        enum: ['Cool', 'Warm', 'Neutral']
    }],
    primaryColor: String, // Hex
    complementaryColors: [String], // Hex
}, { timestamps: true });

module.exports = mongoose.model('OutfitReference', OutfitReferenceSchema);

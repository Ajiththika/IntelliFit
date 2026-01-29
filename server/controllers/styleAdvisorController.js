const OutfitReference = require('../models/OutfitReference');

// @desc    Get outfit recommendations based on skin tone and undertone
// @route   POST /api/style-advisor/recommendations
// @access  Public
exports.getRecommendations = async (req, res) => {
    try {
        const { skinTone, undertone, gender } = req.body;

        // Basic validation
        if (!skinTone || !undertone) {
            return res.status(400).json({ success: false, message: 'Please provide skin tone and undertone analysis' });
        }

        // Map frontend skinTone (which might be generic) to DB buckets if needed
        // Assuming frontend sends 'Light', 'Medium', 'Dark'
        let skinToneFilter = skinTone;

        // Build query
        const query = {
            recommendedSkinTones: skinTone,
            recommendedUndertones: undertone
        };

        if (gender && gender !== 'Unisex') {
            query.gender = { $in: [gender, 'Unisex'] };
        }

        let recommendations = await OutfitReference.find(query).limit(10);

        // FALLBACK: If no contents in DB (since we haven't seeded), return mock data
        if (recommendations.length === 0) {
            recommendations = getMockRecommendations(skinTone, undertone, gender);
        }

        res.status(200).json({
            success: true,
            count: recommendations.length,
            data: recommendations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Helper: Mock data for immediate demo purposes
const getMockRecommendations = (skinTone, undertone, gender) => {
    const images = {
        'Casual': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop',
        'Formal': 'https://images.unsplash.com/photo-1594938298603-c8148c472f81?w=500&auto=format&fit=crop',
        'Party': 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&auto=format&fit=crop'
    };

    // Simple logic to suggest colors based on undertone
    let colors = [];
    if (undertone === 'Cool') {
        colors = ['#0000FF', '#800080', '#FFC0CB', '#00FFFF']; // Blue, Purple, Pink, Cyan
    } else if (undertone === 'Warm') {
        colors = ['#FFA500', '#FFD700', '#A52A2A', '#008000']; // Orange, Gold, Brown, Green
    } else {
        // Neutral
        colors = ['#FF0000', '#000000', '#FFFFFF', '#808080'];
    }

    return [
        {
            _id: 'mock1',
            name: `Perfect ${undertone} Casual Look`,
            description: `A great casual outfit that complements your ${skinTone} skin and ${undertone} undertone.`,
            category: 'Casual',
            imageUrl: images.Casual,
            primaryColor: colors[0],
            complementaryColors: [colors[1], colors[2]],
            gender: gender || 'Unisex'
        },
        {
            _id: 'mock2',
            name: `Elegant ${undertone} Formal Wear`,
            description: `Look sharp with this formal style tailored for ${undertone} tones.`,
            category: 'Formal',
            imageUrl: images.Formal,
            primaryColor: colors[1],
            complementaryColors: [colors[0], colors[3]],
            gender: gender || 'Unisex'
        },
        {
            _id: 'mock3',
            name: `Stunning Party Vibe`,
            description: `Stand out with this color palette perfect for you.`,
            category: 'Party',
            imageUrl: images.Party,
            primaryColor: colors[2],
            complementaryColors: [colors[0], colors[1]],
            gender: gender || 'Unisex'
        }
    ];
};


const generateDesign = async (req, res) => {
    try {
        const { outfit, gender, country, background, age, ratio } = req.body;

        // Validation
        if (!outfit) {
            return res.status(400).json({ message: 'Outfit description is required' });
        }

        const apiKey = 'U6O6AEJ65XZQV2HB2JXF7M86QH8D3K';
        const url = `https://thenewblack.ai/api/1.1/wf/clothing?api_key=${apiKey}`;

        // Construct payload with defaults
        const payload = {
            outfit,
            gender: gender || 'female',
            country: country || 'French', // Default to something neutral if needed, or let user pick
            background: background || 'studio',
            age: age || '25',
            ratio: ratio || '3:4',
            negative_prompt: "ugly, blurry, low quality, distorted"
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // The API returns the URL as text sometimes, or JSON?
        // My test script output "Response Text: https://..."
        // If content-type is text/plain, we read text.

        const contentType = response.headers.get("content-type");
        let resultUrl = "";

        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            // Handle error logic from API if any
            if (data.statusCode && data.statusCode >= 400) {
                return res.status(400).json({ message: data.message || 'Error from AI provider' });
            }
            // If it returns JSON with url? we haven't seen that in success case.
            // But let's assume if it is JSON, it might wrap it.
            // Wait, previous error was JSON. Success was Text.
            // So if it's JSON it's likely an error (unless they changed it).
            return res.status(400).json(data);
        } else {
            resultUrl = await response.text();
        }

        if (!resultUrl || resultUrl.trim().length === 0) {
            return res.status(500).json({ message: 'Failed to generate image' });
        }

        // Return the URL to the frontend
        res.status(200).json({ imageUrl: resultUrl });

    } catch (error) {
        console.error('Design generation error:', error);
        res.status(500).json({ message: 'Server error during design generation' });
    }
};

module.exports = {
    generateDesign
};

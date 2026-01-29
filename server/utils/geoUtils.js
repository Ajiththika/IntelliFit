// @desc    Get nearby tailors
// @route   GET /api/tailors/nearby
// @access  Public
const getNearbyTailors = async (req, res) => {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ message: 'Please provide latitude and longitude' });
    }

    const radiusKm = radius ? parseFloat(radius) : 10;
    const radiusRadians = radiusKm / 6378.1; // Earth radius in km

    try {
        const tailors = await TailorProfile.find({
            loc: {
                $geoWithin: {
                    $centerSphere: [[parseFloat(lng), parseFloat(lat)], radiusRadians]
                }
            }
        }).populate('user', 'name avatar');

        // Privacy: Do NOT return exact coordinates. Return approx distance.
        const tailorsWithDistance = tailors.map(tailor => {
            const tObj = tailor.toObject();
            if (tObj.loc && tObj.loc.coordinates) {
                // Simple Haversine calculation or similar could go here if we needed precise distance in response fields,
                // but for now we just verify they are within radius.
                // Let's add an approximate distance purely for UI if needed?
                // The user requested: "Show only approximate distance".
                // $near produces distance if used with aggregation or find, but $geoWithin doesn't sort by dist.
                // Let's manually filter fields.
                delete tObj.loc;
                // In a real app we'd calculate distance here.
                // Mocking distance for MVP or calculating it:
                const dist = getDistanceFromLatLonInKm(lat, lng, tailor.loc.coordinates[1], tailor.loc.coordinates[0]);
                tObj.distanceKm = parseFloat(dist.toFixed(1));
            }
            return tObj;
        });

        // Sort by distance locally since $geoWithin doesn't sort
        tailorsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

        res.json(tailorsWithDistance);
    } catch (error) {
        console.error("Geo search failed", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

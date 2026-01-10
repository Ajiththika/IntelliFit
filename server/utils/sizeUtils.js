// MVP Rule-Based Algorithm for Size Estimation

const calculateBMI = (weight, height) => {
    // weight in kg, height in cm
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

const getFrameSize = (wristSize, gender) => {
    if (!wristSize) return 'medium';
    // Simple thresholds (in cm)
    if (gender === 'male') {
        return wristSize < 16.5 ? 'small' : wristSize > 19 ? 'large' : 'medium';
    } else {
        return wristSize < 15 ? 'small' : wristSize > 16.5 ? 'large' : 'medium';
    }
};

const estimateMeasurements = (data) => {
    const { gender, height, weight, age, wristSize, fitPreference } = data;

    // Base ratios (Very simplified for MVP)
    let chest, waist, hip, shoulder, sleeve, inseam, neck;

    // Convert height to inches for standard formula mental model, then back to cm if needed.
    // We will output in CM for consistency.

    if (gender === 'male') {
        // Estimations for Men
        // Base chest roughly correlates with weight and height
        // A standard rule of thumb: Chest = (Height * 0.3) + (Weight * 0.4) - approximate
        chest = (height * 0.25) + (weight * 0.55) + 10;

        // Waist is often chest - 15cm to 20cm for athletic, less for higher BMI
        waist = chest - 18 + (age * 0.1);
        if (calculateBMI(weight, height) > 25) waist += 5;

        hip = waist + 10;
        shoulder = chest * 0.45;
        neck = chest * 0.38;
        sleeve = height * 0.38;
        inseam = height * 0.45;

    } else {
        // Estimations for Women
        // Bust can be complex, using rough correlation
        chest = (height * 0.22) + (weight * 0.5) + 15;

        waist = chest * 0.75;
        hip = waist * 1.4; // Women have wider hip ratio

        shoulder = chest * 0.38;
        neck = chest * 0.34;
        sleeve = height * 0.36;
        inseam = height * 0.46;
    }

    // Adjustments based on Fit Preference (Easy +/ inches converted to cm)
    let ease = 0;
    if (fitPreference === 'slim') ease = -2;
    if (fitPreference === 'loose') ease = 4;

    // Apply ease to circumference measurements only
    const measurements = {
        chest: Math.round(chest + ease),
        waist: Math.round(waist + ease),
        hip: Math.round(hip + ease),
        shoulder: Math.round(shoulder), // Usually structure doesn't change much with fit preference, but maybe slightly
        neck: Math.round(neck),
        sleeve: Math.round(sleeve),
        inseam: Math.round(inseam),
    };

    return {
        measurements,
        bmi: calculateBMI(weight, height),
        frame: getFrameSize(wristSize, gender),
        confidence: 85, // Static high confidence for rule-based MVP
    };
};

module.exports = {
    estimateMeasurements,
};

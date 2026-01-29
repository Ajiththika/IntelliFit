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

    // ---------------------------------------------------------
    // 1. Calculate Body Measurements (Skin Tight)
    // ---------------------------------------------------------

    // Base chest roughly correlates with weight and height
    // Refined heuristic: Chest increases with BMI
    // Start with a base skeleton size from height, add bulk from weight

    if (gender === 'male') {
        const baseChest = height * 0.28; // skeletal chest
        const bulk = (weight / height) * 100; // bulk factor
        chest = baseChest + (bulk * 0.6) + 5;

        // Waist
        // For men, waist is typically 0.85-0.95 of chest depending on fitness (BMI)
        const bmi = calculateBMI(weight, height);
        let waistRatio = 0.82;
        if (bmi > 25) waistRatio += (bmi - 25) * 0.015; // waist grows faster than chest with weight
        waist = chest * waistRatio;

        hip = chest * 0.95; // Men hip usually slightly less than chest unless very overweight
        shoulder = chest * 0.45;
        neck = chest * 0.38;
        sleeve = height * 0.38 + 2;
        inseam = height * 0.45;
    } else {
        // Women
        const baseChest = height * 0.25;
        const bulk = (weight / height) * 100;
        chest = baseChest + (bulk * 0.65) + 8; // Bust adds volume

        // Waist
        let waistRatio = 0.70;
        const bmi = calculateBMI(weight, height);
        if (bmi > 25) waistRatio += (bmi - 25) * 0.012;
        waist = chest * waistRatio;

        hip = waist * 1.35; // Hips significantly wider

        shoulder = chest * 0.37;
        neck = chest * 0.33;
        sleeve = height * 0.36;
        inseam = height * 0.46;
    }

    const bodyMeasurements = {
        chest: Math.round(chest),
        waist: Math.round(waist),
        hip: Math.round(hip),
        shoulder: Math.round(shoulder),
        neck: Math.round(neck),
        sleeve: Math.round(sleeve),
        inseam: Math.round(inseam),
        thigh: Math.round(hip * 0.58),
    };

    // ---------------------------------------------------------
    // 2. Calculate Garment Measurements (With Ease)
    // ---------------------------------------------------------
    let easeMap = {
        slim: { chest: 4, waist: 2, hip: 3, thigh: 2 },
        regular: { chest: 8, waist: 4, hip: 5, thigh: 4 },
        loose: { chest: 12, waist: 8, hip: 8, thigh: 6 }
    };

    const selectedEase = easeMap[fitPreference] || easeMap['regular'];

    const garmentMeasurements = {
        chest: bodyMeasurements.chest + selectedEase.chest,
        waist: bodyMeasurements.waist + selectedEase.waist,
        hip: bodyMeasurements.hip + selectedEase.hip,
        thigh: bodyMeasurements.thigh + selectedEase.thigh,
        shoulder: bodyMeasurements.shoulder + 1, // Minimal ease for structure
        neck: bodyMeasurements.neck + 1,
        sleeve: bodyMeasurements.sleeve + 1, // Length ease
        inseam: bodyMeasurements.inseam // Usually exact or slight break, keeping exact for now
    };

    // ---------------------------------------------------------
    // 3. Validation & Warnings
    // ---------------------------------------------------------
    const bmi = calculateBMI(weight, height);
    const warnings = [];

    if (bmi < 18.5) warnings.push('BMI indicates underweight. Waist estimates may be lower than actual.');
    if (bmi > 30) warnings.push('BMI indicates obesity. Measurement accuracy decreases for higher BMI.');
    if (age < 18) warnings.push('Growth factors for under-18s are not fully modeled.');
    if (gender === 'female' && chest > hip) warnings.push('Inverted triangle body shape detected; verify shoulder fit.');

    // ---------------------------------------------------------
    // 4. Confidence Score
    // ---------------------------------------------------------
    const measurementMeta = {};
    const baseConfidence = 85;
    const confidenceMap = {
        chest: 85, waist: 70, hip: 75, shoulder: 85, neck: 80, sleeve: 90, inseam: 90, thigh: 70
    };
    const bmiPenalty = (bmi < 18.5 || bmi > 30) ? 15 : 0;

    Object.keys(bodyMeasurements).forEach(key => {
        let conf = (confidenceMap[key] || baseConfidence) - bmiPenalty;
        if (conf < 0) conf = 0; if (conf > 100) conf = 100;
        measurementMeta[key] = { confidence: conf, source: 'AI' };
    });

    const averageConfidence = Math.round(
        Object.values(measurementMeta).reduce((a, b) => a + b.confidence, 0) / Object.keys(measurementMeta).length
    );

    return {
        bodyMeasurements,
        garmentMeasurements,
        measurementMeta,
        bmi,
        frame: getFrameSize(wristSize, gender),
        confidence: averageConfidence,
        warnings
    };
};

module.exports = {
    estimateMeasurements,
};

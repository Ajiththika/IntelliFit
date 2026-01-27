# AI Measurement & Recommendation Pipeline

## Overview
The IntelliFit AI Measurement System combines heuristic algorithms with (planned) computer vision models to generate accurate body measurements from basic user data and uploaded photos. The system is designed with a "Human-in-the-Loop" architecture, ensuring that AI suggestions can be verified and corrected by customers or professional tailors.

## Architecture

### 1. Data Inputs
*   **Core Logic**: Gender, Height, Weight, Age.
*   **Refinement**: Wrist Circumference, Fit Preference (Slim, Regular, Loose).
*   **Vision (Future)**: Front-facing and Side-facing full-body photos.

### 2. Processing Pipeline

#### Stage 1: Statistical Heuristics (Current)
*   **Input**: Height, Weight, Age, Gender.
*   **Logic**: Uses anthropometric data tables and BMI calculations to estimate circumferences (Chest, Waist, Hip).
*   **Output**: Baseline measurements with ~85% confidence.

#### Stage 2: Computer Vision Refinement (Planned)
*   **Input**: User Photos + Reference Object (e.g., A4 paper or phone height).
*   **Logic**:
    1.  **Pose Detection**: Identify key body landmarks (Shoulders, Elbows, Hips, Knees).
    2.  **Contour Analysis**: Extract body outline for volumetric estimation.
    3.  **Scale Calibration**: Use reference object or user height to map pixels to centimeters.
*   **Output**: Adjusted measurements with ~95% confidence.

### 3. Confidence Scoring
Each measurement is assigned a confidence score (0-100%).
*   **High Confidence (>90%)**: Consistent with statistical norms and visual data.
*   **Medium Confidence (70-90%)**: Fallback to statistical averages; minor outliers detected.
*   **Low Confidence (<70%)**: clear mismatch between inputs (e.g., high weight but small visual contour), requiring manual review.

### 4. Human-in-the-Loop (Review Process)
*   **Draft State**: AI generates initial numbers.
*   **Customer Review**: User sees "Proposed" values with confidence indicators. User must "Approve" or "Edit" values.
*   **Tailor Override**: If a user is connected to a tailor, the tailor can request a re-measure or calculate their own values from the photos.

### 5. Feedback Loop
*   **Data Collection**: Every "Manual Edit" is stored as a correction event.
*   **Training**: Discrepancies between "AI Predicted" and "Final Approved" values are used to fine-tune the heuristic coefficients and the future vision model.

## Data Schema & Integration

### SizeProfile Model
```javascript
{
  user: ObjectId,
  status: 'DRAFT' | 'VERIFIED',
  measurements: {
    chest: { value: Number, confidence: Number, source: 'AI' | 'MANUAL' },
    waist: { value: Number, confidence: Number, source: 'AI' | 'MANUAL' },
    // ...
  },
  history: [
    { timestamp: Date, action: 'OVERRIDE', previousValue: Number, newValue: Number }
  ]
}
```

## Error Handling
*   **Input Validation**: Reject impossible values (e.g., 200kg weight with 150cm height).
*   **Confidence Thresholds**: If overall confidence < 60%, force manual entry or display warning "AI Unsure - Please Measure Manually".
*   **System Failure**: Fallback to manual entry form if AI service is unreachable.

# Customer Profile & Measurement System Design

This document outlines the architecture for the Customer Measurement & Style Profile system, enabling users to maintain accurate body data and style preferences.

## 1. Data Models

### 1.1 Size Profile Schema (`SizeProfile.js`)
Stores current measurements, history, and style preferences.

```javascript
{
  user: ObjectId (Ref: User),
  // Physical Stats (Input for AI)
  gender: Enum('male', 'female', 'other'),
  height: Number (cm),
  weight: Number (kg),
  age: Number,
  wristSize: Number (cm, optional),
  
  // The "Living" Measurements (Output/Editable)
  measurements: {
      chest: Number,
      waist: Number,
      hip: Number,
      shoulder: Number,
      sleeve: Number,
      inseam: Number,
      neck: Number,
      thigh: Number
  },
  
  // Metadata
  fitPreference: Enum('slim', 'regular', 'loose'),
  stylePreferences: {
      preferredColors: [String], // e.g., ['Black', 'Navy']
      fabricSensitivities: [String], // e.g., ['Wool']
      typicalSize: String // e.g., 'L', 'XL'
  },
  
  // History Tracking
  history: [{
      timestamp: Date,
      measurements: Object, // Snapshot of measurements
      source: Enum('AI_GENERATED', 'MANUAL_EDIT'),
      note: String
  }]
}
```

## 2. Measurement Lifecycle

### 2.1 Creation (AI Generation)
1.  **Input**: User provides Height, Weight, Age, Gender.
2.  **Process**: System calculates `measurements` using `estimateMeasurements` utility.
3.  **Storage**: 
    -   Saves to `measurements` field.
    -   Adds entry to `history` with source `AI_GENERATED`.

### 2.2 Manual Adjustment
1.  **Trigger**: User clicks "Edit Measurements" on the result card.
2.  **Action**: User overrides specific values (e.g., changes Waist from 32 to 33).
3.  **Storage**:
    -   Updates `measurements` field.
    -   Adds entry to `history` with source `MANUAL_EDIT`.
    -   **Constraint**: Manual edits are preserved until the next "Generate" action is confirmed (User is warned that generating new sizes overwrites manual edits).

### 2.3 Style Profiling
-   Simple tag-based selection for colors and fabrics.
-   Stored in `stylePreferences` object.

## 3. UI Flow

### 3.1 Measurements Page
-   **Section A: Body Stats Form**: The "Generator" inputs.
-   **Section B: Current Measurements Card**:
    -   Displays Chest, Waist, etc.
    -   **Toggle**: "View Mode" vs "Edit Mode".
    -   In Edit Mode, fields become inputs.
-   **Section C: History Log** (Accordion/List): Shows previous measurement snapshots dates.

## 4. Validation Rules
-   **Height**: 50cm - 300cm
-   **Weight**: 10kg - 300kg
-   **Age**: 1 - 120
-   **Measurements**: All values must be positive.
-   **Required**: Gender, Height, Weight.

## 5. Security
-   **Private Access**: Only the owner (User) can read/write their `SizeProfile`.
-   **Tailor Access**: Tailors can *Request View* (Future feature) or user verbally shares. Currently strictly private to user.

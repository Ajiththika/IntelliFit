# Universal Profile Management System Design

This document outlines the architecture for a "WhatsApp-style" persistent profile system where user data is saved automatically, accessible anytime, and never lost.

## 1. Core Philosophy: "Always Saved"
The system moves away from "Edit -> Click Save" to "Edit -> Auto-Save".
- **Real-time Persistence**: Changes are saved to the local state immediately and synced to the backend after a brief pause (debounce).
- **Session Continuity**: Data persists across browser refreshes and device switches.
- **Universal Access**: Every user type (Customer, Tailor, Admin) has a dedicated, persistent profile.

## 2. Data Models

### 2.1 Base Identity (The "Passport")
*Model: `User`*
Every entity in the system starts here.
- **Fields**:
  - `_id`: Unique Identifier (UUID/ObjectId)
  - `email`: Login credential (Immutable/Verifiable)
  - `role`: 'user' | 'tailor' | 'admin'
  - `name`: Display Name (Editable, Auto-Saved)
  - `avatar`: Profile Picture URL
  - `phone`: Contact Number
  - `isPremium`: Subscription Status

### 2.2 Customer Extension (The "Digital Twin")
*Model: `SizeProfile` (Linked to User)*
Stores physical attributes for accurate fitting.
- **Fields**:
  - `user`: Reference to Base Identity
  - `gender`: 'male' | 'female' | 'other'
  - `measurements`: { chest, waist, hips, inseam, ... } (Auto-Saved)
  - `preferences`: { fit: 'slim'/'regular', metric: 'cm'/'in' }
  - `lastUpdated`: Timestamp

### 2.3 Tailor Extension (The "Storefront")
*Model: `TailorProfile` (Linked to User)*
Stores business logic and public-facing data.
- **Fields**:
  - `businessName`: Public Store Name
  - `bio`: Description/Story
  - `location`: Service Area
  - `services`: [{ name, price, description }] (Structured List)
  - `portfolio`: [URL strings] (Gallery)
  - `rating`: Aggregate Score

## 3. Update & Save Logic

### 3.1 The Auto-Save Workflow
1.  **User Action**: User types in a field (e.g., changes "Bio").
2.  **Local State**: React `useState` updates immediately (UI reflects change).
3.  **Debounce**: System waits **1000ms** for typing to stop.
4.  **Sync**:
    -   *If valid*: `PUT /api/resource` is called.
    -   *Feedback*: UI shows "Saving..." -> "Saved".
    -   *Error*: UI shows "Retry" (does not revert text).

### 3.2 Update Rules
-   **Upsert Strategy**: API endpoints (`POST /profile`) act as "Create or Update". If the profile exists, it updates; if not, it creates.
-   **Partial Updates**: APIs accept partial JSON. Sending `{ "name": "New Name" }` only updates the name, leaving other fields intact.
-   **Last Write Wins**: If two sessions edit simultaneously, the latest request (by server receipt) overwrites.

## 4. Edge Cases & Handling

| Edge Case | Handling Strategy |
| :--- | :--- |
| **Network Failure** | UI displays "Offline - Changes will save later". Queue requests (Future) or block nav (MVP). |
| **Incomplete Profile** | User can leave profile partially filled. "Completeness" meter encourages finishing. |
| **Session Expiry** | If token expires during edit, auto-save fails. UI prompts "Session Expired - Login to save" without clearing form. |
| **Large Payloads** | Images are uploaded first; only URLs are saved to the profile text data. |

## 5. Security Access Control
-   **Own Profile**: Users can only access `PUT /api/users/profile` (their own).
-   **Public View**: `GET /api/tailors/:id` allows public read access to Tailor profiles.
-   **Private View**: `GET /api/size-profile` is strictly private (Customer only).
-   **Admin Override**: Admins can edit broad user details but typically do not alter personal Size Profiles implies consent.

## 6. Implementation Status
-   [x] **Tailor Profile**: Auto-save implemented (`TailorProfileEditor`).
-   [x] **Database Models**: All schemas created.
-   [ ] **User/Customer Profile**: Currently manual save. Needs refactoring to Auto-Save.

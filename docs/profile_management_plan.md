# implementation_plan: Profile Management & Persistence Feature

This plan outlines the design and implementation steps for a robust, persistent profile management system for the IntelliFit platform.

## 1. User Roles & Profile Structure (Data Models)

The system is built on a "Universal Profile" concept where every entity is a `User`, extended by specific profile models based on their role (`TailorProfile`, `SizeProfile`).

### 1.1 Universal User Model (`User.js`)
*Already exists. Handles authentication and identity.*
- **Fields**: `name`, `email`, `password`, `role`, `phone`, `avatar`, `isPremium`.
- **Purpose**: Base identity for Customers, Tailors, and Admins.
- **Persistence**: Updates here reflect across the platform immediately.

### 1.2 Customer Profile (`SizeProfile.js` + `User.js`)
*Combination of User data and Size data.*
- **SizeProfile**: Stores measurements (`height`, `weight`, `chest`, `waist`, etc.).
- **Persistence**: "Auto-save" on the frontend ensures no data loss.
- **Versioning**: (Future) Store history of size profiles.

### 1.3 Tailor Profile (`TailorProfile.js`)
*Extends User for Tailors.*
- **Existing Fields**: `businessName`, `bio`, `specializations`, `experienceYears`, `location`, `portfolioImages`.
- **New Field Requirement**: Structured `pricing`.
  - **Change**: Convert `pricing` from `String` to `Array` of objects.
  - **Schema**:
    ```javascript
    pricing: [{
        serviceName: { type: String, required: true },
        startingPrice: { type: Number, required: true },
        description: String
    }]
    ```
- **Portfolio**: Managed via `portfolioImages` (array of URLs).

### 1.4 Admin Profile
*Admin identity is managed via `User` model with `role: 'admin'`.*
- **Accountability**: Actions (bans, verifications) should be logged (Future: `AdminLog` model).
- **Capabilities**: Can edit any `User` or `TailorProfile` via Admin Dashboard.

---

## 2. API Endpoints & Logic

### 2.1 User / Universal
- `GET /api/users/profile`: Fetches base user data. *Enhanced to optionally return linked profile data based on role.*
- `PUT /api/users/profile`: Updates base user data (`name`, `phone`, `avatar`).

### 2.2 Customer (Size)
- `GET /api/size-profile`: Fetches current size profile.
- `POST /api/size-profile`: Creates or Updates size profile (Upsert). *Triggers auto-save on frontend.*

### 2.3 Tailor
- `GET /api/tailors/profile`: Fetches own tailor profile.
- `POST /api/tailors/profile`: Upsert (Create/Update) tailor profile.
  - **Validation**: Ensure `businessName`, `location` are present for public visibility.
- `GET /api/tailors/:id`: Public view for customers.

### 2.4 Admin
- `GET /api/admin/users`: List all users.
- `PUT /api/admin/users/:id`: Edit user details / toggle active status.
- `PUT /api/admin/tailors/:id/status`: Approve/Reject tailor profile.

---

## 3. Frontend Implementation Strategy

### 3.1 "Auto-Save" Architecture
To meet the "WhatsApp-like" persistence requirement:
1.  **State Management**: React `useState` / Context holds the form data.
2.  **Debounce**: Use a `useDebounce` hook (e.g., 1000ms delay) on form inputs.
3.  **Effect**: `useEffect` triggers the API update call when debounced data changes.
4.  **Feedback**: Show a subtle "Saving..." -> "Saved" indicator in the UI.

### 3.2 Customer Profile Flow
1.  **View**: `ProfilePage` tabs: "Account Details", "My Sizes".
2.  **Edit**: Inputs are standard form fields. Changing a value triggers the auto-save flow.

### 3.3 Tailor Profile Flow
1.  **Dashboard**:Dedicated "Profile" tab.
2.  **Sections**:
    - **Basic Info**: Name, Bio, Location.
    - **Services & Pricing**: Dynamic list (Add/Remove Service).
    - **Portfolio**: Image uploader (already partially implemented).
3.  **Preview**: "View Public Profile" button to see what customers see.

### 3.4 Public Tailor View
- **User**: Search/Click Tailor.
- **Page**: `TailorPublicProfile`.
- **Components**:
    - `TailorHeader` (Avatar, Name, Location, Rating).
    - `PortfolioGrid` (Images).
    - `PricingTable` (Services list).
    - `ReviewsSection`.

---

## 4. Edge Cases & Handling

1.  **Missing Data**:
    - *Scenario*: Tailor creates account but doesn't fill profile.
    - *Handling*: specific flag `isProfileComplete`. Don't show in search results until complete.
2.  **Role Switching**:
    - *Scenario*: Customer becomes Tailor.
    - *Handling*: Create empty `TailorProfile` upon role upgrade. Retain `SizeProfile` (tailors also wear clothes).
3.  **Concurrent Edits**:
    - *Scenario*: User edits on two devices.
    - *Handling*: Last write wins (standard for this MVP).
4.  **Image Upload Failures**:
    - *Handling*: Retry logic or clear error message. Don't block text updates if image fails.

## 5. MVP Implementation Steps

1.  **Backend**:
    -   Update `TailorProfile` schema for structured pricing.
    -   Verify `userController` and `tailorController` support upserts.
2.  **Frontend - Tailor**:
    -   Build `TailorProfileEditor` with auto-save.
    -   Implement "Add Service" for pricing.
3.  **Frontend - Customer**:
    -   Enhance `UserProfile` to include Size data forms.
4.  **Public View**:
    -   Create `TailorDetailsPage` fetching full profile + services.

## 6. Future Enhancements (Post-MVP)
- **Profile Versioning**: "Undo" changes.
- **Completeness Score**: "Your profile is 80% complete - add a photo!"
- **Verified Badge**: Admin verification workflow.

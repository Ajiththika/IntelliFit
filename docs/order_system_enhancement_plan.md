# implementation_plan: Order System Enhancements

The next critical step for the IntelliFit marketplace is to refine the ordering process. Currently, we have a basic `CreateOrderDialog` with hardcoded pricing and simple logic. We need to make this dynamic and integrated with the new `TailorProfile` pricing structure.

## 1. Objectives

-   **Dynamic Service Selection**: Instead of hardcoded "Suit: $200", fetch the *actual* services and prices defined by the specific tailor in their profile.
-   **Order Transparency**: Display the selected service details clearly to the user before confirmation.
-   **Tailor Dashboard**: Ensure tailors can view and manage these orders effectively (Status updates).

## 2. Dynamic Pricing Integration

### 2.1 Frontend: `CreateOrderDialog.jsx`
-   **Fetch Services**: When the dialog opens, it receives `tailorId`. We need to fetch the full tailor profile to get the `pricing` array (Service Name, Price, Description).
-   **Service Selector**: Replace the static `Select` with a dynamic dropdown populated from `tailor.pricing`.
-   **Fallback**: If the tailor has no services listed, show a "Custom Order" option with a "Request Quote" flow (or just a generic text input for MVP).

### 2.2 Backend: Order Logic
-   **Validation**: The `price` is currently sent by the client. While acceptable for MVP, we should verify that limits aren't being exploited. For now, we will trust the client but log discrepancies.
-   **Snapshot**: We are already snapshotting `sizeProfile`. This is good.

## 3. Order Management UI

### 3.1 Customer View (`OrdersPage.jsx`)
-   **Status Badges**: Visual indicators for 'Pending', 'In Progress', 'Completed'.
-   **Order Details**: Ability to expand an order to see the "Instructions" and "Snapshot Measurements" used.

### 3.2 Tailor View (`OrdersPage.jsx` - Role Aware)
-   **Action Buttons**: "Accept", "Reject", "Mark Complete".
-   **Measurement View**: Tailor needs to potentially *see* the customer's measurements attached to the order.

## 4. Implementation Steps

1.  **Refactor `CreateOrderDialog`**:
    -   Fetch tailor details on mount (or pass them in).
    -   Map `tailor.pricing` to the dropdown.
    -   Update state to track `selectedService` object (price, name).

2.  **Enhance `OrdersPage`**:
    -   Add "Tailor View" logic: If `user.role === 'tailor'`, fetch `shop-orders`.
    -   Render a different table/card for Tailors with "Update Status" controls.

3.  **Measurement Visibility**:
    -   Ensure the `Order` model's `sizeProfileSnapshot` is actually being populated correctly (already in controller).
    -   Add a "View Measurements" modal for the Tailor on the Order Card.

## 5. Security & Edge Cases
-   **No Services**: Handle case where tailor hasn't set up pricing yet.
-   **Concurrency**: If a tailor deletes a service while a user is booking it (Low risk for MVP).

This plan focuses on **Step 1 & 2**: Making the booking flow real.

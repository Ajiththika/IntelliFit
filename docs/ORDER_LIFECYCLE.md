# Order Lifecycle & Management System

## 1. Overview
The IntelliFit Order System governs the transactional flow between Customers and Tailors. It ensures that every order includes a precise "snapshot" of the customer's measurements at the time of purchase, preventing disputes if the customer's body changes later. It also enforces a strict state machine to guide the order from creation to completion.

## 2. Order Schema
The status and data integrity are managed via the following Mongoose schema extensions:

### Core Fields
*   **customer**: `ObjectId` (User)
*   **tailor**: `ObjectId` (TailorProfile)
*   **garmentType**: `String` (e.g., "Suit", "Shirt")
*   **price**: `Number`
*   **instructions**: `String`

### Lifecycle Fields
*   **status**: `enum` ['pending', 'accepted', 'rejected', 'in_progress', 'fitting_review', 'completed', 'cancelled', 'disputed']
*   **statusHistory**: Array of change logs `{ status, changedBy, timestamp, note }`

### Measurement Integrity
*   **sizeProfileSnapshot**: A frozen copy of the `SizeProfile` at the moment of order creation.
    *   `measurements`: The actual cm values.
    *   `confidence`: The aggregate confidence score.
    *   `source`: 'AI_GENERATED' or 'VERIFIED'.
    *   `meta`: Detailed confidence map per measurement.

## 3. Status Machine

The system enforces valid state transitions to prevent illogical flows (e.g., moving from 'completed' back to 'pending').

| Current State    | Allowed Transitions                | Triggered By       | Notes                                      |
| :--------------- | :--------------------------------- | :----------------- | :----------------------------------------- |
| **pending**      | `accepted`, `rejected`, `cancelled`| Tailor / Customer  | Customer can cancel only if still pending. |
| **accepted**     | `in_progress`, `cancelled`         | Tailor             | Tailor confirms materials/schedule.        |
| **in_progress**  | `fitting_review`, `completed`, `disputed` | Tailor    | Main production phase.                     |
| **fitting_review**| `in_progress`, `completed`        | Tailor             | Optional step for interim checks.          |
| **completed**    | `disputed`                         | Tailor             | Order finished.                            |
| **disputed**     | `in_progress`, `completed`, `cancelled` | Admin / Support | Resolution phase.                          |
| **cancelled**    | *None (Terminal)*                  | -                  |                                            |
| **rejected**     | *None (Terminal)*                  | -                  |                                            |

## 4. API Flow

### A. Create Order
*   **Endpoint**: `POST /api/orders`
*   **Logic**:
    1.  Validates Tailor and Garment details.
    2.  Fetches Customer's current `SizeProfile`.
    3.  **FREEZES** the profile into `sizeProfileSnapshot`.
    4.  Sets status to `pending`.
    5.  Logs initial history event.

### B. Update Status
*   **Endpoint**: `PUT /api/orders/:id/status`
*   **Logic**:
    1.  Checks if User is Authorized (Tailor, Customer, or Admin).
    2.  Checks `allowedTransitions` map against current status.
    3.  If valid, updates status and appends to `statusHistory`.
    4.  If invalid, returns `400 Bad Request`.

## 5. Failure Handling

*   **Missing Profile**: Order creation fails with `400` if the user has no generated measurements.
*   **Invalid Transition**: Returns `400` with descriptive error (e.g., "Cannot move from cancelled to in_progress").
*   **Authorization**: Customers attempting to accept their own orders returns `401`.
*   **Data Integrity**: If a user updates their profile *after* placing an order, the order remains unaffected because it uses the `snapshot`.

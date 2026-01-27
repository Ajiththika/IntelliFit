# Payment & Commission Architecture

## 1. Overview
IntelliFit uses a commission-based business model where payments are held in escrow until order completion.

## 2. Data Models
*   **Order**: Tracks `paymentStatus` (unpaid, escrow, paid, refunded) and `commission` amount.
*   **Transaction**: Immutable ledger of all money movements (`PAYMENT`, `PAYOUT`, `REFUND`).

## 3. Commission Logic
*   **Platform Fee**: 15% (Configurable in Controller).
*   **Calculation**: `Commission = Price * 0.15`, `Tailor Payout = Price - Commission`.

## 4. Payment Flow

### Phase 1: Purchase (Escrow)
1.  **Customer** clicks "Pay Now" on an Accepted Order.
2.  **API**: `POST /api/payment/create-order-session`
    *   Calculates split.
    *   Creates Stripe Session.
3.  **Webhook** (Mocked via `mock-success`):
    *   Verifies payment.
    *   Updates Order `paymentStatus` -> `'escrow'`.
    *   Creates `Transaction` (Type: PAYMENT).

### Phase 2: Fulfillment
1.  Tailor fulfills order.
2.  Customer confirms receipt (Order Status -> `completed`).

### Phase 3: Payout (Release)
1.  **Trigger**: Admin review or Automated Scheduler.
2.  **API**: `POST /api/payment/release-funds` (Admin Only)
    *   Checks if Order is `completed` AND `paymentStatus` is `escrow`.
    *   Updates `paymentStatus` -> `'paid'`.
    *   Creates `Transaction` (Type: PAYOUT) to Tailor.
    *   (Future) Integreate `stripe.transfers.create` for real bank transfer.

## 5. Failure Cases
*   **Payment Failed**: Stripe handles retries; Order remains `unpaid`.
*   **Refunds**: Admin can trigger refunds. This sets Order `paymentStatus` -> `refunded` and creates a `REFUND` Transaction.

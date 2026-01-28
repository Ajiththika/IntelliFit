# Analytics & Metrics Strategy

## 1. Objectives
*   **Acquisition**: Track signups and user role distribution.
*   **Activation**: Measure "Time to First Measurement" and "Size Profile Completion".
*   **Revenue**: Monitor Order Volume, Gross Merchandise Value (GMV), and Tailor Payouts.
*   **Retention**: Track Repeat Purchase Rate and Login Frequency.

## 2. Metrics List (KPIs)

| Metric | Definition | Purpose |
| :--- | :--- | :--- |
| **New Accounts** | Count of `USER_REGISTERED` events. | Growth tracking. |
| **Profile Completion** | % of users with `SIZE_GENERATED`. | Product activation. |
| **Order Conversion** | `ORDER_CREATED` / Unique Visitors. | Funnel health. |
| **Escrow Conversion** | `PAYMENT_COMPLETED` / `ORDER_CREATED`. | Payment success rate. |
| **Tailor Activity** | Active tailors (with >=1 order/month). | Marketplace supply health. |

## 3. Event Schema (JSON)

We use a structured JSON schema for all events, compatible with tools like Mixpanel, Amplitude, or Google Analytics 4.

```json
{
  "eventName": "ORDER_CREATED",
  "userId": "user_12345",
  "role": "user",
  "properties": {
    "orderId": "order_987",
    "amount": 150.00,
    "garmentType": "Suit",
    "tailorId": "tailor_555"
  },
  "timestamp": "2026-01-28T10:00:00Z",
  "userAgent": "Mozilla/5.0...",
  "source": "web_app"
}
```

## 4. Implementation Strategy (Hybrid)
1.  **Backend Tracking**: Critical events (Signups, Orders, Payments) are logged directly from the server to ensure accuracy.
2.  **Frontend Tracking**: Interactions (Button clicks, Page views) can be sent to an API endpoint `POST /api/analytics/collect`.
3.  **Storage**: 
    *   **Phase 1**: Store in MongoDB `AnalyticsEvent` collection for internal querying.
    *   **Phase 2**: Async push to specialized tools (e.g., Segment/Mixpanel).

## 5. Key Events to Track
*   **User Lifecycle**: `USER_REGISTERED`, `USER_LOGGED_IN`, `ROLE_SWITCHED`.
*   **Core Loop**: `SIZE_GENERATED`, `SIZE_VERIFIED`.
*   **Marketplace**: `ORDER_CREATED`, `ORDER_ACCEPTED`, `PAYMENT_COMPLETED`.

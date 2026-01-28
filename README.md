# IntelliFit - AI-Powered Automated Tailoring Marketplace

IntelliFit is a next-generation platform connecting customers with professional tailors, powered by AI body measurement technology. It streamlines the entire custom clothing process from size estimation to order fulfillment and secure payments.

## 🚀 Key Features

*   **AI Size Studio**: Instantly generates body measurements using height, weight, age, and fit preferences.
*   **Marketplace**: Browse tailors, view portfolios, and filter by specialization.
*   **Universal Profile**: Maintain a single verified size profile usable across multiple orders.
*   **Order Management**: Full lifecycle tracking (Pending -> Fitting -> Completed) with escrow payments.
*   **Tailor Dashboard**: Dedicated business tools for tailors to manage orders, earnings, and reputation.
*   **Admin Governance**: Robust tools for user management, verification, audit logging, and platform security.

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Axios.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose).
*   **Authentication**: JWT (JSON Web Tokens).
*   **Payments**: Stripe Connect (Escrow workflow).
*   **Analytics**: Custom Event Tracking (MongoDB-based).

## 📚 Documentation Implementation Status

We maintain detailed architectural documentation for all subsystems:

*   [AI Measurement Pipeline](docs/AI_MEASUREMENT_PIPELINE.md)
*   [Order Lifecycle & State Machine](docs/ORDER_LIFECYCLE.md)
*   [Payment & Commission Architecture](docs/PAYMENT_ARCHITECTURE.md)
*   [Security & Privacy Compliance (GDPR)](docs/SECURITY_COMPLIANCE.md)
*   [Admin Governance & Moderation](docs/ADMIN_GOVERNANCE.md)
*   [Analytics Strategy](docs/ANALYTICS_STRATEGY.md)

## 🏁 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)
*   Stripe Account (for payments)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Ajiththika/IntelliFit.git
    cd IntelliFit
    ```

2.  **Install Server Dependencies**
    ```bash
    cd server
    npm install
    ```

3.  **Install Client Dependencies**
    ```bash
    cd ../client
    npm install
    ```

### Configuration

1.  Create `server/.env` based on `server/.env.example`.
2.  Create `client/.env` based on `client/.env.example`.

### Running the Application

**Development Mode (Concurrent)**
You can run both client and server terminals separately.

Terminal 1 (Server):
```bash
cd server
npm run dev
```

Terminal 2 (Client):
```bash
cd client
npm run dev
```

The Application will be available at:
*   Frontend: `http://localhost:5173`
*   Backend API: `http://localhost:5000`

## 🧪 Testing

*   **Admin Setup**: Run `node create_admin.js` to seed a SuperAdmin account.
*   **Tailor Setup**: Run `node create_test_tailor.js` to seed a sample Tailor profile.

## 🔒 Security

This project adheres to strict security standards including:
*   Bcrypt password hashing.
*   Role-Based Access Control (RBAC).
*   Audit logging for sensitive actions.
*   GDPR Data Export/Deletion compliance.

## 📄 License

MIT License

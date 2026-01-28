# Security & Compliance Architecture

## 1. Security Architecture

### A. Authentication & Authorization
*   **JWT (JSON Web Tokens)**: Stateless authentication with expiration.
*   **Bcrypt**: Salted password hashing (Cost factor 10+).
*   **RBAC (Role-Based Access Control)**: Middleware enforces `user`, `tailor`, `admin` boundaries.

### B. Data Protection
*   **Transport Layer**: HTTPS forced for all connections (Production).
*   **At Rest**: MongoDB Atlas Encryption (Enterprise) or Filesystem encryption.
*   **Sensitive Data**:
    *   Passwords: Never stored plain-text.
    *   Payment Data: Handled strictly by Stripe (PCI-DSS compliance); no raw card data hits our servers.
    *   Measurements: Stored in isolated `SizeProfile` collection, linked via ID.

### C. API Security
*   **Helmet**: Sets secure HTTP headers (HSTS, X-Frame-Options).
*   **Input Sanitization**: Mongoose Schema validation prevents common Injection attacks.
*   **Rate Limiting**: (Planned) To mitigate DDoS and Brute Force.

## 2. Threat Model

| Threat | Component | Mitigation |
| :--- | :--- | :--- |
| **SQL/NoSQL Injection** | Database | Mongoose Object Modeling sanitizes queries. |
| **XSS (Cross-Site Scripting)** | Frontend/API | React escapes content by default; `helmet` CSP. |
| **Broken Auth** | Auth System | Short-lived JWTs; Password complexity rules. |
| **Insecure Direct Object Ref** | API | `req.user._id` verification check on all resource access. |
| **Data Breach** | Storage | Minimal PII storage; Offloaded Payments. |

## 3. GDPR Compliance Checklist

### Right to Access (Art. 15)
- [x] Users can view profile and order history.
- [ ] **Implementation**: `GET /api/users/export-data` (New) returns full JSON dump.

### Right to Rectification (Art. 16)
- [x] Users can edit profile and body measurements.

### Right to Erasure (Art. 17)
- [ ] "Right to be Forgotten".
- [ ] **Implementation**: `DELETE /api/users/delete-account` (New)
    -   Hard deletes `SizeProfile` (Biometric data).
    -   Anonymizes `User` record (Scrub Name/Email).
    -   Retains `Order` records for 7 years (Tax Compliance).

### Data Minimization
- [x] Only collecting required measurements for fit.

### Audit Trails
- [x] Admin actions logged in `AuditLog`.

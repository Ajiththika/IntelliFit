# Admin Governance & Moderation

## 1. Overview
The Admin Control Panel empowers platform administrators to maintain safety, quality, and trust. It provides tools for user management, role verification, and comprehensive audit logging.

## 2. Permission Matrix

| Feature | User | Tailor | Admin | SuperAdmin |
| :--- | :---: | :---: | :---: | :---: |
| **Manage Orders** | Own Only | Own Only | View All | View All |
| **Edit Profile** | Own Only | Own Only | Any | Any |
| **Request Tailor Role** | Yes | - | - | - |
| **Approve/Reject Tailors** | - | - | Yes | Yes |
| **Suspend Users** | - | - | Yes | Yes |
| **View Audit Logs** | - | - | Yes | Yes |
| **Manage Admins** | - | - | - | Yes |

## 3. Moderation Flows

### A. Tailor Verification Flow
1.  **Request**: User submits Tailor application (Business Name, Portfolio, etc.).
2.  **Review**: Admin reviews the request in "Pending Access Requests".
3.  **Action**:
    *   **Approve**: User gains `tailor` role permissions. Action is logged.
    *   **Reject**: User stays as `user`. Request is cleared. Action is logged.

### B. User Suspension Flow
1.  **Trigger**: Code of Conduct violation or payment fraud.
2.  **Action**: Admin navigates to User Management -> "Suspend".
3.  **Result**: 
    *   User `isActive` set to `false`.
    *   User token invalidated (on next check).
    *   Audit Log entry created: `SUSPEND_USER` by `Admin_ID`.

## 4. Audit Logging

To ensure accountability, all governance actions are recorded in the immutable `AuditLog` collection.

### Schema
```javascript
{
  admin: ObjectId, // Who performed the action
  action: String,  // e.g., 'SUSPEND_USER', 'APPROVE_ROLE'
  targetUser: ObjectId, // Impacted account
  details: String, // Contextual notes
  timestamp: Date
}
```

### Logged Events
*   `APPROVE_ROLE` / `REJECT_ROLE`
*   `SUSPEND_USER` / `ACTIVATE_USER`
*   `DELETE_USER` (SuperAdmin)
*   `UPDATE_SETTINGS` (Platform Config)

# Authentication & Authorization System

## 1. Authentication Flow Diagram

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB

    Note over Client, DB: Registration Flow
    Client->>API: POST /api/auth/register (name, email, password, role)
    API->>API: Validate Input (Check role != admin)
    API->>DB: Check if email exists
    alt Email Exists
        DB-->>API: User Exists
        API-->>Client: 400 Bad Request
    else New User
        API->>API: Hash Password (bcrypt)
        API->>DB: Create User
        DB-->>API: User Created
        API->>API: Generate JWT Token
        API-->>Client: 201 Created (User Data + Token)
    end

    Note over Client, DB: Login Flow
    Client->>API: POST /api/auth/login (email, password)
    API->>DB: Find User by Email
    alt User Found
        API->>API: Compare Password (bcrypt)
        alt Password Match
            API->>API: Generate JWT Token
            API-->>Client: 200 OK (User Data + Token)
        else Invalid Password
            API-->>Client: 401 Unauthorized
        end
    else User Not Found
        API-->>Client: 401 Unauthorized
    end

    Note over Client, DB: Protected Route Access
    Client->>API: GET /api/admin/users (Header: Bearer <Token>)
    API->>API: Verify Token (JWT)
    alt Token Valid
        API->>DB: Fetch User (req.user)
        API->>API: Check Role Middleware (admin?)
        alt Role Authorized
            API->>API: Execute Controller Logic
            API-->>Client: 200 OK (Data)
        else Role Forbidden
            API-->>Client: 403 Forbidden
        end
    else Token Invalid/Expired
        API-->>Client: 401 Unauthorized
    end
```

## 2. API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new customer or tailor. (Admin role blocked) |
| `POST` | `/api/auth/login` | Public | Authenticate user and receive JWT. |

### User Management (Protected)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Private | Get authenticated user's profile. |
| `PUT` | `/api/users/profile` | Private | Update authenticated user's profile. |
| `GET` | `/api/admin/users` | Admin | Get list of all users. |

## 3. Role-Based Middleware Logic

The system uses two primary middleware functions located in `server/middleware/authMiddleware.js`.

### `protect` Middleware
1.  **Extraction**: Looks for `Authorization` header with `Bearer <token>`.
2.  **Verification**: Uses `jwt.verify` with valid secret.
3.  **User Attachment**: Fetches user from DB (excluding password) and attaches to `req.user`.
4.  **Error Handling**: Returns `401 Not authorized` if token is missing or invalid.

### `authorize(...roles)` Middleware
1.  **Prerequisite**: Must run *after* `protect`.
2.  **Check**: Verifies if `req.user.role` is included in the allowed `roles` arguments.
3.  **Outcome**:
    -   If match: calls `next()`.
    -   If mismatch: Returns `403 Forbidden` with specific message.

**Usage Example:**
```javascript
router.get('/users', protect, authorize('admin'), getUsers);
```

## 4. Error Handling Scenarios

| Scenario | HTTP Status | Error Message | Action |
| :--- | :--- | :--- | :--- |
| **Invalid Email/Password** | `401 Unauthorized` | "Invalid email or password" | Client prompts user to retry. |
| **User Already Exists** | `400 Bad Request` | "User already exists" | Client suggests logging in. |
| **Token Missing** | `401 Unauthorized` | "Not authorized, no token" | Client redirects to login. |
| **Token Expired/Invalid** | `401 Unauthorized` | "Not authorized, token failed" | Client clears storage, redirects login. |
| **Forbidden Role** | `403 Forbidden` | "User role [role] is not authorized..." | Client shows "Access Denied" page. |

## 5. Security Measures Implemented
1.  **Password Hashing**: Bcrypt used for salt+hash before storage.
2.  **JWT**: Stateless session management.
3.  **Role Validation**: Registration endpoint explicitly blocks creation of `admin` role via public API.

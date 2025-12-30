# Node.js User Auth Service

A Node.js + TypeScript authentication service using:
- **Joi** for request validation
- **Controller/Service** architecture
- **JWT** for access & refresh tokens
- **MySQL** as the database

---

## Features
- User signup and login
- Access & refresh token management (JWT)
- Token rotation and revocation
- Secure password hashing
- Protected API endpoints

---

## Flows

### 1. Signup Flow
```
Client
  |
  |  POST /signup
  |  { name, email, mobile, password }
  v
Controller
  |
  v
Service
  |-- hash password
  |-- insert into users table
  v
MySQL (users)

✔ No tokens yet
✔ Just user creation
```

### 2. Login Flow (Token Issue)
```
Client
  |
  |  POST /login
  |  { email, password }
  v
Controller
  |
  v
Service
  |-- verify password
  |-- generate ACCESS TOKEN (3 min)
  |-- generate REFRESH TOKEN (6 min)
  |-- save refresh token in DB
  v
MySQL (refresh_tokens)
  |
  v
Client
  |-- stores access token (memory)
  |-- stores refresh token (cookie / storage)

Tokens after login:
- Access Token   → short-lived (stateless)
- Refresh Token  → long-lived (stored in DB)
```

### 3. Access Protected API
```
Client
  |
  |  GET /profile
  |  Authorization: Bearer ACCESS_TOKEN
  v
Auth Middleware
  |-- verify access token
  |-- token valid?
  |     YES → continue
  |     NO  → 401
  v
Controller → Service → DB

✔ Access token only
✔ DB NOT touched
```

### 4. Access Token Expires (after 3 min)
```
Client
  |-- API call fails (401)
  |
  |  POST /refresh-token
  |  { refreshToken }
  v
Controller
  |
  v
Service
  |-- find refresh token in DB
  |-- revoked = false ?
  |-- not expired ?
  |-- jwt.verify()
  |-- REVOKE OLD REFRESH TOKEN
  |-- generate NEW ACCESS TOKEN
  |-- generate NEW REFRESH TOKEN
  |-- save NEW refresh token
  v
MySQL (refresh_tokens)
  |
  v
Client

🔄 Token Rotation
Old refresh token → revoked
New refresh token → active
```

### 5. Logout Flow
```
Client
  |  POST /logout
  |  { refreshToken }
  v
Controller
  |
  v
Service
  |-- revoke refresh token
  v
MySQL (refresh_tokens)
```

---

## Big Picture (One Screen Summary)
```
 ┌────────────┐
 │   Client   │
 └─────┬──────┘
       |
       |  login
       v
 ┌────────────┐
 │   Server   │
 └─────┬──────┘
       |
       | access token (3 min)
       | refresh token (6 min)
       v
 ┌────────────┐
 │   Client   │
 └─────┬──────┘
       |
       | refresh
       v
 ┌────────────┐
 │  MySQL DB  │ ← refresh_tokens
 └────────────┘
```

---

## Tech Stack
- Node.js
- TypeScript
- Joi (validation)
- JWT (jsonwebtoken)
- MySQL

---

## Project Structure
- `src/controllers/` - Route controllers
- `src/services/`    - Business logic
- `src/middlewares/` - Validation/auth middlewares
- `src/routes/`      - API route definitions
- `src/utils/`       - Utility functions (e.g., JWT)
- `src/config/`      - DB and config

---


## Setup
1. Clone repo & install dependencies
2. Create MySQL database:
    ```sql
    CREATE DATABASE node_user_auth_db;
    USE node_user_auth_db;
    ```
3. Copy `.env.example` to `.env` and update values as needed
4. Configure MySQL connection in `src/config/db.ts`
5. Create tables in MySQL:
   ```sql
   CREATE TABLE users (
     id BIGINT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(150) NOT NULL,
     mobile VARCHAR(20) NOT NULL,
     password VARCHAR(255) NOT NULL,

     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

     UNIQUE KEY uniq_email (email),
     UNIQUE KEY uniq_mobile (mobile)
   );

   CREATE TABLE refresh_tokens (
     id BIGINT AUTO_INCREMENT PRIMARY KEY,
     user_id BIGINT NOT NULL,
     token VARCHAR(500) NOT NULL,
     expires_at DATETIME NOT NULL,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     revoked BOOLEAN DEFAULT FALSE,

     CONSTRAINT fk_refresh_user
       FOREIGN KEY (user_id)
       REFERENCES users(id)
       ON DELETE CASCADE,

     UNIQUE KEY uniq_token (token),
     INDEX idx_user_id (user_id)
   );
   ```
6. Start server: `npm run dev`

---

## License
MIT

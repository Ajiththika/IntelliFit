# Deployment Guide

This guide covers how to deploy the IntelliFit platform to production environments.

## 1. Architecture Overview
IntelliFit is a MERN stack application consisting of:
*   **Frontend**: React (Vite) Single Page Application.
*   **Backend**: Node.js / Express API.
*   **Database**: MongoDB (Atlas recommended for production).

## 2. Prerequisite Services
Before deploying code, provision the following:
*   **MongoDB Atlas Cluster**: Get the Connection String (SRV).
*   **Stripe Account**: Get Public/Secret API Keys.
*   **Cloudinary (Optional)**: If you implement image hosting later.

## 3. Backend Deployment (e.g., Render / Heroku / Railway)

1.  **Environment Variables**:
    Set the following on your host:
    ```bash
    NODE_ENV=production
    MONGO_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/intelifit?retryWrites=true&w=majority
    JWT_SECRET=<long_random_string>
    STRIPE_SECRET_KEY=sk_live_...
    ```

2.  **Build Command**:
    ```bash
    npm install
    ```
    (No build step needed for Node API, just install).

3.  **Start Command**:
    ```bash
    npm start
    ```

## 4. Frontend Deployment (e.g., Vercel / Netlify)

1.  **Environment Variables**:
    Set the following in your Vercel/Netlify dashboard:
    ```bash
    VITE_API_BASE_URL=https://your-backend-api.onrender.com/api
    ```

2.  **Build Settings**:
    *   **Framework Preset**: Vite
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`

3.  **Deploy**: Connect your GitHub repository and trigger the deploy.

## 5. CI/CD Pipeline (GitHub Actions)

We recommend setting up a `.github/workflows/deploy.yml` to automate testing and deployment.

### Example Workflow
```yaml
name: CI/CD

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Client
        run: cd client && npm install
      - name: Build Client
        run: cd client && npm run build
      - name: Install Server
        run: cd server && npm install
```

## 6. Post-Deployment Checks
1.  **Health Check**: Visit `https://your-api.com/` and ensure it returns "API is running".
2.  **Database**: Verify connection by logging in via the Frontend.
3.  **Stripe**: Make a test purchase (using tailored test cards or $0.50 transaction).

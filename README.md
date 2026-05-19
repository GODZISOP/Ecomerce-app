# MediMart Pakistan — Separated E-Commerce Monorepo 🩺📦

Welcome to **MediMart Pakistan**! This repository has been structured into three independent, professional-grade subdirectories for a clean separation of concerns, allowing standalone scaling, robust security, and seamless deployment on Vercel.

---

## 📂 Project Architecture

* **`/frontend`**: The consumer-facing digital pharmacy. Handles search, cart, checkout, orders tracking, and consultation via AI Chat Assistant. (Runs on port `3000`)
* **`/admin-panel`**: The secure admin dashboard. Manages products (CRUD), views live sales statistics, fulfills orders, and validates uploaded doctor prescriptions. (Runs on port `3002`)
* **`/backend`**: The backend server hosting all secure database API operations, metrics aggregation, status transitions, and store settings configs. (Runs on port `3001`)

---

## 🚀 Getting Started

From the root of the workspace, you can manage all three environments effortlessly using our global npm scripts:

### 1. Install All Dependencies
Installs all standard node modules across the root and the three subdirectories with a single command:
```bash
npm run install:all
```

### 2. Run All Dev Servers
To run each app individually:
* **Backend API Server**: `npm run dev:backend`
* **Frontend Customer Shop**: `npm run dev:frontend`
* **Admin Dashboard Workspace**: `npm run dev:admin`

---

## 🔌 API Proxy Rewrites
Both `frontend` and `admin-panel` are configured with built-in transparent proxy rewrites in `next.config.ts`.
This redirects all `/api/*` browser calls to the backend server (on `http://localhost:3001` or your production server) dynamically, eliminating CORS problems and keeping code extremely clean!

---

## ⚡ Deployment on Vercel
1. Set up **3 independent projects** on your Vercel Dashboard.
2. In each project, define the **Root Directory** field to match its folder: `frontend`, `admin-panel`, or `backend`.
3. Add `NEXT_PUBLIC_BACKEND_URL` in the frontend and admin-panel settings to point to your live backend server URL.
4. Click deploy! Zero configuration required.


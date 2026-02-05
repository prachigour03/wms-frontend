# 🏗️ Warehouse Management System (WMS)

Full-stack Warehouse Management System with **Node.js + Express backend** and **React + Vite frontend**, deployed on **Render (backend)** and **Vercel (frontend)**.

---

## 🚀 Live Links

* **Backend (API):** `https://<your-backend>.onrender.com/api`
* **Frontend (UI):** `https://<your-frontend>.vercel.app`

> Replace `<your-backend>` and `<your-frontend>` with actual deployed URLs.

---

## 🧰 Tech Stack

* **Backend:** Node.js, Express.js, PostgreSQL, Sequelize, JWT Auth
* **Frontend:** React.js, Vite, Axios, Tailwind CSS (optional)
* **Deployment:** Render (backend), Vercel (frontend)
* **Security:** bcrypt, JWT, CORS

---

## 📁 Project Structure

```
wms-project/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── middlewares/
│   ├── package.json
│   └── .env.example

├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── .env.example
```

---

## ⚙️ Environment Variables

### Backend `.env.example`

```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=StrongPassword@123
```

### Frontend `.env.example`

```
VITE_API_URL=http://localhost:5000/api
```

> **Important:** Never commit real credentials. Use `.env` locally and set environment variables on Render/Vercel for production.

---

## 🧩 Features

* JWT Authentication & Protected Routes
* Role-Based Access Control (RBAC)
* User Management (CRUD)
* Warehouse Modules (Items, Inventory, Orders)
* Email Notifications (via configured SMTP)
* Seeders for initial setup

---

## ▶️ Getting Started Locally

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Fill your local values
npm run dev
```

Server runs at: `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env  # Set VITE_API_URL
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔐 Deployment

### Backend (Render)

1. Push backend code to GitHub.
2. Create **Web Service** on Render.
3. Connect GitHub repo.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add all environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.) in Render Dashboard.
7. Deploy → ✅ Live backend URL.

### Frontend (Vercel)

1. Push frontend code to GitHub.
2. Create **New Project** on Vercel → Link GitHub repo.
3. Framework: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add environment variable: `VITE_API_URL` pointing to backend URL.
7. Deploy → ✅ Live frontend URL.

---

## 🌐 CORS Configuration

Backend (`app.js`) must allow frontend origin:

```js
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://<your-frontend>.vercel.app'
  ],
  credentials: true
}));
```

Redeploy backend after changes.

---

## 🧪 Scripts

**Backend**

```bash
npm run dev     # Development (nodemon)
npm start       # Production
```

**Frontend**

```bash
npm run dev     # Development
npm run build   # Production build
```

---

## 🔒 Security Notes

* Never push `.env` or real credentials to GitHub.
* Use strong JWT secrets.
* Use App Passwords for email accounts.
* Rotate credentials if exposed.

---

## 📝 Roadmap

* Swagger / API Documentation
* Advanced warehouse features
* Audit Logs
* Rate limiting & throttling

---

## 🧠 Interview / Viva Line

> This WMS project is a full-stack application with backend deployed on Render and frontend on Vercel. Environment variables and secrets are managed securely for production.

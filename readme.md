# 🏃‍♂️ RUN | Marathon Event Platform

A full-stack web application for organizing and participating in marathon events. Built with **React**, **Firebase Auth**, **MongoDB**, and **Express** — fully secured with **JWT (Firebase token)** authentication and protected API routes.

---

## 🔗 Live Project

- 🌐 Client: [b11a11-client-side.web.app](https://b11a11-client-side.web.app/)
- 🌐 Server: [b11a11-server-side-jayedalnahian.vercel.app](https://b11a11-server-side-jayedalnahian.vercel.app)

---

## 🚀 Features

- 🔐 **Secure Firebase Authentication** (Email/Password, Google Login)
- 🪪 **JWT Token Handling** with Firebase `getIdToken()`
- 📦 In-memory token storage (no cookies or localStorage)
- 🗂️ Role-based UI (User/Admin)
- 🏁 Marathon creation, registration, and cancellation
- 🔍 Search and filter marathons
- 🕒 Countdown to marathon start
- 💬 Q&A, Chat UI with DaisyUI
- 🎨 Fully responsive UI using **Tailwind CSS + DaisyUI**
- 🌐 Hosted on Firebase & Vercel

---

## 🛠️ Tech Stack

### Frontend
- **React 19**
- **React Router v7 (data mode)**
- **Tailwind CSS & DaisyUI**
- **Axios**
- **Firebase Auth**
- **React Countdown Timer, Slick Slider**
- **SweetAlert2**

### Backend
- **Node.js + Express**
- **MongoDB (native driver)**
- **Firebase Admin SDK**
- **JWT verification with Firebase**
- **Vercel deployment**

---

## 📁 Project Structure

📦 client/
┣ 📁 src/
┃ ┣ 📁 components/
┃ ┣ 📁 pages/
┃ ┣ 📁 providers/ 🔐 AuthContext
┃ ┣ 📁 hooks/
┃ ┣ App.jsx
┃ ┗ main.jsx

📦 server/
┣ 📁 middlewares/
┃ ┗ verifyJWT.js
┣ 📁 utils/
┃ ┗ firebaseAdmin.js
┣ index.js
┗ .env



## 🔐 Authentication Flow

1. User logs in via Firebase (Google/Email).
2. Firebase issues an `accessToken` via `getIdToken()`.
3. Token is stored in React memory (not localStorage).
4. Every secure request sends the token in:
   ```http
   Authorization: Bearer <accessToken>



   
📦 Installation (Local Dev)


🔽 Clone Repositories
git clone https://github.com/your-username/b11a11-client-side.git
git clone https://github.com/your-username/b11a11-server-side.git




▶️ Client
cd b11a11-client-side
npm install
npm run dev




▶️ Server
cd b11a11-server-side
npm install
node index.js



🙋‍♂️ Author
Jayed Al Nahian
Portfolio (Coming Soon)
📧 .com
# 🔥 FitQuest - The Ultimate Gamified Fitness Community

FitQuest is a premium, full-stack MERN application designed to transform fitness into an addictive, RPG-like experience. Inspired by the competitive spirit of Strava and the engagement of modern gaming, it features a cinematic glassmorphism UI, real-time social interactions, and a robust quadratic progression system.

**Live Demo:** [https://fitness-challenge-tracker-three.vercel.app/](https://fitness-challenge-tracker-three.vercel.app/)

---

## ✨ Core Features

### 🎮 Elite Gamification
- **Quadratic Leveling**: Experience a realistic growth curve where every level feels earned. Powered by a `500 * (L^2 - L)` XP formula.
- **Achievements & Badges**: Unlock 20+ unique milestones with authoritative backend verification and custom XP rewards.
- **Data Integrity**: Built-in "Self-Healing" data synchronization ensures your Level, XP, and Stats are always accurate and consistent.

### 🏋️ Unified Workout Hub
- **Workouts & Routines**: Standalone high-performance pages for one-off sessions and recurring daily habits.
- **Active Focus**: Cinematic "Active" cards at the top of every page keep your current goals front and center.
- **Discovery Library**: Browse and start new sessions with a single click, featuring AI-suggested matches.

### 🤝 Advanced Social System
- **Athlete Community**: Find and connect with fellow users via an intelligent search that tracks friendship status.
- **Social Cheers**: Motivate your friends with "Cheers" that send instant notifications, keeping the community engaged.
- **Friend Requests**: Seamless invitation system with real-time acceptance notifications.

### 🤖 AI Heartbeat & Notifications
- **10-Minute Heartbeat**: An automated background task delivers randomized fitness tips and activity summaries every 10 minutes.
- **Dynamic Notifications**: Real-time alerts for level-ups, achievement unlocks, and social interactions with bulk management (Mark All Read/Clear All).

---

## 🛠️ Tech Stack

- **Frontend**: React 19 (Vite), Framer Motion for cinematic animations, Chart.js for performance analytics, Lucide React icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT (JSON Web Tokens).
- **Styling**: Vanilla CSS with a bespoke Glassmorphism Design System and CSS Variables for dynamic theming.

---

## 🚀 Deployment

### Backend (Render)
1. Create a new **Web Service** on Render.
2. Set Root Directory to `backend`.
3. Build Command: `npm install`.
4. Start Command: `npm start`.
5. **Environment Variables**:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A secure random string.
   - `NODE_ENV`: `production`.
   - `FRONTEND_URL`: Your Vercel app URL (for CORS).

### Frontend (Vercel)
1. Create a new project and set Root Directory to `frontend`.
2. Vercel will auto-detect Vite.
3. **Environment Variable**:
   - `VITE_API_URL`: `https://your-backend-url.onrender.com/api`

---

## 💻 Local Setup

1. **Clone the repo**
2. **Backend**:
   ```bash
   cd backend
   npm install
   # Create .env with MONGO_URI and JWT_SECRET
   npm start
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   # Create .env with VITE_API_URL=http://localhost:5000/api
   npm run dev
   ```

---

## 🏆 Credits
Developed with ❤️ by **Vishnu Bishnoi** for the 4th Semester Web Development Project.
💪 Keep pushing your limits!

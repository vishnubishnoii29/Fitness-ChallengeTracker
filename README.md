# 🔥 FitQuest - The Ultimate Gamified Fitness Community

FitQuest is a premium, full-stack MERN application designed to transform fitness into an addictive, RPG-like experience. Inspired by the competitive spirit of Strava and the engagement of modern gaming, it features a cinematic glassmorphism UI, real-time social interactions, and a robust quadratic progression system.

**Live Demo:** [https://fitness-challenge-tracker-three.vercel.app/](https://fitness-challenge-tracker-three.vercel.app/)

---

## ✨ Core Features

### 🎮 Elite Gamification
- **Quadratic Leveling**: Experience a realistic growth curve where every level feels earned. Powered by a `500 * (L^2 - L)` XP formula.
- **Achievements & Badges**: Unlock 20+ unique milestones with authoritative backend verification and custom XP rewards.
- **Data Integrity & Self-Healing**: Automated background logic synchronizes XP/Points and prunes dead activity references, ensuring a crash-free experience.

### 🛠️ Custom Content Creation
- **Create & Start**: Effortlessly build your own Workouts, Routines, and Challenges.
- **Auto-Activation**: Content you create is automatically started for you, appearing instantly on your Dashboard.
- **Expanding Ecosystem**: Support for specialized types like **Mindfulness**, **Wellness**, and **Consistency**.

### 🏋️ Unified Visual Language
- **Pixel-Perfect Sync**: Every page shares a strictly synchronized design language, from the **4px left-accent active cards** to the **grid-based library layouts**.
- **Active Focus**: Cinematic "Active" sections at the top of every page keep your current goals front and center.
- **High-End Aesthetics**: Pure glassmorphism with backdrop blurring and fluid Framer Motion transitions.

### 🤝 Advanced Social System
- **Athlete Community**: Intelligently search and connect with fellow users.
- **Social Cheers**: Motivate friends with "Cheers" that send instant notifications.
- **Real-time Interactions**: Live updates for level-ups and achievement unlocks shared across the platform.

### 🤖 AI Heartbeat & Notifications
- **10-Minute Heartbeat**: A precision background task that delivers curated fitness tips and updates every 10 minutes.
- **Dynamic Notifications**: Integrated alert center for all social and progress events with bulk management.

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

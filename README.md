# FitQuest - Fitness Challenge Tracker

A full-stack MERN application inspired by Strava, featuring a modern, highly engaging, and gamified user experience.

## Features
- **Vibrant UI**: Built with React and Framer Motion for smooth transitions and card-based layouts.
- **Dark/Light Mode**: Full CSS variable support for a seamless theme switching experience.
- **Dashboard**: Real-time stats, interactive charts (Chart.js), and active challenge tracking.
- **Explore**: Discover new workouts, AI recommendations, and challenges categorized by difficulty and type.
- **Challenges**: Create, track, and join challenges with specific goals (Distance, Reps, Time) and rewards.
- **Leaderboard**: Global, Friends, and Weekly rankings with streak and points tracking.
- **Gamification**: Earn XP, level up, unlock badges, and maintain streaks to stay motivated.

## Tech Stack
- **Frontend**: React (Vite), React Router, Framer Motion, Chart.js, Lucide React icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT authentication.

## Deployment Instructions

### Backend (Render)
1.  Create a new Web Service on [Render](https://render.com/).
2.  Connect your repository and set the root directory to `backend`.
3.  Set the build command to `npm install`.
4.  Set the start command to `npm start`.
5.  Add the following Environment Variables:
    -   `MONGO_URI`: Your MongoDB connection string.
    -   `JWT_SECRET`: A secure random string for JWT.
    -   `PORT`: `5000` (Render will handle this automatically, but good to have).

### Frontend (Vercel)
1.  Create a new project on [Vercel](https://vercel.com/).
2.  Connect your repository and set the root directory to `frontend`.
3.  Vercel will automatically detect the Vite project.
4.  Add the following Environment Variable:
    -   `VITE_API_URL`: The URL of your deployed backend service (e.g., `https://your-backend.onrender.com/api`).
5.  Deploy!

## Local Development

### Backend
1. `cd backend`
2. `npm install`
3. Create a `.env` file based on `.env.example`.
4. `npm start`

### Frontend
1. `cd frontend`
2. `npm install`
3. Create a `.env` file based on `.env.example`.
4. `npm run dev`

# FitQuest - Gamified Fitness Tracker

FitQuest is a full-stack MERN fitness tracker that turns workout tracking into a game-like experience. Users can register, log in, start workouts and routines, join or create challenges, earn XP, level up, unlock achievements, compete on leaderboards, connect with friends, receive notifications, and chat with an AI fitness coach.

**Live Demo:** [https://fitness-challenge-tracker-beta.vercel.app/](https://fitness-challenge-tracker-beta.vercel.app/)  
**Backend API:** [https://fitness-challengetracker-2.onrender.com/](https://fitness-challengetracker-2.onrender.com/)

---

## Core Features

### Authentication

- User registration and login with JWT.
- Password hashing with `bcryptjs`.
- Protected backend routes using auth middleware.
- Protected frontend routes using auth context and React Router.
- Axios interceptor automatically attaches the JWT token to API requests.

### Dashboard

- User profile summary with level, XP, streak, and avatar.
- Fitness stats for calories burned, total distance, workout time, and challenges won.
- Active challenges, workouts, and routines.
- Weekly activity chart powered by Chart.js.
- Daily AI coach insight with graceful fallback behavior.
- Onboarding modal for missing age, height, and weight.

### Gamification

- Quadratic XP leveling system:

  ```text
  XP = 500 * (L^2 - L)
  ```

- Backend-controlled XP, points, levels, badges, and streaks.
- Level-up notifications.
- Achievement unlocks based on challenge completions, streaks, XP milestones, and leaderboard goals.
- Data repair logic that syncs XP/points and removes invalid active workout or challenge references.

### Workouts, Routines, And Challenges

- Browse workouts and routines from the database.
- Start workouts and routines so they appear on the dashboard.
- Create custom workouts/routines and auto-start them for the creator.
- Browse, join, create, stop, and complete challenges.
- Challenge rewards include XP and optional badges.
- Completion updates activity logs, stats, streaks, achievements, and notifications.

### Social And Leaderboards

- Search users by username or email.
- Send, accept, and reject friend requests.
- View friends and cheer them with motivational notifications.
- Global, weekly, and friends leaderboard filters.

### AI Features

- Streaming AI Coach chat using OpenRouter.
- Dashboard AI insight, cached per day.
- AI-based workout recommendations with database fallback.
- Background heartbeat task that sends AI or static fitness tips every 10 minutes.

### Notifications

- Notification center for level-ups, achievements, friend requests, friend accepts, cheers, activity updates, and AI tips.
- Mark single notification as read.
- Mark all notifications as read.
- Clear all notifications.

---

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- Framer Motion
- Chart.js and `react-chartjs-2`
- Lucide React icons
- React Markdown and remark-gfm for AI responses
- Custom CSS design system

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs password hashing
- CORS
- dotenv
- OpenRouter AI API integration

---

## Project Structure

```text
FITNESSTRACKER/
  backend/
    config/
      achievements.js
    middleware/
      authMiddleware.js
    models/
      Activity.js
      Challenge.js
      Notification.js
      User.js
      Workout.js
    routes/
      achievementRoutes.js
      activityRoutes.js
      aiRoutes.js
      authRoutes.js
      challengeRoutes.js
      notificationRoutes.js
      userRoutes.js
      workoutRoutes.js
    utils/
      achievementHelper.js
      levelSystem.js
    server.js
    seed.js
    package.json
  frontend/
    public/
    src/
      components/
      context/
      pages/
      api.js
      App.jsx
      main.jsx
      index.css
    vercel.json
    package.json
  README.md
```

---

## Important Backend Routes

### Auth

```text
POST /api/auth/register
POST /api/auth/login
```

### Users

```text
GET    /api/users/profile
PUT    /api/users/profile
PUT    /api/users/password
GET    /api/users/leaderboard
GET    /api/users/workouts/active
POST   /api/users/workouts/:workoutId/start
POST   /api/users/workouts/:workoutId/complete
DELETE /api/users/workouts/:workoutId/stop
POST   /api/users/challenges/:challengeId/join
POST   /api/users/challenges/:challengeId/complete
DELETE /api/users/challenges/:challengeId/stop
GET    /api/users/search
POST   /api/users/friends/request/:targetId
GET    /api/users/friends/requests
POST   /api/users/friends/request/:requestId/respond
GET    /api/users/friends
POST   /api/users/friends/:friendId/cheer
```

### Workouts And Challenges

```text
GET  /api/workouts
GET  /api/workouts/recommended
POST /api/workouts

GET  /api/challenges
GET  /api/challenges/active
GET  /api/challenges/:id
POST /api/challenges
```

### Activity, Achievements, Notifications, AI

```text
GET  /api/activity/user
POST /api/activity

GET  /api/achievements/unlocked
POST /api/achievements/check-unlocks

GET    /api/notifications
PUT    /api/notifications/mark-all-read
PUT    /api/notifications/:id/read
DELETE /api/notifications/clear-all

POST /api/ai/chat
POST /api/ai/chat/stream
GET  /api/ai/insights
GET  /api/ai/recommendations
```

---

## Database Models

### User

Stores account details, profile metrics, XP, points, level, streak, stats, active workouts, active challenges, badges, unlocked achievements, friends, friend requests, and cached AI data.

### Workout

Stores workouts and routines using the `kind` field. Includes title, type, difficulty, duration, image, match score, and recommendation status.

### Challenge

Stores goal-based challenges with duration, goal type, goal value, difficulty, XP reward, badge reward, creator, and participant count.

### Activity

Stores user activity logs. These logs power dashboard charts, streaks, stats, achievement checks, and heartbeat notifications.

### Notification

Stores user notifications with title, message, read status, and creation date.

---

## Local Setup

### Prerequisites

- Node.js 18 or newer
- MongoDB connection string
- Optional OpenRouter API key for AI features

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
FRONTEND_URL=http://localhost:5173
OPENROUTER_API_KEY=optional_openrouter_key
NODE_ENV=development
```

Start the backend:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The Vite dev server usually runs on:

```text
http://localhost:5173
```

---

## Deployment

### Backend On Render

1. Create a Render Web Service.
2. Set the root directory to `backend`.
3. Build command:

   ```bash
   npm install
   ```

4. Start command:

   ```bash
   npm start
   ```

5. Add environment variables:

   ```text
   MONGO_URI
   JWT_SECRET
   FRONTEND_URL
   OPENROUTER_API_KEY
   NODE_ENV=production
   ```

### Frontend On Vercel

1. Create a Vercel project.
2. Set the root directory to `frontend`.
3. Add environment variable:

   ```text
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

4. Deploy using Vercel's Vite defaults.

---

## Notes For Reviewers

- The backend is the authority for XP, levels, streaks, stats, and achievements.
- AI features are optional and have fallback behavior when the OpenRouter key is missing.
- The app seeds sample users, workouts, routines, and challenges when the database is empty.
- Background heartbeat notifications run after the backend connects to MongoDB.
- Generated preparation files such as `PRESENTATION_SCRIPT.md` and `VIVA_PREP.md` are intentionally ignored by Git.

---

## Credits

Developed by Vishnu Bishnoi.
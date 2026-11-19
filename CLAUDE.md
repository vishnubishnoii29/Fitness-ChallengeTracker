# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

FitQuest: a gamified MERN fitness tracker. Two independent npm projects in one repo — `backend/` (Express 5 + Mongoose 9, CommonJS) and `frontend/` (React 19 + Vite + Tailwind 4, ESM). There is no root `package.json`; run npm commands inside each folder. Backend tests use the built-in `node:test` runner and need no database (`test/logic.test.js` stubs models via `require.cache`).

## Commands

Backend (`cd backend`; needs `.env` copied from `.env.example`: `MONGO_URI`, `JWT_SECRET`, optional `OPENROUTER_API_KEY`, `FRONTEND_URL`):
- `npm start` — runs `node server.js` on port 5000; `npm run dev` restarts on changes
- `npm test` — all tests; one file: `node --test test/unit.test.js`
- `npm run seed` — **destructive**: replaces all Challenges and Workouts with the sample data

Frontend (`cd frontend`; optional `.env` with `VITE_API_URL`):
- `npm run dev` — Vite on 5173; `/api` is proxied to `http://localhost:5000` (see `vite.config.js`)
- `npm run build`, `npm run lint`, `npm run preview`

## Architecture

**Backend** (`app.js` builds the Express app — helmet, rate limits, CORS, routers — and is what tests import; `server.js` connects to Mongo, seeds, starts the heartbeat and listens):
- Mounts routers under `/api/{auth,users,challenges,activity,notifications,workouts,achievements,ai}`. Three routers share `/api/users`: `userRoutes.js` (leaderboard, profile, password), `userProgressRoutes.js` (join/start/stop/complete challenges and workouts, where XP is awarded) and `friendRoutes.js` (search, friend requests, cheers). Streak logic lives in `utils/streak.js`.
- On startup `server.js` calls `utils/seeder.js` (`seedIfEmpty`, data in `data/seedData.js`; demo users only outside production) and starts `jobs/heartbeat.js`, a 6-hourly `setInterval` that creates a notification for every user (activity digest or AI/static fitness tip). `seed.js` is the CLI wrapper behind `npm run seed`.
- The backend is the authority for XP, levels, streaks and achievements. `utils/levelSystem.js` (quadratic: `XP = 500*(L²-L)`), `utils/achievementHelper.js` and `config/achievements.js` define the rules; routes call them after completing challenges/workouts and emit `Notification`/`Activity` docs. Routes also run "data repair" logic (sync XP/points, drop stale active workout/challenge refs).
- Anti-abuse rules: XP amounts come only from `utils/rewards.js` (clients never send XP); a challenge pays once per user (`completedChallenges`) and only built-in challenges (no `creator`) pay XP; workout XP, challenge creation and workout creation are capped per day. Activities are written only by the server (no client write endpoint), and achievements/stats derive from them. `updateStreak` is idempotent per day via `User.lastStreakDate`; achievements are claimed atomically in `utils/achievementHelper.js`. Validate ids with `validateIdParams` and escape user input going into regexes (`utils/validate.js`). `User.toJSON` strips the password hash.
- Auth: JWT via `middleware/authMiddleware.js`; passwords hashed with bcryptjs.
- AI: `routes/aiRoutes.js` and the heartbeat call OpenRouter (`openrouter/free`) with raw `fetch`, streaming for the coach chat. Missing key must degrade gracefully to fallbacks.
- CORS allowlist in `server.js` hardcodes the Vercel URLs, `FRONTEND_URL`, localhost 5173–5175, and any `*.vercel.app`.

**Frontend** (`frontend/src`):
- `api.js` is the single axios instance: normalizes `VITE_API_URL` (with or without trailing `/api`, defaults to `/api`), attaches the JWT from `localStorage['user'].token`, and clears the session on 401. Call it with relative paths without a leading slash (e.g. `api.post('auth/login', …)`).
- `context/AuthContext.jsx` + `context/auth.js` hold the logged-in user (stored in localStorage as the full login response including token).
- `App.jsx` defines routes; authenticated pages (dashboard, workouts, routines, explore, challenges, leaderboard, social, profile, notifications, achievements, ai-coach) render inside a `ProtectedRoute` layout with `components/Sidebar.jsx`. One page component per route in `pages/`.
- Styling is mostly a custom CSS design system in `index.css` with Tailwind 4 via `@tailwindcss/postcss`.

**Deployment**: frontend on Vercel (`vercel.json` rewrites `/api/*` to the Render backend `fitness-challengetracker-2.onrender.com` and everything else to `/` for SPA routing); backend on Render. `PRESENTATION_SCRIPT.md` and `VIVA_PREP.md` are intentionally git-ignored prep files.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
// Render/Vercel sit behind a proxy; needed so rate limiting sees the real client IP
app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ limit: '100kb', extended: true }));

const allowedOrigins = [
  'https://fitness-challenge-tracker-beta.vercel.app',
  'https://fitness-challenge-tracker-three.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
].filter(Boolean);

const VERCEL_PREVIEW = /^https:\/\/fitness-challenge-tracker[a-z0-9-]*\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients, listed origins, and this project's Vercel preview deployments
    if (!origin || allowedOrigins.includes(origin) || VERCEL_PREVIEW.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging (development only; never logs request bodies)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

const limiter = (windowMinutes, max, message) => rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message },
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/auth'), // auth has its own stricter limiter
  message: { message: 'Too many requests, please try again later.' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth', limiter(15, 20, 'Too many login attempts, please try again later.'));
app.use('/api/users/password', limiter(15, 10, 'Too many password attempts, please try again later.'));
app.use('/api/ai', limiter(10, 30, 'Too many AI requests, please slow down.'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/users', require('./routes/userProgressRoutes'));
app.use('/api/users', require('./routes/friendRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/achievements', require('./routes/achievementRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

app.get('/', (req, res) => res.send('FitQuest API is running...'));
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// Error handler
app.use((err, req, res, next) => {
  // Body-parser errors (bad JSON, payload too large) carry their own 4xx status
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error('Unhandled Error:', err.stack);

  const message = status >= 500
    ? 'An unexpected error occurred on the server.'
    : (err.message === 'Not allowed by CORS' ? 'Origin not allowed' : err.expose ? err.message : 'Bad request');
  res.status(err.message === 'Not allowed by CORS' ? 403 : status).json({
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

module.exports = app;

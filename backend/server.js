require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Import models for seeding
const User = require('./models/User');
const Challenge = require('./models/Challenge');
const Activity = require('./models/Activity');
const Notification = require('./models/Notification');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - JSON parsing should be first
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const allowedOrigins = [
  'https://fitness-challenge-tracker-three.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debug middleware - log incoming requests (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    // Don't log sensitive data like passwords
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) delete sanitizedBody.password;
    console.log('Body:', sanitizedBody);
    next();
  });
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/', (req, res) => {
  res.send('FitQuest API is running...');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Basic Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Seed Database Function
const seedDB = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding Users...');
      
      // Hash passwords for seeded users
      const hashedPassword = await bcrypt.hash('123', 10);
      
      await User.insertMany([
        { username: '@sjenkins', email: 's@test.com', password: hashedPassword, level: 42, points: 14500, streak: 120, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
        { username: '@alex_t', email: 'a@test.com', password: hashedPassword, level: 38, points: 13200, streak: 85, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
        { username: '@marcusd', email: 'm@test.com', password: hashedPassword, level: 36, points: 12850, streak: 45, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
        { username: '@emma_w', email: 'e@test.com', password: hashedPassword, level: 34, points: 11900, streak: 60, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
        { username: '@dchen', email: 'd@test.com', password: hashedPassword, level: 30, points: 10500, streak: 12, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80' }
      ]);
    }

    const challengeCount = await Challenge.countDocuments();
    if (challengeCount === 0) {
      console.log('Seeding Challenges...');
      await Challenge.insertMany([
        { title: '100km Cycling Month', durationDays: 30, goalType: 'Distance', goalValue: 100, difficulty: 'Medium', rewardXP: 1000, rewardBadge: 'Cyclist Badge' },
        { title: '30 Days of Yoga', durationDays: 30, goalType: 'Consistency', goalValue: 30, difficulty: 'Easy', rewardXP: 800, rewardBadge: 'Yoga Master Badge' },
        { title: 'Summer Shred', durationDays: 30, goalType: 'Weight Loss', goalValue: 10000, difficulty: 'Hard', rewardXP: 5000, rewardBadge: 'Shredded Badge' },
        { title: 'Weekend Warrior', durationDays: 2, goalType: 'Consistency', goalValue: 2, difficulty: 'Easy', rewardXP: 500, rewardBadge: 'Weekend Badge' },
        { title: '10K Run', durationDays: 7, goalType: 'Distance', goalValue: 10, difficulty: 'Medium', rewardXP: 700, rewardBadge: 'Runner Badge' }
      ]);
    }
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};

// Database Connection
const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected');
      await seedDB(); // Run seeder
    } else {
      console.log('No MONGO_URI provided, skipping DB connection for now.');
    }
    
    // Start activity diff processor every minute
    const processActivityDiffs = async () => {
      try {
        console.log('[Background Task] Running 1-minute heartbeat task...');
        
        // 1. Fetch all users to send them a heartbeat
        const users = await User.find({});
        
        for (const user of users) {
          // Check for unprocessed activities for this user
          const unprocessed = await Activity.find({ userId: user._id, processed: false });
          
          const fitnessTips = [
            "Tip: Drink at least 8 glasses of water today for optimal metabolism.",
            "AI Recommendation: Try adding 10 minutes of HIIT to your routine for better calorie burn.",
            "Diet Tip: High-protein breakfasts can help reduce cravings throughout the day.",
            "Challenge: Can you do 20 pushups right now? Give it a try!",
            "Workout Tip: Remember to stretch for 5 minutes after your session to aid recovery.",
            "Pro Tip: Consistency is better than intensity. Keep showing up!",
            "AI Suggestion: Your sleep affects your gains. Aim for 7-9 hours tonight.",
            "Quick Routine: Take a 5-minute walk every hour to stay active while working."
          ];

          let message = fitnessTips[Math.floor(Math.random() * fitnessTips.length)];
          let title = 'AI Fitness Tip';
          
          if (unprocessed.length > 0) {
            title = 'FitQuest Update';
            const counts = unprocessed.reduce((acc, it) => {
              acc[it.type] = (acc[it.type] || 0) + 1;
              return acc;
            }, {});
            const parts = Object.entries(counts).map(([t, c]) => `${c} ${t}${c > 1 ? 's' : ''}`);
            message = `Activity Update: ${parts.join(', ')}. Keep moving!`;
            
            // Mark these activities as processed
            await Activity.updateMany({ _id: { $in: unprocessed.map(a => a._id) } }, { processed: true });
          }

          // Create the notification for this user
          await Notification.create({ 
            userId: user._id, 
            title: title, 
            message,
            read: false
          });
          
          console.log(`[Background Task] Notification sent to ${user.username || user.email || user._id}`);
        }

        console.log(`[Background Task] Completed heartbeat for ${users.length} users.`);
      } catch (err) {
        console.error('[Background Task] ERROR:', err);
      }
    };

    // Run immediately and then every minute
    processActivityDiffs();
    setInterval(processActivityDiffs, 60 * 1000);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

connectDB();

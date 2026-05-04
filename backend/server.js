require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import models for seeding
const User = require('./models/User');
const Challenge = require('./models/Challenge');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));

// Basic Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Seed Database Function
const seedDB = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding Users...');
      await User.insertMany([
        { username: '@sjenkins', email: 's@test.com', password: '123', level: 42, points: 14500, streak: 120, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
        { username: '@alex_t', email: 'a@test.com', password: '123', level: 38, points: 13200, streak: 85, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
        { username: '@marcusd', email: 'm@test.com', password: '123', level: 36, points: 12850, streak: 45, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
        { username: '@emma_w', email: 'e@test.com', password: '123', level: 34, points: 11900, streak: 60, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
        { username: '@dchen', email: 'd@test.com', password: '123', level: 30, points: 10500, streak: 12, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80' }
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
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

connectDB();

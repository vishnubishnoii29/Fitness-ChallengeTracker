const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { protect } = require('../middleware/authMiddleware');

// Test route to verify routes are loading
router.get('/test', (req, res) => {
  res.json({ message: 'Activity routes are working!' });
});

// Create activity entry (routine / diet / calorie)
router.post('/', protect, async (req, res) => {
  try {
    const { type, data } = req.body;
    const userId = req.user.id; // Use ID from token
    
    if (!type) return res.status(400).json({ message: 'type required' });

    const activity = await Activity.create({ userId, type, data });
    
    // Update user streak
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (user) {
      // Import streak updater from userRoutes
      const { updateStreak } = require('./userRoutes');
      if (updateStreak) {
        await updateStreak(userId);
      }
    }

    res.status(201).json(activity);
  } catch (err) {
    console.error('Create activity error', err);
    res.status(500).json({ message: 'Could not create activity', error: err.message });
  }
});

// Get user activities (for dashboard)
router.get('/user', protect, async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100); // Get recent activities
    res.json(activities);
  } catch (err) {
    console.error('Get user activities error', err);
    res.status(500).json({ message: 'Could not fetch activities', error: err.message });
  }
});

// Create sample activities for testing (Only in development)
router.post('/sample', protect, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not allowed in production' });
  }
  
  try {
    const userId = req.user.id;
    const now = new Date();
    
    const sampleActivities = [];
    
    // Sample routine activities (workouts)
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      sampleActivities.push({
        userId,
        type: 'routine',
        data: {
          distance: Math.random() * 10 + 2,
          duration: Math.random() * 60 + 30,
          calories: Math.floor(Math.random() * 300 + 200)
        },
        createdAt: date
      });
    }
    
    await Activity.insertMany(sampleActivities);
    res.json({ message: 'Sample activities created', count: sampleActivities.length });
  } catch (err) {
    console.error('Create sample activities error', err);
    res.status(500).json({ message: 'Could not create sample activities', error: err.message });
  }
});

module.exports = router;

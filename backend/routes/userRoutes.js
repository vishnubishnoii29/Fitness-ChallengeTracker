const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get all users for leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ points: -1 }).limit(10);
    
    // Add rank property dynamically
    const rankedUsers = users.map((u, index) => ({
      ...u.toObject(),
      rank: index + 1,
      trend: index % 2 === 0 ? 'up' : 'down',
    }));
    res.json(rankedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get logged in user profile
router.get('/profile', protect, async (req, res) => {
  try {
    // req.user.id comes from the protect middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get all users for leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { filter = 'global' } = req.query;
    let users;
    
    switch (filter.toLowerCase()) {
      case 'weekly':
        // For weekly leaderboard, sort by recent activity (mock implementation)
        users = await User.find()
          .select('-password')
          .sort({ streak: -1, points: -1 }) // Prioritize streak, then points
          .limit(10);
        break;
        
      case 'friends':
        // For friends leaderboard, return a subset of users (mock implementation)
        // In a real app, this would filter by actual friends list
        users = await User.find()
          .select('-password')
          .sort({ points: -1 })
          .limit(5); // Fewer results for friends
        break;
        
      case 'global':
      default:
        // Global leaderboard - all users sorted by points
        users = await User.find()
          .select('-password')
          .sort({ points: -1 })
          .limit(10);
        break;
    }
    
    // Add rank property and trend
    const rankedUsers = users.map((u, index) => {
      const userObj = u.toObject();
      return {
        ...userObj,
        rank: index + 1,
        trend: Math.random() > 0.5 ? 'up' : 'down' // Mock trend data
      };
    });
    
    res.json(rankedUsers);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ message: 'Error fetching leaderboard' });
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
    
    // Add trend field for consistency
    const userObj = user.toObject();
    userObj.trend = Math.random() > 0.5 ? 'up' : 'down'; // Mock trend data
    
    res.json(userObj);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, avatar, level, points, streak } = req.body;
    
    // Validate input
    if (username && username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;
    if (level !== undefined) updateData.level = level;
    if (points !== undefined) updateData.points = points;
    if (streak !== undefined) updateData.streak = streak;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Join a challenge
router.post('/challenges/:challengeId/join', protect, async (req, res) => {
  try {
    const { challengeId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already joined
    const alreadyJoined = user.activeChallenges.some(
      c => c.challengeId.toString() === challengeId
    );

    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }

    user.activeChallenges.push({
      challengeId,
      progress: 0
    });

    await user.save();
    res.json({ message: 'Challenge joined successfully', user });
  } catch (err) {
    console.error('Challenge join error:', err);
    res.status(500).json({ message: 'Error joining challenge' });
  }
});

// Update challenge progress
router.put('/challenges/:challengeId/progress', protect, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { progress } = req.body;

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be a number between 0 and 100' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const challenge = user.activeChallenges.find(
      c => c.challengeId.toString() === challengeId
    );

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found in user\'s active challenges' });
    }

    challenge.progress = progress;
    await user.save();
    
    res.json({ message: 'Challenge progress updated', user });
  } catch (err) {
    console.error('Progress update error:', err);
    res.status(500).json({ message: 'Error updating progress' });
  }
});

module.exports = router;

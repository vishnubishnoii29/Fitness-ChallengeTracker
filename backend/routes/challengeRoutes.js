const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const { protect } = require('../middleware/authMiddleware');

// Get all challenges
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find().select('-__v');
    res.json(challenges);
  } catch (err) {
    console.error('Error fetching challenges:', err);
    res.status(500).json({ message: 'Error fetching challenges' });
  }
});

// Get active challenges for a user
router.get('/active', protect, async (req, res) => {
  try {
    // Ideally, this fetches challenges based on logged-in user. We'll return mock active ones from DB.
    const challenges = await Challenge.find().limit(2);
    // Add mock progress
    const activeWithProgress = challenges.map((c, i) => ({
      ...c.toObject(),
      progress: i === 0 ? 65 : 40,
      current: i === 0 ? '65 km' : '12 Days',
      goal: i === 0 ? '100 km' : '30 Days',
      daysLeft: i === 0 ? 12 : 18
    }));
    res.json(activeWithProgress);
  } catch (err) {
    console.error('Error fetching active challenges:', err);
    res.status(500).json({ message: 'Error fetching active challenges' });
  }
});

// Get single challenge
router.get('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).populate('creator', 'username avatar');
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (err) {
    console.error('Challenge fetch error:', err);
    res.status(500).json({ message: 'Error fetching challenge' });
  }
});

// Create a challenge (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, durationDays, goalType, goalValue, difficulty, rewardXP, rewardBadge } = req.body;

    // Validate required fields
    if (!title || !durationDays || !goalType || goalValue === undefined) {
      return res.status(400).json({ message: 'Missing required fields: title, durationDays, goalType, goalValue' });
    }

    // Validate title length
    if (title.length < 3 || title.length > 100) {
      return res.status(400).json({ message: 'Title must be between 3 and 100 characters' });
    }

    // Validate goalType
    const validGoalTypes = ['Distance', 'Time', 'Reps', 'Consistency', 'Weight Loss'];
    if (!validGoalTypes.includes(goalType)) {
      return res.status(400).json({ message: `goalType must be one of: ${validGoalTypes.join(', ')}` });
    }

    // Validate difficulty
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return res.status(400).json({ message: `difficulty must be one of: ${validDifficulties.join(', ')}` });
    }

    const challenge = new Challenge({
      title,
      description: description || '',
      durationDays,
      goalType,
      goalValue,
      difficulty: difficulty || 'Medium',
      rewardXP: rewardXP || 100,
      rewardBadge: rewardBadge || '',
      creator: req.user.id,
      participantsCount: 1
    });

    const newChallenge = await challenge.save();
    res.status(201).json(newChallenge);
  } catch (err) {
    console.error('Challenge creation error:', err);
    res.status(400).json({ message: err.message || 'Error creating challenge' });
  }
});

module.exports = router;

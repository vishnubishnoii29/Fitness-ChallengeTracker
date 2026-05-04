const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');

// Get all challenges
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get active challenges for a user (mock logic for now)
router.get('/active', async (req, res) => {
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
    res.status(500).json({ message: err.message });
  }
});

// Create a challenge
router.post('/', async (req, res) => {
  const challenge = new Challenge(req.body);
  try {
    const newChallenge = await challenge.save();
    res.status(201).json(newChallenge);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Create activity entry (routine / diet / calorie)
router.post('/', async (req, res) => {
  try {
    const { userId, type, data } = req.body;
    if (!userId || !type) return res.status(400).json({ message: 'userId and type required' });

    const activity = await Activity.create({ userId, type, data });
    res.status(201).json(activity);
  } catch (err) {
    console.error('Create activity error', err);
    res.status(500).json({ message: 'Could not create activity', error: err.message });
  }
});

module.exports = router;

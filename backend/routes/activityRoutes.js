const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { protect } = require('../middleware/authMiddleware');

// Activities are written only by the server (completing workouts/challenges), never by clients.
// Get user activities (for dashboard)
router.get('/user', protect, async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(activities);
  } catch (err) {
    console.error('Get user activities error', err);
    res.status(500).json({ message: 'Could not fetch activities' });
  }
});

module.exports = router;

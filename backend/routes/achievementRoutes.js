const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { checkAndUnlockAchievements } = require('../utils/achievementHelper');

// Check and unlock achievements
router.post('/check-unlocks', protect, async (req, res) => {
  try {
    const { unlocked, xpReward, oldLevel, newLevel } = await checkAndUnlockAchievements(req.user.id);

    if (unlocked.length === 0) {
      return res.json({ message: 'No new achievements unlocked', unlockedAchievements: [] });
    }
    res.json({
      message: `Unlocked ${unlocked.length} achievements! +${xpReward} XP`,
      unlockedAchievements: unlocked,
      xpReward,
      oldLevel,
      newLevel
    });
  } catch (err) {
    console.error('Error checking achievements:', err);
    res.status(500).json({ message: 'Error checking achievements' });
  }
});

// Get user's unlocked achievements
router.get('/unlocked', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('unlockedAchievements');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ unlockedAchievements: user.unlockedAchievements || [] });
  } catch (err) {
    console.error('Error fetching unlocked achievements:', err);
    res.status(500).json({ message: 'Error fetching unlocked achievements' });
  }
});

module.exports = router;

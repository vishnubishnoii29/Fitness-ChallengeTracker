const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const { calculateLevel, checkLevelUp } = require('../utils/levelSystem');

// Achievement definitions
const achievements = require('../config/achievements');

// Check and unlock achievements
router.post('/check-unlocks', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const Activity = require('../models/Activity');
    const Notification = require('../models/Notification');
    
    // Get user's current stats
    const activities = await Activity.find({ userId: user._id });
    const completedChallenges = activities.filter(a => 
      a.type === 'other' && a.data?.type === 'challenge_won'
    ).length;
    
    const unlockedAchievements = [];

    // Check each achievement
    for (const achievement of achievements) {
      // Skip if already unlocked
      if (user.unlockedAchievements && user.unlockedAchievements.includes(achievement.id)) {
        continue;
      }

      let isUnlocked = false;
      const currentValue = getCurrentValue(achievement.type, user, completedChallenges, activities);
      
      if (currentValue >= achievement.requirement) {
        isUnlocked = true;
        unlockedAchievements.push(achievement);
      }
    }

    // Update unlocked achievements and grant XP if any new ones
    if (unlockedAchievements.length > 0) {
      const oldLevel = user.level;
      let totalXPReward = 0;
      
      // Calculate total XP reward from new achievements
      unlockedAchievements.forEach(achievement => {
        totalXPReward += achievement.xpReward || 0;
      });
      
      // Add to unlocked achievements
      if (!user.unlockedAchievements) user.unlockedAchievements = [];
      unlockedAchievements.forEach(achievement => {
        user.unlockedAchievements.push(achievement.id);
      });

      // Apply XP reward via XP
      const { processExperience } = require('../utils/levelSystem');
      await processExperience(user, totalXPReward);
      
      await user.save();

      // Create notification for each unlocked achievement
      for (const achievement of unlockedAchievements) {
        await Notification.create({
          userId: user._id,
          title: '🏆 Achievement Unlocked!',
          message: `You've unlocked: ${getAchievementTitle(achievement.id)}! +${achievement.xpReward} XP`,
          type: 'achievement_unlock',
          data: {
            achievementId: achievement.id,
            xpReward: achievement.xpReward,
            newLevel: user.level
          },
          read: false
        });
      }

      res.json({
        message: `Unlocked ${unlockedAchievements.length} achievements! +${totalXPReward} XP`,
        unlockedAchievements,
        xpReward: totalXPReward,
        oldLevel,
        newLevel: user.level
      });
    } else {
      res.json({
        message: 'No new achievements unlocked',
        unlockedAchievements: []
      });
    }
  } catch (err) {
    console.error('Error checking achievements:', err);
    res.status(500).json({ message: 'Error checking achievements' });
  }
});

// Get user's unlocked achievements
router.get('/unlocked', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      unlockedAchievements: user.unlockedAchievements || []
    });
  } catch (err) {
    console.error('Error fetching unlocked achievements:', err);
    res.status(500).json({ message: 'Error fetching unlocked achievements' });
  }
});

// Helper functions
function getCurrentValue(type, user, completedChallenges, activities) {
  switch (type) {
    case 'challenge':
      return completedChallenges;
    case 'streak':
      return user.streak || 0;
    case 'xp':
      return user.xp || user.points || 0;
    case 'leaderboard':
      // This would need actual leaderboard position calculation
      return 999; // Placeholder
    default:
      return 0;
  }
}

function getAchievementTitle(achievementId) {
  const ach = achievements.find(a => a.id === achievementId);
  return ach ? ach.title : 'Unknown Achievement';
}

module.exports = router;

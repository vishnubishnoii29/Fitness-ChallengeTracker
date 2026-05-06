const User = require('../models/User');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { processExperience } = require('./levelSystem');

// Achievement definitions
const achievements = require('../config/achievements');

const checkAndUnlockAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const unlockedNew = [];
    const stats = user.stats || { burnedCalories: 0, totalDistance: 0, workoutTime: 0, challengesWon: 0 };

    for (const ach of achievements) {
      if (user.unlockedAchievements && user.unlockedAchievements.includes(ach.id)) continue;

      let current = 0;
      if (ach.type === 'challenge') current = stats.challengesWon;
      else if (ach.type === 'streak') current = user.streak || 0;
      else if (ach.type === 'xp') current = user.xp || 0;
      else if (ach.type === 'calories') current = stats.burnedCalories;
      else if (ach.type === 'distance') current = stats.totalDistance;
      else if (ach.type === 'time') current = stats.workoutTime;

      if (current >= ach.requirement) {
        unlockedNew.push(ach);
      }
    }

    if (unlockedNew.length > 0) {
      if (!user.unlockedAchievements) user.unlockedAchievements = [];
      
      let totalXP = 0;
      for (const ach of unlockedNew) {
        user.unlockedAchievements.push(ach.id);
        totalXP += ach.xpReward;

        // Create notification
        await Notification.create({
          userId: user._id,
          title: '🏆 Achievement Unlocked!',
          message: `You've unlocked: ${ach.id.replace(/_/g, ' ')}! +${ach.xpReward} XP`,
          type: 'achievement_unlock',
          read: false
        });
      }

      await processExperience(user, totalXP);
      await user.save();
      console.log(`Unlocked ${unlockedNew.length} achievements for user ${userId}`);
    }
  } catch (err) {
    console.error('Achievement helper error:', err);
  }
};

module.exports = { checkAndUnlockAchievements };

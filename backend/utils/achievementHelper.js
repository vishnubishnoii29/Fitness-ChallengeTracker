const User = require('../models/User');
const Notification = require('../models/Notification');
const { processExperience } = require('./levelSystem');
const achievements = require('../config/achievements');

// Achievements are derived only from server-maintained user fields (stats, streak, xp).
const currentValueFor = (ach, user) => {
  const stats = user.stats || {};
  switch (ach.type) {
    case 'challenge': return stats.challengesWon || 0;
    case 'streak': return user.streak || 0;
    case 'xp': return user.xp || 0;
    case 'calories': return stats.burnedCalories || 0;
    case 'distance': return stats.totalDistance || 0;
    case 'time': return stats.workoutTime || 0;
    default: return 0; // e.g. leaderboard-rank achievements are not awarded automatically
  }
};

// Unlocks any newly earned achievements and pays their XP.
// Each achievement is claimed with an atomic update, so concurrent calls can never award it twice.
// Returns { unlocked, xpReward, oldLevel, newLevel }.
const checkAndUnlockAchievements = async (userId) => {
  const empty = { unlocked: [], xpReward: 0 };
  try {
    const user = await User.findById(userId);
    if (!user) return empty;

    const earned = achievements.filter(
      (ach) => !(user.unlockedAchievements || []).includes(ach.id) && currentValueFor(ach, user) >= ach.requirement
    );

    const claimed = [];
    for (const ach of earned) {
      const result = await User.updateOne(
        { _id: userId, unlockedAchievements: { $ne: ach.id } },
        { $push: { unlockedAchievements: ach.id } }
      );
      if (result.modifiedCount === 1) claimed.push(ach);
    }
    if (claimed.length === 0) return empty;

    const xpReward = claimed.reduce((sum, ach) => sum + (ach.xpReward || 0), 0);
    const fresh = await User.findById(userId);
    const oldLevel = fresh.level;
    await processExperience(fresh, xpReward);
    await fresh.save();

    await Notification.insertMany(claimed.map((ach) => ({
      userId,
      title: '🏆 Achievement Unlocked!',
      message: `You've unlocked: ${ach.title}! +${ach.xpReward} XP`,
      type: 'achievement_unlock',
      data: { achievementId: ach.id, xpReward: ach.xpReward, newLevel: fresh.level },
    })));

    return { unlocked: claimed, xpReward, oldLevel, newLevel: fresh.level };
  } catch (err) {
    console.error('Achievement helper error:', err);
    return empty;
  }
};

module.exports = { checkAndUnlockAchievements };

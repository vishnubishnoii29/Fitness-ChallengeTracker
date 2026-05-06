// Level System Utility Functions
// Level progression: Quadratic scaling (Level 2: 1000, Level 3: 3000, Level 4: 6000, etc.)

/**
 * Calculate user level based on XP
 */
const calculateLevel = (xp) => {
  if (!xp || xp <= 0) return 1;
  // Formula: XP = 500 * (L^2 - L)
  const level = Math.floor(Math.sqrt(xp / 500 + 0.25) + 0.5);
  return Math.max(1, level);
};

/**
 * XP required to reach a specific level
 */
const getXPForLevel = (level) => {
  if (level <= 1) return 0;
  const L = level - 1;
  return 500 * (L * L + L);
};

const getLevelRewards = (level) => {
  const rewards = {
    1: { title: "Beginner", badge: "🌟 Beginner" },
    2: { title: "Novice", badge: "💪 Novice" },
    3: { title: "Amateur", badge: "🏃 Amateur" },
    4: { title: "Skilled", badge: "⭐ Skilled" },
    5: { title: "Expert", badge: "🏆 Expert" },
    10: { title: "Master", badge: "👑 Master" },
    15: { title: "Legend", badge: "🔥 Legend" },
    20: { title: "Elite", badge: "💎 Elite" },
    25: { title: "Champion", badge: "🏅 Champion" },
    30: { title: "Grandmaster", badge: "🎖️ Grandmaster" }
  };
  
  let highestReward = rewards[1];
  for (const [lvl, r] of Object.entries(rewards)) {
    if (parseInt(lvl) <= level) highestReward = r;
  }
  return highestReward;
};

/**
 * Process XP gain
 * Note: Removed bonusXP from level-ups to prevent infinite feedback loops
 */
const processExperience = async (user, amount) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) return null;
  
  const Notification = require('../models/Notification');
  const oldXP = Number(user.xp) || 0;
  const oldLevel = user.level || calculateLevel(oldXP);
  
  // Unify XP and Points to the same value to prevent drift
  const unifiedXP = Math.max(oldXP, Number(user.points) || 0) + numAmount;
  user.xp = unifiedXP;
  user.points = unifiedXP;

  const newLevel = calculateLevel(user.xp);
  let finalLevelUpData = null;
  
  if (newLevel > oldLevel) {
    // User leveled up! (Might skip multiple levels)
    user.level = newLevel;
    const rewards = getLevelRewards(newLevel);
    
    // Add badge
    if (rewards.badge) {
      if (!user.badges) user.badges = [];
      if (!user.badges.includes(rewards.badge)) {
        user.badges.push(rewards.badge);
      }
    }
    
    // Create notification for the new level reached
    await Notification.create({
      userId: user._id,
      title: `🎉 Level Up!`,
      message: `Congratulations! You've reached Level ${newLevel}: ${rewards.title}!`,
      type: 'level_up',
      data: { oldLevel, newLevel, rewards },
      read: false
    });
    
    finalLevelUpData = { leveledUp: true, oldLevel, newLevel, rewards };
  }
  
  return finalLevelUpData;
};

module.exports = {
  calculateLevel,
  getXPForLevel,
  getLevelRewards,
  processExperience
};

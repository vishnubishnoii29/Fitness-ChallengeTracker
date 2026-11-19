const User = require('../models/User');

const dayKey = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Records activity for today and returns the user's current streak. Idempotent: at most one change per calendar day, however often it is called.
// Consecutive days extend the streak; a gap resets it to 1.
const updateStreak = async (userId, now = new Date()) => {
  try {
    const today = dayKey(now);
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = dayKey(yesterdayDate);

    const user = await User.findById(userId).select('streak lastStreakDate');
    if (!user) return;
    if (user.lastStreakDate === today) return user.streak;

    let streak;
    if (!user.lastStreakDate) streak = Math.max(1, user.streak || 0); // first tracked day (keeps legacy streaks)
    else if (user.lastStreakDate === yesterday) streak = (user.streak || 0) + 1;
    else streak = 1;

    // Conditional update so two parallel requests cannot both increment
    await User.updateOne(
      { _id: userId, lastStreakDate: user.lastStreakDate },
      { $set: { streak, lastStreakDate: today } }
    );
    return streak;
  } catch (err) {
    console.error('Error updating streak:', err);
  }
};

module.exports = { updateStreak, dayKey };

const express = require('express');
const router = express.Router();
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const Workout = require('../models/Workout');
const Challenge = require('../models/Challenge');
const Activity = require('../models/Activity');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isString } = require('../utils/validate');
const { calculateLevel } = require('../utils/levelSystem');

// The leaderboard is public, so it only exposes these fields (no email, friends, etc.)
const PUBLIC_FIELDS = 'username avatar level xp points streak';

// Get all users for leaderboard
router.get('/leaderboard', optionalProtect, async (req, res) => {
  try {
    const { filter = 'global' } = req.query;
    let users;
    
    switch (filter.toLowerCase()) {
      case 'weekly':
        // For weekly leaderboard, sort by recent activity (mock implementation)
        users = await User.find()
          .select(PUBLIC_FIELDS)
          .sort({ streak: -1, points: -1 }) // Prioritize streak, then points
          .limit(10);
        break;
        
      case 'friends':
        // For friends leaderboard, filter by the user's friend list
        if (!req.user) {
          users = []; // Not logged in, no friends
        } else {
          const currentUser = await User.findById(req.user.id);
          const friendIds = currentUser.friends || [];
          // Include current user in their own friends leaderboard
          users = await User.find({
            _id: { $in: [...friendIds, req.user.id] }
          })
          .select(PUBLIC_FIELDS)
          .sort({ points: -1 })
          .limit(50);
        }
        break;
        
      case 'global':
      default:
        // Global leaderboard - all users sorted by points
        users = await User.find()
          .select(PUBLIC_FIELDS)
          .sort({ points: -1 })
          .limit(10);
        break;
    }
    
    // Add rank property and trend
    const rankedUsers = users.map((u, index) => {
      const userObj = { _id: u._id, username: u.username, avatar: u.avatar, streak: u.streak };
      // Ensure we use the best available data for XP/Level
      const effectiveXP = Math.max(Number(u.xp) || 0, Number(u.points) || 0);
      const currentLevel = calculateLevel(effectiveXP);
      
      return {
        ...userObj,
        xp: effectiveXP,
        points: effectiveXP,
        level: currentLevel,
        rank: index + 1,
        trend: u.streak > 0 ? 'up' : 'down',
        isCurrentUser: req.user ? u._id.toString() === req.user.id : false
      };
    });
    
    res.json(rankedUsers);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

// Get logged in user profile
router.get('/profile', protect, async (req, res) => {
  try {
    // req.user.id comes from the protect middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // REPAIR/SYNC DATA: If data is inconsistent, update it
    // 1. Clean up dead references in activeChallenges and activeWorkouts
    const initialChallengeCount = user.activeChallenges.length;
    const initialWorkoutCount = user.activeWorkouts.length;
    
    // Check which challenges/workouts still exist
    const challengeIds = user.activeChallenges.filter(c => c.challengeId).map(c => c.challengeId);
    const workoutIds = user.activeWorkouts.filter(w => w.workoutId).map(w => w.workoutId);
    
    const existingChallenges = await Challenge.find({ _id: { $in: challengeIds } }).select('_id');
    const existingWorkouts = await Workout.find({ _id: { $in: workoutIds } }).select('_id');
    
    const existingChallengeIdSet = new Set(existingChallenges.map(c => c._id.toString()));
    const existingWorkoutIdSet = new Set(existingWorkouts.map(w => w._id.toString()));
    
    user.activeChallenges = user.activeChallenges.filter(c => c.challengeId && existingChallengeIdSet.has(c.challengeId.toString()));
    user.activeWorkouts = user.activeWorkouts.filter(w => w.workoutId && existingWorkoutIdSet.has(w.workoutId.toString()));

    // 2. Recalculate level and XP if out of sync
    const effectiveXP = Math.max(Number(user.xp) || 0, Number(user.points) || 0);
    const correctLevel = calculateLevel(effectiveXP);

    let needsSave = user.activeChallenges.length !== initialChallengeCount || 
                    user.activeWorkouts.length !== initialWorkoutCount ||
                    user.xp !== effectiveXP || 
                    user.points !== effectiveXP || 
                    user.level !== correctLevel;

    // 3. Recalculate stats if missing
    if (user.stats.burnedCalories === 0 && user.stats.totalDistance === 0) {
      const activities = await Activity.find({ userId: user._id });
      if (activities.length > 0) {
        console.log(`Recalculating stats for user: ${user.username}`);
        const newStats = { burnedCalories: 0, totalDistance: 0, workoutTime: 0, challengesWon: 0 };
        activities.forEach(activity => {
          if (activity.data?.calories) newStats.burnedCalories += Number(activity.data.calories) || 0;
          if (activity.data?.distance) newStats.totalDistance += Number(activity.data.distance) || 0;
          if ((activity.type === 'routine' || activity.type === 'workout') && activity.data?.duration) {
            newStats.workoutTime += Number(activity.data.duration) || 0;
          }
          if (activity.type === 'other' && activity.data?.type === 'challenge_won') {
            newStats.challengesWon += 1;
          }
        });
        user.stats = newStats;
        needsSave = true;
      }
    }

    if (needsSave) {
      user.xp = effectiveXP;
      user.points = effectiveXP;
      user.level = correctLevel;
      await user.save().catch(e => console.error('Background sync failed:', e));
    }

    const userObj = user.toObject();
    userObj.xp = effectiveXP;
    userObj.points = effectiveXP;
    userObj.level = correctLevel;
    userObj.trend = user.streak > 0 ? 'up' : 'down';

    res.json(userObj);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, avatar, age, height, weight } = req.body;
    
    // Validate input
    const updateData = {};
    if (username !== undefined) {
      if (!isString(username) || username.length < 3 || username.length > 30 || !/^[A-Za-z0-9_.@-]+$/.test(username)) {
        return res.status(400).json({ message: 'Username must be 3-30 characters (letters, numbers, _ . @ -)' });
      }
      updateData.username = username;
    }
    if (avatar !== undefined && avatar !== '') {
      if (!isString(avatar) || avatar.length > 500 || !/^https?:\/\//i.test(avatar)) {
        return res.status(400).json({ message: 'Avatar must be an http(s) URL' });
      }
      updateData.avatar = avatar;
    }
    // Security: level, points, xp and streak can never be set by the client
    const ranges = { age: [1, 120], height: [30, 300], weight: [10, 500] };
    for (const [field, value] of Object.entries({ age, height, weight })) {
      if (value === undefined || value === null || value === 0) continue; // 0 / empty means "not set"
      const [min, max] = ranges[field];
      if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
        return res.status(400).json({ message: `${field} must be a number between ${min} and ${max}` });
      }
      updateData[field] = value;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Change Password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!isString(currentPassword) || !isString(newPassword) || !currentPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < 6 || newPassword.length > 72) {
      return res.status(400).json({ message: 'New password must be between 6 and 72 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ message: 'Error updating password' });
  }
});

module.exports = router;

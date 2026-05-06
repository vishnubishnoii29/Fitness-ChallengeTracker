const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { calculateLevel, processExperience } = require('../utils/levelSystem');
const { checkAndUnlockAchievements } = require('../utils/achievementHelper');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');
const Challenge = require('../models/Challenge');
const Workout = require('../models/Workout');

// Helper function to update user streak
const updateStreak = async (userId) => {
  try {
    const User = require('../models/User');
    const Activity = require('../models/Activity');
    
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 1. Check if user already maintained streak today
    const activitiesToday = await Activity.find({
      userId,
      createdAt: { $gte: today }
    });

    // If this is the first activity today, we process streak
    if (activitiesToday.length <= 1) {
      // Find the most recent activity BEFORE today
      const lastActivity = await Activity.findOne({
        userId,
        createdAt: { $lt: today }
      }).sort({ createdAt: -1 });

      if (!lastActivity) {
        // No previous activities, start at 1
        user.streak = 1;
      } else {
        const lastDate = new Date(lastActivity.createdAt);
        const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());

        if (lastDay.getTime() === yesterday.getTime()) {
          // Logged yesterday! Increment streak
          user.streak += 1;
        } else if (lastDay.getTime() < yesterday.getTime()) {
          // Missed yesterday, reset to 1
          user.streak = 1;
        }
      }
      
      // Save updated streak
      await user.save();
      console.log(`Streak updated for user ${userId}: ${user.streak} days.`);
    }
  } catch (err) {
    console.error('Error updating streak:', err);
  }
};

// Get all users for leaderboard
router.get('/leaderboard', optionalProtect, async (req, res) => {
  try {
    const { filter = 'global' } = req.query;
    let users;
    
    switch (filter.toLowerCase()) {
      case 'weekly':
        // For weekly leaderboard, sort by recent activity (mock implementation)
        users = await User.find()
          .select('-password')
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
          .select('-password')
          .sort({ points: -1 })
          .limit(50);
        }
        break;
        
      case 'global':
      default:
        // Global leaderboard - all users sorted by points
        users = await User.find()
          .select('-password')
          .sort({ points: -1 })
          .limit(10);
        break;
    }
    
    // Add rank property and trend
    const rankedUsers = users.map((u, index) => {
      const userObj = u.toObject();
      // Ensure we use the best available data for XP/Level
      const effectiveXP = Math.max(Number(userObj.xp) || 0, Number(userObj.points) || 0);
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

    // REPAIR/SYNC STATS: If stats are missing or 0 but activities exist, recalculate
    if (user.stats.burnedCalories === 0 && user.stats.totalDistance === 0) {
      const Activity = require('../models/Activity');
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
        await user.save().catch(e => console.error('Stats sync failed:', e));
        userObj.stats = newStats;
      }
    }
    
    res.json(userObj);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, avatar, level, points, streak, age, height, weight } = req.body;
    
    // Validate input
    if (username && username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;
    // Security: Do NOT allow manual updates of level, points, or streak
    if (age !== undefined) updateData.age = age;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;

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
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Change Password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const bcrypt = require('bcryptjs');

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    console.log(`Saving updated password for user: ${user.username}`);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    res.status(500).json({ message: 'Error updating password' });
  }
});

// Join a challenge
router.post('/challenges/:challengeId/join', protect, async (req, res) => {
  try {
    const { challengeId } = req.params;
    console.log(`User ${req.user.id} attempting to join challenge ${challengeId}`);
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize array if it doesn't exist
    if (!user.activeChallenges) user.activeChallenges = [];

    // Check if already joined
    const alreadyJoined = user.activeChallenges.some(
      c => c.challengeId && c.challengeId.toString() === challengeId
    );

    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }

    user.activeChallenges.push({
      challengeId,
      progress: 0
    });

    await user.save();
    console.log('Challenge joined successfully');
    res.json({ message: 'Challenge joined successfully', user });
  } catch (err) {
    console.error('Challenge join error:', err);
    res.status(500).json({ message: 'Error joining challenge: ' + err.message });
  }
});

// Update challenge progress
router.put('/challenges/:challengeId/progress', protect, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { progress } = req.body;

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be a number between 0 and 100' });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.activeChallenges) {
      return res.status(404).json({ message: 'User or challenges not found' });
    }

    const challenge = user.activeChallenges.find(
      c => c.challengeId && c.challengeId.toString() === challengeId
    );

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found in user\'s active challenges' });
    }

    challenge.progress = progress;
    await user.save();
    
    res.json({ message: 'Challenge progress updated', user });
  } catch (err) {
    console.error('Progress update error:', err);
    res.status(500).json({ message: 'Error updating progress: ' + err.message });
  }
});

// Start a workout or routine
router.post('/workouts/:workoutId/start', protect, async (req, res) => {
  try {
    const { workoutId } = req.params;
    console.log(`User ${req.user.id} attempting to start workout ${workoutId}`);
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize array if it doesn't exist
    if (!user.activeWorkouts) user.activeWorkouts = [];

    // Check if already active
    const alreadyActive = user.activeWorkouts.some(
      w => w.workoutId && w.workoutId.toString() === workoutId
    );

    if (alreadyActive) {
      return res.status(400).json({ message: 'This workout is already in your active list' });
    }

    user.activeWorkouts.push({
      workoutId,
      progress: 0,
      dateStarted: new Date()
    });

    await user.save();
    console.log('Workout started successfully');
    res.json({ message: 'Workout started successfully', user });
  } catch (err) {
    console.error('Workout start error:', err);
    res.status(500).json({ message: 'Error starting workout: ' + err.message });
  }
});

// Get active workouts with populated workout details
router.get('/workouts/active', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const Workout = require('../models/Workout');
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userWithWorkouts = await User.findById(req.user.id).populate('activeWorkouts.workoutId');
    
    if (!userWithWorkouts) {
      return res.status(404).json({ message: 'User not found' });
    }

    const activeWorkouts = (userWithWorkouts.activeWorkouts || [])
      .filter(aw => aw.workoutId)
      .map(aw => {
        const workout = aw.workoutId;
        const now = new Date();
        const startDate = new Date(aw.dateStarted || workout.createdAt || now);
        const diffTime = Math.abs(now - startDate);
        const daysActive = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

        return {
          ...workout.toObject(),
          progress: aw.progress,
          dateStarted: aw.dateStarted,
          daysActive: daysActive
        };
      });

    console.log('Active workouts found:', activeWorkouts.length);
    res.json(activeWorkouts);
  } catch (err) {
    console.error('Error fetching active workouts:', err);
    res.status(500).json({ message: 'Error fetching active workouts' });
  }
});

// Stop/Cancel a challenge
router.delete('/challenges/:challengeId/stop', protect, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.activeChallenges = user.activeChallenges.filter(
      c => c.challengeId && c.challengeId.toString() !== challengeId
    );

    await user.save();
    res.json({ message: 'Challenge cancelled' });
  } catch (err) {
    console.error('Error stopping challenge:', err);
    res.status(500).json({ message: 'Error stopping challenge' });
  }
});

// Complete a challenge
router.post('/challenges/:challengeId/complete', protect, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const Challenge = require('../models/Challenge');
    const challenge = await Challenge.findById(challengeId);
    
    const initialActiveCount = user.activeChallenges.length;
    user.activeChallenges = user.activeChallenges.filter(
      c => c.challengeId && c.challengeId.toString() !== challengeId
    );

    // FIX: Only award XP if the challenge was actually removed from the active list
    if (user.activeChallenges.length === initialActiveCount) {
      return res.status(400).json({ message: 'Challenge is not active or already completed' });
    }

    let levelUpInfo = null;

    if (challenge) {
      levelUpInfo = await processExperience(user, challenge.rewardXP || 100);
      
      // Award Badge if challenge has one
      if (challenge.rewardBadge && !user.badges.includes(challenge.rewardBadge)) {
        user.badges.push(challenge.rewardBadge);
      }
      
      // Calculate calories and distance for the activity log
      let calories = 0;
      let distance = 0;
      const goalValue = challenge.goalValue || 0;

      switch (challenge.goalType) {
        case 'Distance': 
          distance = goalValue;
          calories = goalValue * 75; // Approx 75 kcal per km
          break;
        case 'Time': 
          calories = goalValue * 10; // Approx 10 kcal per minute
          break;
        case 'Reps': 
          calories = goalValue * 0.5; // Approx 0.5 kcal per rep
          break;
        case 'Consistency': 
          calories = goalValue * 150; // Bonus for consistency
          break;
        case 'Weight Loss': 
          calories = goalValue; 
          break;
        default: 
          calories = goalValue || 0;
      }

      const Activity = require('../models/Activity');
      await Activity.create({
        userId: user._id,
        type: 'other',
        data: {
          type: 'challenge_won',
          challengeId: challenge._id,
          challengeTitle: challenge.title,
          xpGained: challenge.rewardXP || 100,
          calories: calories,
          distance: distance
        }
      });

      // Update User Stats (Backend Authority)
      user.stats.burnedCalories += calories;
      user.stats.totalDistance += distance;
      user.stats.challengesWon += 1;
    }

    await user.save();
    await updateStreak(user._id);

    // Trigger achievement check in background (non-blocking)
    const { checkAndUnlockAchievements } = require('../utils/achievementHelper');
    if (checkAndUnlockAchievements) {
      checkAndUnlockAchievements(user._id).catch(err => console.error('Achievement check failed:', err));
    }

    res.json({ 
      message: levelUpInfo?.leveledUp ? 
        `Challenge completed! 🎉 Level up to Level ${levelUpInfo.newLevel}!` : 
        'Challenge completed!', 
      user,
      levelUp: levelUpInfo
    });
  } catch (err) {
    console.error('Error completing challenge:', err);
    res.status(500).json({ message: 'Error completing challenge' });
  }
});

// Stop/Cancel a workout
router.delete('/workouts/:workoutId/stop', protect, async (req, res) => {
  try {
    const { workoutId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.activeWorkouts = user.activeWorkouts.filter(
      w => w.workoutId && w.workoutId.toString() !== workoutId
    );

    await user.save();
    res.json({ message: 'Workout stopped' });
  } catch (err) {
    console.error('Error stopping workout:', err);
    res.status(500).json({ message: 'Error stopping workout' });
  }
});

// Complete a workout
router.post('/workouts/:workoutId/complete', protect, async (req, res) => {
  try {
    const { workoutId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const Workout = require('../models/Workout');
    const workout = await Workout.findById(workoutId);

    const initialActiveCount = user.activeWorkouts.length;
    user.activeWorkouts = user.activeWorkouts.filter(
      w => w.workoutId && w.workoutId.toString() !== workoutId
    );

    // FIX: Only award XP if the workout was actually removed from the active list
    if (user.activeWorkouts.length === initialActiveCount) {
      return res.status(400).json({ message: 'Workout is not active or already completed' });
    }

    let levelUpInfo = null;
    const rewardXP = 50;

    levelUpInfo = await processExperience(user, rewardXP); // Standard workout XP
    
    await user.save();
    
    // Update streak
    await updateStreak(user._id);

    if (workout) {
      const Activity = require('../models/Activity');
      // Parse duration (e.g., "30 min" -> 30)
      const durationNum = parseInt(workout.duration) || 30;
      
      // Estimate distance for Cardio (e.g., 1km per 10 mins)
      let distance = 0;
      if (workout.type === 'Cardio') {
        distance = parseFloat((durationNum / 8).toFixed(1)); // Approx 7.5 min/km pace
      } else if (workout.kind === 'Routine' && workout.type === 'Cardio') {
        // Routines might be longer, let's give a default distance
        distance = 5.0;
      }

      // Estimate calories based on workout type and duration
      let calories = 0;
      switch (workout.type) {
        case 'HIIT': calories = durationNum * 12; break;
        case 'Cardio': calories = durationNum * 10; break;
        case 'Strength': calories = durationNum * 8; break;
        case 'Yoga': calories = durationNum * 4; break;
        default: calories = durationNum * 5;
      }

      await Activity.create({
        userId: user._id,
        type: 'routine',
        data: {
          workoutId: workout._id,
          workoutTitle: workout.title,
          duration: durationNum,
          distance: distance,
          calories: calories,
          workoutType: workout.type,
          xpGained: rewardXP
        }
      });

      // Update User Stats (Backend Authority)
      user.stats.burnedCalories += calories;
      user.stats.totalDistance += distance;
      user.stats.workoutTime += durationNum;
    }

    await user.save();
    await updateStreak(user._id);

    // Trigger achievement check in background (non-blocking)
    const { checkAndUnlockAchievements } = require('../utils/achievementHelper');
    if (checkAndUnlockAchievements) {
      checkAndUnlockAchievements(user._id).catch(err => console.error('Achievement check failed:', err));
    }

    res.json({ 
      message: levelUpInfo?.leveledUp ? 
        `Workout completed! 🎉 Level up to Level ${levelUpInfo.newLevel}!` : 
        'Workout completed!', 
      user,
      levelUp: levelUpInfo
    });
  } catch (err) {
    console.error('Error completing workout:', err);
    res.status(500).json({ message: 'Error completing workout' });
  }
});

// --- SOCIAL ROUTES ---

// Search users with friendship status
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    
    const currentUser = await User.findById(req.user.id);
    
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        { 
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    }).select('username avatar level xp friendRequests').limit(10);
    
    const results = users.map(u => {
      let status = 'none';
      if (currentUser.friends.includes(u._id)) {
        status = 'friend';
      } else if (u.friendRequests.some(r => r.from.toString() === req.user.id)) {
        status = 'pending';
      }
      
      const userObj = u.toObject();
      delete userObj.friendRequests; // Don't leak all requests
      return { ...userObj, friendshipStatus: status };
    });
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error searching users' });
  }
});

// Send friend request
router.post('/friends/request/:targetId', protect, async (req, res) => {
  try {
    const target = await User.findById(req.params.targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });
    
    if (target.friendRequests.some(r => r.from.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Request already sent' });
    }
    
    target.friendRequests.push({ from: req.user.id });
    await target.save();
    
    // Create notification for target
    const Notification = require('../models/Notification');
    const sender = await User.findById(req.user.id);
    await Notification.create({
      userId: target._id,
      title: '👋 New Friend Request',
      message: `${sender.username} wants to be friends!`,
      type: 'friend_request',
      data: { fromId: req.user.id },
      read: false
    });

    res.json({ message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending request' });
  }
});

// Get friend requests
router.get('/friends/requests', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friendRequests.from', 'username avatar level');
    res.json(user.friendRequests.filter(r => r.status === 'pending'));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Respond to request
router.post('/friends/request/:requestId/respond', protect, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const user = await User.findById(req.user.id);
    const request = user.friendRequests.id(req.params.requestId);
    
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    request.status = status;
    
    if (status === 'accepted') {
      const friendId = request.from;
      if (!user.friends.includes(friendId)) {
        user.friends.push(friendId);
      }
      
      const friend = await User.findById(friendId);
      if (!friend.friends.includes(req.user.id)) {
        friend.friends.push(req.user.id);
      }
      await friend.save();

      // Create notification for the person who sent the request
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: friendId,
        title: '🤝 Friend Request Accepted',
        message: `${user.username} accepted your friend request!`,
        type: 'friend_accept',
        data: { friendId: user._id },
        read: false
      });
    }
    
    await user.save();
    res.json({ message: `Request ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Error responding to request' });
  }
});

// Get friends list
router.get('/friends', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'username avatar level xp streak');
    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching friends' });
  }
});

// Cheer a friend
router.post('/friends/:friendId/cheer', protect, async (req, res) => {
  try {
    const friend = await User.findById(req.params.friendId);
    if (!friend) return res.status(404).json({ message: 'Friend not found' });
    
    const user = await User.findById(req.user.id);
    const Notification = require('../models/Notification');
    
    await Notification.create({
      userId: friend._id,
      title: '🔥 Athlete Cheer!',
      message: `${user.username} is cheering you on! Keep pushing!`,
      type: 'social_cheer',
      data: { fromId: user._id },
      read: false
    });
    
    res.json({ message: 'Cheer sent!' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending cheer' });
  }
});

router.updateStreak = updateStreak;
module.exports = router;

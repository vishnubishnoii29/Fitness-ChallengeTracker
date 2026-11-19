const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Workout = require('../models/Workout');
const Challenge = require('../models/Challenge');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { processExperience } = require('../utils/levelSystem');
const { checkAndUnlockAchievements } = require('../utils/achievementHelper');
const { updateStreak } = require('../utils/streak');
const { validateIdParams } = require('../utils/validate');
const { WORKOUT_XP, MAX_XP_WORKOUTS_PER_DAY } = require('../utils/rewards');

const MAX_CHALLENGE_XP = 5000;

// --- CHALLENGE & WORKOUT PROGRESS ROUTES ---

// Join a challenge
router.post('/challenges/:challengeId/join', protect, validateIdParams('challengeId'), async (req, res) => {
  try {
    const { challengeId } = req.params;
    console.log(`User ${req.user.id} attempting to join challenge ${challengeId}`);
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!(await Challenge.exists({ _id: challengeId }))) {
      return res.status(404).json({ message: 'Challenge not found' });
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
    await Challenge.updateOne({ _id: challengeId }, { $inc: { participantsCount: 1 } });
    console.log('Challenge joined successfully');
    res.json({ message: 'Challenge joined successfully', user });
  } catch (err) {
    console.error('Challenge join error:', err);
    res.status(500).json({ message: 'Error joining challenge' });
  }
});

// Update challenge progress
router.put('/challenges/:challengeId/progress', protect, validateIdParams('challengeId'), async (req, res) => {
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
    res.status(500).json({ message: 'Error updating progress' });
  }
});

// Start a workout or routine
router.post('/workouts/:workoutId/start', protect, validateIdParams('workoutId'), async (req, res) => {
  try {
    const { workoutId } = req.params;
    console.log(`User ${req.user.id} attempting to start workout ${workoutId}`);
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!(await Workout.exists({ _id: workoutId }))) {
      return res.status(404).json({ message: 'Workout not found' });
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
router.delete('/challenges/:challengeId/stop', protect, validateIdParams('challengeId'), async (req, res) => {
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
router.post('/challenges/:challengeId/complete', protect, validateIdParams('challengeId'), async (req, res) => {
  try {
    const { challengeId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

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

    // Only built-in challenges pay XP, and only once per user. Community (user-created) challenges
    // are for fun: paying XP for them would let people farm XP with their own challenges.
    const alreadyCompleted = (user.completedChallenges || []).some(id => id.toString() === challengeId);
    const isCommunityChallenge = challenge && !!challenge.creator;
    const rewardable = challenge && !alreadyCompleted && !isCommunityChallenge;
    const challengeXP = rewardable ? Math.min(challenge.rewardXP || 100, MAX_CHALLENGE_XP) : 0;

    if (rewardable) {
      user.completedChallenges.push(challenge._id);
      levelUpInfo = await processExperience(user, challengeXP);
      
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

      await Activity.create({
        userId: user._id,
        type: 'other',
        data: {
          type: 'challenge_won',
          challengeId: challenge._id,
          challengeTitle: challenge.title,
          xpGained: challengeXP,
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
    if (rewardable) user.streak = (await updateStreak(user._id)) ?? user.streak;

    // Trigger achievement check in background (non-blocking)
    if (checkAndUnlockAchievements) {
      checkAndUnlockAchievements(user._id).catch(err => console.error('Achievement check failed:', err));
    }

    res.json({ 
      message: levelUpInfo?.leveledUp ? 
        `Challenge completed! 🎉 Level up to Level ${levelUpInfo.newLevel}!` : 
        (rewardable ? 'Challenge completed!' : 'Challenge closed. No reward: already earned, or a community challenge.'), 
      user,
      levelUp: levelUpInfo
    });
  } catch (err) {
    console.error('Error completing challenge:', err);
    res.status(500).json({ message: 'Error completing challenge' });
  }
});

// Stop/Cancel a workout
router.delete('/workouts/:workoutId/stop', protect, validateIdParams('workoutId'), async (req, res) => {
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
router.post('/workouts/:workoutId/complete', protect, validateIdParams('workoutId'), async (req, res) => {
  try {
    const { workoutId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const workout = await Workout.findById(workoutId);

    const initialActiveCount = user.activeWorkouts.length;
    user.activeWorkouts = user.activeWorkouts.filter(
      w => w.workoutId && w.workoutId.toString() !== workoutId
    );

    // FIX: Only award XP if the workout was actually removed from the active list
    if (user.activeWorkouts.length === initialActiveCount) {
      return res.status(400).json({ message: 'Workout is not active or already completed' });
    }

    // Daily cap on XP-earning workouts so completion can't be looped for XP
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const rewardedToday = await Activity.countDocuments({
      userId: user._id,
      type: 'routine',
      createdAt: { $gte: startOfToday },
      'data.xpGained': { $gt: 0 }
    });
    const rewardXP = rewardedToday >= MAX_XP_WORKOUTS_PER_DAY ? 0 : WORKOUT_XP;

    const levelUpInfo = await processExperience(user, rewardXP);
    
    await user.save();
    

    if (workout) {
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
    user.streak = (await updateStreak(user._id)) ?? user.streak;

    // Trigger achievement check in background (non-blocking)
    if (checkAndUnlockAchievements) {
      checkAndUnlockAchievements(user._id).catch(err => console.error('Achievement check failed:', err));
    }

    res.json({ 
      message: levelUpInfo?.leveledUp ? 
        `Workout completed! 🎉 Level up to Level ${levelUpInfo.newLevel}!` : 
        (rewardXP > 0 ? 'Workout completed!' : 'Workout completed. Daily XP limit reached, come back tomorrow!'), 
      user,
      levelUp: levelUpInfo
    });
  } catch (err) {
    console.error('Error completing workout:', err);
    res.status(500).json({ message: 'Error completing workout' });
  }
});

module.exports = router;

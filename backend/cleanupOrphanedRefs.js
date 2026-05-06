const mongoose = require('mongoose');
const User = require('./models/User');
const Challenge = require('./models/Challenge');
const Workout = require('./models/Workout');
require('dotenv').config();

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find();
    console.log(`Checking ${users.length} users for orphaned references...`);

    let totalFixed = 0;

    for (const user of users) {
      let userModified = false;

      // 1. Check activeChallenges
      if (user.activeChallenges && user.activeChallenges.length > 0) {
        const initialCount = user.activeChallenges.length;
        const validChallenges = [];
        
        for (const ac of user.activeChallenges) {
          if (!ac.challengeId) continue;
          const exists = await Challenge.exists({ _id: ac.challengeId });
          if (exists) {
            validChallenges.push(ac);
          }
        }
        
        if (validChallenges.length !== initialCount) {
          user.activeChallenges = validChallenges;
          userModified = true;
          console.log(`Fixed ${initialCount - validChallenges.length} orphaned challenges for user ${user.username || user.email}`);
        }
      }

      // 2. Check activeWorkouts
      if (user.activeWorkouts && user.activeWorkouts.length > 0) {
        const initialCount = user.activeWorkouts.length;
        const validWorkouts = [];
        
        for (const aw of user.activeWorkouts) {
          if (!aw.workoutId) continue;
          const exists = await Workout.exists({ _id: aw.workoutId });
          if (exists) {
            validWorkouts.push(aw);
          }
        }
        
        if (validWorkouts.length !== initialCount) {
          user.activeWorkouts = validWorkouts;
          userModified = true;
          console.log(`Fixed ${initialCount - validWorkouts.length} orphaned workouts for user ${user.username || user.email}`);
        }
      }

      if (userModified) {
        await user.save({ validateBeforeSave: false });
        totalFixed++;
      }
    }

    console.log(`Finished. Fixed ${totalFixed} users.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanup();

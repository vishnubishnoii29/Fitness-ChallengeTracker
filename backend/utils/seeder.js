const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Workout = require('../models/Workout');
const { demoUsers, challenges, workouts } = require('../data/seedData');

const DEMO_PASSWORD = '123';

// Fills any empty collection with sample data. Safe to run on every startup.
// Demo users (shared weak password) are only created outside production.
const seedIfEmpty = async () => {
  if (process.env.NODE_ENV !== 'production' && (await User.countDocuments()) === 0) {
    console.log('Seeding demo users...');
    const password = await bcrypt.hash(DEMO_PASSWORD, 10);
    await User.insertMany(demoUsers.map((u) => ({ ...u, password })));
  }

  if ((await Challenge.countDocuments()) === 0) {
    console.log('Seeding challenges...');
    await Challenge.insertMany(challenges);
  }

  if ((await Workout.countDocuments()) === 0) {
    console.log('Seeding workouts and routines...');
    await Workout.insertMany(workouts);
  }
};

// Replaces all challenges and workouts with the sample data (used by `npm run seed`).
const resetContent = async () => {
  await Challenge.deleteMany({});
  await Workout.deleteMany({});
  await Challenge.insertMany(challenges);
  await Workout.insertMany(workouts);
};

module.exports = { seedIfEmpty, resetContent };

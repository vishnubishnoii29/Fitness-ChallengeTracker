require('dotenv').config();
const mongoose = require('mongoose');
const Workout = require('./models/Workout');
const Challenge = require('./models/Challenge');

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const wCount = await Workout.countDocuments();
    const cCount = await Challenge.countDocuments();
    console.log(`Workouts: ${wCount}`);
    console.log(`Challenges: ${cCount}`);
    const workouts = await Workout.find().limit(1);
    console.log('Sample Workout:', workouts);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
checkDB();

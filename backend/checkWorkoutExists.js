const mongoose = require('mongoose');
const Workout = require('./models/Workout');
require('dotenv').config();

const checkWorkouts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const ids = [
      '69fa3f86c02fd8fc7b4379a7', '69fa3f86c02fd8fc7b4379a9', 
      '69fa3fff34541d80b1879bb5', '69fa3fff34541d80b1879bb6',
      '69fa5057e55306fcbb45734b', '69fa5057e55306fcbb45734f',
      '69fa5057e55306fcbb457354'
    ];
    const workouts = await Workout.find({ _id: { $in: ids } });
    console.log(`Found ${workouts.length} out of ${ids.length} workouts.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkWorkouts();

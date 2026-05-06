const mongoose = require('mongoose');
const Activity = require('./models/Activity');
const Workout = require('./models/Workout');
require('dotenv').config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const activities = await Activity.find({ type: 'routine' });
    console.log(`Found ${activities.length} routine activities to check.`);

    let updatedCount = 0;
    for (const activity of activities) {
      let updated = false;
      
      // Fix missing calories
      if (activity.data && !activity.data.calories) {
        const durationNum = activity.data.duration || 30;
        const type = activity.data.workoutType || 'HIIT';
        
        let calories = 0;
        switch (type) {
          case 'HIIT': calories = durationNum * 12; break;
          case 'Cardio': calories = durationNum * 10; break;
          case 'Strength': calories = durationNum * 8; break;
          case 'Yoga': calories = durationNum * 4; break;
          default: calories = durationNum * 5;
        }
        
        activity.data.calories = calories;
        activity.markModified('data');
        updated = true;
      }
      
      // Fix missing distance for Cardio
      if (activity.data && !activity.data.distance && activity.data.workoutType === 'Cardio') {
        const durationNum = activity.data.duration || 30;
        activity.data.distance = parseFloat((durationNum / 8).toFixed(1));
        activity.markModified('data');
        updated = true;
      }

      if (updated) {
        await activity.save();
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} activities.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();

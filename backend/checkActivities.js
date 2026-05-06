const mongoose = require('mongoose');
const Activity = require('./models/Activity');
require('dotenv').config();

const checkActivities = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(5);
    console.log(JSON.stringify(activities, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkActivities();

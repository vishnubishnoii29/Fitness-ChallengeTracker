const mongoose = require('mongoose');
const Challenge = require('./models/Challenge');
require('dotenv').config();

const checkChallenges = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const ids = ['69f8ca47b4f8c640df368c08', '69fa3d00f40325686b4ef755', '69fa3fff34541d80b1879b9c'];
    const challenges = await Challenge.find({ _id: { $in: ids } });
    console.log(`Found ${challenges.length} out of ${ids.length} challenges.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkChallenges();

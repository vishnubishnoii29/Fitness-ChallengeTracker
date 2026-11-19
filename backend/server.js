require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { seedIfEmpty } = require('./utils/seeder');
const { startHeartbeat } = require('./jobs/heartbeat');

const PORT = process.env.PORT || 5000;

['MONGO_URI', 'JWT_SECRET'].forEach((name) => {
  if (!process.env[name]) console.warn(`[WARNING] Environment variable ${name} is missing!`);
});

const start = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI environment variable is missing!');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    await seedIfEmpty();
    startHeartbeat();

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
};

start();

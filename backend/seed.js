// Usage: npm run seed
// Destructive: replaces all challenges, workouts and routines with the sample data.
require('dotenv').config();
const mongoose = require('mongoose');
const { seedIfEmpty, resetContent } = require('./utils/seeder');

(async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set');
    await mongoose.connect(process.env.MONGO_URI);
    await resetContent();
    await seedIfEmpty();
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
})();

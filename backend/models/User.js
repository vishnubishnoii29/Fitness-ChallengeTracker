const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 1 },
  points: { type: Number, default: 0 },
  age: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  stats: {
    burnedCalories: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 },
    workoutTime: { type: Number, default: 0 },
    challengesWon: { type: Number, default: 0 }
  },
  activeChallenges: [{
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
    progress: { type: Number, default: 0 }
  }],
  activeWorkouts: [{
    workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout' },
    progress: { type: Number, default: 0 },
    dateStarted: { type: Date, default: Date.now }
  }],
  badges: [{ type: String }],
  unlockedAchievements: [{ type: String }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  dailyRecommendations: { type: Array, default: [] },
  recommendationsDate: { type: String, default: "" } // Store as YYYY-MM-DD
});

userSchema.index({ points: -1 });
userSchema.index({ streak: -1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);

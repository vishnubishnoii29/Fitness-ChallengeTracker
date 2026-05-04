const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  durationDays: { type: Number, required: true },
  goalType: { type: String, enum: ['Distance', 'Time', 'Reps', 'Consistency', 'Weight Loss'], required: true },
  goalValue: { type: Number, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  rewardXP: { type: Number, default: 100 },
  rewardBadge: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participantsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Challenge', challengeSchema);

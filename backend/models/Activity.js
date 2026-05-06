const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['routine', 'diet', 'calorie', 'other'], required: true },
  data: { type: mongoose.Schema.Types.Mixed },
  processed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ processed: 1 });

module.exports = mongoose.model('Activity', activitySchema);

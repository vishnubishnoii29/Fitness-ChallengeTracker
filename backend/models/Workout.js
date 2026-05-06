const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  kind: {
    type: String,
    required: true,
    enum: ['Workout', 'Routine'],
    default: 'Workout'
  },
  type: {
    type: String,
    required: true,
    enum: ['Cardio', 'Strength', 'Flexibility', 'HIIT', 'Yoga', 'Consistency', 'Mindfulness', 'Wellness']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  duration: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  match: {
    type: String,
    default: '90%'
  },
  isRecommended: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);

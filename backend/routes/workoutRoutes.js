const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');

// Get all workouts
router.get('/', async (req, res) => {
  try {
    const workouts = await Workout.find();
    res.json(workouts);
  } catch (err) {
    console.error('Error fetching workouts:', err);
    res.status(500).json({ message: 'Error fetching workouts' });
  }
});

// Get recommended workouts
router.get('/recommended', async (req, res) => {
  try {
    const recommended = await Workout.find({ isRecommended: true }).limit(6);
    res.json(recommended);
  } catch (err) {
    console.error('Error fetching recommended workouts:', err);
    res.status(500).json({ message: 'Error fetching recommended workouts' });
  }
});

// Create a workout (protected)
router.post('/', require('../middleware/authMiddleware').protect, async (req, res) => {
  try {
    const { title, description, duration, type, kind, calories, difficulty, image } = req.body;
    
    const workout = new Workout({
      title,
      description,
      duration,
      type,
      kind: kind || 'Workout',
      calories: calories || '300',
      difficulty: difficulty || 'Medium',
      image: image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
      isRecommended: false
    });

    const newWorkout = await workout.save();

    // Automatically start the workout for the creator
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      $push: { activeWorkouts: { workoutId: newWorkout._id, status: 'In Progress', progress: 0 } }
    });

    res.status(201).json(newWorkout);
  } catch (err) {
    console.error('Workout creation error:', err);
    res.status(400).json({ message: err.message || 'Error creating workout' });
  }
});

module.exports = router;

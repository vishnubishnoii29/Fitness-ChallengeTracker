const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { isString } = require('../utils/validate');
const { MAX_WORKOUTS_CREATED_PER_DAY } = require('../utils/rewards');

const TYPES = ['Cardio', 'Strength', 'Flexibility', 'HIIT', 'Yoga', 'Consistency', 'Mindfulness', 'Wellness'];
const KINDS = ['Workout', 'Routine'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

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
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, duration, type, kind, calories, difficulty, image } = req.body;

    if (!isString(title) || title.trim().length < 3 || title.length > 100) {
      return res.status(400).json({ message: 'Title must be between 3 and 100 characters' });
    }
    if (!isString(duration) || !duration || duration.length > 30) {
      return res.status(400).json({ message: 'duration is required (e.g. "30 min")' });
    }
    if (description !== undefined && (!isString(description) || description.length > 500)) {
      return res.status(400).json({ message: 'description must be text up to 500 characters' });
    }
    if (!TYPES.includes(type)) {
      return res.status(400).json({ message: `type must be one of: ${TYPES.join(', ')}` });
    }
    if (kind !== undefined && !KINDS.includes(kind)) {
      return res.status(400).json({ message: `kind must be one of: ${KINDS.join(', ')}` });
    }
    if (difficulty !== undefined && !DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({ message: `difficulty must be one of: ${DIFFICULTIES.join(', ')}` });
    }
    if (calories !== undefined && (!/^\d{1,5}$/.test(String(calories)))) {
      return res.status(400).json({ message: 'calories must be a whole number' });
    }
    if (image !== undefined && (!isString(image) || !/^https?:\/\//i.test(image) || image.length > 500)) {
      return res.status(400).json({ message: 'image must be an http(s) URL' });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const createdToday = await Workout.countDocuments({ creator: req.user.id, createdAt: { $gte: startOfToday } });
    if (createdToday >= MAX_WORKOUTS_CREATED_PER_DAY) {
      return res.status(429).json({ message: `You can create up to ${MAX_WORKOUTS_CREATED_PER_DAY} workouts per day` });
    }

    const workout = new Workout({
      creator: req.user.id,
      title: title.trim(),
      description: description || '',
      duration,
      type,
      kind: kind || 'Workout',
      calories: String(calories || '300'),
      difficulty: difficulty || 'Medium',
      image: image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
      isRecommended: false
    });

    const newWorkout = await workout.save();

    // Automatically start the workout for the creator
    await User.findByIdAndUpdate(req.user.id, {
      $push: { activeWorkouts: { workoutId: newWorkout._id, progress: 0 } }
    });

    res.status(201).json(newWorkout);
  } catch (err) {
    console.error('Workout creation error:', err);
    res.status(400).json({ message: 'Error creating workout' });
  }
});

module.exports = router;

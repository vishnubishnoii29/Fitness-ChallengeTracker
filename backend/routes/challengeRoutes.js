const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const { protect } = require('../middleware/authMiddleware');

// Get all challenges
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.find().select('-__v');
    res.json(challenges);
  } catch (err) {
    console.error('Error fetching challenges:', err);
    res.status(500).json({ message: 'Error fetching challenges' });
  }
});

// Get active challenges for a user
router.get('/active', protect, async (req, res) => {
  try {
    // Get the user's active challenges from their profile
    const User = require('../models/User');
    const user = await User.findById(req.user.id).populate('activeChallenges.challengeId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return only real active challenges
    const activeChallenges = user.activeChallenges
      .filter(activeChallenge => activeChallenge.challengeId)
      .map(activeChallenge => {
        const challenge = activeChallenge.challengeId;
        
        // Calculate days left based on challenge duration
        const createdDate = new Date(challenge.createdAt || Date.now());
        const endDate = new Date(createdDate);
        endDate.setDate(endDate.getDate() + challenge.durationDays);
        const today = new Date();
        const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
        
        // Calculate current progress based on goal type
        let current = '';
        let goal = '';
        
        switch (challenge.goalType) {
          case 'Distance':
            current = `${(activeChallenge.progress * challenge.goalValue / 100).toFixed(1)} km`;
            goal = `${challenge.goalValue} km`;
            break;
          case 'Time':
            current = `${Math.floor(activeChallenge.progress * challenge.goalValue / 100)} min`;
            goal = `${challenge.goalValue} min`;
            break;
          case 'Consistency':
            current = `${Math.floor(activeChallenge.progress * challenge.goalValue / 100)} Days`;
            goal = `${challenge.goalValue} Days`;
            break;
          case 'Weight Loss':
            current = `${Math.floor(activeChallenge.progress * challenge.goalValue / 100)} kcal`;
            goal = `${challenge.goalValue} kcal`;
            break;
          default:
            current = `${activeChallenge.progress}%`;
            goal = `${challenge.goalValue}`;
        }
        
        return {
          ...challenge.toObject(),
          progress: activeChallenge.progress,
          current: current,
          goal: goal,
          daysLeft: daysLeft
        };
      });
    
    res.json(activeChallenges);
  } catch (err) {
    console.error('Error fetching active challenges:', err);
    res.status(500).json({ message: 'Error fetching active challenges' });
  }
});

// Get single challenge
router.get('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id).populate('creator', 'username avatar');
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (err) {
    console.error('Challenge fetch error:', err);
    res.status(500).json({ message: 'Error fetching challenge' });
  }
});

// Create a challenge (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, durationDays, goalType, goalValue, difficulty, rewardXP, rewardBadge } = req.body;

    // Validate required fields
    if (!title || !durationDays || !goalType || goalValue === undefined) {
      return res.status(400).json({ message: 'Missing required fields: title, durationDays, goalType, goalValue' });
    }

    // Validate title length
    if (title.length < 3 || title.length > 100) {
      return res.status(400).json({ message: 'Title must be between 3 and 100 characters' });
    }

    // Validate goalType
    const validGoalTypes = ['Distance', 'Time', 'Reps', 'Consistency', 'Weight Loss'];
    if (!validGoalTypes.includes(goalType)) {
      return res.status(400).json({ message: `goalType must be one of: ${validGoalTypes.join(', ')}` });
    }

    // Validate difficulty
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return res.status(400).json({ message: `difficulty must be one of: ${validDifficulties.join(', ')}` });
    }

    const challenge = new Challenge({
      title,
      description: description || '',
      durationDays,
      goalType,
      goalValue,
      difficulty: difficulty || 'Medium',
      rewardXP: rewardXP || 100,
      rewardBadge: rewardBadge || '',
      creator: req.user.id,
      participantsCount: 1
    });

    const newChallenge = await challenge.save();

    // Automatically join the creator to their own challenge
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      $push: { activeChallenges: { challengeId: newChallenge._id, progress: 0 } }
    });

    res.status(201).json(newChallenge);
  } catch (err) {
    console.error('Challenge creation error:', err);
    res.status(400).json({ message: err.message || 'Error creating challenge' });
  }
});

module.exports = router;

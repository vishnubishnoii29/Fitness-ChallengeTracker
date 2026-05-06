require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Challenge = require('./models/Challenge');
const Workout = require('./models/Workout');
const bcrypt = require('bcryptjs');

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing Challenges and Workouts for a fresh, comprehensive sync
    await Challenge.deleteMany({});
    await Workout.deleteMany({});

    console.log('Seeding Challenges...');
    await Challenge.insertMany([
      { title: '100km Cycling Month', durationDays: 30, goalType: 'Distance', goalValue: 100, difficulty: 'Medium', rewardXP: 1000, rewardBadge: 'Cyclist Badge' },
      { title: '30 Days of Yoga', durationDays: 30, goalType: 'Consistency', goalValue: 30, difficulty: 'Easy', rewardXP: 800, rewardBadge: 'Yoga Master Badge' },
      { title: 'Summer Shred', durationDays: 30, goalType: 'Weight Loss', goalValue: 10000, difficulty: 'Hard', rewardXP: 5000, rewardBadge: 'Shredded Badge' },
      { title: 'Weekend Warrior', durationDays: 2, goalType: 'Consistency', goalValue: 2, difficulty: 'Easy', rewardXP: 500, rewardBadge: 'Weekend Badge' },
      { title: '10K Run', durationDays: 7, goalType: 'Distance', goalValue: 10, difficulty: 'Medium', rewardXP: 700, rewardBadge: 'Runner Badge' },
      { title: '100 Pushups Challenge', durationDays: 30, goalType: 'Consistency', goalValue: 30, difficulty: 'Medium', rewardXP: 1200, rewardBadge: 'Strength Badge' },
      { title: 'Half Marathon Debut', durationDays: 60, goalType: 'Distance', goalValue: 21, difficulty: 'Hard', rewardXP: 3000, rewardBadge: 'Endurance Badge' },
      { title: 'Water Intake Streak', durationDays: 7, goalType: 'Consistency', goalValue: 7, difficulty: 'Easy', rewardXP: 300, rewardBadge: 'Hydration Badge' },
      { title: 'Meditation Master', durationDays: 14, goalType: 'Consistency', goalValue: 14, difficulty: 'Easy', rewardXP: 600, rewardBadge: 'Zen Badge' },
      { title: 'Bodyweight Squat Blitz', durationDays: 10, goalType: 'Consistency', goalValue: 10, difficulty: 'Medium', rewardXP: 1500, rewardBadge: 'Legs Badge' },
      { title: '5000 Steps Daily', durationDays: 30, goalType: 'Consistency', goalValue: 30, difficulty: 'Easy', rewardXP: 400, rewardBadge: 'Walker Badge' },
      { title: '200km Running Month', durationDays: 30, goalType: 'Distance', goalValue: 200, difficulty: 'Hard', rewardXP: 2000, rewardBadge: 'Marathoner Badge' },
      { title: 'Plank Hold Master', durationDays: 14, goalType: 'Time', goalValue: 300, difficulty: 'Medium', rewardXP: 800, rewardBadge: 'Core Master Badge' },
      { title: '100 Burpees Challenge', durationDays: 7, goalType: 'Reps', goalValue: 100, difficulty: 'Hard', rewardXP: 1000, rewardBadge: 'Burpee Beast Badge' },
      { title: 'Early Bird Workout', durationDays: 21, goalType: 'Consistency', goalValue: 21, difficulty: 'Medium', rewardXP: 1200, rewardBadge: 'Early Bird Badge' },
      { title: 'Swimming Distance', durationDays: 14, goalType: 'Distance', goalValue: 20, difficulty: 'Medium', rewardXP: 900, rewardBadge: 'Swimmer Badge' },
      { title: 'Pull-up Progress', durationDays: 30, goalType: 'Reps', goalValue: 50, difficulty: 'Hard', rewardXP: 1500, rewardBadge: 'Pull-up Pro Badge' },
      { title: 'Daily Meditation', durationDays: 30, goalType: 'Consistency', goalValue: 30, difficulty: 'Easy', rewardXP: 600, rewardBadge: 'Mindfulness Badge' },
      { title: 'Cycling Century', durationDays: 7, goalType: 'Distance', goalValue: 100, difficulty: 'Hard', rewardXP: 1800, rewardBadge: 'Century Rider Badge' },
      { title: 'Push-up Power', durationDays: 14, goalType: 'Reps', goalValue: 500, difficulty: 'Medium', rewardXP: 1100, rewardBadge: 'Push-up Master Badge' },
      { title: 'Flexibility Focus', durationDays: 21, goalType: 'Time', goalValue: 630, difficulty: 'Easy', rewardXP: 700, rewardBadge: 'Flexibility Badge' },
      { title: 'Rowing Machine Challenge', durationDays: 10, goalType: 'Distance', goalValue: 50, difficulty: 'Medium', rewardXP: 800, rewardBadge: 'Rowing Badge' },
      { title: 'No Junk Food', durationDays: 14, goalType: 'Consistency', goalValue: 14, difficulty: 'Hard', rewardXP: 1400, rewardBadge: 'Clean Eating Badge' },
      { title: 'Stair Climbing', durationDays: 7, goalType: 'Distance', goalValue: 5, difficulty: 'Medium', rewardXP: 600, rewardBadge: 'Stair Master Badge' },
      { title: 'Handstand Practice', durationDays: 21, goalType: 'Time', goalValue: 315, difficulty: 'Hard', rewardXP: 1600, rewardBadge: 'Balance Master Badge' }
    ]);

    console.log('Seeding Workouts & Routines...');
    await Workout.insertMany([
      { title: 'HYROX Power Hour', kind: 'Workout', type: 'HIIT', difficulty: 'Hard', duration: '60 min', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', isRecommended: true },
      { title: 'Morning Mobility Flow', kind: 'Workout', type: 'Flexibility', difficulty: 'Easy', duration: '15 min', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80', isRecommended: true },
      { title: 'Core Ignition', kind: 'Workout', type: 'Strength', difficulty: 'Medium', duration: '20 min', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', isRecommended: true },
      { title: '12-3-30 Treadmill Walk', kind: 'Workout', type: 'Cardio', difficulty: 'Easy', duration: '30 min', image: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800&q=80', isRecommended: true },
      { title: 'Desk Worker Relief', kind: 'Workout', type: 'Flexibility', difficulty: 'Easy', duration: '10 min', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80' },
      { title: 'Kettlebell Finisher', kind: 'Workout', type: 'HIIT', difficulty: 'Medium', duration: '15 min', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80' },
      { title: 'Sunset Hatha Yoga', kind: 'Workout', type: 'Yoga', difficulty: 'Medium', duration: '45 min', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80' },
      { title: 'Explosive Plyometrics', kind: 'Workout', type: 'HIIT', difficulty: 'Hard', duration: '30 min', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80' },
      { title: 'Zazen Meditation', kind: 'Workout', type: 'Yoga', difficulty: 'Easy', duration: '20 min', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80' },
      { title: 'Marathon Ready', kind: 'Routine', type: 'Cardio', difficulty: 'Hard', duration: '16 Weeks', image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=80', isRecommended: true },
      { title: 'Summer Shred', kind: 'Routine', type: 'HIIT', difficulty: 'Hard', duration: '8 Weeks', image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80', isRecommended: true },
      { title: 'Foundation of Strength', kind: 'Routine', type: 'Strength', difficulty: 'Medium', duration: '12 Weeks', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' },
      { title: 'Path to Flexibility', kind: 'Routine', type: 'Flexibility', difficulty: 'Medium', duration: '4 Weeks', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80' },
      { title: 'Calisthenics Masterclass', kind: 'Routine', type: 'Strength', difficulty: 'Hard', duration: '12 Weeks', image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=80' },
      { title: 'Postpartum Recovery', kind: 'Routine', type: 'Flexibility', difficulty: 'Easy', duration: '6 Weeks', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80' },
      { title: '75 Hard Program', kind: 'Routine', type: 'HIIT', difficulty: 'Hard', duration: '75 Days', image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80' },
      { title: 'Office Athlete Plan', kind: 'Routine', type: 'Flexibility', difficulty: 'Easy', duration: 'Ongoing', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80' },
      { title: 'Boxing Cardio Blast', kind: 'Workout', type: 'Cardio', difficulty: 'Medium', duration: '45 min', image: 'https://images.unsplash.com/photo-1541900242-7e6a46b9b4f0?w=800&q=80', isRecommended: true },
      { title: 'Deadlift Strength', kind: 'Workout', type: 'Strength', difficulty: 'Hard', duration: '40 min', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80' },
      { title: 'Pilates Core', kind: 'Workout', type: 'Flexibility', difficulty: 'Medium', duration: '30 min', image: 'https://images.unsplash.com/photo-1571019613244-5d931d5f9d7c?w=800&q=80' },
      { title: 'Mountain Climber HIIT', kind: 'Workout', type: 'HIIT', difficulty: 'Hard', duration: '25 min', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' },
      { title: 'Evening Yoga Flow', kind: 'Workout', type: 'Yoga', difficulty: 'Easy', duration: '35 min', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80' },
      { title: 'Sprint Interval Training', kind: 'Workout', type: 'Cardio', difficulty: 'Hard', duration: '20 min', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80' },
      { title: 'Resistance Band Workout', kind: 'Workout', type: 'Strength', difficulty: 'Easy', duration: '25 min', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80' },
      { title: 'Power Yoga', kind: 'Workout', type: 'Yoga', difficulty: 'Medium', duration: '50 min', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80' },
      { title: 'Battle Ropes', kind: 'Workout', type: 'HIIT', difficulty: 'Hard', duration: '30 min', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80' },
      { title: 'Stretching Recovery', kind: 'Workout', type: 'Flexibility', difficulty: 'Easy', duration: '15 min', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80' },
      { title: 'Beginner Weight Loss', kind: 'Routine', type: 'Cardio', difficulty: 'Easy', duration: '6 Weeks', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80', isRecommended: true },
      { title: 'Advanced Strength Training', kind: 'Routine', type: 'Strength', difficulty: 'Hard', duration: '16 Weeks', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80' },
      { title: 'Yoga for Athletes', kind: 'Routine', type: 'Flexibility', difficulty: 'Medium', duration: '8 Weeks', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80' },
      { title: 'HIIT Transformation', kind: 'Routine', type: 'HIIT', difficulty: 'Hard', duration: '12 Weeks', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80' },
      { title: 'Flexibility Revolution', kind: 'Routine', type: 'Flexibility', difficulty: 'Easy', duration: '4 Weeks', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80' },
      { title: 'Cardio Endurance Builder', kind: 'Routine', type: 'Cardio', difficulty: 'Medium', duration: '10 Weeks', image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&q=80' },
      { title: 'Functional Fitness', kind: 'Routine', type: 'Strength', difficulty: 'Medium', duration: '8 Weeks', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80' },
      { title: 'Mobility Mastery', kind: 'Routine', type: 'Flexibility', difficulty: 'Easy', duration: '6 Weeks', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80' },
      { title: 'Morning Yoga Flow', kind: 'Workout', type: 'Yoga', difficulty: 'Easy', duration: '20 min', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80', isRecommended: true },
      { title: 'HIIT Cardio Blast', kind: 'Workout', type: 'HIIT', difficulty: 'Hard', duration: '30 min', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', isRecommended: true },
      { title: 'Strength Training', kind: 'Workout', type: 'Strength', difficulty: 'Medium', duration: '45 min', image: 'https://images.unsplash.com/photo-1581009146145-b5ef0506d3e8?w=800&q=80', isRecommended: true },
      { title: 'Flexibility Stretch', kind: 'Workout', type: 'Flexibility', difficulty: 'Easy', duration: '15 min', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80', isRecommended: true }
    ]);
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();

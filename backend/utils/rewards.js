// Server-side reward rules. Clients never choose how much XP something is worth.
const CHALLENGE_XP = { Easy: 300, Medium: 600, Hard: 1000 };
const WORKOUT_XP = 50;
const MAX_XP_WORKOUTS_PER_DAY = 10;
const MAX_CHALLENGES_PER_DAY = 5;
const MAX_WORKOUTS_CREATED_PER_DAY = 10;

const challengeXP = (difficulty) => CHALLENGE_XP[difficulty] || CHALLENGE_XP.Medium;

module.exports = { CHALLENGE_XP, WORKOUT_XP, MAX_XP_WORKOUTS_PER_DAY, MAX_CHALLENGES_PER_DAY, MAX_WORKOUTS_CREATED_PER_DAY, challengeXP };

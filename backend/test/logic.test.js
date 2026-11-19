// Tests for streak and achievement logic using in-memory fakes instead of MongoDB.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Replace a module in require.cache with a fake export
const stubModule = (relPath, exports) => {
  const resolved = require.resolve(path.join(__dirname, '..', relPath));
  require.cache[resolved] = { id: resolved, filename: resolved, loaded: true, exports };
};

// A tiny fake of the User model supporting only what the code under test calls
const makeUserModel = (docs) => {
  const matches = (doc, filter) => Object.entries(filter).every(([key, cond]) => {
    if (cond && typeof cond === 'object' && '$ne' in cond) return Array.isArray(doc[key]) ? !doc[key].includes(cond.$ne) : doc[key] !== cond.$ne;
    return doc[key] === cond;
  });
  return {
    findById: (id) => {
      const doc = docs.get(id);
      const q = Promise.resolve(doc ? Object.assign(Object.create({ save: async () => {} }), doc) : null);
      q.select = () => q;
      return q;
    },
    updateOne: async (filter, update) => {
      const doc = docs.get(filter._id);
      const { _id, ...rest } = filter;
      if (!doc || !matches(doc, rest)) return { modifiedCount: 0 };
      if (update.$set) Object.assign(doc, update.$set);
      if (update.$push) for (const [k, v] of Object.entries(update.$push)) doc[k] = [...(doc[k] || []), v];
      return { modifiedCount: 1 };
    },
  };
};

const day = (iso) => new Date(`${iso}T12:00:00`);

test('streak: first activity, same-day repeats, consecutive days, and gaps', async () => {
  const docs = new Map([['u1', { streak: 1, lastStreakDate: '' }]]);
  stubModule('models/User.js', makeUserModel(docs));
  delete require.cache[require.resolve('../utils/streak')];
  const { updateStreak } = require('../utils/streak');

  assert.equal(await updateStreak('u1', day('2026-03-01')), 1); // first tracked day keeps the legacy value
  assert.equal(await updateStreak('u1', day('2026-03-01')), 1); // same day: no change
  assert.equal(await updateStreak('u1', day('2026-03-01')), 1); // and again
  assert.equal(await updateStreak('u1', day('2026-03-02')), 2); // next day: +1
  assert.equal(await updateStreak('u1', day('2026-03-02')), 2); // repeated calls never inflate it
  assert.equal(await updateStreak('u1', day('2026-03-03')), 3);
  assert.equal(await updateStreak('u1', day('2026-03-06')), 1); // missed days reset
  assert.equal(docs.get('u1').lastStreakDate, '2026-03-06');
});

test('streak: two concurrent updates only count once', async () => {
  const docs = new Map([['u2', { streak: 4, lastStreakDate: '2026-03-01' }]]);
  stubModule('models/User.js', makeUserModel(docs));
  delete require.cache[require.resolve('../utils/streak')];
  const { updateStreak } = require('../utils/streak');

  await Promise.all([updateStreak('u2', day('2026-03-02')), updateStreak('u2', day('2026-03-02'))]);
  assert.equal(docs.get('u2').streak, 5);
});

test('achievements: derived from server stats and never double-awarded', async () => {
  const docs = new Map([['u3', {
    _id: 'u3', level: 1, xp: 0, streak: 0, unlockedAchievements: [],
    stats: { challengesWon: 1, burnedCalories: 0, totalDistance: 0, workoutTime: 0 },
  }]]);
  const notifications = [];
  const processed = [];
  stubModule('models/User.js', makeUserModel(docs));
  stubModule('models/Notification.js', { insertMany: async (items) => { notifications.push(...items); } });
  stubModule('utils/levelSystem.js', { processExperience: async (user, xp) => { processed.push(xp); } });
  delete require.cache[require.resolve('../utils/achievementHelper')];
  const { checkAndUnlockAchievements } = require('../utils/achievementHelper');

  const first = await checkAndUnlockAchievements('u3');
  assert.deepEqual(first.unlocked.map((a) => a.id), ['first_challenge']);
  assert.equal(first.xpReward, 50);

  // A second (or concurrent) call finds nothing new, so XP is not paid again
  const second = await checkAndUnlockAchievements('u3');
  assert.equal(second.unlocked.length, 0);
  assert.deepEqual(processed, [50]);
  assert.equal(notifications.length, 1);
});

test('achievements: leaderboard-rank achievements are never auto-awarded', async () => {
  const docs = new Map([['u4', { _id: 'u4', level: 1, xp: 0, streak: 0, unlockedAchievements: [], stats: {} }]]);
  stubModule('models/User.js', makeUserModel(docs));
  stubModule('models/Notification.js', { insertMany: async () => {} });
  stubModule('utils/levelSystem.js', { processExperience: async () => {} });
  delete require.cache[require.resolve('../utils/achievementHelper')];
  const { checkAndUnlockAchievements } = require('../utils/achievementHelper');

  const result = await checkAndUnlockAchievements('u4');
  assert.ok(!result.unlocked.some((a) => a.id.startsWith('leaderboard_')));
});

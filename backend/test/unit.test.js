const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateLevel, getXPForLevel } = require('../utils/levelSystem');
const { escapeRegex, isObjectId } = require('../utils/validate');
const { challengeXP, CHALLENGE_XP } = require('../utils/rewards');

test('calculateLevel follows XP = 500 * (L^2 - L)', () => {
  assert.equal(calculateLevel(0), 1);
  assert.equal(calculateLevel(-5), 1);
  assert.equal(calculateLevel(999), 1);
  assert.equal(calculateLevel(1000), 2);
  assert.equal(calculateLevel(2999), 2);
  assert.equal(calculateLevel(3000), 3);
  assert.equal(calculateLevel(6000), 4);
});

test('getXPForLevel is consistent with calculateLevel', () => {
  for (let level = 1; level <= 40; level++) {
    assert.equal(calculateLevel(getXPForLevel(level)), level);
    if (level > 1) assert.equal(calculateLevel(getXPForLevel(level) - 1), level - 1);
  }
});

test('escapeRegex neutralises regex metacharacters', () => {
  const evil = '(a+)+$.*[x]';
  const re = new RegExp(escapeRegex(evil));
  assert.ok(re.test(evil));
  assert.ok(!re.test('aaaa'));
});

test('isObjectId only accepts valid id strings', () => {
  assert.ok(isObjectId('507f1f77bcf86cd799439011'));
  assert.ok(!isObjectId('nope'));
  assert.ok(!isObjectId({ $ne: null }));
  assert.ok(!isObjectId(undefined));
});

test('challenge XP is derived from difficulty only', () => {
  assert.equal(challengeXP('Easy'), CHALLENGE_XP.Easy);
  assert.equal(challengeXP('Hard'), CHALLENGE_XP.Hard);
  assert.equal(challengeXP('anything else'), CHALLENGE_XP.Medium);
  assert.equal(challengeXP(undefined), CHALLENGE_XP.Medium);
});

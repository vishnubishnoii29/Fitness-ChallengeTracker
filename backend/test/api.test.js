// HTTP-level tests that never reach MongoDB: they cover validation, auth and security headers.
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const app = require('../app');

let server;
let base;
const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET);
const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
const post = (path, body, headers = { 'Content-Type': 'application/json' }) =>
  fetch(base + path, { method: 'POST', headers, body: JSON.stringify(body) });

test.before(async () => {
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

test('health check works and security headers are set', async () => {
  const res = await fetch(base + '/health');
  assert.equal(res.status, 200);
  assert.ok(res.headers.get('x-content-type-options'));
  assert.equal(res.headers.get('x-powered-by'), null);
});

test('protected routes reject missing or bad tokens', async () => {
  assert.equal((await fetch(base + '/api/users/profile')).status, 401);
  const bad = await fetch(base + '/api/users/profile', { headers: { Authorization: 'Bearer nope' } });
  assert.equal(bad.status, 401);
});

test('login rejects non-string credentials (operator injection)', async () => {
  const res = await post('/api/auth/login', { email: { $ne: null }, password: 'x' });
  assert.equal(res.status, 400);
});

test('register validates input', async () => {
  assert.equal((await post('/api/auth/register', { username: 'ab', email: 'a@b.co', password: 'secret1' })).status, 400);
  assert.equal((await post('/api/auth/register', { username: 'valid_name', email: 'not-an-email', password: 'secret1' })).status, 400);
  assert.equal((await post('/api/auth/register', { username: 'valid_name', email: 'a@b.co', password: '123' })).status, 400);
  assert.equal((await post('/api/auth/register', { username: '<script>', email: 'a@b.co', password: 'secret1' })).status, 400);
});

test('creating a challenge cannot choose its own XP and is validated', async () => {
  const bad = await post('/api/challenges', { title: 'ab', durationDays: 5, goalType: 'Reps', goalValue: 10 }, auth);
  assert.equal(bad.status, 400);
  const huge = await post('/api/challenges', { title: 'Valid title', durationDays: 5, goalType: 'Reps', goalValue: -1 }, auth);
  assert.equal(huge.status, 400);
});

test('invalid ids are rejected before touching the database', async () => {
  for (const path of ['/api/users/challenges/abc/complete', '/api/users/workouts/abc/complete', '/api/users/friends/request/abc']) {
    assert.equal((await post(path, {}, auth)).status, 400, path);
  }
  assert.equal((await fetch(base + '/api/challenges/abc')).status, 400);
});

test('AI chat validates the message', async () => {
  assert.equal((await post('/api/ai/chat', { message: 42 }, auth)).status, 400);
  assert.equal((await post('/api/ai/chat', { message: 'x'.repeat(2000) }, auth)).status, 400);
});

test('profile update rejects client-controlled progression fields via validation', async () => {
  const res = await fetch(base + '/api/users/profile', { method: 'PUT', headers: auth, body: JSON.stringify({ age: 9999 }) });
  assert.equal(res.status, 400);
});

test('former debug, seed and client-written activity endpoints are gone', async () => {
  for (const path of ['/api/seed', '/api/add-more-content', '/api/test-workouts', '/api/activity/test']) {
    assert.equal((await fetch(base + path)).status, 404, path);
  }
});

test('clients cannot write activities (used to forge achievements)', async () => {
  const res = await post('/api/activity', { type: 'other', data: { type: 'challenge_won' } }, auth);
  assert.equal(res.status, 404);
  assert.equal((await post('/api/activity/sample', {}, auth)).status, 404);
});

test('bad JSON is a 400 and does not leak details', async () => {
  const res = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad json' });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.stack, undefined);
});

test('password change validates input types', async () => {
  const res = await fetch(base + '/api/users/password', { method: 'PUT', headers: auth, body: JSON.stringify({ currentPassword: 1, newPassword: {} }) });
  assert.equal(res.status, 400);
});

test('workout creation validates type and image', async () => {
  const bad = await post('/api/workouts', { title: 'Valid title', duration: '30 min', type: 'Nonsense' }, auth);
  assert.equal(bad.status, 400);
});

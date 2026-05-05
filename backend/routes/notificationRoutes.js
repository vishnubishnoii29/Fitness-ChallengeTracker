const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// Get notifications for the logged in user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(notifications);
  } catch (err) {
    console.error('Fetch notifications error', err);
    res.status(500).json({ message: 'Could not fetch notifications', error: err.message });
  }
});

// Mark all notifications as read for current user
router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark all as read', error: err.message });
  }
});

// Clear all notifications for current user
router.delete('/clear-all', protect, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear notifications', error: err.message });
  }
});

// Mark a single notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const n = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id }, 
      { read: true }, 
      { new: true }
    );
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    res.json(n);
  } catch (err) {
    res.status(500).json({ message: 'Could not update notification', error: err.message });
  }
});

// Test notification
router.post('/test', protect, async (req, res) => {
  try {
    const n = await Notification.create({
      userId: req.user.id,
      title: 'System Test',
      message: 'The notification system is officially WORKING!',
      read: false
    });
    res.status(201).json(n);
  } catch (err) {
    res.status(500).json({ message: 'Test failed', error: err.message });
  }
});

module.exports = router;

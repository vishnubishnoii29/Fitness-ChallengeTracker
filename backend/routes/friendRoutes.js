const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isString, escapeRegex, validateIdParams } = require('../utils/validate');
const Notification = require('../models/Notification');
const User = require('../models/User');

// --- SOCIAL ROUTES ---

const CHEER_COOLDOWN_MS = 60 * 60 * 1000; // one cheer per friend per hour

// Search users with friendship status
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!isString(q) || q.length < 2 || q.length > 50) return res.json([]);
    const pattern = escapeRegex(q);
    
    const currentUser = await User.findById(req.user.id);
    
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        { username: { $regex: pattern, $options: 'i' } }
      ]
    }).select('username avatar level xp friendRequests').limit(10);
    
    const results = users.map(u => {
      let status = 'none';
      if (currentUser.friends.includes(u._id)) {
        status = 'friend';
      } else if (u.friendRequests.some(r => r.from.toString() === req.user.id && r.status === 'pending')) {
        status = 'pending';
      } else if (currentUser.friendRequests.some(r => r.from.toString() === u._id.toString() && r.status === 'pending')) {
        status = 'incoming'; // they already asked you; accept it from your requests list
      }
      
      const userObj = u.toObject();
      delete userObj.friendRequests; // Don't leak all requests
      return { ...userObj, friendshipStatus: status };
    });
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Error searching users' });
  }
});

// Send friend request
router.post('/friends/request/:targetId', protect, validateIdParams('targetId'), async (req, res) => {
  try {
    if (req.params.targetId === req.user.id) {
      return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
    }
    const [target, sender] = await Promise.all([User.findById(req.params.targetId), User.findById(req.user.id)]);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (!sender) return res.status(404).json({ message: 'User not found' });
    if (sender.friendRequests.some(r => r.from.toString() === req.params.targetId && r.status === 'pending')) {
      return res.status(400).json({ message: 'This user already sent you a request. Check your requests.' });
    }

    if (target.friends.some(f => f.toString() === req.user.id)) {
      return res.status(400).json({ message: 'You are already friends' });
    }
    if (target.friendRequests.some(r => r.from.toString() === req.user.id && r.status === 'pending')) {
      return res.status(400).json({ message: 'Request already sent' });
    }
    
    target.friendRequests.push({ from: req.user.id });
    await target.save();
    
    // Create notification for target
    await Notification.create({
      userId: target._id,
      title: '👋 New Friend Request',
      message: `${sender.username} wants to be friends!`,
      type: 'friend_request',
      data: { fromId: req.user.id },
      read: false
    });

    res.json({ message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending request' });
  }
});

// Get friend requests
router.get('/friends/requests', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friendRequests.from', 'username avatar level');
    res.json(user.friendRequests.filter(r => r.status === 'pending'));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Respond to request
router.post('/friends/request/:requestId/respond', protect, validateIdParams('requestId'), async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    if (status !== 'accepted' && status !== 'rejected') {
      return res.status(400).json({ message: "status must be 'accepted' or 'rejected'" });
    }
    const user = await User.findById(req.user.id);
    const request = user.friendRequests.id(req.params.requestId);
    
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been answered' });
    }
    
    request.status = status;
    
    if (status === 'accepted') {
      const friendId = request.from;
      if (!user.friends.includes(friendId)) {
        user.friends.push(friendId);
      }
      
      const friend = await User.findById(friendId);
      if (!friend) {
        request.status = 'rejected';
        await user.save();
        return res.status(404).json({ message: 'That user no longer exists' });
      }
      if (!friend.friends.includes(req.user.id)) {
        friend.friends.push(req.user.id);
      }
      await friend.save();

      // Create notification for the person who sent the request
      await Notification.create({
        userId: friendId,
        title: '🤝 Friend Request Accepted',
        message: `${user.username} accepted your friend request!`,
        type: 'friend_accept',
        data: { friendId: user._id },
        read: false
      });
    }
    
    await user.save();
    res.json({ message: `Request ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Error responding to request' });
  }
});

// Get friends list
router.get('/friends', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'username avatar level xp streak');
    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching friends' });
  }
});

// Cheer a friend
router.post('/friends/:friendId/cheer', protect, validateIdParams('friendId'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.friends.some(f => f.toString() === req.params.friendId)) {
      return res.status(403).json({ message: 'You can only cheer your friends' });
    }
    const friend = await User.findById(req.params.friendId);
    if (!friend) return res.status(404).json({ message: 'Friend not found' });

    const recentCheer = await Notification.exists({
      userId: friend._id,
      type: 'social_cheer',
      'data.fromId': user._id,
      createdAt: { $gte: new Date(Date.now() - CHEER_COOLDOWN_MS) }
    });
    if (recentCheer) {
      return res.status(429).json({ message: 'You already cheered this friend recently' });
    }
    
    await Notification.create({
      userId: friend._id,
      title: '🔥 Athlete Cheer!',
      message: `${user.username} is cheering you on! Keep pushing!`,
      type: 'social_cheer',
      data: { fromId: user._id },
      read: false
    });
    
    res.json({ message: 'Cheer sent!' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending cheer' });
  }
});

module.exports = router;

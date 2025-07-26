const express = require('express');
const router = express.Router();
const User = require('../DataModel/User');

// Register user
router.post('/', async (req, res) => {
  console.log('POST /api/users called with body:', req.body);
  try {
    const user = new User(req.body);
    await user.save();
    console.log('User saved:', user);
    res.status(201).json(user);
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(400).json({ error: err.message });
  }
});

// List users
router.get('/', async (req, res) => {
  console.log('GET /api/users called');
  try {
    const users = await User.find();
    console.log('Users found:', users.length);
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

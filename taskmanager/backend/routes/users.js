const router = require('express').Router();
const User = require('../models/User');
const { protect, managerOnly } = require('../middleware/auth');

// GET /api/users — managers get list of users to assign tasks
router.get('/', protect, managerOnly, async (_req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('name email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

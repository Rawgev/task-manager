const router = require('express').Router();
const Log = require('../models/Log');
const { protect, managerOnly } = require('../middleware/auth');

// GET /api/logs — managers only, paginated
router.get('/', protect, managerOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const logs = await Log.find()
      .populate('user', 'name')
      .populate('task', 'title')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

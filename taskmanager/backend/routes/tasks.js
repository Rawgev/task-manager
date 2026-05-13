const router = require('express').Router();
const Task = require('../models/Task');
const Log = require('../models/Log');
const { protect, managerOnly } = require('../middleware/auth');

const logActivity = async (taskId, userId, action, meta = {}) => {
  await Log.create({ task: taskId, user: userId, action, meta });
};

const normalizeTaskPayload = (payload, { defaultUnassigned = false } = {}) => {
  const normalized = { ...payload };
  const hasAssignedTo = Object.prototype.hasOwnProperty.call(normalized, 'assignedTo');

  if (!hasAssignedTo && defaultUnassigned) {
    normalized.assignedTo = [];
  } else if (hasAssignedTo && (normalized.assignedTo === '' || normalized.assignedTo == null)) {
    normalized.assignedTo = [];
  } else if (hasAssignedTo && Array.isArray(normalized.assignedTo)) {
    normalized.assignedTo = normalized.assignedTo.filter(Boolean);
  } else if (hasAssignedTo) {
    normalized.assignedTo = [normalized.assignedTo];
  }

  if (normalized.dueDate === '') {
    normalized.dueDate = null;
  }

  return normalized;
};

// GET /api/tasks — user sees assigned, manager sees all they created
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = req.user.role === 'manager'
      ? { createdBy: req.user._id }
      : {
          $or: [
            { assignedTo: req.user._id },
            { assignedTo: null },
            { assignedTo: { $size: 0 } },
            { assignedTo: { $exists: false } }
          ]
        };

    if (req.query.status) query.status = req.query.status;

    const [tasks, total] = await Promise.all([
      Task.find(query).populate('assignedTo', 'name email').populate('createdBy', 'name').sort('order -createdAt').skip(skip).limit(limit),
      Task.countDocuments(query)
    ]);
    res.json({ tasks, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks — managers only
router.post('/', protect, managerOnly, async (req, res) => {
  try {
    const task = await Task.create({ ...normalizeTaskPayload(req.body, { defaultUnassigned: true }), createdBy: req.user._id });
    await logActivity(task._id, req.user._id, 'created task');
    req.io.emit('task:created', task);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:id — managers can edit all fields; users can only update status
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    let allowed = false;
    let updates = {};

    if (req.user.role === 'manager' && String(task.createdBy) === String(req.user._id)) {
      allowed = true;
      updates = normalizeTaskPayload(req.body);
    } else if (req.user.role === 'user') {
      const assignees = Array.isArray(task.assignedTo)
        ? task.assignedTo
        : [task.assignedTo].filter(Boolean);
      const isAssigned = assignees.some((id) => String(id) === String(req.user._id));
      const isUnassigned = assignees.length === 0;
      allowed = isAssigned || isUnassigned;
      if (!allowed) return res.status(403).json({ error: 'Not authorized to edit this task' });
      allowed = true;
      updates = { status: req.body.status }; // users can only update status
    }

    if (!allowed) return res.status(403).json({ error: 'Not authorized to edit this task' });

    const prev = { status: task.status };
    Object.assign(task, updates);
    await task.save();

    const changed = Object.keys(updates).map(k => `${k} → ${updates[k]}`).join(', ');
    await logActivity(task._id, req.user._id, `updated: ${changed}`, { prev, updates });
    req.io.emit('task:updated', task);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id — managers only
router.patch('/reorder', protect, managerOnly, async (req, res) => {
  try {
    const updates = Array.isArray(req.body.updates) ? req.body.updates : [];
    if (updates.length === 0) return res.status(400).json({ error: 'No task order updates provided' });

    const taskIds = updates.map((item) => item._id || item.id).filter(Boolean);
    const ownedCount = await Task.countDocuments({ _id: { $in: taskIds }, createdBy: req.user._id });
    if (ownedCount !== taskIds.length) return res.status(403).json({ error: 'Not authorized to reorder these tasks' });

    await Task.bulkWrite(
      updates.map((item) => ({
        updateOne: {
          filter: { _id: item._id || item.id, createdBy: req.user._id },
          update: { $set: { status: item.status, order: item.order } },
        },
      }))
    );

    await logActivity(taskIds[0], req.user._id, 'reordered tasks');
    req.io.emit('task:updated', { reordered: true });
    res.json({ message: 'Task order updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', protect, managerOnly, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found or not authorized' });
    await logActivity(task._id, req.user._id, 'deleted task');
    req.io.emit('task:deleted', { _id: task._id });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

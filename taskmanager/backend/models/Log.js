const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g. "created", "updated status to completed"
  meta: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Log', LogSchema);

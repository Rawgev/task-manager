import { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function StatusModal({ task, onClose, onSaved }) {
  const [status, setStatus] = useState(task.status);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/tasks/${task._id}`, { status });
      toast.success('Status updated');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm p-4 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-display">Update Status</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 truncate">{task.title}</p>
        <form onSubmit={submit} className="space-y-4">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? '…' : 'Update'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

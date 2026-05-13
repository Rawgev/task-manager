import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const assignedIds = (assignedTo) => {
  if (!assignedTo) return [];
  const values = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
  return values.map((user) => user?._id || user).filter(Boolean);
};

export default function TaskModal({ task, onClose, onSaved }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    assignedTo: assignedIds(task?.assignedTo)
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users').then(({ data }) => setUsers(data)).catch(() => {});
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleAssignee = (userId) => {
    setForm((current) => ({
      ...current,
      assignedTo: current.assignedTo.includes(userId)
        ? current.assignedTo.filter((id) => id !== userId)
        : [...current.assignedTo, userId],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      assignedTo: form.assignedTo,
      dueDate: form.dueDate || null,
    };
    try {
      if (task?._id) {
        await api.put(`/tasks/${task._id}`, payload);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto p-4 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-display">{task ? 'Edit Task' : 'New Task'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input name="title" value={form.title} onChange={handle} className="input" placeholder="Task title" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handle} className="input resize-none" rows={3} placeholder="Optional details…" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select name="status" value={form.status} onChange={handle} className="input">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Priority</label>
              <select name="priority" value={form.priority} onChange={handle} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">Due Date</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handle} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Assign To</label>
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                <p className="mb-2 text-xs text-slate-400">
                  {form.assignedTo.length === 0 ? 'Unassigned - visible to everyone' : `${form.assignedTo.length} selected`}
                </p>
                <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                  {users.map((u) => (
                    <label key={u._id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.assignedTo.includes(u._id)}
                        onChange={() => toggleAssignee(u._id)}
                        className="h-4 w-4 rounded border-slate-300 accent-brand-500"
                      />
                      <span>{u.name}</span>
                    </label>
                  ))}
                  {users.length === 0 && (
                    <p className="text-sm text-slate-400">No users found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-2 sm:flex-row">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

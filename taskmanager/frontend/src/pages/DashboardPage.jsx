import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuthStore } from '../store';
import { getSocket } from '../socket';

const StatCard = ({ label, value, color }) => (
  <div className="card p-4 sm:p-6">
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
    <p className={`text-3xl font-bold font-display ${color}`}>{value}</p>
  </div>
);

const assigneeNames = (assignedTo) => {
  if (!assignedTo) return '';
  const values = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
  return values.map((assigned) => assigned?.name).filter(Boolean).join(', ');
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks?limit=100');
      setTasks(data.tasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const socket = getSocket();
    socket.emit('join', user._id);
    const refresh = () => fetchTasks();
    socket.on('task:created', refresh);
    socket.on('task:updated', refresh);
    socket.on('task:deleted', refresh);
    return () => {
      socket.off('task:created', refresh);
      socket.off('task:updated', refresh);
      socket.off('task:deleted', refresh);
    };
  }, [user._id]);

  const counts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const recent = tasks.slice(0, 5);

  return (
    <div className="w-full max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-display">Dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Hello, <span className="text-brand-500 font-semibold">{user?.name}</span> —{' '}
          {user?.role === 'manager' ? 'here is your team overview.' : 'here are your tasks.'}
        </p>
      </div>

      {loading ? (
        <div className="text-slate-400 animate-pulse">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <StatCard label="Total Tasks" value={counts.total} color="text-slate-800 dark:text-white" />
            <StatCard label="To Do" value={counts.todo} color="text-slate-500" />
            <StatCard label="In Progress" value={counts.inProgress} color="text-blue-500" />
            <StatCard label="Completed" value={counts.completed} color="text-green-500" />
          </div>

          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold font-display text-lg">Recent Tasks</h3>
              <Link to="/tasks" className="text-sm text-brand-500 hover:text-brand-600 font-medium">View all →</Link>
            </div>
            {recent.length === 0 ? (
              <p className="text-slate-400 text-sm py-6 text-center">No tasks yet.</p>
            ) : (
              <div className="space-y-3">
                {recent.map((task) => (
                  <div key={task._id} className="flex flex-col gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{task.title}</p>
                      {assigneeNames(task.assignedTo) && (
                        <p className="text-xs text-slate-400 mt-0.5">Assigned to {assigneeNames(task.assignedTo)}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium badge-${task.priority}`}>{task.priority}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium badge-${task.status}`}>{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

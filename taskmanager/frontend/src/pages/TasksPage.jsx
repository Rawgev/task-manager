import { useEffect, useState, useCallback } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../api';
import { useAuthStore } from '../store';
import { getSocket } from '../socket';
import TaskModal from '../components/TaskModal';
import StatusModal from '../components/StatusModal';
import toast from 'react-hot-toast';

const COLS = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

function TaskCard({ task, isManager, onEdit, onDelete, onStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null;
  const overdue = due && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className="card p-4 cursor-grab active:cursor-grabbing select-none hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-sm leading-snug flex-1">{task.title}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium badge-${task.priority}`}>{task.priority}</span>
      </div>
      {task.description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 line-clamp-2">{task.description}</p>
      )}
      <div className="flex flex-wrap gap-1.5 text-xs text-slate-400 mb-3">
        {task.assignedTo?.name && <span>👤 {task.assignedTo.name}</span>}
        {due && <span className={overdue ? 'text-red-400' : ''}>{overdue ? '⚠' : '📅'} {due}</span>}
      </div>
      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        {isManager ? (
          <>
            <button onClick={() => onEdit(task)} className="text-xs btn-ghost py-1 px-2">Edit</button>
            <button onClick={() => onDelete(task._id)} className="text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 py-1 px-2 rounded-lg transition-colors">Delete</button>
          </>
        ) : (
          <button onClick={() => onStatusChange(task)} className="text-xs btn-ghost py-1 px-2">Change Status</button>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager';
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState(null); // null | { type: 'create'|'edit'|'status', task? }
  const [filter, setFilter] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50 });
      if (filter) params.set('status', filter);
      const { data } = await api.get(`/tasks?${params}`);
      setTasks(data.tasks);
      setTotalPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchTasks();
    const socket = getSocket();
    socket.on('task:created', fetchTasks);
    socket.on('task:updated', fetchTasks);
    socket.on('task:deleted', fetchTasks);
    return () => {
      socket.off('task:created', fetchTasks);
      socket.off('task:updated', fetchTasks);
      socket.off('task:deleted', fetchTasks);
    };
  }, [fetchTasks]);

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    // Find the column the card was dropped in
    const colEl = document.elementFromPoint(window._dndX || 0, window._dndY || 0);
    const col = colEl?.closest('[data-col]')?.dataset?.col;
    if (!col) return;
    const task = tasks.find((t) => t._id === active.id);
    if (!task || task.status === col) return;
    try {
      await api.put(`/tasks/${task._id}`, { status: col, ...( isManager ? {} : {}) });
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const colTasks = (colId) => tasks.filter((t) => t.status === colId);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display">Tasks</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{tasks.length} task{tasks.length !== 1 ? 's' : ''} shown</p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="input !w-auto text-sm py-2">
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          {isManager && (
            <button onClick={() => setModal({ type: 'create' })} className="btn-primary">
              + New Task
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 animate-pulse text-center py-20">Loading tasks…</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLS.map((col) => (
              <div key={col.id} data-col={col.id}
                className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-4 min-h-[200px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold font-display text-sm">{col.label}</h3>
                  <span className="text-xs bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-mono text-slate-500">
                    {colTasks(col.id).length}
                  </span>
                </div>
                <SortableContext items={colTasks(col.id).map((t) => t._id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {colTasks(col.id).map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        isManager={isManager}
                        onEdit={(t) => setModal({ type: 'edit', task: t })}
                        onDelete={deleteTask}
                        onStatusChange={(t) => setModal({ type: 'status', task: t })}
                      />
                    ))}
                    {colTasks(col.id).length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-8">No tasks here</p>
                    )}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
        </DndContext>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-sm px-3 py-1.5">← Prev</button>
          <span className="px-4 py-1.5 text-sm text-slate-500">Page {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-ghost text-sm px-3 py-1.5">Next →</button>
        </div>
      )}

      {modal?.type === 'create' && (
        <TaskModal onClose={() => setModal(null)} onSaved={fetchTasks} />
      )}
      {modal?.type === 'edit' && (
        <TaskModal task={modal.task} onClose={() => setModal(null)} onSaved={fetchTasks} />
      )}
      {modal?.type === 'status' && (
        <StatusModal task={modal.task} onClose={() => setModal(null)} onSaved={fetchTasks} />
      )}
    </div>
  );
}

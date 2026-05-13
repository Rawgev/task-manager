import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../store';
import { disconnectSocket } from '../socket';

const navCls = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
    isActive
      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
  }`;

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { dark, toggle } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/auth');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col p-4 gap-2">
        <div className="px-4 py-3 mb-4">
          <h1 className="text-2xl font-bold font-display text-brand-600 dark:text-brand-400">TaskFlow</h1>
          <p className="text-xs text-slate-400 mt-0.5">Collaborative Manager</p>
        </div>

        <NavLink to="/" end className={navCls}>
          <span>⊞</span> Dashboard
        </NavLink>
        <NavLink to="/tasks" className={navCls}>
          <span>✓</span> Tasks
        </NavLink>
        {user?.role === 'manager' && (
          <NavLink to="/logs" className={navCls}>
            <span>⌚</span> Activity Logs
          </NavLink>
        )}

        <div className="mt-auto space-y-2">
          {/* Dark mode toggle */}
          <button onClick={toggle} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            {dark ? '☀' : '☾'} {dark ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* User info */}
          <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-mono ${
              user?.role === 'manager' ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>{user?.role}</span>
          </div>

          <button onClick={handleLogout} className="w-full btn-ghost text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            ⎋ Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
}

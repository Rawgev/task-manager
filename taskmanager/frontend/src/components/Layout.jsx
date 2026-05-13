import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, useThemeStore } from '../store';
import { disconnectSocket } from '../socket';

const navCls = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
    isActive
      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
  }`;

const mobileNavCls = ({ isActive }) =>
  `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors ${
    isActive
      ? 'bg-brand-500 text-white'
      : 'text-slate-500 dark:text-slate-400'
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
    <div className="flex h-dvh overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col p-4 gap-2">
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
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
          <div className="min-w-0">
            <h1 className="text-xl font-bold font-display text-brand-600 dark:text-brand-400">TaskFlow</h1>
            <p className="truncate text-xs text-slate-400">{user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
              {dark ? 'Light' : 'Dark'}
            </button>
            <button onClick={handleLogout} className="rounded-xl px-3 py-2 text-sm font-medium text-red-500">
              Logout
            </button>
          </div>
        </header>
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
        <div className="mx-auto flex max-w-md gap-2">
          <NavLink to="/" end className={mobileNavCls}>
            <span className="text-base">âŠž</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/tasks" className={mobileNavCls}>
            <span className="text-base">âœ“</span>
            <span>Tasks</span>
          </NavLink>
          {user?.role === 'manager' && (
            <NavLink to="/logs" className={mobileNavCls}>
              <span className="text-base">âŒš</span>
              <span>Logs</span>
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  );
}

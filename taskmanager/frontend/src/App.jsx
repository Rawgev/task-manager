import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore, useThemeStore } from './store';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import LogsPage from './pages/LogsPage';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/auth" replace />;
};

export default function App() {
  const init = useThemeStore((s) => s.init);
  useEffect(() => init(), [init]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        className: 'dark:bg-slate-800 dark:text-white',
        style: { fontFamily: 'DM Sans, sans-serif', borderRadius: '12px' }
      }} />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="logs" element={<LogsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

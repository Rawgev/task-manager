import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuthStore, useThemeStore } from '../store';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // login | signup
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { dark, toggle } = useThemeStore();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/signup';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form;
      const { data } = await api.post(endpoint, payload);
      setAuth(data.user, data.token);
      toast.success(`Welcome${mode === 'signup' ? ', ' + data.user.name : ' back'}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-brand-50 dark:from-slate-950 dark:to-slate-900 p-4">
      {/* Dark toggle */}
      <button onClick={toggle} className="fixed top-4 right-4 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg shadow-sm">
        {dark ? '☀' : '☾'}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-brand-600 dark:text-brand-400 mb-1">TaskFlow</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Collaborative Task Manager</p>
        </div>

        <div className="card p-5 sm:p-8">
          <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  mode === m
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >{m}</button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input name="name" value={form.name} onChange={handle} className="input" placeholder="Jane Doe" required />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" name="email" value={form.email} onChange={handle} className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input type="password" name="password" value={form.password} onChange={handle} className="input" placeholder="••••••••" required />
            </div>
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Role</label>
                <select name="role" value={form.role} onChange={handle} className="input">
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3">
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

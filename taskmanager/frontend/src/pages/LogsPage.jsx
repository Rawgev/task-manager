import { useEffect, useState } from 'react';
import api from '../api';

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/logs?page=${page}&limit=30`);
        setLogs(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page]);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-display">Activity Logs</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">All task activity across your team</p>
      </div>

      {loading ? (
        <div className="text-slate-400 animate-pulse">Loading…</div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">No activity yet.</div>
      ) : (
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {logs.map((log) => (
            <div key={log._id} className="flex items-start gap-4 px-6 py-4">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0 text-sm">
                {log.user?.name?.[0] || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{log.user?.name || 'Unknown'}</span>
                  {' '}<span className="text-slate-500 dark:text-slate-400">{log.action}</span>
                  {log.task?.title && (
                    <> — <span className="font-medium truncate">{log.task.title}</span></>
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost text-sm">← Prev</button>
        <span className="py-2 text-sm text-slate-500">Page {page}</span>
        <button disabled={logs.length < 30} onClick={() => setPage(p => p + 1)} className="btn-ghost text-sm">Next →</button>
      </div>
    </div>
  );
}

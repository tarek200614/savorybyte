import { useEffect, useState } from 'react';
import { Utensils, ShieldCheck, Server, Sparkles } from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState<{ status: string; project: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((res) => {
        if (!res.ok) throw new Error('API server unreachable');
        return res.json();
      })
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/5">
            <Utensils className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            SavoryByte
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span>v1.0.0-dev</span>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto my-auto text-center space-y-8 py-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Phase 1: Foundation & Environment Setup Complete</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight leading-tight">
          Restaurant Reservation & <br />
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 bg-clip-text text-transparent">
            Management SaaS
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          Clean architecture, async Python FastAPI backend, PostgreSQL 16 database, type-safe React frontend with Tailwind CSS design system.
        </p>

        {/* Backend Status Card */}
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-sm text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h2 className="font-semibold text-slate-200">Backend Connectivity</h2>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium ${
                loading
                  ? 'bg-slate-800 text-slate-400 animate-pulse'
                  : health?.status === 'healthy'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {loading ? 'CONNECTING...' : health?.status === 'healthy' ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          <div className="text-sm text-slate-400 space-y-2 font-mono">
            <p className="flex justify-between">
              <span className="text-slate-500">Backend URL:</span>
              <span className="text-amber-400">http://localhost:8000</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-500">Swagger OpenAPI:</span>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline"
              >
                /docs ↗
              </a>
            </p>
            {error && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20 font-sans">
                {error} (Ensure backend container is running)
              </p>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 border-t border-slate-900 py-4">
        SavoryByte SaaS — Enterprise Architecture & Full-Stack System
      </footer>
    </div>
  );
}

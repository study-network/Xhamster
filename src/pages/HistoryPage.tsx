import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Clock, PlayCircle, Trash2, ArrowRight } from 'lucide-react';

interface HistoryEntry {
  id: string;
  batchId?: string;
  subjectId?: string;
  childId?: string;
  title: string;
  videoUrl?: string;
  timestamp: number;
  watchedAt?: string;
  duration?: string;
}

export const HistoryPage: React.FC = () => {
  const { navigate } = useApp();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadHistory = () => {
    try {
      const raw = localStorage.getItem('studyHistory');
      const parsed = raw ? JSON.parse(raw) : [];
      setHistory(Array.isArray(parsed) ? parsed : []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    window.addEventListener('studyHistoryUpdated', loadHistory);
    window.addEventListener('storage', loadHistory);
    return () => {
      window.removeEventListener('studyHistoryUpdated', loadHistory);
      window.removeEventListener('storage', loadHistory);
    };
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('studyHistory');
    setHistory([]);
    window.dispatchEvent(new Event('studyHistoryUpdated'));
  };

  const resumeVideo = (entry: HistoryEntry) => {
    const params = new URLSearchParams({
      BatchId: entry.batchId || '',
      SubjectId: entry.subjectId || '',
      ChildId: entry.childId || entry.id || '',
      VideoUrl: entry.videoUrl || '',
      title: entry.title || 'Classroom Lecture',
      fullscreen: 'true',
    });
    navigate(`/watch?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3.5 py-1.5 text-xs font-semibold text-purple-300 mb-2">
            <Clock className="h-4 w-4" />
            <span>Activity Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">History</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Your recent study activity and watched lectures
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-rose-400 hover:border-rose-500/30 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center bg-[#0a0e1c]">
          <Clock className="mx-auto h-12 w-12 text-slate-500 mb-3" />
          <h3 className="text-lg font-bold text-white">No Watch History Yet</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Lectures you watch will automatically be logged here so you can resume anytime.
          </p>
          <button
            onClick={() => navigate('/study/batches')}
            className="mt-5 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-purple-500 transition cursor-pointer"
          >
            Start Watching Lectures
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0d1222] p-4 hover:border-purple-500/30 transition"
            >
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                  <PlayCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span>Watched at {item.watchedAt || 'Recent'}</span>
                    {item.duration && <span>• {item.duration}</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => resumeVideo(item)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition self-end sm:self-center cursor-pointer shadow-md shadow-purple-900/30"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                <span>Resume Lecture</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

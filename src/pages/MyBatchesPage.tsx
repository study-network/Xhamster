import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, CalendarCheck2, GraduationCap, Trash2, ArrowRight } from 'lucide-react';
import { BatchItem } from '../types';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      });
}

export const MyBatchesPage: React.FC = () => {
  const { navigate } = useApp();
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync with localStorage enrolledBatches matching learnxpw.site
  const loadBatches = () => {
    try {
      const raw = localStorage.getItem('enrolledBatches');
      const parsed = raw ? JSON.parse(raw) : [];
      setBatches(Array.isArray(parsed) ? parsed.filter((b: any) => b?.batchId || b?._id) : []);
    } catch {
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
    const handleUpdate = () => loadBatches();
    window.addEventListener('batchesUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('batchesUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const formattedBatches = useMemo(() => {
    return batches.map(b => ({
      ...b,
      id: String(b.batchId || b._id),
      title: b.batchName || b.name || 'Batch',
      image: b.batchImage || b.previewImage || 'https://i.ibb.co/V8CbjrG/image.png',
      languageText: b.language || 'Hinglish',
      forText: b.byName || 'Complete Course',
      startDateText: formatDate(b.startDate),
      endDateText: formatDate(b.endDate),
      priceText: String(b.batchPrice || b.feeTotal || '0'),
    }));
  }, [batches]);

  const handleRemove = (batchId: string) => {
    try {
      const updated = batches.filter(b => (b.batchId || b._id) !== batchId);
      localStorage.setItem('enrolledBatches', JSON.stringify(updated));

      // Remove from selectedBatch if it matches
      const selected = localStorage.getItem('selectedBatch');
      if (selected) {
        const parsedSel = JSON.parse(selected);
        if ((parsedSel?.batchId || parsedSel?._id) === batchId) {
          localStorage.removeItem('selectedBatch');
        }
      }

      window.dispatchEvent(new Event('batchesUpdated'));
      setBatches(updated);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-[#101524] border border-white/10 rounded-lg p-6 shadow-xl">
        <h1 className="text-2xl font-semibold mb-4 text-white">My Batches</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <article
                key={idx}
                aria-hidden="true"
                className="overflow-hidden rounded-xl border border-white/10 bg-[#0c1020] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="skeleton-shimmer h-5 w-3/5 rounded"></div>
                  <div className="skeleton-shimmer h-6 w-12 rounded"></div>
                </div>
                <div className="skeleton-shimmer mt-4 aspect-video w-full rounded-lg"></div>
                <div className="mt-4 space-y-3">
                  <div className="skeleton-shimmer h-4 w-2/5 rounded"></div>
                  <div className="skeleton-shimmer h-4 w-4/5 rounded"></div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="skeleton-shimmer h-5 w-20 rounded"></div>
                    <div className="skeleton-shimmer h-5 w-28 rounded"></div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <div className="skeleton-shimmer h-10 flex-1 rounded-md"></div>
                    <div className="skeleton-shimmer h-10 flex-1 rounded-md"></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : formattedBatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {formattedBatches.map(b => (
              <div
                key={b.id}
                className="border border-white/10 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-[#0d1222] flex flex-wrap"
              >
                {/* Header title & 'New' badge */}
                <div className="p-4 pb-0 gap-1 space-y-3 relative flex items-center justify-between w-full">
                  <h2 className="line-clamp-2 text-lg font-bold text-white">{b.title}</h2>
                  <div className="items-center !m-0">
                    <span className="bg-yellow-400 text-xs px-2 py-1 rounded font-medium text-slate-950">
                      New
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="w-full p-4 flex flex-wrap justify-between">
                  {/* Thumbnail & language */}
                  <div className="w-full rounded-lg overflow-hidden relative aspect-video bg-black/40">
                    <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="rounded-md bg-green-500/80 px-2 py-1 text-xs font-medium text-white ring-1 ring-white/10">
                        {b.languageText}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="pt-3 space-y-3 w-full">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-xs font-semibold text-slate-200 truncate">{b.forText}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <CalendarCheck2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Starts on </span>
                      <span className="text-xs font-semibold text-slate-200">{b.startDateText}</span>
                      <span> | Ends on </span>
                      <span className="text-xs font-semibold text-slate-200">{b.endDateText}</span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-base sm:text-lg font-bold text-green-400">₹ FREE</span>
                        {b.priceText && b.priceText !== '0' && (
                          <span className="text-xs text-slate-500 line-through ml-2">
                            ₹{b.priceText}
                          </span>
                        )}
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
                        100% Free For Students
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => {
                          const studyUrl =
                            b.studyUrl ||
                            (b.platform === 'nexttoppers' || (/^\d{1,5}$/.test(b.id) && ![184, 185, 151, 152].includes(Number(b.id)))
                              ? `/study/nexttoppers/${b.id}`
                              : b.platform === 'missionjeet' || [184, 185, 151, 152].includes(Number(b.id))
                              ? `/study/missionjeet/${b.id}`
                              : b.platform === 'vibrant'
                              ? `/study/vibrant/${b.id}`
                              : b.platform === 'sway'
                              ? `/study/sway/${b.id}`
                              : `/study/batches/${b.id}`);
                          navigate(studyUrl);
                        }}
                        className="border border-white/10 hover:bg-white/[0.08] flex-1 min-w-[120px] inline-flex items-center justify-center py-2 px-3 rounded-lg text-sm font-semibold text-white transition cursor-pointer"
                      >
                        <GraduationCap className="w-4 h-4 mr-2 text-purple-400" />
                        Study
                      </button>

                      <button
                        onClick={() => handleRemove(b.id)}
                        className="flex-1 min-w-[120px] text-xs sm:text-sm bg-red-600 hover:bg-red-700 text-white inline-flex items-center justify-center py-2 px-3 rounded-lg font-semibold transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-8 py-12 border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
            <p className="text-base font-semibold text-slate-300">
              You are not enrolled in any batches yet.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Explore available courses and enroll to start your preparation.
            </p>
            <div className="mt-5">
              <button
                onClick={() => navigate('/study/batches')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-purple-500 transition cursor-pointer shadow-lg shadow-purple-600/30"
              >
                <span>Browse Batches</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

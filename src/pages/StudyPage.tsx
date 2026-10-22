import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  MoreVertical,
  ChevronRight,
  CalendarDays,
  Search,
  X,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { BatchItem } from '../types';

export const StudyPage: React.FC = () => {
  const { enrolledBatches, navigate } = useApp();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected batch persistence in localStorage
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(() => {
    try {
      const saved = localStorage.getItem('selectedBatch');
      if (saved) return JSON.parse(saved);
      return enrolledBatches[0] || null;
    } catch {
      return enrolledBatches[0] || null;
    }
  });

  useEffect(() => {
    if (!selectedBatch && enrolledBatches.length > 0) {
      setSelectedBatch(enrolledBatches[0]);
    }
  }, [enrolledBatches, selectedBatch]);

  const handleSelectBatch = (batch: BatchItem) => {
    setSelectedBatch(batch);
    try {
      localStorage.setItem('selectedBatch', JSON.stringify(batch));
    } catch (e) {
      console.error(e);
    }
  };

  const currentBatchId = selectedBatch?.batchId || selectedBatch?._id;

  const filteredEnrolled = enrolledBatches.filter(b => {
    const name = b.name || b.batchName || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getBatchStudyRoute = (batch: BatchItem | null): string => {
    if (!batch) return '/study/batches';
    if (batch.studyUrl) return batch.studyUrl;
    const id = String(batch.batchId || batch._id || '');
    if (batch.platform === 'nexttoppers' || (/^\d{1,5}$/.test(id) && ![184, 185, 151, 152].includes(Number(id)))) {
      return `/study/nexttoppers/${id}`;
    }
    if (batch.platform === 'missionjeet' || [184, 185, 151, 152].includes(Number(id))) {
      return `/study/missionjeet/${id}`;
    }
    if (batch.platform === 'vibrant') return `/study/vibrant/${id}`;
    if (batch.platform === 'sway') return `/study/sway/${id}`;
    return `/study/batches/${id}`;
  };

  return (
    <div className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden">
      <div className="min-h-screen overflow-x-hidden bg-[#080b18] pb-12">
        <div className="container mx-auto w-full max-w-[1180px] space-y-5 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-7">
          {/* Header Banner */}
          <section className="relative isolate overflow-hidden rounded-xl border border-white/10 bg-[#20262c] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-[#20262c] to-[#12161f] px-5 py-6 text-white shadow-[0_14px_42px_rgba(15,23,42,0.18)] sm:px-8 sm:py-7">
            <div className="relative flex min-h-[72px] items-center justify-between gap-5">
              <div className="min-w-0">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
                  Your batch
                </p>
                {selectedBatch ? (
                  <h2 className="text-xl sm:text-2xl font-bold truncate text-white">
                    {selectedBatch.name || selectedBatch.batchName}
                  </h2>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-slate-300">No active batch selected</span>
                    <button
                      onClick={() => setSelectorOpen(true)}
                      className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition cursor-pointer"
                    >
                      Select Batch
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectorOpen(true)}
                aria-label="Open batch selector"
                className="hidden h-10 w-10 place-items-center rounded-full text-white/85 hover:bg-white/10 sm:grid cursor-pointer transition"
              >
                <MoreVertical className="h-6 w-6" />
              </button>
            </div>
          </section>

          {/* Batch Offerings */}
          <section className="rounded-[24px] border border-white/10 bg-[#101524] p-4 shadow-sm sm:p-6">
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#7567ee]">
                Start learning
              </p>
              <h1 className="mt-1 text-xl font-bold sm:text-2xl text-white">Batch Offerings</h1>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* All Classes Button */}
              <button
                type="button"
                onClick={() => {
                  if (selectedBatch) {
                    navigate(getBatchStudyRoute(selectedBatch));
                  } else {
                    setSelectorOpen(true);
                  }
                }}
                title="Subjects, chapters and lectures"
                className="group flex min-h-[76px] w-full items-center gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-left shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition hover:bg-white/[0.06] hover:border-purple-500/40 cursor-pointer active:scale-[0.99]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center p-1 rounded-xl bg-purple-600/20 border border-purple-500/30">
                  <img
                    src="https://static.pw.live/5eb393ee95fab7468a79d189/ADMIN/d9884a89-e9f5-4d01-ad95-ff4435c66284.svg"
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold sm:text-base text-white">
                    All Classes
                  </span>
                  <span className="block text-xs text-slate-400 mt-0.5">
                    Subjects, chapters and video lectures
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-purple-300 transition" />
              </button>

              {/* Weekly Schedule Button */}
              <button
                type="button"
                onClick={() => {
                  if (selectedBatch) {
                    navigate(getBatchStudyRoute(selectedBatch));
                  } else {
                    setSelectorOpen(true);
                  }
                }}
                title="See classes and notes by day"
                className="group flex min-h-[76px] w-full items-center gap-3 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-3 text-left shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition hover:bg-white/[0.06] hover:border-purple-500/40 cursor-pointer active:scale-[0.99]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center p-1 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-[#6674f4]">
                  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-full w-full">
                    <rect width="48" height="48" rx="8" fill="white"></rect>
                    <rect x="8" y="11" width="32" height="30" rx="5" fill="#6674f4"></rect>
                    <rect x="12" y="19" width="24" height="18" rx="2" fill="white"></rect>
                    <rect x="14" y="7" width="4" height="10" rx="2" fill="#6674f4"></rect>
                    <rect x="30" y="7" width="4" height="10" rx="2" fill="#6674f4"></rect>
                    <path
                      d="M16 24H20M24 24H28M32 24H34M16 29H20M24 29H28M32 29H34M16 34H20M24 34H28"
                      stroke="#6674f4"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    ></path>
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold sm:text-base text-white">
                    Weekly Schedule
                  </span>
                  <span className="block text-xs text-slate-400 mt-0.5">
                    Plan your week with classes, notes and tests
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-purple-300 transition" />
              </button>
            </div>
          </section>

          {/* Upcoming Events */}
          <section className="rounded-[24px] border border-white/10 bg-[#101524] p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <h2 className="text-xl font-bold sm:text-2xl text-white">Upcoming Events</h2>
            </div>
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-9 text-center">
              <CalendarDays className="mx-auto h-7 w-7 text-[#7567ee]" />
              <p className="mt-3 font-semibold text-white">No classes scheduled today</p>
              <p className="mt-1 text-sm text-slate-400">
                Open the weekly schedule to check upcoming live classes.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Select Your Batch Slide-out Drawer */}
      <div className={`fixed inset-0 z-[80] ${selectorOpen ? '' : 'pointer-events-none'}`}>
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close batch selector"
          onClick={() => setSelectorOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
            selectorOpen ? 'opacity-100' : 'opacity-0'
          }`}
        ></button>

        {/* Drawer panel */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Select your batch"
          className={`absolute inset-y-0 right-0 flex w-full max-w-[410px] flex-col border-l border-white/10 bg-[#0e1324] shadow-2xl transition-transform duration-200 ease-out ${
            selectorOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <h2 className="font-semibold text-white">Select your batch</h2>
            <button
              type="button"
              onClick={() => setSelectorOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-md transition hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <label className="mb-5 flex h-12 items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-3 focus-within:ring-2 focus-within:ring-purple-500">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                placeholder="Search enrolled batches"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500 text-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </label>

            <section role="radiogroup" aria-label="Enrolled batches">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">
                  Enrolled Batches ({enrolledBatches.length})
                </h3>
                <button
                  onClick={() => {
                    setSelectorOpen(false);
                    navigate('/study/batches');
                  }}
                  className="text-xs font-semibold text-purple-400 hover:text-purple-300"
                >
                  Browse all
                </button>
              </div>

              {filteredEnrolled.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">
                  {enrolledBatches.length === 0 ? (
                    <div>
                      <p>No enrolled batches match your search.</p>
                      <button
                        onClick={() => {
                          setSelectorOpen(false);
                          navigate('/study/batches');
                        }}
                        className="mt-3 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition cursor-pointer"
                      >
                        Enroll in Batches
                      </button>
                    </div>
                  ) : (
                    'No enrolled batches match your search.'
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredEnrolled.map(batch => {
                    const id = batch.batchId || batch._id;
                    const isSelected = (selectedBatch?.batchId || selectedBatch?._id) === id;

                    return (
                      <div
                        key={id}
                        onClick={() => handleSelectBatch(batch)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? 'border-purple-500 bg-purple-600/20 text-white'
                            : 'border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]'
                        }`}
                      >
                        <img
                          src={
                            batch.previewImage ||
                            batch.batchImage ||
                            'https://i.ibb.co/V8CbjrG/image.png'
                          }
                          alt=""
                          className="h-11 w-11 rounded-lg object-cover bg-black/40"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-white">
                            {batch.name || batch.batchName}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {batch.byName || 'Complete Access'}
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="selected_batch"
                          checked={isSelected}
                          onChange={() => handleSelectBatch(batch)}
                          className="accent-purple-600 h-4 w-4"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <div className="shrink-0 border-t border-white/10 bg-[#0e1324] p-4">
            <button
              type="button"
              disabled={!selectedBatch}
              onClick={() => {
                setSelectorOpen(false);
                if (selectedBatch) {
                  navigate(getBatchStudyRoute(selectedBatch));
                } else {
                  navigate('/study/batches');
                }
              }}
              className="h-11 w-full rounded-xl bg-purple-600 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-600/30"
            >
              Continue
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

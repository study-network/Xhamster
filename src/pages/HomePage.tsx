import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchBatches } from '../api/client';
import { BatchItem } from '../types';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle,
  PlayCircle,
  FileText,
  GraduationCap,
  ShieldCheck,
  Compass
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate } = useApp();
  const [featuredBatches, setFeaturedBatches] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    fetchBatches(1)
      .then(res => {
        if (mounted) {
          setFeaturedBatches(res.batches.slice(0, 3));
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load featured batches:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#080b18] text-white">
      {/* Background Glows & Grid */}
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-purple-600/25 blur-3xl"></div>
          <div className="absolute right-0 top-40 h-[28rem] w-[28rem] rounded-full bg-blue-600/15 blur-3xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]"></div>
        </div>

        {/* Hero Section */}
        <section className="mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-12 lg:py-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-4 py-2 text-sm text-purple-200">
              <Sparkles className="h-4 w-4 text-purple-300" />
              <span>A better way to study online</span>
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Learn without limits.
              <span className="mt-2 block bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Grow every day.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              Learnxpw brings your video classes, schedules, batches and study resources into one clean learning space.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/study/batches')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3.5 font-semibold text-white shadow-xl shadow-purple-700/20 transition hover:-translate-y-0.5 hover:from-purple-500 hover:to-blue-500 cursor-pointer"
              >
                <span>Start learning</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => navigate('/study/batches')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3.5 font-semibold text-slate-200 transition hover:bg-white/10 cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                <span>Open batches</span>
              </button>
            </div>

            <div className="mt-9 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                <span>Open learning access without login</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                <span>Works smoothly across mobile and desktop</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                <span>Your classes, schedules and resources together</span>
              </div>
            </div>
          </div>

          {/* Interactive Learning Space Preview Card */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl"></div>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111629]/90 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-purple-300">Learning space</p>
                  <h2 className="mt-2 text-xl font-bold">Everything stays organized</h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-4">
                {/* Continue Learning card */}
                <div
                  onClick={() => navigate('/study/batches')}
                  className="rounded-2xl border border-white/10 bg-[#0a0e1b] p-5 cursor-pointer hover:border-purple-500/40 transition group"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 p-2.5 flex items-center justify-center text-white group-hover:scale-105 transition">
                      <PlayCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">Continue learning</p>
                      <p className="text-xs text-slate-400">
                        {featuredBatches[0]?.name ? `${featuredBatches[0].name} classes ready` : 'Your latest class is ready'}
                      </p>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => navigate('/study/pi')}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 cursor-pointer hover:border-cyan-500/40 hover:bg-white/[0.06] transition"
                  >
                    <Compass className="mb-5 h-5 w-5 text-cyan-300" />
                    <p className="text-sm font-semibold">PI Stream</p>
                    <p className="mt-1 text-xs text-slate-500">Free categories</p>
                  </div>

                  <div
                    onClick={() => navigate('/study/batches')}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 cursor-pointer hover:border-purple-500/40 hover:bg-white/[0.06] transition"
                  >
                    <GraduationCap className="mb-5 h-5 w-5 text-purple-300" />
                    <p className="text-sm font-semibold">Batches</p>
                    <p className="mt-1 text-xs text-slate-500">All courses</p>
                  </div>
                </div>

                {/* Free Access Badge */}
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.05] p-4">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-100">Learning access</p>
                    <p className="mt-0.5 text-xs text-emerald-100/50">Ready without account login</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Live Featured Batches Strip */}
      <section className="border-t border-white/[0.06] bg-[#0c1022]/60 py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-400">Direct From Learnxpw</p>
              <h2 className="text-2xl font-bold mt-1">Explore Live Active Batches</h2>
            </div>
            <button
              onClick={() => navigate('/study/batches')}
              className="text-sm font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>View all available batches</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl border border-white/10 bg-[#101524] p-5 animate-pulse">
                  <div className="h-40 bg-white/5 rounded-xl mb-4"></div>
                  <div className="h-5 bg-white/10 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-white/5 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {featuredBatches.map(batch => (
                <div
                  key={batch._id}
                  onClick={() => navigate(`/study/batches/${batch._id}`)}
                  className="group relative rounded-2xl border border-white/10 bg-[#101524] overflow-hidden cursor-pointer hover:-translate-y-1 hover:border-purple-400/40 transition duration-200"
                >
                  {batch.previewImage && (
                    <div className="aspect-video w-full overflow-hidden bg-black/40">
                      <img
                        src={batch.previewImage}
                        alt={batch.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 font-semibold text-purple-300 border border-purple-500/20">
                        {batch.language || 'Hinglish'}
                      </span>
                      <span className="text-[11px] text-slate-400">{batch.startDate}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition line-clamp-1">
                      {batch.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-1">{batch.byName}</p>

                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-slate-400">
                      <span className="text-slate-300 font-semibold">
                        {batch.feeTotal ? `₹${batch.feeTotal}` : 'Free Access'}
                      </span>
                      <span className="text-purple-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                        Open Batch <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">Built for students</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Focus on learning, not finding things</h2>
            <p className="mt-4 text-slate-400">A clean platform designed to keep your daily study journey simple.</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <article
              onClick={() => navigate('/study/batches')}
              className="rounded-2xl border border-white/10 bg-[#101524] p-6 transition hover:-translate-y-1 hover:border-purple-400/30 cursor-pointer"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
                <PlayCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Video Classes</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Watch your lectures with a smooth and focused learning experience without sign-in obstacles.
              </p>
            </article>

            <article
              onClick={() => navigate('/study/batches')}
              className="rounded-2xl border border-white/10 bg-[#101524] p-6 transition hover:-translate-y-1 hover:border-purple-400/30 cursor-pointer"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Study Resources</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Keep important notes and course resources together in one place directly linked with each chapter.
              </p>
            </article>

            <article
              onClick={() => navigate('/study/batches')}
              className="rounded-2xl border border-white/10 bg-[#101524] p-6 transition hover:-translate-y-1 hover:border-purple-400/30 cursor-pointer"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Your Batches</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Open batches and continue learning without distractions, ads, or interruptions.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* About CTA Section */}
      <section id="about" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-purple-600/15 to-blue-600/10 px-6 py-12 text-center sm:px-12">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to continue your journey?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Open your batches and start learning directly from live official servers.
          </p>
          <button
            onClick={() => navigate('/study/batches')}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-[#0b1020] transition hover:bg-slate-100 cursor-pointer"
          >
            <span>Open batches</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, AlertTriangle, BookOpen } from 'lucide-react';

export interface SwayCourse {
  id: string | number;
  title: string;
  banner?: string;
  bannerSquare?: string;
  priority?: number;
  price?: number;
  discountPrice?: number;
}

export const SwayPage: React.FC = () => {
  const { navigate } = useApp();
  const [courses, setCourses] = useState<SwayCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    let active = true;

    async function fetchSway() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/sway/courses');
        const json = await res.json().catch(() => null);

        if (!res.ok || json?.state !== 200 || !Array.isArray(json?.data)) {
          throw new Error(json?.message || 'Failed to fetch Selection Way courses');
        }

        const sorted = [...json.data].sort((a: any, b: any) => (a.priority ?? 999) - (b.priority ?? 999));
        if (active) setCourses(sorted);
      } catch (err: any) {
        if (active) setError(err?.message || 'Unable to load Selection Way courses');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchSway();

    return () => {
      active = false;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => c.title?.toLowerCase().includes(q));
  }, [courses, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="rounded-lg border border-white/10 bg-[#0d1222] p-6 shadow-xl">
        <h1 className="mb-4 text-2xl font-semibold text-white">Batches</h1>

        {/* Search Bar matching learnxpw.site */}
        <form onSubmit={(e) => e.preventDefault()} className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border border-white/10 bg-white/[0.05] p-4 ps-10 text-sm text-white placeholder-slate-400 outline-none focus:border-green-500"
              placeholder="Search Your Batch"
            />
            <button
              type="submit"
              className="absolute bottom-2.5 end-2.5 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition"
            >
              Search
            </button>
          </div>
        </form>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <article key={i} className="overflow-hidden rounded-xl border border-white/10 bg-[#0a0e1c] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="skeleton-shimmer h-5 w-3/5 rounded" />
                </div>
                <div className="skeleton-shimmer mt-4 aspect-video w-full rounded-lg" />
                <div className="skeleton-shimmer mt-4 h-10 w-full rounded-md" />
              </article>
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.02] px-4 py-14 text-center">
            <AlertTriangle className="mb-3 h-10 w-10 text-rose-500" />
            <h3 className="font-semibold text-white">Error loading batches</h3>
            <p className="mt-1 text-sm text-slate-400">{error}</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <p className="mt-8 text-center text-slate-400">No batches found.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <article
                key={String(course.id)}
                className="flex flex-wrap overflow-hidden rounded-xl border border-gray-700 bg-gray-900 transition-shadow hover:shadow-xl"
              >
                <div className="relative flex w-full items-center justify-between gap-3 p-4 pb-0">
                  <h2 className="line-clamp-2 text-lg font-bold text-white">{course.title}</h2>
                </div>

                <div className="w-full p-4">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/40">
                    <img
                      src={course.banner || course.bannerSquare || 'https://i.ibb.co/V8CbjrG/image.png'}
                      alt={course.title}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <button
                    onClick={() => navigate(`/study/sway/${encodeURIComponent(String(course.id))}`)}
                    className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-md border border-white/20 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4 text-cyan-400" />
                    <span>Study</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

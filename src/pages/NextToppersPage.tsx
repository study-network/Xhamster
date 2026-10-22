import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, GraduationCap, PinOff, BookmarkPlus, UserCheck, Calendar } from 'lucide-react';
import { NEXT_TOPPERS_COURSES, NextTopperCourse } from '../data/nexttoppersCourses';

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Lifetime access';
  const t = Number(dateStr);
  return Number.isFinite(t)
    ? new Date(1e3 * t).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Lifetime access';
}

interface NextToppersCardProps {
  batch: NextTopperCourse;
  enrolled: boolean;
  onOpen: () => void;
  onEnroll: () => void;
  onUnenroll: () => void;
}

const NextToppersBatchCard: React.FC<NextToppersCardProps> = ({
  batch,
  enrolled,
  onOpen,
  onEnroll,
  onUnenroll,
}) => {
  return (
    <article className="flex flex-wrap overflow-hidden rounded-xl border border-white/10 bg-[#0d1222] transition-shadow hover:shadow-lg">
      <div className="relative flex w-full items-center justify-between gap-4 p-4 pb-0">
        <h3 className="line-clamp-2 text-lg font-bold text-white">{batch.title}</h3>
        <span className="!m-0 rounded bg-yellow-400 px-2 py-1 text-xs font-medium text-black">
          {batch.is_trending === 'Trending' ? 'New' : 'Batch'}
        </span>
      </div>

      <div className="flex w-full flex-wrap justify-between p-4">
        <div className="relative w-full overflow-hidden rounded-lg bg-black/40">
          <img
            src={batch.thumbnail}
            alt={batch.title}
            className="aspect-video w-full object-contain"
            loading="lazy"
          />
          <div className="absolute bottom-2 left-2 z-10">
            <span className="rounded-md bg-pink-500/70 px-2 py-1 text-xs font-medium text-white ring-1 ring-pink-700/10 ring-inset dark:bg-green-500/80">
              Next Toppers
            </span>
          </div>
        </div>

        <div className="w-full space-y-3 pt-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <UserCheck className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold text-slate-200">Free learning batch</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="h-4 w-4 shrink-0 text-purple-400" />
            <span>Valid till </span>
            <span className="font-semibold text-slate-200">{formatDate(batch.end_date)}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-base font-bold text-green-400 sm:text-lg">₹ FREE</span>
            <span className="rounded bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 text-xs">
              100% Free For Students
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={onOpen}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold border border-white/10 hover:bg-white/[0.08] min-w-[120px] flex-1 py-2 px-3 text-white transition cursor-pointer"
            >
              <GraduationCap className="mr-2 h-4 w-4 text-purple-400" />
              Study
            </button>

            {enrolled ? (
              <button
                onClick={onUnenroll}
                className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-700 min-w-[120px] flex-1 py-2 px-3 text-white transition cursor-pointer"
              >
                <PinOff className="mr-1 h-4 w-4" />
                Unenroll
              </button>
            ) : (
              <button
                onClick={onEnroll}
                className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-xs sm:text-sm font-semibold bg-green-500 hover:bg-green-600 min-w-[120px] flex-1 py-2 px-3 text-white transition cursor-pointer"
              >
                Enroll Now <BookmarkPlus className="ml-1 h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export const NextToppersPage: React.FC = () => {
  const { navigate, isBatchEnrolled, toggleEnrollBatch } = useApp();
  const [searchInput, setSearchInput] = useState<string>('');
  const [enrolledSet, setEnrolledSet] = useState<Set<number>>(new Set());

  useEffect(() => {
    const s = new Set<number>();
    NEXT_TOPPERS_COURSES.forEach((b) => {
      const id = b.id;
      if (
        (typeof window !== 'undefined' && localStorage.getItem(`enrolled_${id}`) === 'true') ||
        isBatchEnrolled(String(id))
      ) {
        s.add(id);
      }
    });
    setEnrolledSet(s);
  }, [isBatchEnrolled]);

  const handleEnroll = (course: NextTopperCourse) => {
    toggleEnrollBatch({
      _id: String(course.id),
      batchId: String(course.id),
      name: course.title,
      batchName: course.title,
      previewImage: course.thumbnail,
      batchImage: course.thumbnail,
      platform: 'nexttoppers',
      studyUrl: `/study/nexttoppers/${course.id}`,
      language: 'Hinglish',
      feeTotal: 0,
      batchPrice: 0,
      byName: 'Next Toppers',
      startDate: '',
      endDate: course.end_date || '',
    });
    setEnrolledSet((prev) => new Set(prev).add(course.id));
  };

  const handleUnenroll = (course: NextTopperCourse) => {
    toggleEnrollBatch({
      _id: String(course.id),
      batchId: String(course.id),
      name: course.title,
      batchName: course.title,
      previewImage: course.thumbnail,
      batchImage: course.thumbnail,
      platform: 'nexttoppers',
      studyUrl: `/study/nexttoppers/${course.id}`,
    });
    setEnrolledSet((prev) => {
      const next = new Set(prev);
      next.delete(course.id);
      return next;
    });
  };

  const query = searchInput.trim().toLowerCase();
  const filtered = query
    ? NEXT_TOPPERS_COURSES.filter((b) => b.title.toLowerCase().includes(query))
    : NEXT_TOPPERS_COURSES;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Bar matching learnxpw.site */}
      <form onSubmit={(e) => e.preventDefault()} className="mb-6 flex flex-wrap items-center gap-3 sm:gap-5">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-slate-400">
            <Search strokeWidth={2.5} className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="block w-full rounded-md border border-white/10 bg-white/[0.04] p-4 ps-10 text-sm outline-none focus:border-purple-400 text-white placeholder-slate-500"
            placeholder="Search Your Batch"
          />
          <button
            type="submit"
            className="absolute bottom-2.5 end-2.5 rounded-lg bg-green-500 hover:bg-green-600 px-4 py-2 text-sm font-medium text-white transition cursor-pointer"
          >
            Search
          </button>
        </div>
      </form>

      {/* Course Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, idx) => (
            <NextToppersBatchCard
              key={`${course.id}-${course.title}-${idx}`}
              batch={course}
              enrolled={enrolledSet.has(course.id)}
              onOpen={() => navigate(`/study/nexttoppers/${course.id}`)}
              onEnroll={() => handleEnroll(course)}
              onUnenroll={() => handleUnenroll(course)}
            />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-slate-400">No batches found.</p>
      )}
    </div>
  );
};

export default NextToppersPage;

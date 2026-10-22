import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchBatches } from '../api/client';
import { BatchItem } from '../types';
import {
  Search,
  BookmarkPlus,
  Trash2,
  CalendarCheck2,
  UserCheck,
  GraduationCap,
  Loader2,
  BookOpen
} from 'lucide-react';

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

export const BatchesPage: React.FC = () => {
  const { navigate, enrolledBatches, toggleEnrollBatch, isBatchEnrolled } = useApp();

  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // PW Banner Carousel Images from live learnxpw.site
  const banners = [
    'https://static.pw.live/5eb393ee95fab7468a79d189/ADMIN/2cd05c71-3897-4e88-9c73-3e307e0dde03.jpg',
    'https://static.pw.live/5eb393ee95fab7468a79d189/ADMIN/4f17deae-eab1-4b19-b5cb-2bb2291d60e5.jpg',
    'https://static.pw.live/5eb393ee95fab7468a79d189/ADMIN/afeb7785-0e5e-4fc9-95e7-57b328032009.jpg',
  ];

  // Auto advance banner slider
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch batches on debouncedQuery or page changes
  useEffect(() => {
    let active = true;
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    fetchBatches(page, debouncedQuery)
      .then(res => {
        if (!active) return;
        setBatches(prev => (page === 1 ? res.batches : [...prev, ...res.batches]));
        setTotalPages(res.totalPages);
        setLoading(false);
        setLoadingMore(false);
      })
      .catch(err => {
        console.error('Failed to fetch batches:', err);
        if (active) {
          if (page === 1) setBatches([]);
          setLoading(false);
          setLoadingMore(false);
        }
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery, page]);

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6">
      {/* Carousel Slider */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1325] aspect-[21/7] max-h-[260px] shadow-2xl">
        {banners.map((imgUrl, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ${
              activeSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img src={imgUrl} alt={`Banner ${idx + 1}`} className="h-full w-full object-cover" />
          </div>
        ))}

        {/* Dots Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`h-2 rounded-full transition-all ${
                activeSlide === i ? 'w-6 bg-purple-500' : 'w-2 bg-white/40'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Page Header & Search Form */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Batches</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Live lectures, comprehensive syllabus schedules, and study materials
          </p>
        </div>

        {/* Search Box */}
        <form
          onSubmit={e => {
            e.preventDefault();
            setDebouncedQuery(searchInput);
            setPage(1);
          }}
          className="relative w-full md:w-80"
        >
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search Your Batch..."
            className="w-full rounded-xl border border-white/10 bg-[#101524] pl-10 pr-20 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setDebouncedQuery('');
                setPage(1);
              }}
              className="absolute right-14 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Batch Cards Grid */}
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
      ) : batches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center bg-[#0a0e1c]">
          <BookOpen className="mx-auto h-12 w-12 text-slate-500 mb-3" />
          <h3 className="text-lg font-bold text-white">No batches found</h3>
          <p className="mt-1 text-xs text-slate-400">
            {debouncedQuery
              ? `No courses matching "${debouncedQuery}". Try another search term.`
              : 'No batches available right now.'}
          </p>
          {debouncedQuery && (
            <button
              onClick={() => {
                setSearchInput('');
                setDebouncedQuery('');
                setPage(1);
              }}
              className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition cursor-pointer"
            >
              Show all batches
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {batches.map(batch => {
            const id = batch.batchId || batch._id;
            const isEnrolled = isBatchEnrolled(id);
            const title = batch.name || batch.batchName || 'Batch';
            const image = batch.previewImage || batch.batchImage || 'https://i.ibb.co/V8CbjrG/image.png';
            const price = String(batch.feeTotal || batch.batchPrice || 0);

            return (
              <div
                key={batch._id}
                className="border border-white/10 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-[#0d1222] flex flex-wrap"
              >
                {/* Title & 'New' badge */}
                <div className="p-4 pb-0 gap-1 space-y-3 relative flex items-center justify-between w-full">
                  <h2 className="line-clamp-2 text-lg font-bold text-white">{title}</h2>
                  <div className="items-center !m-0">
                    <span className="bg-yellow-400 text-xs px-2 py-1 rounded font-medium text-slate-950">
                      New
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="w-full p-4 flex flex-wrap justify-between">
                  <div className="w-full rounded-lg overflow-hidden relative aspect-video bg-black/40">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="rounded-md bg-green-500/80 px-2 py-1 text-xs font-medium text-white ring-1 ring-white/10">
                        {batch.language || 'Hinglish'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 space-y-3 w-full">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {batch.byName || 'Complete Batch'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <CalendarCheck2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Starts on </span>
                      <span className="text-xs font-semibold text-slate-200">
                        {formatDate(batch.startDate)}
                      </span>
                      <span> | Ends on </span>
                      <span className="text-xs font-semibold text-slate-200">
                        {formatDate(batch.endDate)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-base sm:text-lg font-bold text-green-400">₹ FREE</span>
                        {price && price !== '0' && (
                          <span className="text-xs text-slate-500 line-through ml-2">₹{price}</span>
                        )}
                      </div>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
                        100% Free For Students
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => navigate(`/study/batches/${id}`)}
                        className="border border-white/10 hover:bg-white/[0.08] flex-1 min-w-[120px] inline-flex items-center justify-center py-2 px-3 rounded-lg text-sm font-semibold text-white transition cursor-pointer"
                      >
                        <GraduationCap className="w-4 h-4 mr-2 text-purple-400" />
                        Study
                      </button>

                      <button
                        onClick={() => toggleEnrollBatch(batch)}
                        className={`flex-1 min-w-[120px] text-xs sm:text-sm inline-flex items-center justify-center py-2 px-3 rounded-lg font-semibold transition cursor-pointer ${
                          isEnrolled
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {isEnrolled ? (
                          <>
                            <Trash2 className="w-4 h-4 mr-1.5" />
                            Unenroll
                          </>
                        ) : (
                          <>
                            <BookmarkPlus className="w-4 h-4 mr-1.5" />
                            Enroll Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {page < totalPages && !loading && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-600/20 px-6 py-2.5 text-xs font-semibold text-purple-200 hover:bg-purple-600 hover:text-white transition disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-600/20"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading Batches...</span>
              </>
            ) : (
              <span>Load More Batches</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

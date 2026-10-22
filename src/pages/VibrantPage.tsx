import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, BookOpen } from 'lucide-react';

export interface VibrantBatch {
  id: number;
  title: string;
  image: string;
}

export const VIBRANT_BATCHES: VibrantBatch[] = [
  {
    id: 8,
    title: 'JEE 2028: 11th Class OG KOTA BATCH',
    image: 'https://appx-content-v2.classx.co.in/paid_course3/2026-04-02-0_8367698380827815.jpeg',
  },
  {
    id: 35,
    title: 'JEE 2028: 11th Class P2 Batch',
    image: 'https://appx-content-v2.classx.co.in/paid_course3/2026-06-10-0_8628078507292692.png',
  },
  {
    id: 10,
    title: 'JEE 2027: 12th Class OG KOTA Batch',
    image: 'https://appx-content-v2.classx.co.in/paid_course3/2026-04-03-0_81101898801182.jpeg',
  },
  {
    id: 36,
    title: 'JEE 2027: 12th Class A2 Batch',
    image: 'https://appx-content-v2.classx.co.in/paid_course3/2026-06-10-0_5680222141996314.png',
  },
  {
    id: 7,
    title: 'Free Resources',
    image: 'https://appx-content-v2.classx.co.in/paid_course3/2026-03-15-0_9931362198126962.jpeg',
  },
  {
    id: 37,
    title: 'JEE 2027: DROPPER X2 BATCH',
    image: 'https://appx-content-v2.classx.co.in/paid_course3/2026-06-10-0_7508583113852749.png',
  },
];

export const VibrantPage: React.FC = () => {
  const { navigate } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return VIBRANT_BATCHES;
    return VIBRANT_BATCHES.filter((b) => b.title.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="rounded-lg border border-white/10 bg-[#0d1222] p-6 shadow-xl">
        <h1 className="mb-4 text-2xl font-semibold text-white">Batches</h1>

        {/* Search bar matching learnxpw.site */}
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

        {/* Batches Grid */}
        {filteredBatches.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBatches.map((batch) => (
              <article
                key={batch.id}
                className="flex flex-wrap overflow-hidden rounded-xl border border-gray-700 bg-gray-900 transition-shadow hover:shadow-xl"
              >
                <div className="relative flex w-full items-center justify-between gap-3 p-4 pb-0">
                  <h2 className="line-clamp-2 text-lg font-bold text-white">{batch.title}</h2>
                  <span className="shrink-0 rounded bg-yellow-400 px-2 py-1 text-xs font-medium text-black">
                    New
                  </span>
                </div>

                <div className="w-full p-4">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/40">
                    <img
                      src={batch.image}
                      alt={batch.title}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <button
                    onClick={() =>
                      navigate(`/study/vibrant/${batch.id}?title=${encodeURIComponent(batch.title)}`)
                    }
                    className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-md border border-white/20 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4 text-purple-400" />
                    <span>Study</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-slate-400">No batches found.</p>
        )}
      </div>
    </div>
  );
};

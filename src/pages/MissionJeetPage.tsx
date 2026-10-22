import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  BookmarkPlus,
  BookmarkCheck,
  UserCheck,
  CalendarCheck2,
  GraduationCap
} from 'lucide-react';

export interface MissionJeetBatch {
  id: number;
  title: string;
  thumbnail: string;
  end_date: string;
}

export const MISSION_JEET_BATCHES: MissionJeetBatch[] = [
  {
    id: 184,
    title: 'Drona 2.0 NEET Class 11th',
    thumbnail:
      'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/uploads/courses/thumbnail/241318_131_drona%202.0%20NEET%20banner%20app.png',
    end_date: '1843410599',
  },
  {
    id: 185,
    title: 'Drona 2.0 JEE Class 11th',
    thumbnail:
      'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/uploads/courses/thumbnail/2967410_131_drona%202.0%20JEE%20banner%20app.png',
    end_date: '1843410599',
  },
  {
    id: 151,
    title: 'Drona JEE class 11th',
    thumbnail:
      'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/uploads/courses/thumbnail/7574748_131_Class%2011th%20Mission%20Jeet%20JEE%20App%20Banners.jpg',
    end_date: '1843410599',
  },
  {
    id: 152,
    title: 'Drona NEET class 11th',
    thumbnail:
      'https://dulae92u7241v.cloudfront.net/1772100600/admin_v2/uploads/courses/thumbnail/4072473_131_Class%2011th%20Mission%20Jeets%20NEET%20App%20Banners.jpg',
    end_date: '1843410599',
  },
];

export const MissionJeetPage: React.FC = () => {
  const { navigate, isBatchEnrolled, toggleEnrollBatch } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MISSION_JEET_BATCHES;
    return MISSION_JEET_BATCHES.filter((b) => b.title.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Bar */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="mb-6 flex flex-wrap items-center gap-3 sm:gap-5"
      >
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

      {/* Grid matching learnxpw.site */}
      {filteredBatches.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBatches.map((batch) => {
            const isEnrolled = isBatchEnrolled(String(batch.id));

            return (
              <article
                key={batch.id}
                className="flex flex-wrap overflow-hidden rounded-xl border border-gray-700 bg-gray-900 transition-shadow hover:shadow-xl"
              >
                {/* Card Title & New Badge */}
                <div className="relative flex w-full items-center justify-between gap-4 p-4 pb-0">
                  <h3 className="line-clamp-2 text-lg font-bold text-white">{batch.title}</h3>
                  <span className="!m-0 rounded bg-yellow-400 px-2 py-1 text-xs font-medium text-black shrink-0">
                    New
                  </span>
                </div>

                <div className="flex w-full flex-wrap justify-between p-4">
                  {/* Banner Image */}
                  <div className="relative w-full overflow-hidden rounded-lg bg-transparent">
                    <img
                      src={batch.thumbnail}
                      alt={batch.title}
                      className="aspect-video w-full object-contain"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="rounded-md bg-green-500/80 px-2 py-1 text-xs font-medium text-white shadow-md">
                        MissionJeet
                      </span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="w-full space-y-3 pt-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <UserCheck className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-slate-200">Free learning batch</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <CalendarCheck2 className="h-4 w-4 shrink-0 text-slate-300" />
                      <span>
                        Valid till <span className="font-semibold text-white">31 May 2028</span>
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-base font-bold text-green-400 sm:text-lg">₹ FREE</span>
                      <span className="rounded bg-green-500 px-2 py-1 text-xs font-bold text-white">
                        100% Free For Students
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => navigate(`/study/missionjeet/${batch.id}`)}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-white/20 bg-white/5 hover:bg-white/10 text-white h-10 px-4 py-2 min-w-[120px] flex-1 transition cursor-pointer"
                      >
                        <GraduationCap className="h-4 w-4 text-purple-400" />
                        <span>Study</span>
                      </button>

                      <button
                        onClick={() =>
                          toggleEnrollBatch({
                            _id: String(batch.id),
                            batchId: String(batch.id),
                            name: batch.title,
                            batchName: batch.title,
                            previewImage: batch.thumbnail,
                            platform: 'missionjeet',
                            studyUrl: `/study/missionjeet/${batch.id}`,
                          })
                        }
                        className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium h-10 px-4 py-2 min-w-[120px] flex-1 text-xs sm:text-sm transition cursor-pointer ${
                          isEnrolled
                            ? 'bg-emerald-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        <span>{isEnrolled ? 'Enrolled' : 'Enroll Now'}</span>
                        {isEnrolled ? (
                          <BookmarkCheck className="h-4 w-4 ml-1" />
                        ) : (
                          <BookmarkPlus className="h-4 w-4 ml-1" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-slate-400">No batches found.</p>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  ArrowLeft,
  Folder,
  PlayCircle,
  FileText,
  Download,
  Loader2,
  ChevronRight,
  Radio,
  Clock3
} from 'lucide-react';
import { VIBRANT_BATCHES } from './VibrantPage';

export const VibrantCoursePage: React.FC = () => {
  const { currentPath, navigate } = useApp();

  const segments = currentPath.split('/').filter(Boolean);
  const courseId = segments[segments.length - 1] || '8';

  const searchParams = new URLSearchParams(window.location.search);
  const titleParam = searchParams.get('title');

  const batchMeta = VIBRANT_BATCHES.find((b) => String(b.id) === courseId) || {
    id: Number(courseId),
    title: titleParam || `Vibrant Batch #${courseId}`,
    image: '',
  };

  const [activeTab, setActiveTab] = useState<'content' | 'live' | 'previous-live'>('content');
  const [folderHistory, setFolderHistory] = useState<Array<{ id: string; title: string }>>([
    { id: '-1', title: 'Home' },
  ]);
  const currentParentId = folderHistory[folderHistory.length - 1].id;

  const [materials, setMaterials] = useState<any[]>([]);
  const [liveLectures, setLiveLectures] = useState<any[]>([]);
  const [prevLiveLectures, setPrevLiveLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    async function loadData() {
      try {
        if (activeTab === 'content') {
          const res = await fetch(
            `/api/vibrant/course?course_id=${encodeURIComponent(courseId)}&parent_id=${encodeURIComponent(
              currentParentId
            )}`
          );
          if (res.ok) {
            const json = await res.json();
            if (active) setMaterials(Array.isArray(json?.data) ? json.data : []);
          }
        } else if (activeTab === 'live') {
          const res = await fetch(`/api/vibrant/live?course_id=${encodeURIComponent(courseId)}`);
          if (res.ok) {
            const json = await res.json();
            if (active) setLiveLectures(Array.isArray(json?.data) ? json.data : []);
          }
        } else if (activeTab === 'previous-live') {
          const res = await fetch(`/api/vibrant/previous-live?course_id=${encodeURIComponent(courseId)}`);
          if (res.ok) {
            const json = await res.json();
            if (active) setPrevLiveLectures(Array.isArray(json?.data) ? json.data : []);
          }
        }
      } catch (e) {
        console.warn('Vibrant load error:', e);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [courseId, currentParentId, activeTab]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <button
            onClick={() => navigate('/study/vibrant')}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Vibrant Batches</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{batchMeta.title}</h1>
        </div>
      </div>

      {/* Tabs: Course Materials, Live Classes, Recorded Live */}
      <div className="mb-6 flex gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer ${
            activeTab === 'content'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-slate-400 hover:text-white bg-white/[0.03]'
          }`}
        >
          <Folder className="h-4 w-4" />
          <span>Course Material</span>
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer ${
            activeTab === 'live'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-slate-400 hover:text-white bg-white/[0.03]'
          }`}
        >
          <Radio className="h-4 w-4 text-rose-400" />
          <span>Live Sessions</span>
        </button>

        <button
          onClick={() => setActiveTab('previous-live')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer ${
            activeTab === 'previous-live'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-slate-400 hover:text-white bg-white/[0.03]'
          }`}
        >
          <Clock3 className="h-4 w-4 text-cyan-400" />
          <span>Recorded Live</span>
        </button>
      </div>

      {/* Breadcrumb for Course Material */}
      {activeTab === 'content' && (
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          {folderHistory.map((folder, idx) => (
            <React.Fragment key={`vb-crumb-${folder.id}-${idx}`}>
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-600" />}
              <button
                onClick={() => setFolderHistory(folderHistory.slice(0, idx + 1))}
                className={`hover:text-white transition cursor-pointer ${
                  idx === folderHistory.length - 1 ? 'font-bold text-purple-400' : 'text-slate-400'
                }`}
              >
                {folder.title}
              </button>
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Material Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-400 mb-3" />
          <span>Loading Vibrant resources...</span>
        </div>
      ) : activeTab === 'content' ? (
        materials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((item, idx) => {
              const isFolder = item.material_type === 'FOLDER';
              const isVideo = item.material_type === 'VIDEO';
              const isDoc = item.material_type === 'PDF' || item.material_type === 'DOCUMENT';

              if (isFolder) {
                return (
                  <div
                    key={item.id || idx}
                    onClick={() =>
                      setFolderHistory([...folderHistory, { id: String(item.id), title: item.Title || 'Folder' }])
                    }
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d1222] p-4 hover:border-purple-500/40 hover:bg-[#12182b] transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                        <Folder className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition">
                          {item.Title || 'Folder'}
                        </h3>
                        <p className="text-[11px] text-slate-400">Directory</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition" />
                  </div>
                );
              }

              if (isDoc) {
                const pdfUrl = item.file_link || item.study_material_link;

                return (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d1222] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{item.Title}</h3>
                        <p className="text-[11px] text-slate-400">PDF Study Notes</p>
                      </div>
                    </div>
                    {pdfUrl ? (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    ) : null}
                  </div>
                );
              }

              // Video Item
              const vUrl = item.video_player_url || item.file_link || '';

              return (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d1222] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center shrink-0">
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{item.Title}</h3>
                      <p className="text-[11px] text-slate-400">Recorded Lecture</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveVideo({ url: vUrl, title: item.Title })}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition cursor-pointer"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    <span>Watch</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-xs text-slate-400">
            No materials found in this section.
          </div>
        )
      ) : activeTab === 'live' ? (
        liveLectures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveLectures.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d1222] p-4"
              >
                <div>
                  <span className="rounded bg-rose-500/20 text-rose-300 px-2 py-0.5 text-[10px] font-bold">
                    LIVE NOW
                  </span>
                  <h3 className="text-sm font-semibold text-white mt-1.5">{item.title || item.Title}</h3>
                </div>
                <button
                  onClick={() =>
                    setActiveVideo({
                      url: item.video_player_url || item.hls_url || item.url,
                      title: item.title || item.Title,
                    })
                  }
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition"
                >
                  Join Live
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-xs text-slate-400">
            No live classes broadcasting currently. Check back during scheduled timings.
          </div>
        )
      ) : prevLiveLectures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prevLiveLectures.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d1222] p-4"
            >
              <div>
                <h3 className="text-sm font-semibold text-white">{item.title || item.Title}</h3>
                <p className="text-[11px] text-slate-400">Previous Broadcast</p>
              </div>
              <button
                onClick={() =>
                  setActiveVideo({
                    url: item.video_player_url || item.file_link || item.url,
                    title: item.title || item.Title,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                <span>Watch</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-xs text-slate-400">
          No previous live streams recorded yet.
        </div>
      )}

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d1222] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="text-sm font-bold text-white">{activeVideo.title}</h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <VideoPlayer
                videoUrl={activeVideo.url}
                topic={activeVideo.title}
                autoplay={true}
                showCloseButton={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

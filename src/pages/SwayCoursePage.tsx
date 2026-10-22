import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  ArrowLeft,
  BookOpen,
  PlayCircle,
  FileText,
  Download,
  Loader2,
  CalendarDays
} from 'lucide-react';

export const SwayCoursePage: React.FC = () => {
  const { currentPath, navigate } = useApp();

  const segments = currentPath.split('/').filter(Boolean);
  const batchId = decodeURIComponent(segments[segments.length - 1] || '');

  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'classes' | 'pdfs'>('classes');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    if (!batchId) return;

    let active = true;
    setLoading(true);

    async function loadSwayBatch() {
      try {
        const [courseRes, classRes, pdfRes] = await Promise.all([
          fetch(`/api/sway/course?batch_id=${encodeURIComponent(batchId)}`).catch(() => null),
          fetch(`/api/sway/classes?batch_id=${encodeURIComponent(batchId)}`).catch(() => null),
          fetch(`/api/sway/pdfs?batch_id=${encodeURIComponent(batchId)}`).catch(() => null),
        ]);

        if (courseRes && courseRes.ok) {
          const cData = await courseRes.json();
          if (active) setCourseInfo(cData?.data || null);
        }

        if (classRes && classRes.ok) {
          const clData = await classRes.json();
          if (active) {
            const rawClasses = clData?.data?.classes || clData?.data || [];
            setClasses(Array.isArray(rawClasses) ? rawClasses : []);
            if (!courseInfo && clData?.data?.course) {
              setCourseInfo(clData.data.course);
            }
          }
        }

        if (pdfRes && pdfRes.ok) {
          const pData = await pdfRes.json();
          if (active) {
            const rawPdfs = pData?.data || [];
            setPdfs(Array.isArray(rawPdfs) ? rawPdfs : []);
          }
        }
      } catch (err) {
        console.warn('Sway course load error:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSwayBatch();

    return () => {
      active = false;
    };
  }, [batchId]);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <button
            onClick={() => navigate('/study/sway')}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All Selection Way Batches</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {courseInfo?.title || 'Selection Way Course'}
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer ${
            activeTab === 'classes'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30'
              : 'text-slate-400 hover:text-white bg-white/[0.03]'
          }`}
        >
          <PlayCircle className="h-4 w-4" />
          <span>Classes ({classes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pdfs')}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition cursor-pointer ${
            activeTab === 'pdfs'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30'
              : 'text-slate-400 hover:text-white bg-white/[0.03]'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>PDF Notes ({pdfs.length})</span>
        </button>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-400 mb-3" />
          <span>Loading Selection Way content...</span>
        </div>
      ) : activeTab === 'classes' ? (
        classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls, idx) => {
              const streamUrl = cls.url || cls.video_url || cls.hls_url || '';

              return (
                <div
                  key={cls.id || idx}
                  className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#0d1222] p-4"
                >
                  <div>
                    <span className="rounded bg-cyan-500/10 text-cyan-300 px-2 py-0.5 text-[10px] font-bold border border-cyan-500/20">
                      Classroom
                    </span>
                    <h3 className="text-sm font-semibold text-white mt-2">{cls.title || `Lecture ${idx + 1}`}</h3>
                    {cls.duration && <p className="text-[11px] text-slate-400 mt-1">{cls.duration}</p>}
                  </div>

                  <button
                    onClick={() =>
                      setActiveVideo({
                        url: streamUrl,
                        title: cls.title || 'Lecture Class',
                      })
                    }
                    className="mt-4 flex items-center justify-center gap-1.5 w-full rounded-lg bg-cyan-600 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition cursor-pointer"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    <span>Watch Class</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-xs text-slate-400">
            No classes uploaded for this batch yet.
          </div>
        )
      ) : pdfs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pdfs.map((p, idx) => (
            <div
              key={p.id || idx}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d1222] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{p.title || `Document ${idx + 1}`}</h3>
                  <p className="text-[11px] text-slate-400">PDF Sheet</p>
                </div>
              </div>
              {p.url || p.file_link ? (
                <a
                  href={p.url || p.file_link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </a>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-xs text-slate-400">
          No PDF notes available for this batch.
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

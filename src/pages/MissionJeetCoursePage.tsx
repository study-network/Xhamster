import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  ArrowLeft,
  Folder,
  FileText,
  PlayCircle,
  Download,
  Loader2,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { MISSION_JEET_BATCHES } from './MissionJeetPage';

interface ContentItem {
  type: string;
  course_id: string;
  parent_id: number;
  entity_id: string;
  title: string;
  data: any;
}

export const MissionJeetCoursePage: React.FC = () => {
  const { currentPath, navigate } = useApp();

  // Extract courseId from URL: /study/missionjeet/:courseId
  const segments = currentPath.split('/').filter(Boolean);
  const courseId = segments[segments.length - 1] || '184';

  const batchMeta = MISSION_JEET_BATCHES.find((b) => String(b.id) === courseId) || {
    id: Number(courseId),
    title: `MissionJeet Batch #${courseId}`,
    thumbnail: '',
  };

  const [folderHistory, setFolderHistory] = useState<Array<{ id: number; title: string }>>([
    { id: 0, title: 'Overview' },
  ]);
  const currentFolderId = folderHistory[folderHistory.length - 1].id;

  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    async function loadContent() {
      try {
        const query = currentFolderId === 0 ? '' : `&parent_id=${currentFolderId}`;
        const res = await fetch(`/api/missionjeet/all-content?courseid=${encodeURIComponent(courseId)}${query}`);
        if (!res.ok) throw new Error('Failed to load course materials');
        const json = await res.json();
        if (active) {
          setItems(Array.isArray(json?.data) ? json.data : []);
        }
      } catch (err) {
        console.warn('MissionJeet loadContent error:', err);
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadContent();

    return () => {
      active = false;
    };
  }, [courseId, currentFolderId]);

  const openFolder = (item: ContentItem) => {
    const id = Number(item.entity_id || item.data?.id);
    setFolderHistory([...folderHistory, { id, title: item.title }]);
  };

  const popToFolder = (index: number) => {
    setFolderHistory(folderHistory.slice(0, index + 1));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <button
            onClick={() => navigate('/study/missionjeet')}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All MissionJeet Batches</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{batchMeta.title}</h1>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        {folderHistory.map((folder, idx) => (
          <React.Fragment key={`crumb-${folder.id}-${idx}`}>
            {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-600" />}
            <button
              onClick={() => popToFolder(idx)}
              className={`hover:text-white transition cursor-pointer ${
                idx === folderHistory.length - 1 ? 'font-bold text-purple-400' : 'text-slate-400'
              }`}
            >
              {folder.title}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {/* Content Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-400 mb-3" />
          <span>Loading course content...</span>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => {
            const isFolder = item.type === 'folder' || item.data?.content_counts?.folders?.total > 0;
            const isPdf = item.type === 'pdf' || item.data?.file_url?.endsWith('.pdf');
            const isVideo = item.type === 'video' || item.type === 'stream';
            const uniqueKey = `mj-item-${item.entity_id || item.data?.id || idx}-${idx}`;

            if (isFolder) {
              return (
                <div
                  key={uniqueKey}
                  onClick={() => openFolder(item)}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d1222] p-4 hover:border-purple-500/40 hover:bg-[#12182b] transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                      <Folder className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">Folder</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition" />
                </div>
              );
            }

            if (isPdf) {
              const fileUrl = item.data?.file_url || item.data?.url || '';

              return (
                <div
                  key={uniqueKey}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d1222] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                      <p className="text-[11px] text-slate-400">PDF Sheet</p>
                    </div>
                  </div>
                  {fileUrl ? (
                    <a
                      href={fileUrl}
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

            // Video item
            const vUrl = item.data?.video_url || item.data?.url || '';

            return (
              <div
                key={uniqueKey}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0d1222] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center shrink-0">
                    <PlayCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    <p className="text-[11px] text-slate-400">Class Lecture</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveVideo({ url: vUrl, title: item.title })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 transition cursor-pointer"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  <span>Play</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-xs text-slate-400">
          No resources found in this folder.
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

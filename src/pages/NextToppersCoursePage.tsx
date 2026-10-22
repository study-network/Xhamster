import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { NEXT_TOPPERS_COURSES, NextTopperCourse } from '../data/nexttoppersCourses';
import {
  ArrowLeft,
  BookOpen,
  Folder,
  FileText,
  PlayCircle,
  Video,
  ChevronRight,
  BookmarkPlus,
  Radio,
  ExternalLink,
  Sparkles,
  Info,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

interface ContentItem {
  type: 'folder' | 'file' | string;
  course_id: string;
  parent_id: number;
  entity_id: string;
  title: string;
  data: {
    id: number;
    title?: string;
    parent_id?: number;
    thumbnail?: string | null;
    content_counts?: {
      pdf?: { total: number };
      test?: { total: number };
      links?: { total: number };
      notes?: { total: number };
      video?: { total: number };
      folders?: { total: number; direct?: number };
    };
    in_app?: number;
    is_drm?: number;
    vdc_id?: string | null;
    is_live?: number;
    duration?: number;
    file_url?: string;
    file_type?: number;
    video_type?: number;
    description?: string | null;
    dynamic_link?: string;
    [key: string]: any;
  };
}

export const NextToppersCoursePage: React.FC = () => {
  const { currentPath, navigate, toggleEnrollBatch, isBatchEnrolled } = useApp();

  // Extract courseId from URL: /study/nexttoppers/:courseId
  const match = currentPath.match(/\/study\/nexttoppers\/([0-9]+)/);
  const courseId = match ? match[1] : '197';

  const courseMeta: NextTopperCourse = NEXT_TOPPERS_COURSES.find(
    (c) => String(c.id) === courseId
  ) || {
    id: Number(courseId),
    title: `NextToppers Course #${courseId}`,
    thumbnail:
      'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/1228199_125_Class%207th%20Nirmann%20Prashant%20Sir%20Banners09-01.png',
  };

  const isEnrolled = isBatchEnrolled(String(courseId));

  // Tabs: overview | content | live
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'live'>('content');

  // Course Details (Overview tab data)
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(true);

  // Content Navigation state
  const [folderHistory, setFolderHistory] = useState<Array<{ id: number; title: string }>>([
    { id: 0, title: 'All Content' },
  ]);
  const currentFolder = folderHistory[folderHistory.length - 1];

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState<boolean>(true);
  const requestCounter = useRef(0);

  // Live classes state
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [loadingLive, setLoadingLive] = useState<boolean>(false);
  const [liveLoaded, setLiveLoaded] = useState<boolean>(false);

  // Fetch Course Details for Overview
  useEffect(() => {
    let active = true;
    setLoadingDetails(true);

    fetch(`/api/nexttoppers/course-details?courseid=${encodeURIComponent(courseId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active) return;
        if (json?.success && Array.isArray(json?.data)) {
          setCourseDetails(json.data);
        } else {
          setCourseDetails(null);
        }
      })
      .catch((err) => {
        console.warn('NextToppers course-details error:', err);
      })
      .finally(() => {
        if (active) setLoadingDetails(false);
      });

    return () => {
      active = false;
    };
  }, [courseId]);

  // Fetch content for current folder
  const loadFolderContent = useCallback(
    async (folderId: number) => {
      const requestId = ++requestCounter.current;
      setLoadingContent(true);

      try {
        const query = folderId === 0 ? '' : `&id=${folderId}`;
        const res = await fetch(
          `/api/nexttoppers/all-content?courseid=${encodeURIComponent(courseId)}${query}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (requestId !== requestCounter.current) return;
        if (json?.success && Array.isArray(json.data)) {
          setContentItems(json.data);
        } else {
          setContentItems([]);
        }
      } catch (err) {
        if (requestId !== requestCounter.current) return;
        console.warn('NextToppers all-content error:', err);
        setContentItems([]);
      } finally {
        if (requestId === requestCounter.current) {
          setLoadingContent(false);
        }
      }
    },
    [courseId]
  );

  useEffect(() => {
    loadFolderContent(currentFolder.id);
  }, [currentFolder.id, loadFolderContent]);

  // Fetch live classes when Live tab is clicked
  const loadLiveClasses = useCallback(async () => {
    setLoadingLive(true);
    try {
      const res = await fetch(`/api/nexttoppers/live?batchid=${encodeURIComponent(courseId)}`);
      const json = await res.json();
      if (json?.success && Array.isArray(json?.data)) {
        setLiveClasses(json.data);
      } else {
        setLiveClasses([]);
      }
    } catch (err) {
      console.warn('NextToppers live error:', err);
      setLiveClasses([]);
    } finally {
      setLiveLoaded(true);
      setLoadingLive(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (activeTab === 'live' && !liveLoaded) {
      loadLiveClasses();
    }
  }, [activeTab, liveLoaded, loadLiveClasses]);

  // Handle clicking on folder or file
  const handleItemClick = async (item: ContentItem) => {
    if (item.type === 'folder') {
      const folderId = Number(item.entity_id || item.data?.id);
      setFolderHistory((prev) => [...prev, { id: folderId, title: item.title }]);
      return;
    }

    // It's a file / video / test / note
    let fileData = item.data || {};

    // 1. If item already has vdc_id, navigate directly to NextToppers player
    if (typeof fileData.vdc_id === 'string' && fileData.vdc_id.trim()) {
      navigate(`/study/nexttoppers/player?id=${encodeURIComponent(fileData.vdc_id.trim())}`);
      return;
    }

    // 2. If it's a YouTube video
    if (fileData.file_type === 2 && fileData.video_type === 1) {
      // Check if file_url contains youtube ID or if thumbnail contains it
      let ytId = '';
      if (fileData.file_url && fileData.file_url.trim()) {
        ytId = fileData.file_url.trim();
      } else if (fileData.thumbnail) {
        const m = fileData.thumbnail.match(/\/vi\/([^/]+)\//);
        if (m) ytId = m[1];
      }
      if (ytId) {
        navigate(`/study/nexttoppers/player?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${ytId}`)}`);
        return;
      }
    }

    // 3. If file_url is streamable directly
    if (typeof fileData.file_url === 'string' && fileData.file_url.trim()) {
      const url = fileData.file_url.trim();
      if (/\.(mpd|m3u8|mp4)(\?|$)/i.test(url)) {
        navigate(`/study/nexttoppers/player?url=${encodeURIComponent(url)}`);
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // 4. Try resolving details from content-details endpoint
    try {
      const res = await fetch(
        `/api/nexttoppers/content-details?content_id=${encodeURIComponent(
          String(item.entity_id)
        )}&courseid=${encodeURIComponent(String(item.course_id || courseId))}`
      );
      const json = await res.json();
      if (json?.success && json?.data) {
        fileData = json.data;
      }
    } catch (e) {
      // Ignore fallback
    }

    if (typeof fileData.vdc_id === 'string' && fileData.vdc_id.trim()) {
      navigate(`/study/nexttoppers/player?id=${encodeURIComponent(fileData.vdc_id.trim())}`);
      return;
    }

    if (typeof fileData.file_url === 'string' && fileData.file_url.trim()) {
      const url = fileData.file_url.trim();
      if (/\.(mpd|m3u8|mp4)(\?|$)/i.test(url)) {
        navigate(`/study/nexttoppers/player?url=${encodeURIComponent(url)}`);
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Fallback to dynamic link
    if (fileData.dynamic_link) {
      window.open(fileData.dynamic_link, '_blank', 'noopener,noreferrer');
      return;
    }
  };

  const popToBreadcrumb = (index: number) => {
    setFolderHistory((prev) => prev.slice(0, index + 1));
  };

  // Helper to extract description and details from overview data
  const overviewDetails = courseDetails?.find((d: any) => d.type === 'overview') || null;
  const rawHtmlDescription = overviewDetails?.data?.find(
    (l: any) => l.layout_type === 'details'
  )?.layout_data?.[0]?.description;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Top Banner & Header */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-[#0d1222] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/study/nexttoppers')}
              className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Back to all batches"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <img
              src={courseMeta.thumbnail}
              alt={courseMeta.title}
              className="h-20 w-32 sm:h-24 sm:w-40 rounded-xl object-cover border border-white/10 shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://dylnd2lqy6eys.cloudfront.net/1770981347/admin_v2/uploads/courses/thumbnail/1228199_125_Class%207th%20Nirmann%20Prashant%20Sir%20Banners09-01.png';
              }}
            />

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 mb-2">
                <Sparkles className="h-3 w-3" />
                <span>Next Toppers Official</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white line-clamp-2">
                {courseMeta.title}
              </h1>
              <p className="mt-1 text-xs text-slate-400">Complete Syllabus & Resource Bundle</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() =>
                toggleEnrollBatch({
                  _id: String(courseMeta.id),
                  batchId: String(courseMeta.id),
                  name: courseMeta.title,
                  batchName: courseMeta.title,
                  previewImage: courseMeta.thumbnail,
                  platform: 'nexttoppers',
                  studyUrl: `/study/nexttoppers/${courseMeta.id}`,
                })
              }
              className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition cursor-pointer ${
                isEnrolled
                  ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
              }`}
            >
              <BookmarkPlus className="h-4 w-4" />
              <span>{isEnrolled ? 'Enrolled' : 'Enroll in Batch'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs matching learnxpw.site */}
        <div className="mt-6 flex items-center gap-2 border-t border-white/[0.08] pt-4">
          <button
            onClick={() => setActiveTab('content')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'content'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Content</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <Info className="h-4 w-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'live'
                ? 'bg-red-500 text-white shadow-md font-bold'
                : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <Radio className="h-4 w-4" />
            <span>Live</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CONTENT TAB */}
      {activeTab === 'content' && (
        <section>
          {/* Breadcrumb Path */}
          <nav className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs text-slate-400">
            {folderHistory.map((folder, index) => {
              const isLast = index === folderHistory.length - 1;
              return (
                <React.Fragment key={`${folder.id}-${index}`}>
                  {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-600" />}
                  <button
                    onClick={() => popToBreadcrumb(index)}
                    className={`transition cursor-pointer ${
                      isLast
                        ? 'font-bold text-amber-400 cursor-default'
                        : 'hover:text-white text-slate-300'
                    }`}
                  >
                    {folder.title}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Shimmer loading matching learnxpw.site */}
          {loadingContent ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 rounded-xl border border-white/5 bg-[#101524] p-4"
                >
                  <div className="skeleton-shimmer h-12 w-12 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton-shimmer h-4 w-4/5 rounded" />
                    <div className="skeleton-shimmer h-3 w-2/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : contentItems.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#101524] p-12 text-center">
              <Folder className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              <h3 className="text-base font-semibold text-white">No items found</h3>
              <p className="mt-1 text-xs text-slate-400">
                This folder does not contain any resources yet.
              </p>
              {folderHistory.length > 1 && (
                <button
                  onClick={() => popToBreadcrumb(folderHistory.length - 2)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Go Back</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentItems.map((item) => {
                const isFolder = item.type === 'folder';
                const counts = item.data?.content_counts;
                const videoCount = counts?.video?.total || 0;
                const pdfCount = (counts?.pdf?.total || 0) + (counts?.notes?.total || 0);
                const testCount = counts?.test?.total || 0;
                const folderCount = counts?.folders?.total || 0;

                const hasCounts =
                  isFolder && (videoCount > 0 || pdfCount > 0 || testCount > 0 || folderCount > 0);

                const isVideoFile = item.data?.file_type === 2 || item.data?.video_type === 4 || item.data?.video_type === 1;
                const isPdfFile = item.data?.file_type === 1 || Boolean(item.data?.has_pdf === '1');

                return (
                  <article
                    key={item.entity_id || `${item.parent_id}-${item.title}`}
                    onClick={() => handleItemClick(item)}
                    className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#101524] p-4 transition hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-[#13192c] cursor-pointer shadow-md"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Thumbnail or Icon */}
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                        {item.data?.thumbnail ? (
                          <img
                            src={item.data.thumbnail}
                            alt={item.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Fallback to icon
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}

                        {/* Overlay icon if no image or fallback */}
                        {isFolder ? (
                          <Folder className="h-6 w-6 text-amber-400" />
                        ) : isVideoFile ? (
                          <PlayCircle className="h-6 w-6 text-emerald-400" />
                        ) : isPdfFile ? (
                          <FileText className="h-6 w-6 text-sky-400" />
                        ) : (
                          <BookOpen className="h-6 w-6 text-slate-400" />
                        )}
                      </div>

                      {/* Title & Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition line-clamp-2">
                          {item.title}
                        </h4>

                        {/* Content counters */}
                        {hasCounts && (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                            {videoCount > 0 && (
                              <span className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5">
                                <Video className="h-3 w-3 text-emerald-400" />
                                {videoCount} {videoCount === 1 ? 'Video' : 'Videos'}
                              </span>
                            )}
                            {pdfCount > 0 && (
                              <span className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5">
                                <FileText className="h-3 w-3 text-sky-400" />
                                {pdfCount} {pdfCount === 1 ? 'PDF' : 'PDFs'}
                              </span>
                            )}
                            {testCount > 0 && (
                              <span className="inline-flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5">
                                <HelpCircle className="h-3 w-3 text-amber-400" />
                                {testCount} {testCount === 1 ? 'Test' : 'Tests'}
                              </span>
                            )}
                          </div>
                        )}

                        {/* File duration or type */}
                        {!isFolder && item.data?.duration ? (
                          <p className="mt-1 text-[11px] text-slate-400">
                            Duration: {Math.round((item.data.duration || 0) / 60)} mins
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-2 text-xs font-semibold">
                      <span className="text-slate-400 text-[11px]">
                        {isFolder ? 'Open Folder' : isVideoFile ? 'Watch Lecture' : 'View Notes'}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <section className="space-y-6">
          {loadingDetails ? (
            <div className="rounded-2xl border border-white/10 bg-[#101524] p-8">
              <div className="skeleton-shimmer h-6 w-1/3 rounded mb-4" />
              <div className="skeleton-shimmer h-4 w-full rounded mb-2" />
              <div className="skeleton-shimmer h-4 w-5/6 rounded mb-2" />
              <div className="skeleton-shimmer h-4 w-4/6 rounded" />
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#101524] p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-amber-400" />
                <span>Course Overview</span>
              </h2>

              {rawHtmlDescription ? (
                <div
                  className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3"
                  dangerouslySetInnerHTML={{ __html: rawHtmlDescription }}
                />
              ) : (
                <p className="text-xs sm:text-sm text-slate-400">
                  Comprehensive academic curriculum for {courseMeta.title}. Includes full recorded
                  lectures, chapter-wise notes, assignment PDFs, and test papers.
                </p>
              )}

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border-t border-white/10 pt-6">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold mb-1">
                    <Calendar className="h-4 w-4" />
                    <span>Validity</span>
                  </div>
                  <p className="text-sm font-bold text-white">Full Academic Session</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                    <Layers className="h-4 w-4" />
                    <span>Structure</span>
                  </div>
                  <p className="text-sm font-bold text-white">Subject & Chapter Modules</p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold mb-1">
                    <Sparkles className="h-4 w-4" />
                    <span>Access</span>
                  </div>
                  <p className="text-sm font-bold text-white">Unlimited Streaming & Notes</p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: LIVE TAB */}
      {activeTab === 'live' && (
        <section>
          {loadingLive ? (
            <div className="rounded-2xl border border-white/10 bg-[#101524] p-12 text-center">
              <div className="skeleton-shimmer h-10 w-10 mx-auto rounded-full mb-4" />
              <div className="skeleton-shimmer h-4 w-40 mx-auto rounded" />
            </div>
          ) : liveClasses.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#101524] p-12 text-center">
              <Radio className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              <h3 className="text-base font-semibold text-white">No Live Classes Right Now</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                There are no ongoing live sessions at this moment. You can browse recorded lectures
                and PDFs in the Content tab.
              </p>
              <button
                onClick={() => setActiveTab('content')}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs shadow-md cursor-pointer hover:bg-amber-400 transition"
              >
                <BookOpen className="h-4 w-4" />
                <span>Go to Content</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {liveClasses.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-red-500/20 bg-[#101524] p-5 shadow-lg"
                >
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <span>LIVE NOW</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-3">{item.title || 'Live Session'}</h4>
                  <button
                    onClick={() => handleItemClick(item)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 text-white font-bold py-2 text-xs cursor-pointer hover:bg-red-600 transition"
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span>Watch Live</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

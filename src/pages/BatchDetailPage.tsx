import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  fetchBatchDetails,
  fetchBatchAnnouncements,
  fetchSubjectChapters,
  fetchTopicContent,
  fetchDppList,
  fetchTodaysSchedule,
  fetchBatchTests,
  fetchTeacherDetails,
  fetchTestInstructions
} from '../api/client';
import { SubjectItem, ChapterItem, VideoLectureItem, AnnouncementItem } from '../types';
import {
  ArrowLeft,
  Moon,
  ChevronRight,
  BookOpen,
  CalendarDays,
  Bell,
  FileQuestion,
  PlayCircle,
  FileText,
  Download,
  AlertCircle,
  Clock,
  Share2,
  Eye,
  X,
  Loader2,
  Megaphone,
  Monitor,
  Sprout,
  Atom,
  FlaskConical,
  TestTube2,
  Laptop,
  Play,
  ArrowRight,
  Sparkles,
  Bookmark
} from 'lucide-react';

// Subject icon resolver matching learnxpw.site
function getSubjectIcon(name: string) {
  const norm = (name || '').toLowerCase();
  if (norm.includes('notice')) return <Megaphone className="h-5 w-5 text-sky-400" />;
  if (norm.includes('physics')) return <Monitor className="h-5 w-5 text-indigo-400" />;
  if (norm.includes('botany')) return <Sprout className="h-5 w-5 text-emerald-400" />;
  if (norm.includes('zoology')) return <Sparkles className="h-5 w-5 text-cyan-400" />;
  if (norm.includes('physical chem')) return <Atom className="h-5 w-5 text-blue-400" />;
  if (norm.includes('organic chem')) return <FlaskConical className="h-5 w-5 text-purple-400" />;
  if (norm.includes('inorganic chem')) return <TestTube2 className="h-5 w-5 text-rose-400" />;
  if (norm.includes('digital') || norm.includes('marketing') || norm.includes('computer')) {
    return <Laptop className="h-5 w-5 text-amber-400" />;
  }
  return <BookOpen className="h-5 w-5 text-purple-400" />;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
}

function formatTimeOnly(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
}

export const BatchDetailPage: React.FC = () => {
  const { batchIdParam, navigate, isBatchEnrolled, toggleEnrollBatch } = useApp();

  const [batchData, setBatchData] = useState<any>(null);
  const [loadingBatch, setLoadingBatch] = useState<boolean>(true);

  // Active top tab in Batch Hub: 'classes' | 'live' | 'announcements' | 'tests'
  const [activeTab, setActiveTab] = useState<'classes' | 'live' | 'announcements' | 'tests'>('classes');

  // Hierarchy Navigation: 'batch' -> 'subject' -> 'chapter'
  const [currentLevel, setCurrentLevel] = useState<'batch' | 'subject' | 'chapter'>('batch');
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterItem | null>(null);

  // Live Class Alert Toast (matching video 00:27 "⚠️ This live class has not started yet.")
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  // Chapters State
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [loadingChapters, setLoadingChapters] = useState<boolean>(false);
  const [chaptersPage, setChaptersPage] = useState<number>(1);
  const [hasMoreChapters, setHasMoreChapters] = useState<boolean>(true);
  const [loadingMoreChapters, setLoadingMoreChapters] = useState<boolean>(false);

  // Chapter Content Tabs (5 tabs matching video 01:36 - 02:58):
  // 'lectures' | 'dpps' | 'notes' | 'dpp-pdf' | 'dpp-videos'
  const [chapterTab, setChapterTab] = useState<'lectures' | 'dpps' | 'notes' | 'dpp-pdf' | 'dpp-videos'>('lectures');
  const [chapterVideos, setChapterVideos] = useState<any[]>([]);
  const [chapterDpps, setChapterDpps] = useState<any[]>([]);
  const [chapterNotes, setChapterNotes] = useState<any[]>([]);
  const [chapterDppPdfs, setChapterDppPdfs] = useState<any[]>([]);
  const [chapterDppVideos, setChapterDppVideos] = useState<any[]>([]);
  const [loadingChapterContent, setLoadingChapterContent] = useState<boolean>(false);

  // Live Classes State
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [teacherProfiles, setTeacherProfiles] = useState<Record<string, { name: string; imageUrl: string }>>({});
  const [loadingLive, setLoadingLive] = useState<boolean>(false);

  // Announcements State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState<boolean>(false);
  const [announcementPage, setAnnouncementPage] = useState<number>(1);
  const [hasMoreAnnouncements, setHasMoreAnnouncements] = useState<boolean>(true);
  const [loadingMoreAnnouncements, setLoadingMoreAnnouncements] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Tests State
  const [tests, setTests] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState<boolean>(false);
  const [activeSyllabus, setActiveSyllabus] = useState<{ name: string; html: string } | null>(null);
  const [loadingSyllabus, setLoadingSyllabus] = useState<boolean>(false);

  // Toast banner trigger helper
  const showAlert = (msg: string) => {
    setAlertBanner(msg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setAlertBanner((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Fetch Batch Details
  useEffect(() => {
    if (!batchIdParam) return;
    let active = true;
    setLoadingBatch(true);
    setCurrentLevel('batch');
    setSelectedSubject(null);
    setSelectedChapter(null);

    fetchBatchDetails(batchIdParam)
      .then((details) => {
        if (!active) return;
        setBatchData(details);
        setLoadingBatch(false);
      })
      .catch((err) => {
        console.error('Failed to load batch:', err);
        if (active) setLoadingBatch(false);
      });

    return () => {
      active = false;
    };
  }, [batchIdParam]);

  // Load Live Classes & Today's Schedule & Teacher Details when 'live' tab active
  useEffect(() => {
    if (activeTab === 'live' && batchIdParam) {
      let active = true;
      setLoadingLive(true);

      fetchTodaysSchedule(batchIdParam)
        .then(async (list) => {
          if (!active) return;
          const classes = Array.isArray(list) ? list : [];
          setScheduleData(classes);

          // Extract all teacher IDs
          const tIds = Array.from(
            new Set(
              classes
                .flatMap((c) => (Array.isArray(c.teachers) ? c.teachers : c.teachers ? [c.teachers] : []))
                .map((t) => (typeof t === 'string' ? t : t?._id || ''))
                .filter(Boolean)
            )
          );

          if (tIds.length > 0) {
            const profiles = await fetchTeacherDetails(tIds);
            if (active) setTeacherProfiles(profiles);
          }
          setLoadingLive(false);
        })
        .catch(() => {
          if (active) setLoadingLive(false);
        });

      return () => {
        active = false;
      };
    }
  }, [activeTab, batchIdParam]);

  // Load Announcements when 'announcements' tab active
  useEffect(() => {
    if (activeTab === 'announcements' && batchIdParam) {
      let active = true;
      setLoadingAnnouncements(true);
      setAnnouncementPage(1);

      fetchBatchAnnouncements(batchIdParam, 1)
        .then((res) => {
          if (!active) return;
          setAnnouncements(res);
          setHasMoreAnnouncements(res.length >= 10);
          setLoadingAnnouncements(false);
        })
        .catch(() => {
          if (active) setLoadingAnnouncements(false);
        });

      return () => {
        active = false;
      };
    }
  }, [activeTab, batchIdParam]);

  const handleLoadMoreAnnouncements = () => {
    if (!batchIdParam || loadingMoreAnnouncements || !hasMoreAnnouncements) return;
    const nextPage = announcementPage + 1;
    setLoadingMoreAnnouncements(true);

    fetchBatchAnnouncements(batchIdParam, nextPage)
      .then((res) => {
        if (res.length === 0) {
          setHasMoreAnnouncements(false);
        } else {
          setAnnouncements((prev) => [...prev, ...res]);
          setAnnouncementPage(nextPage);
          if (res.length < 10) setHasMoreAnnouncements(false);
        }
        setLoadingMoreAnnouncements(false);
      })
      .catch(() => setLoadingMoreAnnouncements(false));
  };

  // Load Tests when 'tests' tab active
  useEffect(() => {
    if (activeTab === 'tests' && batchIdParam) {
      let active = true;
      setLoadingTests(true);

      fetchBatchTests(batchIdParam)
        .then((res) => {
          if (!active) return;
          setTests(res);
          setLoadingTests(false);
        })
        .catch(() => {
          if (active) setLoadingTests(false);
        });

      return () => {
        active = false;
      };
    }
  }, [activeTab, batchIdParam]);

  // Open Subject -> Level 2: Chapters
  const handleOpenSubject = (subj: SubjectItem) => {
    if (!batchIdParam) return;
    setSelectedSubject(subj);
    setCurrentLevel('subject');
    setChapters([]);
    setChaptersPage(1);
    setHasMoreChapters(true);
    setLoadingChapters(true);

    fetchSubjectChapters(batchIdParam, subj._id, 1)
      .then((res) => {
        setChapters(res);
        setHasMoreChapters(res.length > 0);
        setLoadingChapters(false);
      })
      .catch(() => {
        setChapters([]);
        setLoadingChapters(false);
      });
  };

  const handleLoadMoreChapters = () => {
    if (!batchIdParam || !selectedSubject || loadingMoreChapters || !hasMoreChapters) return;
    const nextPage = chaptersPage + 1;
    setLoadingMoreChapters(true);

    fetchSubjectChapters(batchIdParam, selectedSubject._id, nextPage)
      .then((res) => {
        if (res.length === 0) {
          setHasMoreChapters(false);
        } else {
          setChapters((prev) => [...prev, ...res]);
          setChaptersPage(nextPage);
        }
        setLoadingMoreChapters(false);
      })
      .catch(() => setLoadingMoreChapters(false));
  };

  // Open Chapter -> Level 3: Content Tabs (Lectures, DPPs, Notes, DPP PDFs, DPP Videos)
  const handleOpenChapter = (ch: ChapterItem) => {
    if (!batchIdParam || !selectedSubject) return;
    setSelectedChapter(ch);
    setCurrentLevel('chapter');
    setChapterTab('lectures');
    setLoadingChapterContent(true);

    const bsId = (selectedSubject as any).batchSubjectId || selectedSubject._id || '';

    Promise.all([
      fetchTopicContent(batchIdParam, selectedSubject._id, ch._id, 'videos').catch(() => []),
      fetchTopicContent(batchIdParam, selectedSubject._id, ch._id, 'exercises').catch(() => []),
      fetchTopicContent(batchIdParam, selectedSubject._id, ch._id, 'notes').catch(() => []),
      fetchTopicContent(batchIdParam, selectedSubject._id, ch._id, 'dpp-pdf').catch(() => []),
      fetchTopicContent(batchIdParam, selectedSubject._id, ch._id, 'dpp-videos').catch(() => []),
      fetchDppList(batchIdParam, bsId, ch._id, 1, 30).catch(() => []),
    ])
      .then(([vids, exs, nts, dppPdfs, dppVids, dppList]) => {
        setChapterVideos(vids);
        // Prioritize dppList when available for complete quiz details
        const combinedDpps = Array.isArray(dppList) && dppList.length > 0 ? dppList : Array.isArray(exs) ? exs : [];
        setChapterDpps(combinedDpps);
        setChapterNotes(nts);
        setChapterDppPdfs(dppPdfs);
        // Ensure regular lectures are not accidentally displayed in DPP Videos
        const strictlyDppVideos = (Array.isArray(dppVids) ? dppVids : []).filter((v: any) => {
          if (!v || typeof v !== 'object') return false;
          if (v.isDPPVideos === true) return true;
          const topicNorm = (v.topic || v.name || '').toLowerCase();
          if (v.isDPPVideos === false && !topicNorm.includes('dpp')) return false;
          return topicNorm.includes('dpp');
        });
        setChapterDppVideos(strictlyDppVideos);
        setLoadingChapterContent(false);
      })
      .catch(() => setLoadingChapterContent(false));
  };

  // View Syllabus Drawer
  const handleViewSyllabus = async (t: any) => {
    if (!batchIdParam) return;
    setLoadingSyllabus(true);
    setActiveSyllabus({ name: t.name, html: '' });

    try {
      const data = await fetchTestInstructions(t._id, batchIdParam);
      const syllabusHtml = data?.syllabus?.en || (typeof data?.syllabus === 'string' ? data.syllabus : '');
      setActiveSyllabus({
        name: t.name,
        html: syllabusHtml || '<p class="text-slate-400">No detailed syllabus published for this paper.</p>',
      });
    } catch {
      setActiveSyllabus({
        name: t.name,
        html: '<p class="text-slate-400">Unable to load syllabus at this moment.</p>',
      });
    } finally {
      setLoadingSyllabus(false);
    }
  };

  const renderChapterContent = () => {
    if (loadingChapterContent) {
      return (
        <div className="py-12 text-center text-xs text-slate-400">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-purple-400 mb-2" />
          <span>Loading chapter resources...</span>
        </div>
      );
    }

    if (chapterTab === 'lectures') {
      if (chapterVideos.length === 0) {
        return (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400">
            No video lectures available for this chapter yet.
          </div>
        );
      }
      return (
        <div className="space-y-3">
          {chapterVideos.map((vid, idx) => (
            <div
              key={vid._id || idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#101524] p-4 transition hover:border-purple-500/30"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative aspect-video w-28 sm:w-32 shrink-0 overflow-hidden rounded-lg bg-black/60 border border-white/10">
                  <img
                    src={
                      vid.videoDetails?.image ||
                      'https://study-mf.pw.live/static/image/teacherbg.807b2b2f.png'
                    }
                    alt={vid.topic}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg">
                    <Play className="h-3 w-3 fill-current ml-0.5" />
                  </div>
                </div>

                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Lecture • {vid.date ? formatDate(vid.date) : 'Available'}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                    {vid.topic}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {vid.duration || vid.videoDetails?.duration || '1h 45m'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      batchId: batchIdParam || '',
                      BatchId: batchIdParam || '',
                      subjectId: selectedSubject?._id || '',
                      SubjectId: selectedSubject?._id || '',
                      contentId: vid._id || '',
                      ContentId: vid._id || '',
                      ChildId: vid._id || '',
                      topicId: selectedChapter?.slug || selectedChapter?._id || '',
                      Type: vid.urlType || vid.scheduleType || '',
                      thumbnail: vid.videoDetails?.image || vid.image || '',
                      VideoUrl: vid.videoDetails?.videoUrl || vid.url || '',
                      title: vid.topic || '',
                      fullscreen: 'true',
                    });
                    navigate(`/watch?${params.toString()}`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer shadow-md shadow-purple-600/30"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>Watch Full Screen</span>
                </button>

                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      batchId: batchIdParam || '',
                      BatchId: batchIdParam || '',
                      subjectId: selectedSubject?._id || '',
                      SubjectId: selectedSubject?._id || '',
                      contentId: vid._id || '',
                      ContentId: vid._id || '',
                      ChildId: vid._id || '',
                      topicId: selectedChapter?.slug || selectedChapter?._id || '',
                      Type: vid.urlType || vid.scheduleType || '',
                      thumbnail: vid.videoDetails?.image || vid.image || '',
                      VideoUrl: vid.videoDetails?.videoUrl || vid.url || '',
                      title: vid.topic || '',
                    });
                    navigate(`/watch?${params.toString()}`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-slate-300 transition cursor-pointer"
                >
                  <span>Notes & more</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (chapterTab === 'dpps') {
      if (chapterDpps.length === 0) {
        return (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400">
            No DPP quizzes uploaded for this chapter.
          </div>
        );
      }
      return (
        <div className="space-y-3">
          {chapterDpps.map((ex, idx) => {
            const testObj = ex.dppQuizDetails?.test || ex.exerciseIds?.[0]?.content?.[0]?.exerciseDetails || ex.exerciseIds?.[0] || ex;
            const title = testObj?.name || testObj?.title || ex.title || `DPP ${idx + 1} (MCQ Quiz)`;
            const exId = testObj?._id || ex.dppQuizDetails?.test?._id || ex.testId || ex._id;
            const totalQs = testObj?.totalQuestions || 10;
            const totalMarks = testObj?.totalMarks || totalQs * 4;
            const maxDuration = testObj?.maxDuration || 20;
            const scheduleId = ex.dppQuizDetails?.scheduleId || ex.scheduleId || ex._id || '';
            const contentId = ex.dppQuizDetails?.contentId || ex.contentId || '';
            const dateStr = ex.date ? formatDate(ex.date) : (testObj?.createdAt ? formatDate(testObj.createdAt) : 'Available');

            return (
              <div
                key={ex._id || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#101524] p-4 transition hover:border-amber-500/30"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-extrabold text-lg shrink-0">
                    Q
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      DPP • {dateStr}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                      {title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {totalQs} Qs • {totalMarks} Marks • {maxDuration} min
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      type: 'Start',
                      batchId: batchIdParam || '',
                      subjectId: selectedSubject?._id || '',
                      chapterId: selectedChapter?._id || '',
                      batchScheduleId: scheduleId,
                      scheduleId: scheduleId,
                      exerciseId: contentId || exId,
                      testSource: 'BATCH_QUIZ',
                    });
                    navigate(`/practice-v2/dpp/${encodeURIComponent(exId)}?${params.toString()}`);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-5 py-2 text-xs font-semibold text-amber-300 transition self-end sm:self-center cursor-pointer shadow-sm"
                >
                  <span>Attempt</span>
                </button>
              </div>
            );
          })}
        </div>
      );
    }

    if (chapterTab === 'notes') {
      if (chapterNotes.length === 0) {
        return (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400">
            No notes available for this chapter.
          </div>
        );
      }
      return (
        <div className="space-y-3">
          {chapterNotes.map((nt, idx) => {
            const hw = nt.homeworkIds?.[0];
            const att = hw?.attachmentIds?.[0];
            const title = hw?.topic || nt.topic || `Class Notes ${idx + 1}`;
            const pdfUrl = att?.baseUrl && att?.key ? `${att.baseUrl}${att.key}` : '';

            return (
              <div
                key={nt._id || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#101524] p-4 transition hover:border-purple-500/30"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600/15 border border-purple-500/20 text-purple-400 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Notes • {nt.date ? formatDate(nt.date) : 'Available'}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                      {title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {pdfUrl ? (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition"
                    >
                      <Eye className="h-3.5 w-3.5 text-purple-400" />
                      <span>View Note</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => showAlert(`Viewing notes for: ${title}`)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition"
                    >
                      <Eye className="h-3.5 w-3.5 text-purple-400" />
                      <span>View Note</span>
                    </button>
                  )}

                  {pdfUrl ? (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      download
                      className="p-2 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 text-slate-300"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      onClick={() => showAlert(`Downloading: ${title}`)}
                      className="p-2 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 text-slate-300"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (chapterTab === 'dpp-pdf') {
      if (chapterDppPdfs.length === 0) {
        return (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400">
            No DPP PDFs attached for this chapter.
          </div>
        );
      }
      return (
        <div className="space-y-3">
          {chapterDppPdfs.map((pdf, idx) => {
            const hw = pdf.homeworkIds?.[0];
            const att = hw?.attachmentIds?.[0];
            const title = hw?.topic || pdf.topic || `Mathematical Tools : DPP 0${idx + 1}`;
            const pdfUrl = att?.baseUrl && att?.key ? `${att.baseUrl}${att.key}` : '';

            return (
              <div
                key={pdf._id || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#101524] p-4 transition hover:border-amber-500/30"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs shrink-0">
                    DPP
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      DPP PDF • {pdf.date ? formatDate(pdf.date) : 'Available'}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                      {title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {pdfUrl ? (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition"
                    >
                      <Eye className="h-3.5 w-3.5 text-amber-400" />
                      <span>View DPP PDF</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => showAlert(`Opening DPP: ${title}`)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition"
                    >
                      <Eye className="h-3.5 w-3.5 text-amber-400" />
                      <span>View DPP PDF</span>
                    </button>
                  )}

                  {pdfUrl ? (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      download
                      className="p-2 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 text-slate-300"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  ) : (
                    <button
                      onClick={() => showAlert(`Downloading DPP: ${title}`)}
                      className="p-2 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 text-slate-300"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // chapterTab === 'dpp-videos'
    if (chapterDppVideos.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400">
          No DPP video solutions available for this chapter.
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {chapterDppVideos.map((vid, idx) => (
          <div
            key={vid._id || idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#101524] p-4 transition hover:border-purple-500/30"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative aspect-video w-28 sm:w-32 shrink-0 overflow-hidden rounded-lg bg-black/60 border border-white/10">
                <img
                  src={
                    vid.videoDetails?.image ||
                    'https://study-mf.pw.live/static/image/teacherbg.807b2b2f.png'
                  }
                  alt={vid.topic}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg">
                  <Play className="h-3 w-3 fill-current ml-0.5" />
                </div>
              </div>

              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  DPP Solution • {vid.date ? formatDate(vid.date) : 'Available'}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                  {vid.topic}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  {vid.duration || vid.videoDetails?.duration || '30m'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const params = new URLSearchParams({
                  batchId: batchIdParam || '',
                  BatchId: batchIdParam || '',
                  subjectId: selectedSubject?._id || '',
                  SubjectId: selectedSubject?._id || '',
                  contentId: vid._id || '',
                  ContentId: vid._id || '',
                  ChildId: vid._id || '',
                  topicId: selectedChapter?.slug || selectedChapter?._id || '',
                  Type: vid.urlType || vid.scheduleType || '',
                  thumbnail: vid.videoDetails?.image || vid.image || '',
                  VideoUrl: vid.videoDetails?.videoUrl || vid.url || '',
                  title: vid.topic || '',
                  fullscreen: 'true',
                });
                navigate(`/watch?${params.toString()}`);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-semibold text-white transition self-end sm:self-center cursor-pointer shadow-md shadow-purple-600/30"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Watch Solution</span>
            </button>
          </div>
        ))}
      </div>
    );
  };

  // Loading Batch State Shimmer
  if (loadingBatch) {
    return (
      <main className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden p-3 sm:p-5">
        <div className="container mx-auto px-0 py-4 max-w-7xl">
          <div className="rounded-2xl border border-white/10 bg-[#101524] p-6 shadow-2xl">
            <div className="skeleton-shimmer h-8 w-64 max-w-full rounded mb-5"></div>
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="skeleton-shimmer h-9 w-28 rounded-md"></div>
              <div className="skeleton-shimmer h-9 w-32 rounded-md"></div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/10 p-4 bg-[#0d1222]">
                  <div className="flex items-center gap-3">
                    <div className="skeleton-shimmer h-10 w-10 shrink-0 rounded-lg"></div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="skeleton-shimmer h-4 w-4/5 rounded"></div>
                      <div className="skeleton-shimmer h-3 w-2/5 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!batchData) {
    return (
      <main className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-white">Batch Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">Unable to load details from live servers.</p>
        <button
          onClick={() => navigate('/study/batches')}
          className="mt-4 rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white"
        >
          Return to Batches
        </button>
      </main>
    );
  }

  const subjects: SubjectItem[] = batchData.subjects || [];
  const isEnrolled = batchIdParam ? isBatchEnrolled(batchIdParam) : false;

  // Extract scheduled classes vs today's notes from scheduleData
  const liveClassesList = scheduleData.filter((c) => c.lectureType === 'LIVE' || c.teachers?.length);
  const todaysNotesList = scheduleData.flatMap((c) => {
    const hwList = c.homeworkIds || [];
    return hwList.map((hw: any) => ({
      ...hw,
      subjectName: c.subjectId?.name || 'Notices',
      date: c.date,
    }));
  });

  return (
    <main className="min-w-0 w-full max-w-full flex-1 overflow-x-hidden text-white">
      {/* Alert Banner (Matching video 00:27 "⚠️ This live class has not started yet.") */}
      {alertBanner && (
        <div className="fixed top-3 inset-x-4 sm:inset-x-auto sm:right-6 sm:max-w-md z-[100] animate-bounce-short">
          <div className="flex items-center gap-3 rounded-2xl border border-rose-500/40 bg-[#1e131d]/95 p-4 text-white shadow-2xl backdrop-blur-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500 text-white shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex-1 text-xs sm:text-sm font-semibold text-rose-200">
              {alertBanner}
            </div>
            <button
              onClick={() => setAlertBanner(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="px-3 py-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Top Header Bar with < Back on left and Moon toggle on right */}
        <header className="mb-4 flex items-center justify-between border-b border-white/[0.08] pb-3">
          <button
            onClick={() => {
              if (currentLevel === 'chapter') {
                setCurrentLevel('subject');
              } else if (currentLevel === 'subject') {
                setCurrentLevel('batch');
              } else {
                navigate('/study/batches');
              }
            }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>
              {currentLevel === 'chapter'
                ? 'Back to Chapters'
                : currentLevel === 'subject'
                ? 'Back to Subjects'
                : 'Back'}
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                toggleEnrollBatch({
                  _id: batchIdParam || '',
                  name: batchData.name || batchData.batchName,
                  previewImage: batchData.previewImage || batchData.batchImage,
                });
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition cursor-pointer ${
                isEnrolled
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isEnrolled ? 'fill-emerald-400' : ''}`} />
              <span>{isEnrolled ? 'Enrolled' : 'Bookmark'}</span>
            </button>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300">
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* ========================================================
            LEVEL 1: BATCH HUB (All Classes, Live, Announcements, Tests)
            ======================================================== */}
        {currentLevel === 'batch' && (
          <div className="space-y-6">
            {/* Hero Header Card matching video 00:09 */}
            <div className="rounded-2xl border border-white/10 bg-[#0d1222] shadow-2xl overflow-hidden">
              <div className="relative bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-purple-800/60 p-5 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-md bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-300 border border-purple-500/30">
                    {batchData.language || 'Hinglish'}
                  </span>
                  {batchData.byName && (
                    <span className="text-xs text-slate-300 font-medium">• {batchData.byName}</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {batchData.name || batchData.batchName}
                </h1>
              </div>

              {/* Tabs Navigation Row matching video 00:10:
                  [ 📝 Tests ]  [ 🎓 All Classes ]  [ 🟢 Live Classes ]  [ 🔗 Share Batch ]  [ 📢 Announcement ] */}
              <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 border-b border-white/[0.08] bg-[#0a0e1c] overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`flex items-center gap-1.5 py-3.5 px-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                    activeTab === 'tests'
                      ? 'border-[#3dc280] text-[#29ff94]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <span>📝 Tests</span>
                </button>

                <button
                  onClick={() => setActiveTab('classes')}
                  className={`flex items-center gap-1.5 py-3.5 px-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                    activeTab === 'classes'
                      ? 'border-[#3dc280] text-[#29ff94]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🎓 All Classes</span>
                </button>

                <button
                  onClick={() => setActiveTab('live')}
                  className={`flex items-center gap-1.5 py-3.5 px-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                    activeTab === 'live'
                      ? 'border-[#3dc280] text-[#29ff94]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse mr-0.5"></span>
                  <span>Live Classes</span>
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: batchData.name || 'Learnxpw Batch',
                        url: window.location.href,
                      }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      showAlert('Batch link copied to clipboard!');
                    }
                  }}
                  className="flex items-center gap-1.5 py-3.5 px-3 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-all whitespace-nowrap cursor-pointer border-b-2 border-transparent"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share Batch</span>
                </button>

                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`flex items-center gap-1.5 py-3.5 px-3 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                    activeTab === 'announcements'
                      ? 'border-[#3dc280] text-[#29ff94]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <span>📢 Announcement</span>
                </button>
              </div>
            </div>

            {/* TAB 1: ALL CLASSES (Subjects List matching video 00:10 - 00:15) */}
            {activeTab === 'classes' && (
              <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 sm:p-7 shadow-2xl">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Subjects</h2>
                {subjects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400">
                    No subjects found in this batch.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subjects.map((s) => (
                      <div
                        key={s._id}
                        onClick={() => handleOpenSubject(s)}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-[#101524] p-4 transition hover:border-purple-500/40 hover:bg-white/[0.04] cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600/15 border border-purple-500/20 shrink-0">
                            {getSubjectIcon(s.subject)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition truncate">
                              {s.subject}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {s.lectureCount ? `${s.lectureCount} Chapters` : 'Explore syllabus'}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: LIVE CLASSES (Teacher Cards Carousel & Today's Notes matching video 00:18 - 00:32) */}
            {activeTab === 'live' && (
              <div className="space-y-6">
                {/* Horizontal Live Classes Carousel */}
                <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 sm:p-7 shadow-2xl">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Live Classes</h2>

                  {loadingLive ? (
                    <div className="flex gap-4 overflow-x-auto py-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-[220px] min-w-[220px] rounded-xl border border-white/10 bg-[#101524] p-3 space-y-3"
                        >
                          <div className="skeleton-shimmer h-28 w-full rounded-lg"></div>
                          <div className="skeleton-shimmer h-4 w-3/4 rounded"></div>
                          <div className="skeleton-shimmer h-3 w-1/2 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : liveClassesList.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400">
                      No live classes scheduled for today in this batch.
                    </div>
                  ) : (
                    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-hide">
                      {liveClassesList.map((cls, idx) => {
                        const tId = Array.isArray(cls.teachers)
                          ? cls.teachers[0]
                          : cls.teachers || '';
                        const idStr = typeof tId === 'string' ? tId : tId?._id || '';
                        const teacherInfo = teacherProfiles[idStr] || {};
                        const teacherName =
                          teacherInfo.name ||
                          cls.teacherName ||
                          (typeof cls.teachers?.[0] === 'object' ? cls.teachers[0]?.name : 'Faculty');
                        const teacherPhoto =
                          teacherInfo.imageUrl ||
                          'https://study-mf.pw.live/static/image/teacherbg.807b2b2f.png';

                        const isLive = cls.tag === 'LIVE' || cls.status === 'LIVE';
                        const isEnded = cls.tag === 'Ended' || cls.status === 'ENDED';
                        const isUpcoming = !isLive && !isEnded;

                        return (
                          <div
                            key={cls._id || idx}
                            onClick={() => {
                              if (isUpcoming) {
                                showAlert('This live class has not started yet.');
                              } else {
                                const params = new URLSearchParams({
                                  batchId: batchIdParam || '',
                                  BatchId: batchIdParam || '',
                                  subjectId: cls.subjectId?._id || cls.batchSubjectId || '',
                                  SubjectId: cls.subjectId?._id || cls.batchSubjectId || '',
                                  contentId: cls._id || '',
                                  ContentId: cls._id || '',
                                  ChildId: cls._id || '',
                                  topicId: cls.slug || '',
                                  Type: cls.urlType || cls.scheduleType || '',
                                  thumbnail: cls.videoDetails?.image || cls.image || '',
                                  VideoUrl: cls.videoDetails?.videoUrl || cls.url || '',
                                  title: cls.topic || '',
                                  fullscreen: 'true',
                                });
                                navigate(`/watch?${params.toString()}`);
                              }
                            }}
                            className="w-[220px] min-w-[220px] max-w-[220px] overflow-hidden rounded-xl border border-white/10 bg-[#101524] shadow-lg hover:border-purple-500/40 hover:shadow-xl transition cursor-pointer select-none"
                          >
                            {/* Teacher Photo with Background Frame */}
                            <div
                              className="relative h-28 w-full bg-cover bg-center flex items-center justify-center overflow-hidden"
                              style={{
                                backgroundImage: `url('https://study-mf.pw.live/static/image/teacherbg.807b2b2f.png')`,
                              }}
                            >
                              <img
                                src={teacherPhoto}
                                alt={teacherName}
                                className="h-full w-full object-contain"
                              />
                              <div className="absolute bottom-0 inset-x-0 bg-black/85 py-1 text-center text-xs font-semibold text-white truncate px-2">
                                {teacherName}
                              </div>
                            </div>

                            {/* Badge & Timing */}
                            <div className="p-3">
                              <div className="flex items-center justify-between text-[11px] font-bold uppercase mb-2">
                                <span
                                  className={`rounded px-2 py-0.5 ${
                                    isLive
                                      ? 'bg-rose-600 text-white animate-pulse'
                                      : isUpcoming
                                      ? 'bg-purple-600 text-purple-100'
                                      : 'bg-emerald-600 text-white'
                                  }`}
                                >
                                  {isLive ? 'LIVE' : isUpcoming ? 'UPCOMING' : 'ENDED'}
                                </span>

                                <span className="flex items-center gap-1 text-slate-400">
                                  <Clock className="h-3 w-3 text-slate-500" />
                                  <span>{cls.startTime ? formatTimeOnly(cls.startTime) : '10:00 AM'}</span>
                                </span>
                              </div>

                              <h4 className="text-xs font-semibold text-white line-clamp-2 mt-1 border-t border-white/[0.08] pt-2">
                                {cls.topic || cls.name}
                              </h4>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Today's Notes Section matching video 00:23 */}
                <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 sm:p-7 shadow-2xl">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Today's Notes</h2>

                  {todaysNotesList.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400">
                      No notes are scheduled today.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todaysNotesList.map((nt, idx) => {
                        const att = nt.attachmentIds?.[0];
                        const pdfUrl = att?.baseUrl ? `${att.baseUrl}${att.key || ''}` : '';
                        const dateFormatted = nt.date
                          ? new Date(nt.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
                          : '19 OCT';

                        return (
                          <div
                            key={nt._id || idx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#101524] p-4 transition hover:border-purple-500/30"
                          >
                            <div className="flex items-start gap-3.5">
                              {/* Blue Squircle File Icon */}
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 shrink-0">
                                <FileText className="h-6 w-6" />
                              </div>

                              <div className="min-w-0">
                                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                                  {nt.note || 'ANSWER KEY'} • {dateFormatted.toUpperCase()}
                                </span>
                                <h3 className="mt-1 text-sm font-bold text-white leading-snug">
                                  {nt.topic}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">{nt.subjectName}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {pdfUrl ? (
                                <a
                                  href={pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-slate-200 transition"
                                >
                                  <Eye className="h-3.5 w-3.5 text-purple-400" />
                                  <span>View Note</span>
                                </a>
                              ) : (
                                <button
                                  onClick={() => showAlert(`Notes PDF is being prepared for: ${nt.topic}`)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-slate-200 transition"
                                >
                                  <Eye className="h-3.5 w-3.5 text-purple-400" />
                                  <span>View Note</span>
                                </button>
                              )}

                              {pdfUrl ? (
                                <a
                                  href={pdfUrl}
                                  target="_blank"
                                  download
                                  className="p-2 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 text-slate-300"
                                  title="Download PDF"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              ) : (
                                <button
                                  onClick={() => showAlert(`Downloading: ${nt.topic}`)}
                                  className="p-2 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 text-slate-300"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ANNOUNCEMENTS (Matching video 00:33 - 00:54) */}
            {activeTab === 'announcements' && (
              <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 sm:p-7 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
                  <h2 className="text-xl font-bold text-white">📢 Announcements</h2>
                  <button
                    onClick={() => setActiveTab('classes')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                  >
                    ← Back to Batch
                  </button>
                </div>

                {loadingAnnouncements ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-[#101524] p-4 space-y-3">
                        <div className="skeleton-shimmer h-10 w-10 rounded-full"></div>
                        <div className="skeleton-shimmer h-4 w-3/4 rounded"></div>
                        <div className="skeleton-shimmer h-24 w-full rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-xs text-slate-400">
                    No announcements available right now.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {announcements.map((ann, i) => (
                      <div
                        key={ann._id || i}
                        className="rounded-xl border border-white/10 bg-[#101524] p-4 flex flex-col justify-between shadow-md"
                      >
                        <div>
                          {/* PW Team Avatar & Timestamp */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 font-extrabold text-xs">
                              PW
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">PW Team</h4>
                              <p className="text-[11px] text-slate-400">
                                {ann.scheduleTime
                                  ? new Date(ann.scheduleTime).toLocaleString()
                                  : 'Recent update'}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line mb-3">
                            {ann.announcement}
                          </p>
                        </div>

                        {/* Image Attachment Preview if provided */}
                        {ann.attachment && (
                          <div
                            onClick={() =>
                              setPreviewImage(
                                (ann.attachment?.baseUrl || '') + (ann.attachment?.key || '')
                              )
                            }
                            className="mt-2 aspect-video w-full overflow-hidden rounded-lg bg-black/40 cursor-pointer border border-white/10 hover:border-purple-500/40 transition"
                          >
                            <img
                              src={(ann.attachment?.baseUrl || '') + (ann.attachment?.key || '')}
                              alt="Announcement"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {hasMoreAnnouncements && !loadingAnnouncements && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={handleLoadMoreAnnouncements}
                      disabled={loadingMoreAnnouncements}
                      className="rounded-xl border border-purple-500/30 bg-purple-600/10 hover:bg-purple-600 hover:text-white px-6 py-2.5 text-xs font-semibold text-purple-200 transition disabled:opacity-40 cursor-pointer"
                    >
                      {loadingMoreAnnouncements ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: TESTS (Matching video 00:55 - 01:05) */}
            {activeTab === 'tests' && (
              <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 sm:p-7 shadow-2xl">
                <div className="border-b border-white/[0.08] pb-4 mb-6">
                  <h2 className="text-xl font-bold text-white">Tests</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Batch tests, practice tests and PYQs</p>
                </div>

                {loadingTests ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-[#101524] p-5 space-y-3">
                        <div className="skeleton-shimmer h-5 w-3/4 rounded"></div>
                        <div className="skeleton-shimmer h-4 w-1/2 rounded"></div>
                        <div className="skeleton-shimmer h-4 w-1/3 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : tests.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-xs text-slate-400">
                    No tests scheduled for this batch right now.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tests.map((t) => (
                      <div
                        key={t._id}
                        className="rounded-xl border border-white/10 bg-[#101524] p-5 flex flex-col justify-between shadow-md hover:border-purple-500/30 transition"
                      >
                        <div>
                          <h3 className="text-base font-bold text-white line-clamp-2">{t.name}</h3>

                          {/* Stats Row */}
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <FileQuestion className="h-3.5 w-3.5 text-purple-400" />
                              <span>{t.totalQuestions || 48} Questions</span>
                            </span>
                            <span>|</span>
                            <span>{t.totalMarks || 192} Marks</span>
                            <span>|</span>
                            <span>{t.maxDuration || 60} Mins</span>
                            <span>|</span>
                            <span>Attempts: {t.attempts || 0}</span>
                          </div>

                          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                            <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                            <span>Started on {formatDate(t.startTime)}, 10:00 am</span>
                          </div>

                          {/* View Syllabus Link */}
                          <button
                            onClick={() => handleViewSyllabus(t)}
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-2 cursor-pointer"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>View Syllabus</span>
                          </button>
                        </div>

                        {/* Right Start Test Action Button */}
                        <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-4">
                          <span className="text-[11px] text-slate-400">
                            Max Score: <strong className="text-white">{t.totalMarks || 192}</strong>
                          </span>

                          <button
                            onClick={() => {
                              navigate(
                                `/practice-v2/test/${t._id}/instructions?type=Start&source=BATCH_TEST_SERIES&batchId=${batchIdParam}&mode=Online`
                              );
                            }}
                            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/30 transition cursor-pointer"
                          >
                            <span>Start</span>
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white">
                              <ArrowRight className="h-3 w-3" />
                            </div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            LEVEL 2: SUBJECT VIEW (Chapters List matching video 01:29 - 01:34)
            ======================================================== */}
        {currentLevel === 'subject' && selectedSubject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-white">{selectedSubject.subject}</h1>
              <span className="text-xs text-purple-300 font-semibold bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20">
                {chapters.length} Chapters
              </span>
            </div>

            <section className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 sm:p-7 shadow-2xl">
              <h2 className="text-lg font-bold text-white mb-4">Chapters</h2>

              {loadingChapters ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-[#101524] p-4 space-y-2">
                      <div className="skeleton-shimmer h-5 w-3/4 rounded"></div>
                      <div className="skeleton-shimmer h-4 w-1/2 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : chapters.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-10 text-center text-xs text-slate-400">
                  No chapters available for this subject.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {chapters.map((ch) => (
                    <article
                      key={ch._id}
                      onClick={() => handleOpenChapter(ch)}
                      className="cursor-pointer rounded-xl border border-white/10 bg-[#101524] p-4 transition hover:border-purple-500/40 hover:bg-white/[0.03] group shadow-sm"
                    >
                      {/* Purple Left Border Marker */}
                      <div className="rounded border-l-4 border-purple-500 pl-3">
                        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition">
                          {ch.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {ch.videos ?? 0} Videos <span className="mx-1">|</span> {ch.exercises ?? 0} Exercises{' '}
                          <span className="mx-1">|</span> {ch.notes ?? 0} Notes
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {hasMoreChapters && !loadingChapters && chapters.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleLoadMoreChapters}
                    disabled={loadingMoreChapters}
                    className="rounded-xl border border-purple-500/30 bg-purple-600/10 hover:bg-purple-600 hover:text-white px-6 py-2.5 text-xs font-semibold text-purple-200 transition disabled:opacity-40 cursor-pointer"
                  >
                    {loadingMoreChapters ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ========================================================
            LEVEL 3: CHAPTER CONTENT (Lectures, DPPs, Notes, DPP PDFs, DPP Videos matching video 01:36 - 02:58)
            ======================================================== */}
        {currentLevel === 'chapter' && selectedChapter && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-white">{selectedChapter.name}</h1>
              <p className="text-xs text-purple-300 mt-1">{selectedSubject?.subject}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-5 sm:p-7 shadow-2xl">
              {/* 5 Content Tabs matching learnxpw.site video */}
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4 mb-6 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setChapterTab('lectures')}
                  className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                    chapterTab === 'lectures'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Lectures ({chapterVideos.length})
                </button>

                <button
                  onClick={() => setChapterTab('dpps')}
                  className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                    chapterTab === 'dpps'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  DPPs ({chapterDpps.length})
                </button>

                <button
                  onClick={() => setChapterTab('notes')}
                  className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                    chapterTab === 'notes'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Notes ({chapterNotes.length})
                </button>

                <button
                  onClick={() => setChapterTab('dpp-pdf')}
                  className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                    chapterTab === 'dpp-pdf'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  DPP PDFs ({chapterDppPdfs.length})
                </button>

                <button
                  onClick={() => setChapterTab('dpp-videos')}
                  className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                    chapterTab === 'dpp-videos'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  DPP Videos ({chapterDppVideos.length})
                </button>
              </div>

              {renderChapterContent()}
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Syllabus Drawer */}
      {activeSyllabus && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setActiveSyllabus(null)}>
          <aside
            className="w-full max-w-lg bg-[#0d1222] border-l border-white/10 h-full overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wider">Exam Syllabus</span>
                <h3 className="text-base font-bold text-white">{activeSyllabus.name}</h3>
              </div>
              <button
                onClick={() => setActiveSyllabus(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingSyllabus ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-purple-400 mb-2" />
                Loading detailed syllabus...
              </div>
            ) : (
              <div
                className="prose prose-invert prose-xs sm:prose-sm max-w-none text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: activeSyllabus.html }}
              />
            )}
          </aside>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl w-full p-2 bg-[#0d1222] border border-white/10 rounded-2xl shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black transition"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={previewImage} alt="Visual Announcement" className="max-h-[80vh] w-auto mx-auto rounded-xl object-contain" />
          </div>
        </div>
      )}
    </main>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  fetchPiCategories,
  fetchPiCategoryChildren,
  fetchPiWidgets,
  fetchPiWidgetContentList,
  fetchPiWidgetContinueWatching,
  fetchPiTeacherContent,
  fetchPiSubjectContent,
  fetchPiWidgetFilter,
  searchPiContent,
  fetchPiPlaylistDetails,
  fetchPiVideoDetails,
  fetchPiVideoStream,
} from '../api/client';
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Heart,
  Clock,
  Play,
  ArrowLeft,
  Download,
  BookOpen,
  FileText,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  FastForward,
} from 'lucide-react';

// Exact authentic Pi Logo SVG Data URI from learnxpw.site
const PI_LOGO_SVG =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzQiIHZpZXdCb3g9IjAgMCAzNCAzNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIzLjY3OTcgMjMuMTYyMlY4LjQ4NTM1SDI4LjE4OTNWMjMuMTYyMkgyMy42Nzk3WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTkuOTMwMjUgMzAuNTk5M0g1LjQzODQ4VjguNDg1NjhIOS45ODM3M1YxMC44NjMzQzEwLjEyNjMgMTAuNTE3NyAxMC40MzUzIDEwLjEyNDQgMTAuOTEwNiA5LjY4MzQzQzExLjM4NTkgOS4yNDI0NyAxMi4wMDM4IDguODYxMSAxMi43NjQ0IDguNTM5MzFDMTMuNTM2NyA4LjIxNzUzIDE0LjQxNjEgOC4wNTY2NCAxNS40MDI0IDguMDU2NjRDMTYuNzkyNyA4LjA1NjY0IDE4LjAwNDggOC4zOTYzIDE5LjAzODYgOS4wNzU2MkMyMC4wNzI0IDkuNzU0OTQgMjAuODY4NiAxMC42ODQ1IDIxLjQyNzEgMTEuODY0NEMyMS45OTc0IDEzLjAzMjQgMjIuMjgyNiAxNC4zNTUyIDIyLjI4MjYgMTUuODMzMUMyMi4yODI2IDE3LjMxMDkgMjEuOTg1NiAxOC42Mzk3IDIxLjM5MTQgMTkuODE5NkMyMC43OTczIDIwLjk4NzUgMTkuOTcxNCAyMS45MTEyIDE4LjkxMzggMjIuNTkwNUMxNy44NTYyIDIzLjI1NzkgMTYuNjI2MyAyMy41OTE2IDE1LjIyNDEgMjMuNTkxNkMxNC4xNjY1IDIzLjU5MTYgMTMuMjU3NSAyMy40MDA5IDEyLjQ5NyAyMy4wMTk1QzExLjczNjUgMjIuNjM4MiAxMS4xNDIzIDIyLjIwOTEgMTAuNzE0NSAyMS43MzI0QzEwLjI4NjcgMjEuMjU1NyAxMC4wMjUzIDIwLjg4MDMgOS45MzAyNSAyMC42MDYyVjMwLjU5OTNaTTE3Ljg0NDMgMTUuODMzMUMxNy44NDQzIDE1LjAxMDcgMTcuNjY2MSAxNC4yODk3IDE3LjMwOTYgMTMuNjdDMTYuOTY1IDEzLjAzODMgMTYuNTAxNiAxMi41NDk3IDE1LjkxOTMgMTIuMjA0MUMxNS4zMzcgMTEuODQ2NSAxNC42ODk0IDExLjY2NzggMTMuOTc2NCAxMS42Njc4QzEzLjIyNzggMTEuNjY3OCAxMi41NTA1IDExLjg0NjUgMTEuOTQ0NCAxMi4yMDQxQzExLjMzODQgMTIuNTYxNiAxMC44NTcxIDEzLjA1NjIgMTAuNTAwNiAxMy42ODc4QzEwLjE1NiAxNC4zMDc2IDkuOTgzNzMgMTUuMDIyNiA5Ljk4MzczIDE1LjgzMzFDOS45ODM3MyAxNi42NDM1IDEwLjE1NiAxNy4zNjQ1IDEwLjUwMDYgMTcuOTk2MUMxMC44NTcxIDE4LjYxNTkgMTEuMzM4NCAxOS4xMDQ1IDExLjk0NDQgMTkuNDYyQzEyLjU1MDUgMTkuODA3NyAxMy4yMjc4IDE5Ljk4MDUgMTMuOTc2NCAxOS45ODA1QzE0LjY4OTQgMTkuOTgwNSAxNS4zMzcgMTkuODA3NyAxNS45MTkzIDE5LjQ2MkMxNi41MDE2IDE5LjExNjQgMTYuOTY1IDE4LjYzMzcgMTcuMzA5NiAxOC4wMTRDMTcuNjY2MSAxNy4zODI0IDE3Ljg0NDMgMTYuNjU1NCAxNy44NDQzIDE1LjgzMzFaIiBmaWxsPSJ3aGl0ZSIvPgo8ZWxsaXBzZSBjeD0iMjUuOTM0NiIgY3k9IjQuNDY0NzIiIHJ4PSIyLjYyNjk4IiByeT0iMi43NjY5NyIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzM2NzZfNjkxMSkiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8zNjc2XzY5MTEiIHgxPSIyNS45MzQ2IiB5MT0iMS42OTc3NSIgeDI9IjI1LjkzNDYiIHkyPSI3LjIzMTY5IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGREY0NDAiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkRCRDM4Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==';

// Helper: build thumbnail image URL matching learnxpw.site
function getThumbnailUrl(thumbnail: any, type: 'square' | 'portrait' | 'landscape' = 'square'): string | null {
  if (!thumbnail) return null;
  const specific = thumbnail[type];
  if (specific?.baseUrl && specific?.key) {
    return `${specific.baseUrl}${specific.key}`;
  }
  const fallback = thumbnail.landscape || thumbnail.square || thumbnail.portrait;
  if (fallback?.baseUrl && fallback?.key) {
    return `${fallback.baseUrl}${fallback.key}`;
  }
  return null;
}

// Helper: format duration in minutes:seconds or hours:minutes:seconds
function formatDuration(duration?: number): string {
  if (duration === undefined || isNaN(duration) || duration < 0) return '0:00';
  const total = Math.floor(duration);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}

// LocalStorage helpers for saved videos and watch history
const SAVED_KEY = 'pi_saved_videos';
const HISTORY_KEY = 'pi_watch_history';

function getSavedVideos(): any[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function isVideoSaved(id: string): boolean {
  return getSavedVideos().some(v => v?._id === id);
}

function toggleSaveVideo(video: any): boolean {
  const list = getSavedVideos();
  const exists = list.some(v => v?._id === video._id);
  const updated = exists ? list.filter(v => v?._id !== video._id) : [video, ...list];
  localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  return !exists;
}

function getWatchHistory(): any[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function recordWatchHistory(video: any) {
  if (!video || !video._id) return;
  const list = getWatchHistory();
  const filtered = list.filter(h => h?.video?._id !== video._id);
  const updated = [{ video, watchedAt: Date.now() }, ...filtered];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated.slice(0, 50)));
}

function formatWatchedAt(timestamp: number): string {
  const d = new Date(timestamp);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  return `${day}/${month} at ${h12}:${minutes} ${ampm}`;
}

export const PiPage: React.FC = () => {
  // Page / Flow states
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentGoalId, setCurrentGoalId] = useState<string | null>(null);
  const [currentGoalName, setCurrentGoalName] = useState<string | null>(null);

  // Goal Selector modal/view state
  const [isGoalSelectorOpen, setIsGoalSelectorOpen] = useState(false);
  const [goalSelectorList, setGoalSelectorList] = useState<any[]>([]);
  const [goalSelectorTitle, setGoalSelectorTitle] = useState('Choose your Goal');
  const [goalSelectorLoading, setGoalSelectorLoading] = useState(false);
  const [goalSelectorParent, setGoalSelectorParent] = useState<any | null>(null);

  // Feed states
  const [widgets, setWidgets] = useState<any[]>([]);
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  // Modals & Subviews
  const [activeView, setActiveView] = useState<'feed' | 'library'>('feed');
  const [librarySubView, setLibrarySubView] = useState<'main' | 'saved' | 'history'>('main');
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, any[]>>({});
  const [loadingCategoryChildren, setLoadingCategoryChildren] = useState<string | null>(null);

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // View All / Subject modal
  const [viewAllModal, setViewAllModal] = useState<{
    open: boolean;
    title: string;
    items: any[];
    loading: boolean;
  }>({ open: false, title: '', items: [], loading: false });

  const [subjectModal, setSubjectModal] = useState<{
    open: boolean;
    widget: any;
    subject: any;
    teachers: any[];
    selectedTeacherId: string | null;
    items: any[];
    loading: boolean;
  }>({
    open: false,
    widget: null,
    subject: null,
    teachers: [],
    selectedTeacherId: null,
    items: [],
    loading: false,
  });

  // Video / Playlist Player
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  // Check URL query parameters for direct play links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vId = params.get('videoid');
    const pId = params.get('playlistid');
    if (vId) setActiveVideoId(vId);
    if (pId) setActivePlaylistId(pId);
  }, []);

  // Initial Load & Goal check
  useEffect(() => {
    let active = true;
    const storedCatId = localStorage.getItem('selectedCategoryId');
    const storedCatName = localStorage.getItem('selectedCategoryName');

    fetchPiCategories()
      .then(cats => {
        if (!active) return;
        setCategories(cats || []);
        if (storedCatId) {
          setCurrentGoalId(storedCatId);
          setCurrentGoalName(storedCatName || 'Category');
          setIsGoalSelectorOpen(false);
        } else {
          setGoalSelectorList(cats || []);
          setIsGoalSelectorOpen(true);
        }
        setInitialLoading(false);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        if (active) {
          setInitialLoading(false);
          setIsGoalSelectorOpen(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Feed loader whenever currentGoalId changes
  useEffect(() => {
    if (!currentGoalId || isGoalSelectorOpen) return;
    let active = true;
    setFeedLoading(true);
    setWidgets([]);
    setHeroBanners([]);

    const targetCatId = currentGoalId === 'all' ? undefined : currentGoalId;

    fetchPiWidgets(targetCatId, 1, 30)
      .then(async widgetList => {
        if (!active) return;
        const list = widgetList || [];
        const hero = list.find(w => w.type === 'Hero Banner');
        const regular = list.filter(w => w.type !== 'Hero Banner');
        setWidgets(regular);

        if (hero) {
          try {
            const heroItems = await fetchPiWidgetContentList(hero._id, 1, 30);
            if (active) setHeroBanners(heroItems || []);
          } catch (e) {
            console.error('Failed to load hero banner items:', e);
          }
        }
      })
      .catch(e => console.error('Failed to load widgets:', e))
      .finally(() => {
        if (active) setFeedLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentGoalId, isGoalSelectorOpen]);

  // Handle Goal Click in Goal Selector
  const handleGoalCardClick = async (cat: any) => {
    if (cat.childCount && cat.childCount > 0) {
      setGoalSelectorLoading(true);
      try {
        const children = await fetchPiCategoryChildren(cat._id);
        setGoalSelectorParent(cat);
        setGoalSelectorTitle(cat.name);
        setGoalSelectorList(children || []);
      } catch (err) {
        console.error('Failed to fetch category children:', err);
      } finally {
        setGoalSelectorLoading(false);
      }
    } else {
      selectGoal(cat._id, cat.name);
    }
  };

  const selectGoal = (id: string, name: string) => {
    localStorage.setItem('selectedCategoryId', id);
    localStorage.setItem('selectedCategoryName', name);
    setCurrentGoalId(id);
    setCurrentGoalName(name);
    setIsGoalSelectorOpen(false);
    setIsCategoryDrawerOpen(false);
    setGoalSelectorParent(null);
  };

  const handleSwitchGoal = () => {
    localStorage.removeItem('selectedCategoryId');
    localStorage.removeItem('selectedCategoryName');
    setCurrentGoalId(null);
    setCurrentGoalName(null);
    setGoalSelectorParent(null);
    setGoalSelectorTitle('Choose your Goal');
    setGoalSelectorList(categories);
    setIsCategoryDrawerOpen(false);
    setIsGoalSelectorOpen(true);
    setActiveView('feed');
  };

  // Rotating placeholder words
  const placeholderWords = ['Concept', 'Teacher', 'Subject'];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setPlaceholderIndex(i => (i + 1) % placeholderWords.length);
    }, 2500);
    return () => clearInterval(t);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearchLoading(true);
      searchPiContent(searchQuery.trim(), 1, 20)
        .then(results => {
          setSearchResults(results || []);
        })
        .catch(err => {
          console.error('Search error:', err);
          setSearchResults([]);
        })
        .finally(() => setSearchLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Drawer Category Accordion Toggle
  const toggleDrawerCategoryChildren = async (cat: any) => {
    if (expandedCategories[cat._id]) {
      const next = { ...expandedCategories };
      delete next[cat._id];
      setExpandedCategories(next);
      return;
    }
    setLoadingCategoryChildren(cat._id);
    try {
      const children = await fetchPiCategoryChildren(cat._id);
      setExpandedCategories(prev => ({ ...prev, [cat._id]: children || [] }));
    } catch (e) {
      console.error('Error fetching children in drawer:', e);
    } finally {
      setLoadingCategoryChildren(null);
    }
  };

  // Open Player with URL state update
  const handleOpenVideo = (videoId: string, playlistId?: string) => {
    setActiveVideoId(videoId);
    if (playlistId) setActivePlaylistId(playlistId);
    const newUrl = playlistId
      ? `/study/pi?playlistid=${encodeURIComponent(playlistId)}&videoid=${encodeURIComponent(videoId)}`
      : `/study/pi?videoid=${encodeURIComponent(videoId)}`;
    window.history.pushState(null, '', newUrl);
  };

  const handleOpenPlaylist = (playlistId: string) => {
    setActivePlaylistId(playlistId);
    setActiveVideoId(null);
    window.history.pushState(null, '', `/study/pi?playlistid=${encodeURIComponent(playlistId)}`);
  };

  const handleClosePlayer = () => {
    setActiveVideoId(null);
    setActivePlaylistId(null);
    window.history.pushState(null, '', '/study/pi');
  };

  // Open View All Modal
  const openViewAll = async (title: string, fetchFn: (page: number) => Promise<any[]>) => {
    setViewAllModal({
      open: true,
      title,
      items: [],
      loading: true,
    });
    try {
      const initial = await fetchFn(1);
      setViewAllModal({
        open: true,
        title,
        items: initial || [],
        loading: false,
      });
    } catch {
      setViewAllModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Open Subject Modal
  const openSubjectModal = async (widget: any, subject: any) => {
    setSubjectModal({
      open: true,
      widget,
      subject,
      teachers: [],
      selectedTeacherId: null,
      items: [],
      loading: true,
    });

    try {
      const [teachers, items] = await Promise.all([
        fetchPiWidgetFilter(widget._id, 'Teacher').catch(() => []),
        fetchPiSubjectContent(widget._id, subject, 1, 30).catch(() => []),
      ]);

      setSubjectModal(prev => ({
        ...prev,
        teachers: teachers || [],
        items: items || [],
        loading: false,
      }));
    } catch (e) {
      console.error(e);
      setSubjectModal(prev => ({ ...prev, loading: false }));
    }
  };

  const filterSubjectModalTeacher = async (teacherId: string | null) => {
    if (!subjectModal.widget || !subjectModal.subject) return;
    setSubjectModal(prev => ({
      ...prev,
      selectedTeacherId: teacherId,
      loading: true,
      items: [],
    }));
    try {
      const items = await fetchPiSubjectContent(
        subjectModal.widget._id,
        subjectModal.subject,
        1,
        30,
        teacherId || undefined
      );
      setSubjectModal(prev => ({
        ...prev,
        items: items || [],
        loading: false,
      }));
    } catch {
      setSubjectModal(prev => ({ ...prev, loading: false }));
    }
  };

  // 1. Initial Loading Screen
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#101014] max-w-sm mx-auto flex flex-col p-4 items-center justify-center md:max-w-2xl">
        <div className="py-4 flex justify-center mb-6">
          <img src={PI_LOGO_SVG} alt="Pi Logo" width={82} height={40} className="object-contain" />
        </div>
        <div className="animate-pulse rounded-md bg-white/10 h-8 w-48 mb-2"></div>
        <div className="animate-pulse rounded-md bg-white/10 h-4 w-64 mb-8"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 w-full aspect-square rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Goal Selection Screen ("Choose your Goal")
  if (isGoalSelectorOpen) {
    return (
      <div className="min-h-screen bg-[#101014] max-w-sm mx-auto md:max-w-4xl flex flex-col p-4">
        <div className="py-4 flex justify-center items-center relative">
          {goalSelectorParent && (
            <button
              onClick={() => {
                setGoalSelectorParent(null);
                setGoalSelectorTitle('Choose your Goal');
                setGoalSelectorList(categories);
              }}
              className="absolute left-0 p-2 text-white hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          )}
          <img src={PI_LOGO_SVG} alt="Pi Logo" width={82} height={40} className="object-contain" />
        </div>

        <div className="text-center py-6">
          <h1 className="text-xl md:text-2xl font-bold text-white">{goalSelectorTitle}</h1>
          <p className="text-white/50 text-sm mt-1">Select a category to continue</p>
        </div>

        {goalSelectorLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white/5 w-full aspect-square rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 content-start overflow-y-auto pb-10">
            {goalSelectorList.map(cat => (
              <button
                key={cat._id}
                onClick={() => handleGoalCardClick(cat)}
                className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 transition hover:bg-white/5 hover:border-white/20 flex flex-col gap-3 items-center justify-center aspect-square text-center active:scale-[0.98]"
              >
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-16 h-16 object-contain" />
                ) : (
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white/60 text-2xl font-bold">
                    {cat.name?.charAt(0) || 'P'}
                  </div>
                )}
                <p className="text-white font-medium text-sm leading-tight line-clamp-2">{cat.name}</p>
                {cat.childCount && cat.childCount > 0 ? (
                  <span className="text-[11px] text-white/40">{cat.childCount} subcategories</span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. Video / Playlist Player View
  if (activeVideoId || activePlaylistId) {
    return (
      <PiPlayerView
        videoId={activeVideoId}
        playlistId={activePlaylistId}
        onClose={handleClosePlayer}
        onSelectEpisode={vId => handleOpenVideo(vId, activePlaylistId || undefined)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#101014] text-white flex flex-col">
      {/* Sticky Top Header matching learnxpw.site */}
      <header
        className="flex items-center justify-between gap-5 w-full sticky top-0 z-40 px-4 md:px-6 py-2.5 bg-[#09090B] border-b border-white/[0.06]"
        style={{ left: 0, right: 0 }}
      >
        <div className="flex items-center gap-6">
          <img src={PI_LOGO_SVG} alt="Pi Logo" width={42} height={22} className="object-contain" />
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveView('feed')}
              className={`text-sm font-semibold transition ${
                activeView === 'feed' ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveView('library');
                setLibrarySubView('main');
              }}
              className={`text-sm font-semibold transition ${
                activeView === 'library' ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              Library
            </button>
          </nav>
        </div>

        {/* Search Input Trigger */}
        <div
          onClick={() => setIsSearchOpen(true)}
          className="relative w-full max-w-sm cursor-pointer select-none"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 z-10" />
          <div className="w-full bg-[#1a1a1a] border border-white/5 rounded-md pl-9 pr-4 h-9 text-xs sm:text-sm text-white/40 flex items-center">
            <span>Search for a&nbsp;</span>
            <span className="font-semibold text-white/80 transition-all duration-300">
              {placeholderWords[placeholderIndex]}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {activeView === 'library' ? (
        <PiLibraryView
          subView={librarySubView}
          setSubView={setLibrarySubView}
          onOpenVideo={handleOpenVideo}
          onBackToFeed={() => setActiveView('feed')}
        />
      ) : (
        <main className="flex-1 pb-16">
          {/* Goal selection pill button matching learnxpw.site */}
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-3">
            <button
              onClick={() => setIsCategoryDrawerOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-white/10 bg-[#1a1a1a] hover:bg-white/5 transition"
            >
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4 text-white">
                <path d="M11.3333 7.33333H2.66667" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M17.3333 10.6667H2.66667" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M8 14H2.66667" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span className="text-white text-xs sm:text-sm font-medium">{currentGoalName || 'All Categories'}</span>
              <ChevronDown className="h-3 w-3 text-white/50" />
            </button>
          </div>

          {/* Hero Banner Slider */}
          {feedLoading && heroBanners.length === 0 ? (
            <div className="w-full aspect-[16/7] md:aspect-[21/8] bg-white/5 animate-pulse max-w-7xl mx-auto rounded-xl my-2 px-4"></div>
          ) : heroBanners.length > 0 ? (
            <PiHeroBannerSlider
              items={heroBanners}
              onSelect={item => {
                if (item.type === 'Playlist') {
                  handleOpenPlaylist(item._id);
                } else {
                  handleOpenVideo(item._id);
                }
              }}
            />
          ) : null}

          {/* Widgets Feed */}
          {feedLoading && widgets.length === 0 ? (
            <div className="space-y-6 px-4 md:px-6 py-6 max-w-7xl mx-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-5 w-44 bg-white/10 rounded animate-pulse"></div>
                  <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="w-56 h-32 bg-white/5 rounded-lg animate-pulse shrink-0"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-w-7xl mx-auto">
              {widgets.map(widget => (
                <PiWidgetSection
                  key={widget._id}
                  widget={widget}
                  onOpenVideo={handleOpenVideo}
                  onOpenPlaylist={handleOpenPlaylist}
                  onOpenTeacher={teacher => {
                    openViewAll(
                      `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
                      page => fetchPiTeacherContent(widget._id, teacher, page, 30)
                    );
                  }}
                  onOpenSubject={subject => openSubjectModal(widget, subject)}
                  onViewAll={() => {
                    openViewAll(widget.title, page => fetchPiWidgetContentList(widget._id, page, 30));
                  }}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* Slide-out Category Drawer */}
      {isCategoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsCategoryDrawerOpen(false)}
          ></div>
          <div className="relative z-50 w-[82%] max-w-[340px] bg-[#09090B] border-r border-white/[0.08] h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.08]">
              <h2 className="text-white font-bold text-base">All Categories</h2>
              <button
                onClick={() => setIsCategoryDrawerOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
              {categories.map(cat => {
                const isSelected = currentGoalId === cat._id;
                const hasChildren = Boolean(cat.childCount && cat.childCount > 0);
                const isExpanded = Boolean(expandedCategories[cat._id]);
                const children = expandedCategories[cat._id] || [];

                return (
                  <div key={cat._id} className="text-sm">
                    <div
                      className={`flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer transition ${
                        isSelected ? 'bg-white/10 text-white font-semibold' : 'text-white/80'
                      }`}
                      onClick={() => {
                        if (hasChildren) {
                          toggleDrawerCategoryChildren(cat);
                        } else {
                          selectGoal(cat._id, cat.name);
                        }
                      }}
                    >
                      <span className="flex-1">{cat.name}</span>
                      {hasChildren ? (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleDrawerCategoryChildren(cat);
                          }}
                          className="p-1 text-white/50 hover:text-white"
                        >
                          {loadingCategoryChildren === cat._id ? (
                            <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          ) : isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      ) : null}
                    </div>

                    {isExpanded && children.length > 0 && (
                      <div className="bg-black/30 pl-4 py-1 divide-y divide-white/[0.03]">
                        {children.map(ch => (
                          <div
                            key={ch._id}
                            onClick={() => selectGoal(ch._id, ch.name)}
                            className={`px-4 py-2.5 text-xs sm:text-sm hover:bg-white/5 cursor-pointer transition flex items-center justify-between ${
                              currentGoalId === ch._id ? 'text-cyan-400 font-semibold' : 'text-white/70'
                            }`}
                          >
                            <span>{ch.name}</span>
                            {currentGoalId === ch._id && <span className="text-xs text-cyan-400">✓</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Switch Goal Button matching learnxpw.site */}
            <div className="p-4 border-t border-white/[0.08] bg-[#0d0d10]">
              <button
                onClick={handleSwitchGoal}
                className="w-full py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm transition text-center"
              >
                Switch Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#101014] flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07]">
            <h1 className="text-white font-bold text-lg flex-1">Search</h1>
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            <div className="relative w-full bg-[#1a1a1a] border border-[#3A3A46] rounded-md h-12 flex items-center">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search lectures, topics, faculty..."
                autoFocus
                className="w-full h-full bg-transparent border-none rounded-md pl-11 pr-10 text-sm text-white placeholder-white/30 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-12">
            {searchLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-7 w-7 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : searchQuery.trim() && searchResults.length === 0 ? (
              <div className="text-center py-16 text-white/40 text-sm">
                No results found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map(item => {
                  const img = item.imageUrl || getThumbnailUrl(item.thumbnail, 'landscape');
                  const isPlaylist = item.type === 'Playlist';
                  return (
                    <div
                      key={item._id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        if (isPlaylist) {
                          handleOpenPlaylist(item._id);
                        } else {
                          handleOpenVideo(item._id);
                        }
                      }}
                      className="bg-[#17171C] border border-white/[0.06] rounded-lg overflow-hidden cursor-pointer hover:border-white/20 transition group"
                    >
                      <div className="relative aspect-[16/9] bg-gray-900 overflow-hidden">
                        {img ? (
                          <img
                            src={img}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
                            No Preview
                          </div>
                        )}
                        {item.duration ? (
                          <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-mono">
                            {formatDuration(item.duration)}
                          </div>
                        ) : null}
                      </div>
                      <div className="p-3">
                        <p className="text-white text-xs font-medium line-clamp-2 leading-snug">{item.title}</p>
                        {item.teachers?.[0]?.name && (
                          <p className="text-white/40 text-[11px] mt-1">{item.teachers[0].name}</p>
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

      {/* View All Modal */}
      {viewAllModal.open && (
        <div className="fixed inset-0 z-50 bg-[#101014] flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07]">
            <button
              onClick={() => setViewAllModal(prev => ({ ...prev, open: false }))}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-white font-bold text-base flex-1 line-clamp-1">{viewAllModal.title}</h1>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {viewAllModal.loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : viewAllModal.items.length === 0 ? (
              <div className="text-center py-20 text-white/40">No items available</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
                {viewAllModal.items.map(item => {
                  const img = item.imageUrl || getThumbnailUrl(item.thumbnail, 'landscape');
                  const isPlaylist = item.type === 'Playlist';
                  return (
                    <div
                      key={item._id}
                      onClick={() => {
                        setViewAllModal(prev => ({ ...prev, open: false }));
                        if (isPlaylist) {
                          handleOpenPlaylist(item._id);
                        } else {
                          handleOpenVideo(item._id);
                        }
                      }}
                      className="bg-[#17171C] border border-white/[0.06] rounded-lg overflow-hidden cursor-pointer hover:border-white/20 transition group"
                    >
                      <div className="relative aspect-[16/9] bg-gray-900 overflow-hidden">
                        {img && (
                          <img
                            src={img}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        )}
                        {item.duration ? (
                          <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-mono">
                            {formatDuration(item.duration)}
                          </div>
                        ) : null}
                      </div>
                      <div className="p-3">
                        <p className="text-white text-xs font-medium line-clamp-2 leading-snug">{item.title}</p>
                        {item.teachers?.[0]?.name && (
                          <p className="text-white/40 text-[11px] mt-1">{item.teachers[0].name}</p>
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

      {/* Subject Content Modal */}
      {subjectModal.open && (
        <div className="fixed inset-0 z-50 bg-[#101014] flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07]">
            <button
              onClick={() => setSubjectModal(prev => ({ ...prev, open: false }))}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-white font-bold text-base flex-1 line-clamp-1">{subjectModal.subject?.name}</h1>
          </div>

          {/* Teacher filter pills */}
          {subjectModal.teachers.length > 0 && (
            <div className="flex gap-2 overflow-x-auto p-4 border-b border-white/[0.05] scrollbar-hide">
              <button
                onClick={() => filterSubjectModalTeacher(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition shrink-0 ${
                  subjectModal.selectedTeacherId === null
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                All Faculty
              </button>
              {subjectModal.teachers.map((t: any) => {
                const name = `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name;
                const isSelected = subjectModal.selectedTeacherId === t._id;
                return (
                  <button
                    key={t._id}
                    onClick={() => filterSubjectModalTeacher(t._id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition shrink-0 ${
                      isSelected ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 pb-12">
            {subjectModal.loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : subjectModal.items.length === 0 ? (
              <div className="text-center py-20 text-white/40">No content found for this subject</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {subjectModal.items.map(item => {
                  const img = item.imageUrl || getThumbnailUrl(item.thumbnail, 'landscape');
                  const isPlaylist = item.type === 'Playlist';
                  return (
                    <div
                      key={item._id}
                      onClick={() => {
                        setSubjectModal(prev => ({ ...prev, open: false }));
                        if (isPlaylist) {
                          handleOpenPlaylist(item._id);
                        } else {
                          handleOpenVideo(item._id);
                        }
                      }}
                      className="bg-[#17171C] border border-white/[0.06] rounded-lg overflow-hidden cursor-pointer hover:border-white/20 transition group"
                    >
                      <div className="relative aspect-[16/9] bg-gray-900 overflow-hidden">
                        {img && (
                          <img
                            src={img}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        )}
                        {item.duration ? (
                          <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-mono">
                            {formatDuration(item.duration)}
                          </div>
                        ) : null}
                      </div>
                      <div className="p-3">
                        <p className="text-white text-xs font-medium line-clamp-2 leading-snug">{item.title}</p>
                        {item.teachers?.[0]?.name && (
                          <p className="text-white/40 text-[11px] mt-1">{item.teachers[0].name}</p>
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
    </div>
  );
};

// --- Sub-Components ---

// 1. Hero Banner Slider matching learnxpw.site
const PiHeroBannerSlider: React.FC<{ items: any[]; onSelect: (item: any) => void }> = ({ items, onSelect }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % items.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items || items.length === 0) return null;
  const current = items[index];
  const imgUrl = getThumbnailUrl(current.thumbnail, 'landscape') || current.imageUrl;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 my-3">
      <div
        onClick={() => onSelect(current)}
        className="relative w-full aspect-[16/7] md:aspect-[21/8] rounded-xl overflow-hidden cursor-pointer group bg-gray-900 border border-white/10 shadow-lg"
      >
        {imgUrl && (
          <img
            src={imgUrl}
            alt={current.title || 'Hero Banner'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-6">
          <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 w-fit mb-1 border border-cyan-500/30">
            Featured
          </span>
          <h2 className="text-white font-bold text-sm sm:text-lg md:text-xl line-clamp-2 max-w-2xl">{current.title}</h2>
        </div>

        {/* Dots */}
        {items.length > 1 && (
          <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
            {items.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Individual Widget Section
const PiWidgetSection: React.FC<{
  widget: any;
  onOpenVideo: (id: string) => void;
  onOpenPlaylist: (id: string) => void;
  onOpenTeacher: (teacher: any) => void;
  onOpenSubject: (subject: any) => void;
  onViewAll: () => void;
}> = ({ widget, onOpenVideo, onOpenPlaylist, onOpenTeacher, onOpenSubject, onViewAll }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchFn =
      widget.type === 'Continue Watching'
        ? fetchPiWidgetContinueWatching(widget._id, 1, 30)
        : fetchPiWidgetContentList(widget._id, 1, 30);

    fetchFn
      .then(res => {
        if (active) {
          setItems(res || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [widget._id, widget.type]);

  if (loading) {
    return (
      <div className="py-4 px-4 md:px-6">
        <div className="h-5 w-44 bg-white/10 rounded animate-pulse mb-3"></div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-48 h-28 bg-white/5 rounded-lg animate-pulse shrink-0"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  // Teacher Widget
  if (widget.type === 'Teacher Widget') {
    const bgColors = [
      'bg-amber-400 text-black',
      'bg-sky-400 text-black',
      'bg-emerald-400 text-black',
      'bg-pink-400 text-black',
      'bg-purple-400 text-white',
      'bg-orange-400 text-black',
    ];

    return (
      <div className="py-4 px-4 md:px-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold text-base md:text-lg">{widget.title}</h3>
          <button onClick={onViewAll} className="text-white/60 text-xs sm:text-sm hover:text-white transition">
            View All &rsaquo;
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.slice(0, 18).map((t, idx) => {
            const name = `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.name;
            const img = t.imageId?.baseUrl && t.imageId?.key ? `${t.imageId.baseUrl}${t.imageId.key}` : '';
            const colorClass = bgColors[idx % bgColors.length];

            return (
              <div
                key={t._id}
                onClick={() => onOpenTeacher(t)}
                className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg p-2.5 cursor-pointer border border-white/10 hover:border-white/25 transition active:scale-[0.98]"
              >
                <div className={`relative w-11 h-11 rounded-lg overflow-hidden ${colorClass} shrink-0`}>
                  {img ? (
                    <img src={img} alt={name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-lg">
                      {name.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="text-white text-xs font-medium leading-snug line-clamp-2">{name}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Subject Widget
  if (widget.type === 'Subject Widget') {
    return (
      <div className="py-4 px-4 md:px-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold text-base md:text-lg">{widget.title}</h3>
          <button onClick={onViewAll} className="text-white/60 text-xs sm:text-sm hover:text-white transition">
            View All &rsaquo;
          </button>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {items.slice(0, 20).map(s => (
            <div
              key={s._id}
              onClick={() => onOpenSubject(s)}
              className="flex items-center gap-2.5 bg-[#1a1a1a] rounded-lg px-3.5 py-2.5 cursor-pointer border border-white/5 hover:border-white/20 transition active:scale-[0.98]"
            >
              {s.icon ? (
                <img src={s.icon} alt={s.name} className="w-5 h-5 object-contain" />
              ) : (
                <BookOpen className="w-4 h-4 text-cyan-400" />
              )}
              <p className="text-white text-xs sm:text-sm font-medium">{s.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Regular Content Carousel (Landscape / Square / Portrait)
  const isLandscape = widget.layout === 'landscape' || !widget.layout;
  const isPortrait = widget.layout === 'portrait';

  return (
    <div className="py-4 px-4 md:px-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-base md:text-lg">{widget.title}</h3>
        <button onClick={onViewAll} className="text-white/60 text-xs sm:text-sm hover:text-white transition">
          View All &rsaquo;
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item, idx) => {
          const img =
            item.imageUrl ||
            getThumbnailUrl(item.thumbnail, isPortrait ? 'portrait' : isLandscape ? 'landscape' : 'square');
          const isPlaylist = item.type === 'Playlist';

          return (
            <div
              key={item._id || idx}
              onClick={() => {
                if (isPlaylist) onOpenPlaylist(item._id);
                else onOpenVideo(item._id);
              }}
              className={`shrink-0 cursor-pointer group active:scale-[0.98] transition ${
                isPortrait ? 'w-36 sm:w-44' : isLandscape ? 'w-56 sm:w-64' : 'w-36 sm:w-44'
              }`}
            >
              <div
                className={`relative w-full rounded-lg overflow-hidden bg-gray-900 border border-white/5 group-hover:border-white/20 transition ${
                  isPortrait ? 'aspect-[3/4]' : isLandscape ? 'aspect-[16/9]' : 'aspect-square'
                }`}
              >
                {img ? (
                  <img
                    src={img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">PW PI</div>
                )}

                {/* Duration or Video count badge */}
                {isPlaylist ? (
                  <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-medium">
                    {item.videosCount || item.numberOfVideos || 0} videos
                  </div>
                ) : item.duration ? (
                  <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-mono">
                    {formatDuration(item.duration)}
                  </div>
                ) : null}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-white text-xs sm:text-sm font-medium line-clamp-2 leading-tight">{item.title}</p>
                {item.teachers?.[0]?.name && <p className="text-white/40 text-[11px] mt-1">{item.teachers[0].name}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3. My Library View
const PiLibraryView: React.FC<{
  subView: 'main' | 'saved' | 'history';
  setSubView: (view: 'main' | 'saved' | 'history') => void;
  onOpenVideo: (id: string) => void;
  onBackToFeed: () => void;
}> = ({ subView, setSubView, onOpenVideo, onBackToFeed }) => {
  const [saved, setSaved] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setSaved(getSavedVideos());
    setHistory(getWatchHistory());
  }, [subView]);

  if (subView === 'saved') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4 w-full">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSubView('main')}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-white text-lg font-bold">Saved Videos ({saved.length})</h1>
        </div>

        {saved.length === 0 ? (
          <div className="text-center py-20 text-white/40 text-sm">No saved videos yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {saved.map(item => (
              <div
                key={item._id}
                onClick={() => onOpenVideo(item._id)}
                className="bg-[#17171C] border border-white/[0.06] rounded-lg overflow-hidden cursor-pointer hover:border-white/20 transition group"
              >
                <div className="aspect-[16/9] bg-gray-900 relative">
                  <img
                    src={item.imageUrl || getThumbnailUrl(item.thumbnail, 'landscape') || ''}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  {item.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white">
                      {formatDuration(item.duration)}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-white text-xs font-medium line-clamp-2">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (subView === 'history') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-4 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubView('main')}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-white text-lg font-bold">Watch History</h1>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => {
                localStorage.removeItem(HISTORY_KEY);
                setHistory([]);
              }}
              className="text-xs text-red-400 hover:underline"
            >
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20 text-white/40 text-sm">No watch history yet</div>
        ) : (
          <div className="space-y-3">
            {history.map((h, i) => {
              const v = h.video;
              return (
                <div
                  key={i}
                  onClick={() => onOpenVideo(v._id)}
                  className="bg-[#17171C] border border-white/[0.06] rounded-lg p-3 flex items-center gap-4 cursor-pointer hover:border-white/20 transition"
                >
                  <div className="w-24 aspect-[16/9] bg-gray-900 rounded overflow-hidden shrink-0">
                    <img
                      src={v.imageUrl || getThumbnailUrl(v.thumbnail, 'landscape') || ''}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs sm:text-sm font-medium line-clamp-2">{v.title}</p>
                    <p className="text-white/40 text-[11px] mt-1">{formatWatchedAt(h.watchedAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Main Library Hub
  const latestHistory = history[0];

  return (
    <div className="px-4 pt-4 pb-24 max-w-md mx-auto w-full">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBackToFeed} className="text-xs text-white/50 hover:text-white">
          &larr; Back to Home
        </button>
      </div>

      <h1 className="text-white text-lg font-bold mb-4">My Library</h1>
      <div className="space-y-3">
        {/* Saved Videos Card */}
        <div
          onClick={() => setSubView('saved')}
          className="bg-[#17171C] border border-white/[0.06] rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] active:scale-[0.98] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-md overflow-hidden bg-black flex-shrink-0 flex items-center justify-center">
              {saved.length > 0 && saved[0].thumbnail ? (
                <img
                  src={getThumbnailUrl(saved[0].thumbnail, 'square') || ''}
                  alt={saved[0].title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Heart className="h-6 w-6 text-white/40" />
              )}
            </div>
            <div>
              <p className="text-white text-sm font-medium">Saved Videos</p>
              <p className="text-white/50 text-xs mt-0.5">
                {saved.length} video{saved.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </div>

        {/* Watch History Card */}
        <div
          onClick={() => setSubView('history')}
          className="bg-[#17171C] border border-white/[0.06] rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] active:scale-[0.98] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-md overflow-hidden grid grid-cols-2 grid-rows-2 gap-0 bg-black flex-shrink-0">
              {history.slice(0, 4).map((h, idx) => (
                <img
                  key={idx}
                  src={getThumbnailUrl(h.video.thumbnail, 'square') || ''}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ))}
              {history.length === 0 && (
                <div className="col-span-2 row-span-2 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white/40" />
                </div>
              )}
            </div>
            <div>
              <p className="text-white text-sm font-medium">Watch History</p>
              {latestHistory ? (
                <p className="text-white/50 text-xs mt-0.5">Last: {formatWatchedAt(latestHistory.watchedAt)}</p>
              ) : (
                <p className="text-white/50 text-xs mt-0.5">No recent videos</p>
              )}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-white/40" />
        </div>
      </div>
    </div>
  );
};

// 4. Video & Playlist Player (DRM/MPD & Streaming Player)
const PiPlayerView: React.FC<{
  videoId: string | null;
  playlistId: string | null;
  onClose: () => void;
  onSelectEpisode: (videoId: string) => void;
}> = ({ videoId, playlistId, onClose, onSelectEpisode }) => {
  const [loading, setLoading] = useState(true);
  const [videoDetails, setVideoDetails] = useState<any>(null);
  const [playlistDetails, setPlaylistDetails] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [streamData, setStreamData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'episodes' | 'attachments'>('episodes');

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Load Playlist details if active
  useEffect(() => {
    if (!playlistId) return;
    fetchPiPlaylistDetails(playlistId).then(data => {
      if (data) {
        setPlaylistDetails(data);
        const list = data.ottVideoDetails || [];
        setEpisodes(list);
        if (!videoId && list.length > 0) {
          onSelectEpisode(list[0]._id);
        }
      }
    });
  }, [playlistId]);

  // Load Video details & Stream URL
  useEffect(() => {
    if (!videoId) return;
    setLoading(true);
    setPlayerError(null);

    Promise.all([fetchPiVideoDetails(videoId), fetchPiVideoStream(videoId)])
      .then(([vDetails, stream]) => {
        setVideoDetails(vDetails);
        setStreamData(stream);
        setIsSaved(isVideoSaved(videoId));
        if (vDetails) recordWatchHistory(vDetails);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load video stream:', err);
        setPlayerError('Could not load stream details from upstream PW server');
        setLoading(false);
      });
  }, [videoId]);

  // Setup Shaka Player or Native Player
  useEffect(() => {
    if (!streamData?.data?.url || !videoRef.current) return;
    let shakaPlayer: any = null;
    let isCancelled = false;

    async function initShaka() {
      try {
        const shakaModule: any = await import('shaka-player');
        const shaka = shakaModule.default || shakaModule;
        if (isCancelled || !videoRef.current) return;

        if (shaka.polyfill?.installAll) {
          shaka.polyfill.installAll();
        }
        if (shaka.Player && !shaka.Player.isBrowserSupported()) {
          console.warn('Shaka not supported by browser, falling back');
          return;
        }

        shakaPlayer = new shaka.Player(videoRef.current);
        const { url, signedUrl = '', drmDetails, urlType } = streamData.data;

        const net = shakaPlayer.getNetworkingEngine();

        if (urlType === 'awsVideo') {
          const sig = signedUrl.startsWith('?') ? signedUrl : `?${signedUrl}`;
          net.registerRequestFilter((_: any, request: any) => {
            const sep = request.uris[0].includes('?') ? '&' : '?';
            const s = sep === '&' ? sig.substring(1) : sig;
            request.uris[0] = `${request.uris[0]}${sep}${s}`;
          });
          await shakaPlayer.load(`${url}${signedUrl}`);
        } else {
          net.registerRequestFilter((type: any, request: any) => {
            const reqType = shaka.net.NetworkingEngine.RequestType;
            const uri = request.uris[0];
            const isLicense = type === reqType.LICENSE;
            const isManifest = type === reqType.MANIFEST || uri.includes('.mpd') || uri.includes('.m3u8');
            const isUpstream =
              uri.includes('cloudfront.net') || uri.includes('pw.live') || uri.includes('radha-naam.site');

            if (isLicense && drmDetails?.licenseToken) {
              request.uris[0] = `/api/pi/drm-license-manager?url=${encodeURIComponent(drmDetails.licenseUrl || '')}`;
              request.headers['pallycon-customdata-v2'] = drmDetails.licenseToken;
            } else if (isManifest) {
              try {
                const u = new URL(uri);
                request.uris[0] = `/api/pi/play?url=${encodeURIComponent(u.origin + u.pathname)}&signature=${encodeURIComponent(
                  u.search
                )}`;
              } catch {
                request.uris[0] = `/api/pi/play?url=${encodeURIComponent(uri)}&signature=${encodeURIComponent(
                  signedUrl
                )}`;
              }
            } else if (isUpstream) {
              request.uris[0] = `/api/pi/play?url=${encodeURIComponent(uri)}&signature=${encodeURIComponent(
                signedUrl
              )}`;
            }
          });

          await shakaPlayer.load(url);
        }
      } catch (e: any) {
        console.error('Shaka player setup error:', e);
        if (videoRef.current) {
          videoRef.current.src = `${streamData.data.url}${streamData.data.signedUrl || ''}`;
        }
      }
    }

    initShaka();

    return () => {
      isCancelled = true;
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            if (videoRef.current) videoRef.current.pause();
          })
          .catch(() => {});
      } else if (videoRef.current) {
        videoRef.current.pause();
      }
      if (shakaPlayer) {
        shakaPlayer.destroy().catch(() => {});
      }
    };
  }, [streamData]);

  // Safe Play/Pause handlers preventing play() interruption error
  const safePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    const promise = video.play();
    if (promise !== undefined) {
      playPromiseRef.current = promise;
      promise
        .then(() => {
          playPromiseRef.current = null;
          setIsPlaying(true);
        })
        .catch((error: any) => {
          playPromiseRef.current = null;
          setIsPlaying(false);
          // Ignore expected AbortError when pause() is called while play() is pending
          if (error?.name !== 'AbortError' && !error?.message?.includes('interrupted')) {
            console.warn('Playback notice:', error);
          }
        });
    }
  };

  const safePause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playPromiseRef.current) {
      playPromiseRef.current
        .then(() => {
          video.pause();
          setIsPlaying(false);
        })
        .catch(() => {
          video.pause();
          setIsPlaying(false);
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      safePlay();
    } else {
      safePause();
    }
  };

  const seekRelative = (sec: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + sec, duration));
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleToggleSave = () => {
    if (!videoDetails) return;
    const next = toggleSaveVideo(videoDetails);
    setIsSaved(next);
  };

  const attachments = videoDetails?.attachments || [];

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col text-white">
      {/* Top Bar with Back Button */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08] bg-[#101014]">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white text-xs sm:text-sm font-semibold truncate">
            {videoDetails?.title || playlistDetails?.title || 'PW PI Classroom Stream'}
          </h1>
          {playlistDetails?.title && videoDetails?.title && (
            <p className="text-white/40 text-[10px] truncate">{playlistDetails.title}</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* Left: Video Player & Details */}
        <div className="flex-1 flex flex-col">
          {/* Player Container */}
          <div
            ref={playerContainerRef}
            className="relative w-full aspect-[16/9] bg-black overflow-hidden flex items-center justify-center group"
          >
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              onClick={togglePlay}
              onTimeUpdate={() => {
                if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) setDuration(videoRef.current.duration || 0);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Custom Overlay Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 pointer-events-none">
              <div className="flex items-center justify-between pointer-events-auto">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/60 text-white/90">
                  {videoDetails?.title || ''}
                </span>
              </div>

              {/* Center Play/Pause button */}
              <div className="flex items-center justify-center gap-6 pointer-events-auto">
                <button
                  onClick={() => seekRelative(-10)}
                  className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition shadow-lg"
                >
                  <Play className={`h-6 w-6 fill-current ${isPlaying ? 'hidden' : 'ml-0.5'}`} />
                  <span className={`font-bold text-lg ${isPlaying ? '' : 'hidden'}`}>⏸</span>
                </button>
                <button
                  onClick={() => seekRelative(10)}
                  className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition"
                >
                  <FastForward className="h-4 w-4" />
                </button>
              </div>

              {/* Bottom Control Bar */}
              <div className="space-y-2 pointer-events-auto">
                {/* Seek Bar */}
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={e => {
                    const time = Number(e.target.value);
                    if (videoRef.current) videoRef.current.currentTime = time;
                    setCurrentTime(time);
                  }}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />

                <div className="flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-3">
                    <span>
                      {formatDuration(currentTime)} / {formatDuration(duration)}
                    </span>
                    <button onClick={toggleMute} className="hover:text-cyan-400">
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={toggleFullscreen} className="hover:text-cyan-400">
                      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loading && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="h-10 w-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            )}

            {playerError && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-red-400 text-sm mb-2">{playerError}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white"
                >
                  Return to Feed
                </button>
              </div>
            )}
          </div>

          {/* Video Metadata & Actions */}
          <div className="p-4 border-b border-white/[0.06] bg-[#101014]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-bold text-white leading-snug">{videoDetails?.title}</h2>
                {videoDetails?.teachers?.length > 0 && (
                  <p className="text-white/60 text-xs mt-1">
                    Faculty: {videoDetails.teachers.map((t: any) => t.name).join(', ')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSave}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                    isSaved
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Playlist Episodes / Notes Tabs */}
        <div className="w-full lg:w-80 xl:w-96 border-l border-white/[0.08] bg-[#0d0d10] flex flex-col">
          <div className="flex border-b border-white/[0.08]">
            <button
              onClick={() => setActiveTab('episodes')}
              className={`flex-1 py-3 text-xs font-semibold text-center transition border-b-2 ${
                activeTab === 'episodes'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              Episodes {episodes.length > 0 ? `(${episodes.length})` : ''}
            </button>
            <button
              onClick={() => setActiveTab('attachments')}
              className={`flex-1 py-3 text-xs font-semibold text-center transition border-b-2 ${
                activeTab === 'attachments'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              Notes / DPPs {attachments.length > 0 ? `(${attachments.length})` : ''}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[500px] lg:max-h-[calc(100vh-140px)] divide-y divide-white/[0.04]">
            {activeTab === 'episodes' ? (
              episodes.length === 0 ? (
                <div className="p-8 text-center text-white/40 text-xs">No playlist episodes found</div>
              ) : (
                episodes.map((ep, idx) => {
                  const isActive = ep._id === videoId;
                  const thumb = ep.imageUrl || getThumbnailUrl(ep.thumbnail, 'landscape');
                  return (
                    <div
                      key={ep._id || idx}
                      onClick={() => onSelectEpisode(ep._id)}
                      className={`p-3 flex items-start gap-3 cursor-pointer hover:bg-white/5 transition ${
                        isActive ? 'bg-white/10 border-l-2 border-cyan-400' : ''
                      }`}
                    >
                      <div className="w-20 aspect-[16/9] bg-gray-900 rounded overflow-hidden shrink-0 relative">
                        {thumb && <img src={thumb} alt="" className="w-full h-full object-cover" />}
                        {isActive && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Play className="h-4 w-4 text-cyan-400 fill-current" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium line-clamp-2 ${isActive ? 'text-cyan-400' : 'text-white'}`}>
                          {ep.title}
                        </p>
                        {ep.duration && (
                          <p className="text-[10px] text-white/40 mt-1">{formatDuration(ep.duration)}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )
            ) : attachments.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-xs">No PDF notes attached to this lecture</div>
            ) : (
              attachments.map((att: any, idx: number) => {
                const pdfUrl = att.baseUrl && att.key ? `${att.baseUrl}${att.key}` : null;
                return (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-white/5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-5 w-5 text-rose-400 shrink-0" />
                      <p className="text-xs font-medium text-white line-clamp-1">{att.name}</p>
                    </div>
                    {pdfUrl && (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] shrink-0 flex items-center gap-1 transition"
                      >
                        <Download className="h-3 w-3" />
                        <span>PDF</span>
                      </a>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default PiPage;

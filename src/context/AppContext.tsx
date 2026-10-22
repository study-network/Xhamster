import React, { createContext, useContext, useState, useEffect } from 'react';
import { BatchItem, VideoLectureItem } from '../types';

interface AppContextType {
  currentPath: string;
  batchIdParam: string | null;
  activeVideo: VideoLectureItem | null;
  setActiveVideo: (vid: VideoLectureItem | null) => void;
  enrolledBatches: BatchItem[];
  watchHistory: Array<{
    batchId: string;
    subjectId: string;
    topicId: string;
    topicName: string;
    videoName: string;
    watchedAt: string;
    duration?: string;
  }>;
  navigate: (path: string, options?: { video?: VideoLectureItem }) => void;
  toggleEnrollBatch: (batch: BatchItem) => void;
  isBatchEnrolled: (batchId: string) => boolean;
  addToHistory: (entry: {
    batchId: string;
    subjectId: string;
    topicId: string;
    topicName: string;
    videoName: string;
    duration?: string;
  }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return (window.location.pathname + window.location.search) || '/';
  });

  const [activeVideo, setActiveVideo] = useState<VideoLectureItem | null>(null);

  const [enrolledBatches, setEnrolledBatches] = useState<BatchItem[]>(() => {
    try {
      const saved = localStorage.getItem('enrolledBatches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [watchHistory, setWatchHistory] = useState<Array<any>>(() => {
    try {
      const saved = localStorage.getItem('watchHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Listen to browser back/forward buttons
  useEffect(() => {
    const onPopState = () => {
      setCurrentPath((window.location.pathname + window.location.search) || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // If user has no saved enrolled batches on first visit, pre-populate with top live batches
  useEffect(() => {
    if (enrolledBatches.length === 0) {
      import('../api/client').then(({ fetchBatches }) => {
        fetchBatches(1)
          .then(({ batches }) => {
            if (batches && batches.length > 0) {
              setEnrolledBatches((prev) => {
                if (prev.length > 0) return prev;
                return batches.slice(0, 3);
              });
            }
          })
          .catch((err) => console.warn('Batch preload info:', err));
      });
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('enrolledBatches', JSON.stringify(enrolledBatches));
    } catch (e) {
      console.error(e);
    }
  }, [enrolledBatches]);

  useEffect(() => {
    try {
      localStorage.setItem('watchHistory', JSON.stringify(watchHistory));
    } catch (e) {
      console.error(e);
    }
  }, [watchHistory]);

  const navigate = (path: string, options?: { video?: VideoLectureItem }) => {
    if (options?.video) {
      setActiveVideo(options.video);
    }
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Extract batchId only if path is a genuine PW batch (not NextToppers or MissionJeet numeric IDs)
  let batchIdParam: string | null = null;
  const batchMatch = currentPath.match(/^\/study\/batches\/([^/?#]+)/);
  if (batchMatch) {
    const id = batchMatch[1];
    if (!/^\d{1,5}$/.test(id)) {
      batchIdParam = id;
    }
  }

  // Auto-correct any legacy or misrouted numeric batch paths to NextToppers / MissionJeet
  useEffect(() => {
    const match = currentPath.match(/^\/study\/batches\/([^/?#]+)/);
    if (match) {
      const id = match[1];
      if (/^\d{1,5}$/.test(id)) {
        if ([184, 185, 151, 152].includes(Number(id))) {
          navigate(`/study/missionjeet/${id}`);
        } else {
          navigate(`/study/nexttoppers/${id}`);
        }
      }
    }
  }, [currentPath]);

  const isBatchEnrolled = (batchId: string) => {
    if (typeof window !== 'undefined' && localStorage.getItem(`enrolled_${batchId}`) === 'true') {
      return true;
    }
    return enrolledBatches.some(b => (b.batchId || b._id) === batchId);
  };

  const toggleEnrollBatch = (batch: BatchItem) => {
    const id = batch.batchId || batch._id;
    if (typeof window !== 'undefined') {
      const isEnrolledFlag = localStorage.getItem(`enrolled_${id}`) === 'true';
      if (isEnrolledFlag) {
        localStorage.removeItem(`enrolled_${id}`);
      } else {
        localStorage.setItem(`enrolled_${id}`, 'true');
      }
    }

    setEnrolledBatches(prev => {
      const exists = prev.some(b => (b.batchId || b._id) === id);
      const next = exists
        ? prev.filter(b => (b.batchId || b._id) !== id)
        : [...prev, batch];
      try {
        localStorage.setItem('enrolledBatches', JSON.stringify(next));
      } catch (e) {}
      window.dispatchEvent(new Event('batchesUpdated'));
      return next;
    });
  };

  const addToHistory = (entry: {
    batchId: string;
    subjectId: string;
    topicId: string;
    topicName: string;
    videoName: string;
    duration?: string;
  }) => {
    const newEntry = {
      ...entry,
      watchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setWatchHistory(prev => [newEntry, ...prev.filter(h => h.videoName !== entry.videoName)].slice(0, 30));
  };

  return (
    <AppContext.Provider
      value={{
        currentPath,
        batchIdParam,
        activeVideo,
        setActiveVideo,
        enrolledBatches,
        watchHistory,
        navigate,
        toggleEnrollBatch,
        isBatchEnrolled,
        addToHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

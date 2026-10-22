import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { VideoPlayer } from '../components/VideoPlayer';

export const WatchPage: React.FC = () => {
  const { currentPath, navigate } = useApp();

  const queryIndex = currentPath.indexOf('?');
  const queryString = queryIndex !== -1 ? currentPath.slice(queryIndex) : window.location.search;
  const searchParams = new URLSearchParams(queryString);

  const batchId =
    searchParams.get('batchId') ||
    searchParams.get('BatchId') ||
    searchParams.get('batch_id') ||
    '';
  const subjectId =
    searchParams.get('SubjectId') ||
    searchParams.get('subjectId') ||
    searchParams.get('subject_id') ||
    '';
  const childId =
    searchParams.get('ContentId') ||
    searchParams.get('contentId') ||
    searchParams.get('ChildId') ||
    searchParams.get('childId') ||
    searchParams.get('child_id') ||
    searchParams.get('videoId') ||
    searchParams.get('video_id') ||
    '';
  const topicId =
    searchParams.get('topicId') ||
    searchParams.get('topic_id') ||
    searchParams.get('TopicId') ||
    '';
  const initialVideoUrl =
    searchParams.get('VideoUrl') ||
    searchParams.get('videoUrl') ||
    searchParams.get('video_url') ||
    searchParams.get('url') ||
    '';
  const initialTitle =
    searchParams.get('title') ||
    searchParams.get('topic') ||
    searchParams.get('name') ||
    'Lecture Classroom';
  const initialUrlType =
    searchParams.get('Type') ||
    searchParams.get('type') ||
    searchParams.get('urlType') ||
    searchParams.get('scheduleType') ||
    '';
  const initialThumbnail =
    searchParams.get('thumbnail') ||
    searchParams.get('image') ||
    '';

  // Auto-restore last watched lecture if user navigated to /watch with no query parameters
  useEffect(() => {
    if (!childId && !batchId) {
      try {
        const rawHist = localStorage.getItem('studyHistory');
        const hist = rawHist ? JSON.parse(rawHist) : [];
        if (hist.length > 0 && hist[0]?.batchId && hist[0]?.childId) {
          const h = hist[0];
          navigate(`/watch?batchId=${h.batchId}&SubjectId=${h.subjectId || ''}&ContentId=${h.childId}`);
        }
      } catch {}
    }
  }, [childId, batchId, navigate]);

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen overflow-hidden bg-black text-white select-none">
      <VideoPlayer
        key={`${batchId}-${subjectId}-${childId}`}
        videoUrl={initialVideoUrl}
        batchId={batchId}
        subjectId={subjectId}
        videoId={childId}
        topicId={topicId}
        topic={initialTitle}
        urlType={initialUrlType}
        thumbnail={initialThumbnail}
        autoplay={true}
        onBack={() => {
          if (batchId) {
            if (/^\d{1,5}$/.test(batchId)) {
              if ([184, 185, 151, 152].includes(Number(batchId))) {
                navigate(`/study/missionjeet/${batchId}`);
              } else {
                navigate(`/study/nexttoppers/${batchId}`);
              }
            } else {
              navigate(`/study/batches/${batchId}`);
            }
          } else {
            navigate('/study/batches');
          }
        }}
        className="w-full h-full"
      />
    </div>
  );
};

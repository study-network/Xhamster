import React from 'react';
import { useApp } from '../context/AppContext';
import { VideoPlayer } from '../components/VideoPlayer';

export const EmbedPlayerPage: React.FC = () => {
  const { currentPath } = useApp();

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
    searchParams.get('videoId') ||
    searchParams.get('video_id') ||
    '';
  const topicId =
    searchParams.get('topicId') ||
    searchParams.get('topic_id') ||
    searchParams.get('TopicId') ||
    '';
  const videoUrl =
    searchParams.get('VideoUrl') ||
    searchParams.get('videoUrl') ||
    searchParams.get('video_url') ||
    searchParams.get('url') ||
    '';
  const title =
    searchParams.get('title') ||
    searchParams.get('topic') ||
    searchParams.get('name') ||
    'PW Classroom Lecture';
  const urlType =
    searchParams.get('Type') ||
    searchParams.get('type') ||
    searchParams.get('urlType') ||
    '';
  const thumbnail =
    searchParams.get('thumbnail') ||
    searchParams.get('image') ||
    '';

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
      <VideoPlayer
        videoUrl={videoUrl}
        batchId={batchId}
        subjectId={subjectId}
        videoId={childId}
        topicId={topicId}
        topic={title}
        urlType={urlType}
        thumbnail={thumbnail}
        autoplay={true}
        showCloseButton={false}
        className="w-full h-full rounded-none border-0"
      />
    </div>
  );
};

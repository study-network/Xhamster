export interface BatchItem {
  _id: string;
  batchId?: string;
  name?: string;
  batchName?: string;
  byName?: string;
  startDate?: string;
  endDate?: string;
  language?: string;
  previewImage?: string;
  batchImage?: string;
  feeTotal?: number;
  batchPrice?: number;
  type?: string;
  template?: string;
  slug?: string;
  platform?: 'pw' | 'nexttoppers' | 'missionjeet' | 'vibrant' | 'sway' | string;
  studyUrl?: string;
}

export interface SubjectItem {
  _id: string;
  subject: string;
  subjectId: string;
  description?: string;
  slug?: string;
  lectureCount?: number;
  displayOrder?: number;
  imageId?: {
    baseUrl: string;
    key: string;
  };
  fileId?: {
    baseUrl: string;
    key: string;
    name?: string;
  } | null;
}

export interface ChapterItem {
  _id: string;
  name: string;
  type?: string;
  typeId?: string;
  displayOrder?: number;
  notes?: number;
  videos?: number;
  exercises?: number;
  slug?: string;
}

export interface VideoLectureItem {
  _id: string;
  topic: string;
  date: string;
  duration?: string;
  status: string;
  url?: string;
  urlType?: string;
  videoDetails?: {
    id?: string;
    name?: string;
    image?: string;
    videoUrl?: string;
    duration?: string;
    status?: string;
  };
  hasAttachment?: boolean;
}

export interface NoteItem {
  _id: string;
  homeworkIds?: Array<{
    _id: string;
    topic: string;
    note?: string;
    attachmentIds?: Array<{
      _id: string;
      baseUrl?: string;
      key?: string;
      name?: string;
    }>;
  }>;
}

export interface ExerciseItem {
  _id: string;
  title?: string;
  exerciseIds?: Array<{
    title: string;
    content?: Array<{
      exerciseDetails?: {
        totalQuestions?: number;
        maxDuration?: number;
        totalMarks?: number;
      };
    }>;
  }>;
}

export interface AnnouncementItem {
  _id: string;
  announcement: string;
  scheduleTime?: string;
  type?: string;
  attachment?: {
    baseUrl?: string;
    key?: string;
  } | null;
}

export interface ServerInfo {
  webName: string;
  sidebarLogoUrl: string;
  sidebarTitle: string;
  maintenanceMode: boolean;
  tg_channel: string;
  tg_username: string;
  isDirectLoginOpen: boolean;
  tg_bot: string;
}

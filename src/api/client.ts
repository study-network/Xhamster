import { BatchItem, SubjectItem, ChapterItem, VideoLectureItem, NoteItem, ExerciseItem, AnnouncementItem } from '../types';

export const SERVER_CONFIG = {
  webName: "Learnxpw",
  sidebarLogoUrl: "https://i.ibb.co/V8CbjrG/image.png",
  sidebarTitle: "Learnxpw",
  maintenanceMode: false,
  tg_channel: "https://t.me/+ucC5ZMCRfokwNDVl",
  tg_bot: "@bookverse_probot",
  bookLibrary: "https://power-x-library.netlify.app",
};

// Priority sorting for prominent batches matching learnxpw.site
const PRIORITY_BATCHES = [
  "Yakeen 2027",
  "Yakeen 2.0 2027",
  "Earners",
  "Lakshya JEE 2027",
  "Lakshya NEET 2027",
  "Arjuna JEE 2027",
  "Arjuna NEET 2027",
  "Udaan 2027",
  "Neev 2027",
  "Uday 2027",
  "Parishram 2027"
];

function normalizeName(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

function getBatchPriority(name: string): number {
  const norm = normalizeName(name);
  const exact = PRIORITY_BATCHES.findIndex(b => normalizeName(b) === norm);
  if (exact !== -1) return exact;
  const partial = PRIORITY_BATCHES.findIndex(b => norm.includes(normalizeName(b)));
  return partial === -1 ? Number.MAX_SAFE_INTEGER : partial;
}

export function normalizeBatch(raw: any): BatchItem {
  return {
    _id: String(raw?._id || raw?.id || raw?.batchId || ""),
    batchId: String(raw?.batchId || raw?._id || raw?.id || ""),
    name: String(raw?.batchName || raw?.name || ""),
    batchName: String(raw?.batchName || raw?.name || ""),
    previewImage: String(raw?.batchImage || raw?.previewImage || ""),
    batchImage: String(raw?.batchImage || raw?.previewImage || ""),
    language: String(raw?.language || "Hinglish"),
    type: String(raw?.template || raw?.type || "E_BATCH"),
    template: String(raw?.template || raw?.type || "E_BATCH"),
    startDate: String(raw?.startDate || ""),
    endDate: String(raw?.endDate || ""),
    feeTotal: Number(raw?.batchPrice ?? raw?.feeTotal ?? 0),
    batchPrice: Number(raw?.batchPrice ?? raw?.feeTotal ?? 0),
    byName: String(raw?.byName || ""),
    slug: String(raw?.slug || ""),
  };
}

export async function fetchBatches(page = 1, searchQuery = ''): Promise<{ batches: BatchItem[]; totalPages: number }> {
  try {
    const trimmed = typeof searchQuery === 'string' ? searchQuery.trim() : '';
    const isSearch = Boolean(trimmed);
    const endpoint = isSearch
      ? `/api/searchBatch?name=${encodeURIComponent(trimmed)}&page=${page}`
      : `/api/AllBatches?page=${page}`;

    const res = await fetch(endpoint);
    if (!res.ok) {
      if (isSearch) {
        const fallbackRes = await fetch(`/api/AllBatches?page=${page}`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const list = fallbackData?.batches || fallbackData?.data || [];
          return {
            batches: Array.isArray(list) ? list.map(normalizeBatch) : [],
            totalPages: Number(fallbackData?.totalPages || 1),
          };
        }
      }
      return { batches: [], totalPages: 1 };
    }

    const data = await res.json();
    const rawList = isSearch
      ? data?.data || data?.batches || []
      : data?.batches || data?.data || [];

    const mapped: BatchItem[] = Array.isArray(rawList) ? rawList.map(normalizeBatch) : [];

    const sorted = isSearch
      ? mapped
      : [...mapped].sort((a, b) => {
          const pa = getBatchPriority(a.name || '');
          const pb = getBatchPriority(b.name || '');
          return pa - pb;
        });

    return {
      batches: sorted,
      totalPages: Number(data?.totalPages || 1),
    };
  } catch (error) {
    console.error('Safe fetchBatches catch:', error);
    return { batches: [], totalPages: 1 };
  }
}

export async function fetchBatchDetails(batchId: string): Promise<any> {
  try {
    const res = await fetch(`/api/BatchInfo?BatchId=${encodeURIComponent(batchId)}&Type=details`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (e) {
    console.error('fetchBatchDetails error:', e);
    return null;
  }
}

export async function fetchBatchAnnouncements(batchId: string, page = 1): Promise<AnnouncementItem[]> {
  try {
    const res = await fetch(`/api/BatchInfo?BatchId=${encodeURIComponent(batchId)}&Type=announcement&page=${page}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (e) {
    console.error('fetchBatchAnnouncements error:', e);
    return [];
  }
}

export async function fetchSubjectChapters(batchId: string, subjectId: string, page = 1): Promise<ChapterItem[]> {
  try {
    const res = await fetch(
      `/api/SubjectInfo?BatchId=${encodeURIComponent(batchId)}&SubjectId=${encodeURIComponent(subjectId)}&page=${page}`
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (e) {
    console.error('fetchSubjectChapters error:', e);
    return [];
  }
}

export async function fetchDppList(
  batchId: string,
  batchSubjectId: string,
  chapterId: string,
  page = 1,
  limit = 20
): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      batchId,
      batchSubjectId: batchSubjectId || '',
      chapterId: chapterId || '',
      page: String(page),
      limit: String(limit),
    });
    const res = await fetch(`/api/dpp-list?${params.toString()}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || (Array.isArray(json) ? json : []);
  } catch (e) {
    console.error('fetchDppList error:', e);
    return [];
  }
}

export async function fetchTopicContent(
  batchId: string,
  subjectId: string,
  topicId: string,
  contentType: 'videos' | 'notes' | 'exercises' | 'dpp-pdf' | 'dpp-videos',
  page = 1
): Promise<any[]> {
  try {
    const res = await fetch(
      `/api/TopicInfo?BatchId=${encodeURIComponent(batchId)}&SubjectId=${encodeURIComponent(
        subjectId
      )}&TopicId=${encodeURIComponent(topicId)}&ContentType=${contentType}&page=${page}`
    );
    if (!res.ok) return [];
    const json = await res.json();
    const rawList = json?.data || [];

    // Strictly filter dpp-videos so normal lectures are not included
    if (contentType === 'dpp-videos') {
      return rawList.filter((item: any) => {
        if (!item || typeof item !== 'object') return false;
        if (item.isDPPVideos === true) return true;
        const topicNorm = (item.topic || item.name || '').toLowerCase();
        // If explicitly flagged as false and no dpp in topic name, exclude!
        if (item.isDPPVideos === false && !topicNorm.includes('dpp')) return false;
        return topicNorm.includes('dpp');
      });
    }

    return rawList;
  } catch (e) {
    console.error('fetchTopicContent error:', e);
    return [];
  }
}

export async function fetchTodaysSchedule(batchId?: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/todays-schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId: batchId || '' }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || json?.classes || [];
  } catch (e) {
    console.error('Failed to fetch schedule:', e);
    return [];
  }
}

export async function fetchBatchTests(batchId: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/batch-tests?batchId=${encodeURIComponent(batchId)}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (e) {
    console.error('Failed to fetch tests:', e);
    return [];
  }
}

export async function fetchTeacherDetails(ids: string[]): Promise<Record<string, { name: string; imageUrl: string }>> {
  if (!ids || ids.length === 0) return {};
  try {
    const res = await fetch(`/api/get-user-details-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idsParam: ids.join(',') }),
    });
    if (!res.ok) return {};
    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : [];
    const map: Record<string, { name: string; imageUrl: string }> = {};
    for (const t of list) {
      if (t?._id) {
        const img = t.imageId ? `${t.imageId.baseUrl || ''}${t.imageId.key || ''}` : t.photoUrl || t.PhotoUrl || '';
        map[t._id] = {
          name: t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim(),
          imageUrl: img,
        };
      }
    }
    return map;
  } catch (e) {
    console.error('fetchTeacherDetails error:', e);
    return {};
  }
}

export async function fetchTestInstructions(
  testId: string,
  batchId?: string,
  isNextToppers = false,
  isMissionJeet = false
): Promise<any> {
  try {
    let url = '';
    if (isNextToppers) {
      url = `/api/nexttoppers/test-instructions?testid=${encodeURIComponent(testId)}`;
    } else if (isMissionJeet) {
      url = `/api/missionjeet/test-instructions?testid=${encodeURIComponent(testId)}`;
    } else {
      const params = new URLSearchParams({ testId });
      if (batchId) params.set('batchId', batchId);
      url = `/api/test-instructions?${params.toString()}`;
    }

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json || null;
  } catch (e) {
    console.error('fetchTestInstructions error:', e);
    return null;
  }
}

export async function fetchBatchTestData(testId: string, batchId: string, testSource = 'BATCH_TEST_SERIES'): Promise<any> {
  try {
    const params = new URLSearchParams({ testId, batchId, type: 'Start', testSource });
    const res = await fetch(`/api/batch-tests?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json || null;
  } catch (e) {
    console.error('fetchBatchTestData error:', e);
    return null;
  }
}

export async function fetchDppTestData(
  testId: string,
  batchId: string,
  batchScheduleId?: string,
  subjectId?: string,
  exerciseId?: string
): Promise<any> {
  try {
    const params = new URLSearchParams({
      testId,
      batchId,
      type: 'Start',
      testSource: 'BATCH_QUIZ',
    });
    if (batchScheduleId) params.set('batchScheduleId', batchScheduleId);
    if (subjectId) params.set('subjectId', subjectId);
    if (exerciseId) params.set('exerciseId', exerciseId);
    else params.set('exerciseId', testId);

    const res = await fetch(`/api/dpp-tests?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json || null;
  } catch (e) {
    console.error('fetchDppTestData error:', e);
    return null;
  }
}

export async function fetchNextToppersTestData(testId: string): Promise<any> {
  try {
    const res = await fetch(`/api/nexttoppers/test-data?testid=${encodeURIComponent(testId)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json || null;
  } catch (e) {
    console.error('fetchNextToppersTestData error:', e);
    return null;
  }
}

export async function fetchMissionJeetTestData(testId: string): Promise<any> {
  try {
    const res = await fetch(`/api/missionjeet/test-data?testid=${encodeURIComponent(testId)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json || null;
  } catch (e) {
    console.error('fetchMissionJeetTestData error:', e);
    return null;
  }
}


export async function fetchPiCategories(): Promise<any[]> {
  try {
    const res = await fetch(`/api/pi/pw/category`);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (e) {
    console.error('Failed to fetch PI categories:', e);
    return [];
  }
}

export async function fetchPiCategoryChildren(categoryId: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/pi/pw/category/${encodeURIComponent(categoryId)}/children`);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (e) {
    console.error('Failed to fetch PI category children:', e);
    return [];
  }
}

export async function fetchPiWidgets(categoryId?: string, page = 1, limit = 30): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (categoryId && categoryId !== 'all') {
      params.set('categoryId', categoryId);
    }
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    const res = await fetch(`/api/pi/pw/widget?${params.toString()}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (e) {
    console.error('Failed to fetch PI widgets:', e);
    return [];
  }
}

export async function fetchPiWidgetContentList(widgetId: string, page = 1, limit = 30): Promise<any[]> {
  try {
    const res = await fetch(`/api/pi/pw/widget/${encodeURIComponent(widgetId)}/content-list?page=${page}&limit=${limit}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (e) {
    console.error('Failed to fetch widget content list:', e);
    return [];
  }
}

export async function fetchPiWidgetContinueWatching(widgetId: string, page = 1, limit = 30): Promise<any[]> {
  try {
    const res = await fetch(
      `/api/pi/pw/widget/continue-watching/${encodeURIComponent(widgetId)}/content?page=${page}&limit=${limit}`
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (e) {
    console.error('Failed to fetch continue watching:', e);
    return [];
  }
}

export async function fetchPiTeacherContent(widgetId: string, teacher: any, page = 1, limit = 30): Promise<any[]> {
  try {
    const name = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
    const res = await fetch(
      `/api/pi/pw/widget/${encodeURIComponent(widgetId)}/content-list?page=${page}&limit=${limit}&Teacher=${encodeURIComponent(
        teacher._id
      )}&title=${encodeURIComponent(name)}&skipFilter=Teacher`
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (e) {
    console.error('Failed to fetch teacher content:', e);
    return [];
  }
}

export async function fetchPiSubjectContent(
  widgetId: string,
  subject: any,
  page = 1,
  limit = 30,
  teacherId?: string
): Promise<any[]> {
  try {
    const teacherQuery = teacherId ? `&Teacher=${encodeURIComponent(teacherId)}` : '';
    const res = await fetch(
      `/api/pi/pw/widget/${encodeURIComponent(widgetId)}/content-list?page=${page}&limit=${limit}&Subject=${encodeURIComponent(
        subject._id
      )}&title=${encodeURIComponent(subject.name || '')}&skipFilter=Subject${teacherQuery}`
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (e) {
    console.error('Failed to fetch subject content:', e);
    return [];
  }
}

export async function fetchPiWidgetFilter(widgetId: string, key: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/pi/pw/widget/${encodeURIComponent(widgetId)}/filter?key=${encodeURIComponent(key)}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (e) {
    console.error('Failed to fetch widget filter:', e);
    return [];
  }
}

export async function searchPiContent(search: string, page = 1, limit = 20): Promise<any[]> {
  try {
    const res = await fetch(
      `/api/pi/pw/content/search?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (e) {
    console.error('Failed to search PI content:', e);
    return [];
  }
}

export async function fetchPiPlaylistDetails(playlistId: string): Promise<any> {
  try {
    const res = await fetch(`/api/pi/pw/playlist/${encodeURIComponent(playlistId)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (e) {
    console.error('Failed to fetch playlist details:', e);
    return null;
  }
}

export async function fetchPiVideoDetails(videoId: string): Promise<any> {
  try {
    const res = await fetch(`/api/pi/pw/video/details/${encodeURIComponent(videoId)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (e) {
    console.error('Failed to fetch video details:', e);
    return null;
  }
}

export async function fetchPiVideoStream(videoId: string): Promise<any> {
  try {
    const res = await fetch(`/api/pw/pi/${encodeURIComponent(videoId)}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (e) {
    console.error('Failed to fetch video stream:', e);
    return null;
  }
}


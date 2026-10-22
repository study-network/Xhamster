import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import https from 'node:https';
import http from 'node:http';

interface CachedResponse {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: Buffer;
  timestamp: number;
}

const cache = new Map<string, CachedResponse>();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes fresh cache

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  timeout: 15000,
});

async function requestUpstream(
  targetUrl: URL,
  method: string,
  headers: Record<string, string>,
  bodyData?: Buffer,
  timeoutMs = 15000,
  redirectCount = 0
): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: Buffer }> {
  if (redirectCount > 4) {
    throw new Error('Too many redirects');
  }
  return new Promise((resolve, reject) => {
    const isHttps = targetUrl.protocol === 'https:';
    const reqModule = isHttps ? https : http;

    const requestHeaders = { ...headers };
    requestHeaders['Host'] = targetUrl.host;

    const req = reqModule.request(
      targetUrl,
      {
        method,
        agent: isHttps ? httpsAgent : undefined,
        headers: requestHeaders,
        timeout: timeoutMs,
      },
      (res) => {
        // Follow redirects if 3xx and Location header is present
        if (
          res.statusCode &&
          [301, 302, 303, 307, 308].includes(res.statusCode) &&
          res.headers.location
        ) {
          const redirectUrl = new URL(res.headers.location, targetUrl);
          return resolve(
            requestUpstream(
              redirectUrl,
              res.statusCode === 303 ? 'GET' : method,
              headers,
              res.statusCode === 303 ? undefined : bodyData,
              timeoutMs,
              redirectCount + 1
            )
          );
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 200,
            headers: res.headers,
            body: Buffer.concat(chunks),
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error(`Upstream request timed out after ${timeoutMs}ms`));
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (bodyData && bodyData.length > 0) {
      req.write(bodyData);
    }
    req.end();
  });
}

async function fetchWithRetry(
  targetUrl: URL,
  method: string,
  headers: Record<string, string>,
  bodyData?: Buffer,
  retries = 2
) {
  let lastError: any = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await requestUpstream(targetUrl, method, headers, bodyData, 15000);
      return res;
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

process.on('uncaughtException', (err) => {
  console.warn('[Server uncaughtException]', err);
});
process.on('unhandledRejection', (reason) => {
  console.warn('[Server unhandledRejection]', reason);
});
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.static('public'));

  // API Proxy Middleware to learnxpw.site with resilience, retries, and caching
  app.use('/api', async (req: Request, res: Response) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    const fullPath = `/api${req.url}`;
    const targetUrl = new URL(fullPath, 'https://www.learnxpw.site');

    // Auto-fallback: if searchBatch is called without a valid name query, route to AllBatches
    if (targetUrl.pathname === '/api/searchBatch') {
      const queryName = targetUrl.searchParams.get('name');
      if (!queryName || !queryName.trim()) {
        const page = targetUrl.searchParams.get('page') || '1';
        targetUrl.pathname = '/api/AllBatches';
        targetUrl.search = `?page=${page}`;
      }
    }

    // Parameter normalization for upstream compatibility
    if (targetUrl.pathname === '/api/Schedule') {
      const b = targetUrl.searchParams.get('BatchId') || targetUrl.searchParams.get('batchId') || targetUrl.searchParams.get('batch_id');
      const s = targetUrl.searchParams.get('SubjectId') || targetUrl.searchParams.get('subjectId') || targetUrl.searchParams.get('subject_id');
      const c = targetUrl.searchParams.get('ContentId') || targetUrl.searchParams.get('contentId') || targetUrl.searchParams.get('ChildId') || targetUrl.searchParams.get('childId') || targetUrl.searchParams.get('video_id');
      if (b) targetUrl.searchParams.set('BatchId', b);
      if (s) targetUrl.searchParams.set('SubjectId', s);
      if (c) targetUrl.searchParams.set('ContentId', c);
    } else if (targetUrl.pathname === '/api/video-url') {
      const b = targetUrl.searchParams.get('batch_id') || targetUrl.searchParams.get('batchId') || targetUrl.searchParams.get('BatchId');
      const s = targetUrl.searchParams.get('subject_id') || targetUrl.searchParams.get('subjectId') || targetUrl.searchParams.get('SubjectId');
      const v = targetUrl.searchParams.get('video_id') || targetUrl.searchParams.get('childId') || targetUrl.searchParams.get('ChildId') || targetUrl.searchParams.get('contentId') || targetUrl.searchParams.get('ContentId');
      if (b) targetUrl.searchParams.set('batch_id', b);
      if (s) targetUrl.searchParams.set('subject_id', s);
      if (v) targetUrl.searchParams.set('video_id', v);
    } else if (targetUrl.pathname === '/api/get-video-url') {
      const b = targetUrl.searchParams.get('batchId') || targetUrl.searchParams.get('batch_id') || targetUrl.searchParams.get('BatchId');
      const s = targetUrl.searchParams.get('subjectId') || targetUrl.searchParams.get('subject_id') || targetUrl.searchParams.get('SubjectId');
      const c = targetUrl.searchParams.get('childId') || targetUrl.searchParams.get('ChildId') || targetUrl.searchParams.get('video_id') || targetUrl.searchParams.get('contentId') || targetUrl.searchParams.get('ContentId');
      if (b) targetUrl.searchParams.set('batchId', b);
      if (s) targetUrl.searchParams.set('subjectId', s);
      if (c) targetUrl.searchParams.set('childId', c);
    } else if (targetUrl.pathname === '/api/get-otp') {
      const kid = targetUrl.searchParams.get('kid');
      if (kid) {
        targetUrl.searchParams.set('kid', kid.replace(/-/g, '').toLowerCase());
      }
    } else if (
      targetUrl.pathname === '/api/nexttoppers/test-instructions' ||
      targetUrl.pathname === '/api/nexttoppers/test-data'
    ) {
      const tid = targetUrl.searchParams.get('testId') || targetUrl.searchParams.get('testid');
      if (tid) targetUrl.searchParams.set('testid', tid);
    } else if (
      targetUrl.pathname === '/api/missionjeet/test-instructions' ||
      targetUrl.pathname === '/api/missionjeet/test-data'
    ) {
      const tid = targetUrl.searchParams.get('testId') || targetUrl.searchParams.get('testid');
      if (tid) targetUrl.searchParams.set('testid', tid);
    } else if (targetUrl.pathname === '/api/test-instructions') {
      const tid = targetUrl.searchParams.get('testId') || targetUrl.searchParams.get('testid');
      const bid = targetUrl.searchParams.get('batchId') || targetUrl.searchParams.get('batch_id') || targetUrl.searchParams.get('BatchId');
      if (tid) targetUrl.searchParams.set('testId', tid);
      if (bid) targetUrl.searchParams.set('batchId', bid);
    } else if (targetUrl.pathname === '/api/batch-tests') {
      const tid = targetUrl.searchParams.get('testId') || targetUrl.searchParams.get('testid');
      const bid = targetUrl.searchParams.get('batchId') || targetUrl.searchParams.get('batch_id') || targetUrl.searchParams.get('BatchId');
      if (tid) targetUrl.searchParams.set('testId', tid);
      if (bid) targetUrl.searchParams.set('batchId', bid);
      if (!targetUrl.searchParams.get('type')) targetUrl.searchParams.set('type', 'Start');
      if (!targetUrl.searchParams.get('testSource')) targetUrl.searchParams.set('testSource', 'BATCH_TEST_SERIES');
    } else if (targetUrl.pathname === '/api/dpp-tests') {
      const tid = targetUrl.searchParams.get('testId') || targetUrl.searchParams.get('testid') || targetUrl.searchParams.get('exerciseId');
      const bid = targetUrl.searchParams.get('batchId') || targetUrl.searchParams.get('batch_id') || targetUrl.searchParams.get('BatchId');
      if (tid) targetUrl.searchParams.set('testId', tid);
      if (bid) targetUrl.searchParams.set('batchId', bid);
      if (!targetUrl.searchParams.get('type')) targetUrl.searchParams.set('type', 'Start');
      if (!targetUrl.searchParams.get('testSource')) targetUrl.searchParams.set('testSource', 'BATCH_QUIZ');
    }

    const cacheKey = `${req.method}:${targetUrl.pathname}${targetUrl.search}`;

    // For GET requests, serve from cache if recently cached (< CACHE_TTL_MS)
    if (req.method === 'GET') {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        res.status(cached.statusCode);
        for (const [key, val] of Object.entries(cached.headers)) {
          if (val && !['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
            res.setHeader(key, val);
          }
        }
        res.setHeader('X-Cache', 'HIT');
        return res.send(cached.body);
      }
    }

    let referer = 'https://www.learnxpw.site/watch';
    const isTestRoute =
      targetUrl.pathname.includes('test') ||
      targetUrl.pathname.includes('batch-tests') ||
      targetUrl.pathname.includes('dpp-tests');

    if (isTestRoute) {
      const tid =
        targetUrl.searchParams.get('testId') ||
        targetUrl.searchParams.get('testid') ||
        '';
      const bid =
        targetUrl.searchParams.get('batchId') ||
        targetUrl.searchParams.get('batch_id') ||
        targetUrl.searchParams.get('BatchId') ||
        '';
      referer = `https://www.learnxpw.site/practice-v2/test/${tid}/instructions?type=Start&source=BATCH_TEST_SERIES&batchId=${bid}&mode=Online`;
    } else if (targetUrl.pathname.startsWith('/api/nexttoppers')) {
      referer = 'https://www.learnxpw.site/study/nexttoppers';
    } else if (targetUrl.pathname.startsWith('/api/missionjeet')) {
      referer = 'https://www.learnxpw.site/study/missionjeet';
    } else {
      const batchId =
        targetUrl.searchParams.get('batchId') ||
        targetUrl.searchParams.get('batch_id') ||
        targetUrl.searchParams.get('BatchId');
      const subjectId =
        targetUrl.searchParams.get('subjectId') ||
        targetUrl.searchParams.get('subject_id') ||
        targetUrl.searchParams.get('SubjectId');
      const contentId =
        targetUrl.searchParams.get('contentId') ||
        targetUrl.searchParams.get('video_id') ||
        targetUrl.searchParams.get('childId') ||
        targetUrl.searchParams.get('ChildId') ||
        targetUrl.searchParams.get('ContentId');

      if (batchId || subjectId || contentId) {
        referer = `https://www.learnxpw.site/watch?batchId=${batchId || ''}&SubjectId=${subjectId || ''}&ContentId=${contentId || ''}`;
      }
    }

    const headers: Record<string, string> = {
      'Host': 'www.learnxpw.site',
      'Origin': 'https://www.learnxpw.site',
      'Referer': referer,
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept': (req.headers['accept'] as string) || 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Connection': 'keep-alive',
    };

    if (req.headers['range']) {
      headers['Range'] = req.headers['range'] as string;
    }

    let bodyBuffer: Buffer | undefined;
    if (req.method === 'POST') {
      headers['Content-Type'] = 'application/json';
      const bodyStr = JSON.stringify(req.body ?? {});
      bodyBuffer = Buffer.from(bodyStr);
      headers['Content-Length'] = Buffer.byteLength(bodyBuffer).toString();
    }

    try {
      const upstreamRes = await fetchWithRetry(targetUrl, req.method, headers, bodyBuffer, 2);

      // If upstream returned error for searchBatch, attempt fallback to AllBatches
      if (upstreamRes.statusCode >= 400 && targetUrl.pathname === '/api/searchBatch') {
        const fallbackUrl = new URL('/api/AllBatches?page=1', 'https://www.learnxpw.site');
        const fallbackRes = await fetchWithRetry(fallbackUrl, 'GET', headers, undefined, 1);
        res.status(fallbackRes.statusCode);
        if (fallbackRes.headers['content-type']) {
          res.setHeader('Content-Type', fallbackRes.headers['content-type']);
        }
        return res.send(fallbackRes.body);
      }

      // Cache successful GET responses (skip video streams, partial content, or large files)
      const isVideoOrPlay = targetUrl.pathname.includes('/play') || targetUrl.pathname.includes('/video');
      const isCacheable =
        req.method === 'GET' &&
        upstreamRes.statusCode === 200 &&
        !isVideoOrPlay &&
        upstreamRes.body.length < 512 * 1024;

      if (isCacheable) {
        cache.set(cacheKey, {
          statusCode: upstreamRes.statusCode,
          headers: upstreamRes.headers as Record<string, string | string[] | undefined>,
          body: upstreamRes.body,
          timestamp: Date.now(),
        });
      }

      res.status(upstreamRes.statusCode);
      for (const [key, val] of Object.entries(upstreamRes.headers)) {
        if (val && !['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
          res.setHeader(key, val);
        }
      }
      res.setHeader('X-Cache', 'MISS');
      res.send(upstreamRes.body);
    } catch (err: any) {
      console.warn(`[Proxy Warning] Upstream request failed for ${targetUrl.pathname}: ${err?.message || err}`);

      // Stale-if-error: if we have any cached version, use it
      const cached = cache.get(cacheKey);
      if (cached) {
        console.warn(`[Proxy Info] Serving stale cache for ${targetUrl.pathname}`);
        res.status(cached.statusCode);
        for (const [key, val] of Object.entries(cached.headers)) {
          if (val && !['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
            res.setHeader(key, val);
          }
        }
        res.setHeader('X-Cache', 'STALE-FALLBACK');
        return res.send(cached.body);
      }

      // Graceful fallback JSON response so UI does not crash or throw uncaught errors
      res.status(200).json({
        success: false,
        message: 'Upstream server busy. Please refresh.',
        batches: [],
        data: [],
        totalPages: 1,
      });
    }
  });

  // Background pre-warm for primary batches
  setTimeout(async () => {
    try {
      const url = new URL('/api/AllBatches?page=1', 'https://www.learnxpw.site');
      const res = await fetchWithRetry(url, 'GET', {
        'Host': 'www.learnxpw.site',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
      });
      if (res.statusCode === 200) {
        cache.set('GET:/api/AllBatches?page=1', {
          statusCode: 200,
          headers: res.headers as Record<string, string | string[] | undefined>,
          body: res.body,
          timestamp: Date.now(),
        });
      }
    } catch (e: any) {
      // Non-critical background warmup
    }
  }, 500);

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        allowedHosts: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.use((_req: Request, res: Response) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

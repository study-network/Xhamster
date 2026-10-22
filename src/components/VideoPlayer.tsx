import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Loader2,
  X,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Tv,
  MonitorPlay,
  PlaySquare,
  ShieldCheck,
  Check,
  ArrowLeft
} from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string;
  signedUrl?: string;
  batchId?: string;
  subjectId?: string;
  videoId?: string;
  topicId?: string;
  topic?: string;
  poster?: string;
  thumbnail?: string;
  urlType?: string;
  description?: string;
  autoplay?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function extractYouTubeId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/|shorts\/))([\w-]{11})/i,
    /ytimg\.com\/vi(?:_webp)?\/([\w-]{11})/i,
    /\/vi\/([\w-]{11})\//i,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  signedUrl = '',
  batchId,
  subjectId,
  videoId,
  topicId,
  topic = 'Lecture Video',
  poster,
  thumbnail,
  urlType = '',
  description = '',
  autoplay = true,
  onBack,
  onClose,
  showCloseButton = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<any>(null);

  // 1. Detect YouTube across all available metadata
  const detectedYouTubeId =
    extractYouTubeId(videoUrl) ||
    extractYouTubeId(thumbnail) ||
    extractYouTubeId(poster) ||
    extractYouTubeId(description) ||
    (urlType?.toLowerCase() === 'youtube'
      ? extractYouTubeId(videoUrl) ||
        extractYouTubeId(thumbnail) ||
        extractYouTubeId(poster) ||
        extractYouTubeId(description)
      : null);

  // 2. Compute effective IDs
  const effectiveBatchId = batchId || '';
  const effectiveSubjectId = subjectId || '';
  const effectiveVideoId = videoId || '';
  const effectiveTopicId = topicId || '';
  const effectiveVideoUrl = videoUrl || '';

  // 3. Compute Embed URL (Local Embed Player route for zero cross-origin issues)
  const buildLocalEmbedUrl = () => {
    const params = new URLSearchParams();
    if (effectiveBatchId) params.set('batchId', effectiveBatchId);
    if (effectiveSubjectId) params.set('SubjectId', effectiveSubjectId);
    if (effectiveVideoId) params.set('ContentId', effectiveVideoId);
    if (effectiveTopicId) params.set('topicId', effectiveTopicId);
    if (urlType) params.set('Type', urlType);
    if (effectiveVideoUrl) params.set('VideoUrl', effectiveVideoUrl);
    if (topic) params.set('title', topic);
    return `/player/embed?${params.toString()}`;
  };

  // 4. Official External LearnXPW site link
  const buildOfficialLearnXpwUrl = () => {
    if (!effectiveBatchId && !effectiveVideoUrl) return '';
    if (effectiveVideoUrl && effectiveVideoUrl.includes('learnxpw.site/watch')) return effectiveVideoUrl;
    if (!effectiveBatchId) return '';

    const base = 'https://www.learnxpw.site/watch';
    const params = new URLSearchParams();
    params.set('batchId', effectiveBatchId);
    if (effectiveSubjectId) params.set('SubjectId', effectiveSubjectId);
    if (effectiveVideoId) {
      params.set('ChildId', effectiveVideoId);
      params.set('ContentId', effectiveVideoId);
    }
    if (urlType) params.set('Type', urlType);
    params.set('isLocked', 'false');
    if (effectiveTopicId) params.set('topicId', effectiveTopicId);
    if (effectiveVideoUrl && !effectiveVideoUrl.includes('learnxpw.site/watch')) {
      params.set('VideoUrl', effectiveVideoUrl);
    }
    return `${base}?${params.toString()}`;
  };

  const localEmbedUrl = buildLocalEmbedUrl();
  const officialLearnXpwUrl = buildOfficialLearnXpwUrl();

  // Mode: YouTube > Direct (with ClearKey DRM) > Iframe
  const initialMode: 'youtube' | 'direct' | 'iframe' = detectedYouTubeId
    ? 'youtube'
    : 'direct';

  const [playerMode, setPlayerMode] = useState<'youtube' | 'direct' | 'iframe'>(initialMode);
  const [useOfficialIframe, setUseOfficialIframe] = useState<boolean>(false);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);

  // Direct Player State
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStep, setLoadingStep] = useState<string>('Initializing player...');
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [buffered, setBuffered] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [tracks, setTracks] = useState<any[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [drmDecrypted, setDrmDecrypted] = useState<boolean>(false);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  // Update mode when props switch
  useEffect(() => {
    if (detectedYouTubeId) {
      setPlayerMode('youtube');
    } else {
      setPlayerMode('direct');
    }
  }, [detectedYouTubeId, effectiveVideoId]);

  // Record lecture to study history
  useEffect(() => {
    if (!effectiveBatchId && !effectiveVideoId && !videoUrl && !detectedYouTubeId) return;
    try {
      const rawHist = localStorage.getItem('studyHistory');
      const hist = rawHist ? JSON.parse(rawHist) : [];
      const entry = {
        id: effectiveVideoId || detectedYouTubeId || videoUrl || `${effectiveBatchId}-${Date.now()}`,
        batchId: effectiveBatchId,
        subjectId: effectiveSubjectId,
        childId: effectiveVideoId,
        title: topic,
        videoUrl: detectedYouTubeId
          ? `https://www.youtube.com/watch?v=${detectedYouTubeId}`
          : videoUrl || officialLearnXpwUrl || '',
        timestamp: Date.now(),
        watchedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      const updated = [entry, ...hist.filter((h: any) => h.id !== entry.id)].slice(0, 50);
      localStorage.setItem('studyHistory', JSON.stringify(updated));
      window.dispatchEvent(new Event('studyHistoryUpdated'));
    } catch {}
  }, [effectiveBatchId, effectiveSubjectId, effectiveVideoId, videoUrl, topic, officialLearnXpwUrl, detectedYouTubeId]);

  // Fullscreen change listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture if user is typing in input or textarea
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }
      if (playerMode !== 'direct' || !videoRef.current) return;

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'j':
        case 'J':
          e.preventDefault();
          seek(Math.max(0, (videoRef.current?.currentTime || 0) - 10));
          break;
        case 'ArrowRight':
        case 'l':
        case 'L':
          e.preventDefault();
          seek(Math.min(duration || 0, (videoRef.current?.currentTime || 0) + 10));
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(Math.max(0, volume - 0.1));
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerMode, duration, volume, isPlaying]);

  // Direct Player Stream Setup with ClearKey DRM Decryption
  useEffect(() => {
    if (playerMode !== 'direct') {
      setLoading(false);
      return;
    }

    let isCancelled = false;

    async function loadStream() {
      try {
        setLoading(true);
        setError(null);
        setDrmDecrypted(false);
        setLoadingStep('Resolving stream URL...');

        let finalUrl = videoUrl ? videoUrl.trim() : '';
        let finalSigned = signedUrl ? signedUrl.trim() : '';

        // 1. Resolve signed video URL if signature is missing or IDs provided
        const hasSignature =
          /[?&](?:Policy|Signature|Key-Pair-Id|Expires)=/i.test(finalUrl) ||
          /[?&](?:Policy|Signature|Key-Pair-Id|Expires)=/i.test(finalSigned);

        if ((!hasSignature || !finalUrl || finalUrl.includes('/api/')) && effectiveBatchId && effectiveSubjectId && effectiveVideoId) {
          try {
            const res = await fetch(
              `/api/video-url?batch_id=${encodeURIComponent(effectiveBatchId)}&subject_id=${encodeURIComponent(
                effectiveSubjectId
              )}&video_id=${encodeURIComponent(effectiveVideoId)}`
            );
            if (res.ok) {
              const data = await res.json();
              if (data?.data?.url) {
                finalUrl = data.data.url.trim();
                finalSigned = (data.data.signedUrl || '').trim();
              }
            }
          } catch (e) {
            console.warn('First video-url endpoint error:', e);
          }

          if (!finalSigned) {
            try {
              const fallbackRes = await fetch(
                `/api/get-video-url?batchId=${encodeURIComponent(effectiveBatchId)}&subjectId=${encodeURIComponent(
                  effectiveSubjectId
                )}&childId=${encodeURIComponent(effectiveVideoId)}`
              );
              if (fallbackRes.ok) {
                const data = await fallbackRes.json();
                if (data?.data?.url) {
                  finalUrl = data.data.url.trim();
                  finalSigned = (data.data.signedUrl || '').trim();
                }
              }
            } catch (e) {
              console.warn('Fallback get-video-url error:', e);
            }
          }
        }

        if (!finalUrl) {
          throw new Error('Video stream could not be loaded. Please click Switch to PW Embed or retry.');
        }

        if (isCancelled || !videoRef.current) return;

        function formatProxiedUrl(rawUri: string, signatureQuery: string): string {
          if (!rawUri || typeof rawUri !== 'string') return '';

          // If already pointing to /api/play
          if (rawUri.includes('/api/play')) {
            if (rawUri.startsWith('https://api/play') || rawUri.startsWith('http://api/play')) {
              return rawUri.replace(/^https?:\/\/api\/play/, `${window.location.origin}/api/play`);
            }
            if (rawUri.startsWith('/')) {
              return `${window.location.origin}${rawUri}`;
            }
            return rawUri;
          }

          let fullUri = rawUri.trim();
          if (fullUri.startsWith('//')) {
            fullUri = `https:${fullUri}`;
          } else if (fullUri.startsWith('/') || (typeof window !== 'undefined' && fullUri.startsWith(window.location.origin))) {
            try {
              const origin = typeof window !== 'undefined' ? window.location.origin : '';
              const pathOnly = fullUri.replace(origin, '').replace(/^\/api\/play\/?/, '').replace(/^\/api\/?/, '').replace(/^\//, '');
              const baseUrl = finalUrl.substring(0, finalUrl.lastIndexOf('/') + 1);
              fullUri = new URL(pathOnly, baseUrl).href;
            } catch {
              fullUri = `${window.location.origin}${fullUri}`;
            }
          }

          const token = (signatureQuery || '').replace(/^[?&]/, '');
          const hasSignature = /[?&](?:Policy|Signature|Key-Pair-Id|Expires)=/i.test(fullUri);
          const targetWithToken =
            !token || hasSignature || !/^https?:\/\//i.test(fullUri)
              ? fullUri
              : `${fullUri}${fullUri.includes('?') ? '&' : '?'}${token}`;

          return `/api/play?url=${encodeURIComponent(targetWithToken)}`;
        }

        // 2. If stream is DASH (MPD), inspect manifest for ClearKey DRM
        const isMpd = finalUrl.includes('.mpd');
        let clearKeys: Record<string, string> | null = null;

        if (isMpd) {
          setLoadingStep('Inspecting ClearKey DRM protection...');
          try {
            const mpdTarget = formatProxiedUrl(finalUrl, finalSigned);
            const mpdRes = await fetch(mpdTarget, { cache: 'no-store' });
            if (mpdRes.ok) {
              const mpdXml = await mpdRes.text();
              const kidMatch = mpdXml.match(/cenc:default_KID="([^"]+)"/i);
              if (kidMatch && kidMatch[1]) {
                const cleanKid = kidMatch[1].replace(/-/g, '').toLowerCase();
                setLoadingStep(`Decrypting ClearKey license (${cleanKid.slice(0, 8)}...)...`);
                const otpRes = await fetch(`/api/get-otp?kid=${encodeURIComponent(cleanKid)}`, { cache: 'no-store' });
                if (otpRes.ok) {
                  const otpData = await otpRes.json();
                  if (otpData?.clearKeys) {
                    clearKeys = otpData.clearKeys;
                    setDrmDecrypted(true);
                  }
                }
              }
            }
          } catch (e) {
            console.warn('DRM manifest / OTP lookup warning:', e);
          }
        }

        if (isCancelled || !videoRef.current) return;

        setLoadingStep('Initializing media engine...');

        // 3. Initialize Shaka Player
        const shakaModule: any = await import('shaka-player');
        const shaka = shakaModule.default || shakaModule;

        if (shaka.polyfill?.installAll) {
          shaka.polyfill.installAll();
        }

        if (playerRef.current) {
          await playerRef.current.destroy().catch(() => {});
          playerRef.current = null;
        }

        if (isCancelled || !videoRef.current) return;

        const player = new shaka.Player(videoRef.current);
        playerRef.current = player;

        // Configure Shaka Player with ABR and ClearKeys DRM
        player.configure({
          streaming: {
            bufferingGoal: 30,
            rebufferingGoal: 2,
            bufferBehind: 30,
            retryParameters: {
              maxAttempts: 4,
              baseDelay: 500,
              backoffFactor: 2,
              timeout: 10000,
            },
          },
          abr: {
            enabled: true,
          },
          ...(clearKeys ? { drm: { clearKeys } } : {}),
        });

        // Register request filter to route segments through /api/play
        const net = player.getNetworkingEngine();
        net.registerRequestFilter((type: any, request: any) => {
          if (type === shaka.net.NetworkingEngine.RequestType.LICENSE || !request.uris?.length) return;
          const uri = request.uris[0];
          if (!uri || uri.startsWith('data:') || uri.startsWith('blob:')) return;

          // If already pointing to /api/play, ensure origin is correct
          if (uri.includes('/api/play')) {
            if (uri.startsWith('https://api/play') || uri.startsWith('http://api/play')) {
              request.uris[0] = uri.replace(/^https?:\/\/api\/play/, `${window.location.origin}/api/play`);
            } else if (uri.startsWith('/api/play')) {
              request.uris[0] = `${window.location.origin}${uri}`;
            }
            return;
          }

          request.uris[0] = formatProxiedUrl(uri, finalSigned);
        });

        player.addEventListener('variantchanged', () => {
          const tracksList = player.getVariantTracks();
          setTracks(tracksList);
        });

        player.addEventListener('error', (e: any) => {
          console.warn('Shaka player error event:', e);
        });

        setLoadingStep('Buffering initial video frames...');

        if (isMpd) {
          await player.load(formatProxiedUrl(finalUrl, finalSigned), 0, 'application/dash+xml');
        } else if (finalUrl.includes('.m3u8')) {
          const hlsTarget = finalUrl.startsWith('/api/') ? finalUrl : formatProxiedUrl(finalUrl, finalSigned);
          await player.load(hlsTarget, 0, 'application/x-mpegURL');
        } else {
          await player.load(finalUrl);
        }

        if (isCancelled) return;
        setLoading(false);
        setTracks(player.getVariantTracks() || []);

        if (autoplay && videoRef.current) {
          videoRef.current.play().catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(() => {});
            }
          });
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Direct player initialization issue:', err);
          setError(err?.message || 'Could not load direct stream.');
          setLoading(false);
        }
      }
    }

    loadStream();

    return () => {
      isCancelled = true;
      if (playerRef.current) {
        playerRef.current.destroy().catch(() => {});
        playerRef.current = null;
      }
    };
  }, [videoUrl, signedUrl, effectiveBatchId, effectiveSubjectId, effectiveVideoId, autoplay, playerMode, reloadTrigger]);

  // Video element event handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (videoRef.current.buffered.length > 0) {
      setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(time, duration));
  };

  const changeVolume = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    if (videoRef.current) {
      videoRef.current.volume = clamped;
      if (clamped > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const isFullscreenMode = isFullscreen || className.includes('h-full') || className.includes('inset-0');

  const toggleFullscreen = () => {
    const el: any = containerRef.current || videoRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
      try {
        if (screen.orientation && 'lock' in screen.orientation) {
          (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } catch {}
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowQualityMenu(false);
      }
    }, 3500);
  };

  const changeSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
  };

  const selectQuality = (trackId: string) => {
    if (!playerRef.current) return;
    if (trackId === 'auto') {
      playerRef.current.configure({ abr: { enabled: true } });
      setSelectedQuality('auto');
    } else {
      playerRef.current.configure({ abr: { enabled: false } });
      const track = tracks.find((t) => String(t.id) === trackId);
      if (track) {
        playerRef.current.selectVariantTrack(track, true);
        setSelectedQuality(trackId);
      }
    }
    setShowQualityMenu(false);
  };

  // 1. YouTube Mode
  if (playerMode === 'youtube' && detectedYouTubeId) {
    return (
      <div
        ref={containerRef}
        className={`relative ${isFullscreenMode ? 'w-full h-full rounded-none border-0' : 'aspect-video w-full rounded-2xl border border-white/10 shadow-2xl'} overflow-hidden bg-black select-none ${className}`}
      >
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent">
          <div className="flex items-center gap-2.5 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 sm:p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
                title="Go Back"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <span className="text-xs sm:text-sm font-bold text-white/95 truncate max-w-xs sm:max-w-md drop-shadow">{topic}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className={`relative ${isFullscreenMode ? 'w-full h-full' : 'aspect-video w-full'} bg-black`}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${detectedYouTubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
            title={topic}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      </div>
    );
  }

  // 2. Iframe Mode (Embed Player / LearnXPW Stream)
  if (playerMode === 'iframe') {
    const activeIframeSrc = useOfficialIframe ? officialLearnXpwUrl : localEmbedUrl;

    return (
      <div
        ref={containerRef}
        className={`relative w-full ${isFullscreenMode ? 'h-full rounded-none border-0' : 'overflow-hidden rounded-2xl border border-white/10 shadow-2xl'} bg-[#070a14] flex flex-col ${className}`}
      >
        {/* Top Control Bar for Iframe */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent">
          <div className="flex items-center gap-2.5 min-w-0">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 sm:p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
                title="Go Back"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <span className="text-xs sm:text-sm font-bold text-white/95 truncate max-w-xs sm:max-w-md lg:max-w-xl drop-shadow">
              {topic}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="rounded-full bg-black/60 p-1.5 text-white hover:bg-black/90 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Iframe Viewport */}
        <div className={`relative w-full ${isFullscreenMode ? 'flex-1 h-full' : 'aspect-video min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[580px]'} bg-black`}>
          {iframeLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#070a14] text-white">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400 mb-3" />
              <p className="text-xs sm:text-sm font-semibold text-slate-200">
                Connecting to PW Lecture Stream...
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Loading classroom player
              </p>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={activeIframeSrc}
            title={topic}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setIframeLoading(false)}
            className="w-full h-full border-0 bg-black"
          />
        </div>
      </div>
    );
  }

  // 3. Direct HTML5 / Shaka Player Mode (with ClearKey DRM Decrypted)
  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative ${isFullscreenMode ? 'w-full h-full rounded-none border-0' : 'aspect-video w-full rounded-2xl border border-white/10 shadow-2xl'} overflow-hidden bg-black select-none ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        poster={poster || thumbnail}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        className="h-full w-full object-contain cursor-pointer"
      />

      {/* Top Bar overlay in Direct Mode */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 sm:p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
              title="Go Back"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <span className="text-xs sm:text-sm font-bold text-white/95 truncate max-w-xs sm:max-w-md lg:max-w-xl drop-shadow">
            {topic}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="rounded-full bg-black/60 p-1.5 text-white hover:bg-black/90 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Big Play / Pause Overlay Button when paused */}
      {!loading && !error && !isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 cursor-pointer"
        >
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform duration-200 pl-1">
            <Play className="h-8 w-8 sm:h-10 sm:w-10 fill-current" />
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xs">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-2" />
          <span className="text-xs font-semibold text-white">{loadingStep}</span>
          <span className="text-[11px] text-slate-400 mt-1">Decrypting with hardware acceleration</span>
        </div>
      )}

      {/* Error Overlay with Fallback to Iframe */}
      {error && !loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-2" />
          <h4 className="text-sm font-bold text-white mb-1">Playback Error</h4>
          <p className="text-xs text-slate-400 max-w-md mb-4">{error}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setReloadTrigger((t) => t + 1)}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry HD Stream</span>
            </button>

            <button
              onClick={() => setPlayerMode('iframe')}
              className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition shadow-lg cursor-pointer"
            >
              Switch to Iframe Embed
            </button>
          </div>
        </div>
      )}

      {/* Custom Video Controls (Bottom) */}
      {!loading && !error && showControls && (
        <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 transition-opacity">
          {/* Progress Bar */}
          <div
            className="group relative h-1.5 w-full cursor-pointer rounded-full bg-white/20 mb-3"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seek(pos * duration);
            }}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-white/30"
              style={{ width: `${(buffered / (duration || 1)) * 100}%` }}
            />
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-purple-500 group-hover:bg-purple-400"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer">
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
              </button>

              <button
                onClick={() => seek(currentTime - 10)}
                className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer text-slate-300"
                title="Rewind 10s (Left Arrow)"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={() => seek(currentTime + 10)}
                className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer text-slate-300"
                title="Forward 10s (Right Arrow)"
              >
                <RotateCw className="h-4 w-4" />
              </button>

              <div className="text-xs font-mono text-slate-300 ml-1">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>

              {/* Volume */}
              <div className="flex items-center gap-1.5 ml-2">
                <button onClick={toggleMute} className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer">
                  {isMuted || volume === 0 ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  className="w-16 h-1 rounded-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Playback Speed Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSpeedMenu(!showSpeedMenu);
                    setShowQualityMenu(false);
                  }}
                  className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-semibold hover:bg-white/20 transition cursor-pointer"
                >
                  {playbackRate}x
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-9 right-0 z-40 rounded-xl border border-white/10 bg-[#0d1222] p-1.5 shadow-2xl backdrop-blur-md min-w-[70px]">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => changeSpeed(s)}
                        className={`w-full text-left rounded-lg px-2.5 py-1 text-[11px] transition cursor-pointer ${
                          playbackRate === s ? 'bg-purple-600 text-white font-bold' : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality Menu */}
              {tracks.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowQualityMenu(!showQualityMenu);
                      setShowSpeedMenu(false);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer text-slate-300"
                    title="Stream Quality"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  {showQualityMenu && (
                    <div className="absolute bottom-9 right-0 z-40 rounded-xl border border-white/10 bg-[#0d1222] p-1.5 shadow-2xl backdrop-blur-md min-w-[100px] max-h-48 overflow-y-auto">
                      <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">Resolution</div>
                      <button
                        onClick={() => selectQuality('auto')}
                        className={`w-full text-left rounded-lg px-2.5 py-1 text-[11px] transition cursor-pointer flex items-center justify-between ${
                          selectedQuality === 'auto' ? 'bg-purple-600 text-white font-bold' : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <span>Auto (ABR)</span>
                        {selectedQuality === 'auto' && <Check className="h-3 w-3" />}
                      </button>
                      {tracks
                        .filter((t, i, arr) => arr.findIndex((x) => x.height === t.height) === i && t.height)
                        .sort((a, b) => b.height - a.height)
                        .map((t) => (
                          <button
                            key={t.id}
                            onClick={() => selectQuality(String(t.id))}
                            className={`w-full text-left rounded-lg px-2.5 py-1 text-[11px] transition cursor-pointer flex items-center justify-between ${
                              selectedQuality === String(t.id)
                                ? 'bg-purple-600 text-white font-bold'
                                : 'text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <span>{t.height}p</span>
                            {selectedQuality === String(t.id) && <Check className="h-3 w-3" />}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

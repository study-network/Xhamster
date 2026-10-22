import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Tv,
  Check,
  ExternalLink
} from 'lucide-react';

declare const window: any;

export const NextToppersPlayerPage: React.FC = () => {
  const { navigate } = useApp();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);
  const [isYouTube, setIsYouTube] = useState<boolean>(false);
  const [youTubeId, setYouTubeId] = useState<string | null>(null);

  // Player controls state
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('videoVolume');
    return saved ? Number(saved) : 1;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isTheater, setIsTheater] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [tracks, setTracks] = useState<Array<{ id: number; height: number; bitrate: number }>>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<number | 'auto'>('auto');
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<any>(null);

  // Parse query params
  const searchParams = new URLSearchParams(window.location.search);
  const videoId = searchParams.get('id');
  const rawUrl = searchParams.get('url');

  // Load video details
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    async function init() {
      try {
        // Direct URL check
        if (rawUrl) {
          const trimmed = rawUrl.trim();
          // Check YouTube
          const ytMatch = trimmed.match(
            /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/))([\w-]{11})/i
          );
          if (ytMatch) {
            if (active) {
              setIsYouTube(true);
              setYouTubeId(ytMatch[1]);
              setLoading(false);
            }
            return;
          }

          if (active) {
            setStreamUrl(trimmed);
            setLoading(false);
          }
          return;
        }

        // VDC ID check
        if (videoId) {
          const res = await fetch(
            `/api/nexttoppers/video-details?videoid=${encodeURIComponent(videoId)}`
          );
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          const json = await res.json();

          if (!json?.success || !json?.data?.file_url) {
            throw new Error(json?.error || json?.message || 'Video stream unavailable');
          }

          if (active) {
            const url = String(json.data.file_url).trim();
            const token = json.data.token ? String(json.data.token).trim() : null;

            setStreamUrl(url);
            if (token) {
              setLicenseUrl(
                `/api/nexttoppers/validateLicense?pallyconCustomdataV2=${encodeURIComponent(token)}`
              );
            } else {
              setLicenseUrl(null);
            }
            setLoading(false);
          }
          return;
        }

        throw new Error('No video URL or video ID provided.');
      } catch (err: any) {
        if (active) {
          setError(err?.message || 'Unable to load video.');
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      active = false;
    };
  }, [videoId, rawUrl]);

  // Initialize Shaka Player when streamUrl is set
  useEffect(() => {
    if (!streamUrl || isYouTube || !videoRef.current) return;

    let destroyed = false;

    async function setupShaka() {
      try {
        const shaka = await import('shaka-player');
        if (destroyed || !videoRef.current) return;

        // Install polyfills
        shaka.default.polyfill.installAll();

        if (!shaka.default.Player.isBrowserSupported()) {
          console.warn('Browser not supported by Shaka Player, falling back to native video');
          if (videoRef.current) {
            videoRef.current.src = streamUrl!;
            videoRef.current.play().catch(() => {});
          }
          return;
        }

        const player = new shaka.default.Player();
        await player.attach(videoRef.current);
        playerRef.current = player;

        // Configure DRM if license URL is provided
        if (licenseUrl) {
          player.configure({
            drm: {
              servers: {
                'com.widevine.alpha': licenseUrl,
              },
            },
          });
        }

        // Configure streaming buffer
        player.configure({
          streaming: {
            bufferingGoal: 30,
            rebufferingGoal: 2,
            bufferBehind: 30,
            retryParameters: {
              maxAttempts: 3,
              baseDelay: 1000,
              backoffFactor: 2,
            },
          },
        });

        // Listen for track changes to populate quality selector
        player.addEventListener('variantchanged', () => {
          if (destroyed) return;
          const variantTracks = player.getVariantTracks();
          const cleanTracks: Array<{ id: number; height: number; bitrate: number }> = [];
          const seenHeights = new Set<number>();

          for (const t of variantTracks) {
            if (t.height && !seenHeights.has(t.height)) {
              seenHeights.add(t.height);
              cleanTracks.push({
                id: t.id,
                height: t.height,
                bitrate: t.videoBandwidth || t.bandwidth || 0,
              });
            }
          }
          cleanTracks.sort((a, b) => b.height - a.height);
          setTracks(cleanTracks);
        });

        // Load stream
        await player.load(streamUrl!);
        if (videoRef.current) {
          videoRef.current.volume = volume;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        console.warn('Shaka load error, trying native playback fallback:', err);
        if (videoRef.current && !destroyed) {
          videoRef.current.src = streamUrl!;
          videoRef.current.play().catch(() => {});
        }
      }
    }

    setupShaka();

    return () => {
      destroyed = true;
      if (playerRef.current) {
        playerRef.current.destroy().catch(() => {});
        playerRef.current = null;
      }
    };
  }, [streamUrl, licenseUrl, isYouTube]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekRelative = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds)
    );
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
    localStorage.setItem('videoVolume', String(newVol));
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    if (!nextMuted && volume === 0) {
      handleVolumeChange(0.5);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettings(false);
  };

  const handleQualityChange = (trackId: number | 'auto') => {
    setSelectedTrackId(trackId);
    if (playerRef.current) {
      if (trackId === 'auto') {
        playerRef.current.configure({ abr: { enabled: true } });
      } else {
        playerRef.current.configure({ abr: { enabled: false } });
        const variantTracks = playerRef.current.getVariantTracks();
        const chosen = variantTracks.find((t: any) => t.id === trackId);
        if (chosen) {
          playerRef.current.selectVariantTrack(chosen, true);
        }
      }
    }
    setShowSettings(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Activity timer for controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#080b18] text-white">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#0d1222]/90 px-4 py-3 backdrop-blur-md">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Course</span>
        </button>

        <span className="text-xs sm:text-sm font-bold text-amber-400">
          NextToppers Video Player
        </span>

        {rawUrl && (
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open Link</span>
          </a>
        )}
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className={`relative mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl transition-all duration-300 ${
            isTheater ? 'w-full max-w-full aspect-[21/9]' : 'max-w-5xl aspect-video'
          }`}
        >
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-amber-400" />
              <p className="text-xs text-slate-400 font-medium">Loading video stream...</p>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
              <AlertCircle className="h-12 w-12 text-rose-500 mb-3" />
              <h3 className="text-base font-bold text-white">Failed to Play Video</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-md">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : isYouTube && youTubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youTubeId}?autoplay=1&rel=0&modestbranding=1`}
              title="YouTube Video"
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <video
                ref={videoRef}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
                playsInline
                className="h-full w-full object-contain cursor-pointer"
              />

              {/* Overlay Controls */}
              <div
                className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-transparent to-black/40 p-4 transition-opacity duration-300 ${
                  showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* Top Info Bar */}
                <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                  <span>HD Stream</span>
                  {selectedTrackId !== 'auto' && (
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">
                      {tracks.find((t) => t.id === selectedTrackId)?.height}p
                    </span>
                  )}
                </div>

                {/* Center Play/Pause button on tap */}
                <div
                  onClick={togglePlay}
                  className="flex flex-1 items-center justify-center cursor-pointer"
                >
                  <button
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/80 text-slate-950 backdrop-blur-md hover:scale-110 hover:bg-amber-400 transition"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
                  </button>
                </div>

                {/* Bottom Bar Controls */}
                <div className="space-y-2">
                  {/* Seek Progress Bar */}
                  <div className="relative flex items-center group cursor-pointer">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => {
                        const target = Number(e.target.value);
                        setCurrentTime(target);
                        if (videoRef.current) videoRef.current.currentTime = target;
                      }}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-amber-400 transition"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    {/* Left controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="text-white hover:text-amber-400 transition cursor-pointer"
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </button>

                      <button
                        onClick={() => seekRelative(-10)}
                        className="text-white/80 hover:text-white transition cursor-pointer"
                        title="Seek backward 10s"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => seekRelative(10)}
                        className="text-white/80 hover:text-white transition cursor-pointer"
                        title="Seek forward 10s"
                      >
                        <RotateCw className="h-4 w-4" />
                      </button>

                      {/* Volume */}
                      <div className="flex items-center gap-1.5 group">
                        <button
                          onClick={toggleMute}
                          className="text-white/80 hover:text-white transition cursor-pointer"
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="h-4 w-4 text-rose-400" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={(e) => handleVolumeChange(Number(e.target.value))}
                          className="w-16 h-1 appearance-none rounded-full bg-white/20 accent-amber-400 cursor-pointer"
                        />
                      </div>

                      {/* Time display */}
                      <span className="text-[11px] text-slate-300">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-3 relative">
                      {/* Settings Menu Trigger */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSettings(!showSettings)}
                          className="text-white/80 hover:text-amber-400 transition cursor-pointer"
                          title="Settings"
                        >
                          <Settings className="h-4 w-4" />
                        </button>

                        {/* Settings Popup */}
                        {showSettings && (
                          <div className="absolute right-0 bottom-8 z-50 w-52 rounded-xl border border-white/10 bg-[#101524] p-3 text-xs shadow-2xl space-y-3">
                            {/* Speed selector */}
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                Speed
                              </span>
                              <div className="grid grid-cols-4 gap-1">
                                {[0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => handleSpeedChange(s)}
                                    className={`rounded py-1 text-center transition cursor-pointer ${
                                      playbackRate === s
                                        ? 'bg-amber-500 font-bold text-slate-950'
                                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                                    }`}
                                  >
                                    {s}x
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Quality selector */}
                            {tracks.length > 0 && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                  Quality
                                </span>
                                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                                  <button
                                    onClick={() => handleQualityChange('auto')}
                                    className={`w-full flex items-center justify-between rounded px-2 py-1 text-left cursor-pointer ${
                                      selectedTrackId === 'auto'
                                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                                        : 'text-slate-300 hover:bg-white/5'
                                    }`}
                                  >
                                    <span>Auto</span>
                                    {selectedTrackId === 'auto' && <Check className="h-3 w-3" />}
                                  </button>
                                  {tracks.map((t) => (
                                    <button
                                      key={t.id}
                                      onClick={() => handleQualityChange(t.id)}
                                      className={`w-full flex items-center justify-between rounded px-2 py-1 text-left cursor-pointer ${
                                        selectedTrackId === t.id
                                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                                          : 'text-slate-300 hover:bg-white/5'
                                      }`}
                                    >
                                      <span>{t.height}p</span>
                                      {selectedTrackId === t.id && <Check className="h-3 w-3" />}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Theater Mode Toggle */}
                      <button
                        onClick={() => setIsTheater(!isTheater)}
                        className={`transition cursor-pointer ${
                          isTheater ? 'text-amber-400' : 'text-white/80 hover:text-white'
                        }`}
                        title="Theater mode"
                      >
                        <Tv className="h-4 w-4" />
                      </button>

                      {/* Fullscreen Toggle */}
                      <button
                        onClick={toggleFullscreen}
                        className="text-white/80 hover:text-white transition cursor-pointer"
                        title="Fullscreen"
                      >
                        {isFullscreen ? (
                          <Minimize className="h-4 w-4" />
                        ) : (
                          <Maximize className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

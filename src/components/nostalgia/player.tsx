'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { AnimeEntry } from './types'

interface PlayerContextValue {
  current: AnimeEntry | null
  trackNumber: number
  playableCount: number
  isPlaying: boolean
  volume: number
  muted: boolean
  currentTime: number
  duration: number
  playTrack: (slug: string) => void
  toggle: () => void
  stop: () => void
  skip: (dir: 1 | -1) => void
  setVolume: (v: number) => void
  toggleMute: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}

/** Deterministic PRNG (SSR-safe) for VU meter bar variation. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function fmt(t: number) {
  if (!isFinite(t) || t < 0) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function PlayerProvider({
  anime,
  children,
}: {
  anime: AnimeEntry[]
  children: React.ReactNode
}) {
  const { toast } = useToast()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentSlug, setCurrentSlug] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.75)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const playable = useMemo(
    () => anime.filter((a) => a.audioUrl),
    [anime]
  )
  const current = useMemo(
    () => playable.find((a) => a.slug === currentSlug) ?? null,
    [playable, currentSlug]
  )
  const trackNumber = current
    ? playable.findIndex((a) => a.slug === current.slug) + 1
    : 0

  // keep a ref of the current entry for event handlers (refs must not be
  // written during render — keep them in sync via effects)
  const currentRef = useRef<AnimeEntry | null>(null)
  useEffect(() => {
    currentRef.current = current
  }, [current])

  // restore saved volume + mirror audio volume changes into state via the
  // 'volumechange' event (external system sync — no setState in effect body)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.75
    try {
      const saved = localStorage.getItem('nostalgia-volume')
      if (saved !== null) {
        const v = Math.min(1, Math.max(0, parseFloat(saved)))
        if (!Number.isNaN(v)) audio.volume = v
      }
    } catch {
      /* localStorage unavailable — ignore */
    }
    const onVolumeChange = () => setVolumeState(audio.volume)
    audio.addEventListener('volumechange', onVolumeChange)
    return () => audio.removeEventListener('volumechange', onVolumeChange)
  }, [])

  const playTrack = useCallback(
    (slug: string) => {
      const audio = audioRef.current
      const entry = playable.find((a) => a.slug === slug)
      if (!audio || !entry?.audioUrl) return
      if (currentSlug === slug) {
        if (audio.paused) void audio.play().catch(() => setIsPlaying(false))
        else audio.pause()
        return
      }
      audio.src = entry.audioUrl
      setCurrentSlug(slug)
      setCurrentTime(0)
      setDuration(0)
      void audio.play().catch(() => setIsPlaying(false))
    },
    [playable, currentSlug]
  )

  const skip = useCallback(
    (dir: 1 | -1) => {
      if (playable.length === 0) return
      const idx = playable.findIndex((a) => a.slug === currentSlug)
      const next =
        idx === -1 ? 0 : (idx + dir + playable.length) % playable.length
      playTrack(playable[next].slug)
    },
    [playable, currentSlug, playTrack]
  )

  // keep a ref of skip for the 'ended' event (mixtape auto-advance)
  const skipRef = useRef<(dir: 1 | -1) => void>(() => {})
  useEffect(() => {
    skipRef.current = skip
  }, [skip])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || playable.length === 0) return
    if (!currentSlug) {
      playTrack(playable[0].slug)
      return
    }
    if (audio.paused) void audio.play().catch(() => setIsPlaying(false))
    else audio.pause()
  }, [playable, currentSlug, playTrack])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    setCurrentSlug(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }, [])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v))
    const audio = audioRef.current
    if (audio) {
      audio.volume = clamped
      if (clamped > 0 && audio.muted) {
        audio.muted = false
        setMuted(false)
      }
    }
    try {
      localStorage.setItem('nostalgia-volume', String(clamped))
    } catch {
      /* ignore */
    }
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(audio.muted)
  }, [])

  // wire up the single hidden <audio> element events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onMeta = () => setDuration(audio.duration || 0)
    const onTime = () => setCurrentTime(audio.currentTime || 0)
    const onEnded = () => skipRef.current(1)
    const onError = () => {
      const entry = currentRef.current
      setIsPlaying(false)
      if (entry) {
        toast({
          title: 'The tape got chewed! (╥_╥)',
          description: `Couldn't read the theme song for ${entry.title}. Try skipping to the next tape.`,
          variant: 'destructive',
        })
      }
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [toast])

  const value = useMemo<PlayerContextValue>(
    () => ({
      current,
      trackNumber,
      playableCount: playable.length,
      isPlaying,
      volume,
      muted,
      currentTime,
      duration,
      playTrack,
      toggle,
      stop,
      skip,
      setVolume,
      toggleMute,
    }),
    [
      current,
      trackNumber,
      playable.length,
      isPlaying,
      volume,
      muted,
      currentTime,
      duration,
      playTrack,
      toggle,
      stop,
      skip,
      setVolume,
      toggleMute,
    ]
  )

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* single shared audio element, inspectable for debugging */}
      <audio ref={audioRef} preload="metadata" className="hidden" />
    </PlayerContext.Provider>
  )
}

/** The fixed bottom boombox / cassette deck bar. */
export function BoomboxBar() {
  const {
    current,
    trackNumber,
    playableCount,
    isPlaying,
    volume,
    muted,
    currentTime,
    duration,
    toggle,
    stop,
    skip,
    setVolume,
    toggleMute,
  } = usePlayer()

  const vuBars = useMemo(() => {
    const rand = mulberry32(19881017)
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      dur: `${(0.45 + rand() * 0.55).toFixed(2)}s`,
      delay: `${(-rand() * 0.9).toFixed(2)}s`,
    }))
  }, [])

  const lcdLine = current
    ? `♪ ${current.themeName ?? 'THEME SONG'} — ${current.themeArtist ?? ''} ・「${current.title}」 (${current.year})`
    : ''

  return (
    <div
      className="bevel-out fixed inset-x-0 bottom-0 z-40 bg-[#3a2110] pb-[env(safe-area-inset-bottom)]"
      role="group"
      aria-label="Cassette theme song player"
    >
      <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-2.5 py-2.5 sm:gap-4 sm:px-6">
        {/* cassette */}
        <div
          className="bevel-in hidden shrink-0 items-center gap-2.5 rounded-md bg-[#241308] px-3.5 py-2.5 sm:flex"
          aria-hidden="true"
        >
          <span className={`cassette-reel ${isPlaying ? 'on' : ''}`} />
          <span className="font-vt text-xs tracking-widest text-amber-200/60">
            STEREO
          </span>
          <span className={`cassette-reel ${isPlaying ? 'on' : ''}`} />
        </div>

        {/* LCD display */}
        <div className="bevel-in relative min-w-0 flex-1 overflow-hidden bg-[#041507] px-3 py-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-vt text-xs text-emerald-600/90">
              {current
                ? `TAPE ${String(trackNumber).padStart(2, '0')}/${String(playableCount).padStart(2, '0')}`
                : 'AUX'}
            </span>
            <span className="font-vt text-xs text-emerald-400">
              {current ? `${fmt(currentTime)} / ${fmt(duration)}` : 'MIXTAPE 11'}
            </span>
          </div>
          <div className="overflow-hidden">
            {current ? (
              <p className="lcd-scroll font-vt text-lg leading-tight text-emerald-300">
                <span className="pr-10">{lcdLine}</span>
                <span className="pr-10" aria-hidden="true">
                  {lcdLine}
                </span>
              </p>
            ) : (
              <p className="font-vt text-lg leading-tight text-emerald-300/70">
                INSERT TAPE<span className="retro-blink">▌</span> press ♪ on any
                tape below
              </p>
            )}
          </div>
          <span className="sr-only" aria-live="polite">
            {current
              ? `Now playing: ${current.themeName} by ${current.themeArtist}, theme of ${current.title}`
              : 'No tape playing'}
          </span>
        </div>

        {/* VU meter */}
        <div className="vu-meter hidden shrink-0 md:flex" aria-hidden="true">
          {vuBars.map((b) => (
            <span
              key={b.id}
              className={`vu-bar ${isPlaying ? 'on' : ''}`}
              style={{
                animationDuration: b.dur,
                animationDelay: b.delay,
              }}
            />
          ))}
        </div>

        {/* transport buttons */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => skip(-1)}
            className="bevel-out wiggle-hover flex h-11 w-11 cursor-pointer items-center justify-center rounded-sm bg-[#6b4a28] text-amber-100 transition-colors hover:bg-[#8a5f36]"
            aria-label="Rewind to previous tape theme"
          >
            <SkipBack className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={toggle}
            className="bevel-out wiggle-hover flex h-11 w-11 cursor-pointer items-center justify-center rounded-sm bg-primary text-[#241308] transition-colors hover:bg-[#ffc266]"
            aria-label={isPlaying ? 'Pause theme song' : 'Play theme song'}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Play className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={stop}
            className="bevel-out wiggle-hover hidden h-11 w-11 cursor-pointer items-center justify-center rounded-sm bg-[#6b4a28] text-amber-100 transition-colors hover:bg-[#8a5f36] sm:flex"
            aria-label="Stop and eject tape"
          >
            <Square className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => skip(1)}
            className="bevel-out wiggle-hover flex h-11 w-11 cursor-pointer items-center justify-center rounded-sm bg-[#6b4a28] text-amber-100 transition-colors hover:bg-[#8a5f36]"
            aria-label="Fast-forward to next tape theme"
          >
            <SkipForward className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* volume */}
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-11 w-9 cursor-pointer items-center justify-center text-amber-200/80 transition-colors hover:text-amber-100"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? (
              <VolumeX className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Volume2 className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="Volume"
            className="retro-range w-20 lg:w-28"
          />
        </div>
      </div>

      {/* compact music hint on mobile when nothing is playing */}
      {!current && (
        <p className="font-vt flex items-center justify-center gap-1 pb-1 text-xs text-amber-200/50 sm:hidden">
          <Music className="h-3 w-3" aria-hidden="true" />
          tap ♪ THEME on any tape to play its opening
        </p>
      )}
    </div>
  )
}

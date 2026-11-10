'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Power, SkipBack, SkipForward } from 'lucide-react'
import type { AnimeEntry } from './types'

interface TvHeroProps {
  anime: AnimeEntry[]
}

/** Chunky channel number like an old OSD */
function ChannelOsd({ channel }: { channel: number }) {
  return (
    <span className="font-vt text-2xl text-emerald-300 drop-shadow-[0_0_6px_rgba(124,227,139,0.8)]">
      CH{String(channel).padStart(2, '0')}
    </span>
  )
}

export function TvHero({ anime }: TvHeroProps) {
  const [index, setIndex] = useState(0)
  const [poweredOn, setPoweredOn] = useState(true)
  const [staticFlash, setStaticFlash] = useState(false)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = anime[index]

  const switchChannel = useCallback(
    (dir: 1 | -1) => {
      setStaticFlash(true)
      if (flashTimer.current) clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setStaticFlash(false), 320)
      setIndex((i) => (i + dir + anime.length) % anime.length)
    },
    [anime.length]
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') switchChannel(1)
      if (e.key === 'ArrowLeft') switchChannel(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (flashTimer.current) clearTimeout(flashTimer.current)
    }
  }, [switchChannel])

  if (!current) return null

  return (
    <section
      aria-labelledby="now-showing"
      className="relative mx-auto max-w-5xl px-4 sm:px-6"
    >
      <h2 id="now-showing" className="sr-only">
        Now showing on the nostalgia channel
      </h2>

      {/* TV set chassis */}
      <div className="bevel-out rounded-lg bg-[#3a2110] p-3 sm:p-5">
        <div className="flex items-center justify-between px-1 pb-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,80,80,0.9)]" />
            <span className="font-pixel text-[10px] tracking-widest text-amber-200">
              NOSTALGIA&trade; TRINITRON 2007
            </span>
          </div>
          <span className="font-vt hidden text-sm text-amber-200/60 sm:inline">
            AV-1 &nbsp;|&nbsp; STEREO
          </span>
        </div>

        {/* Screen */}
        <div className="tv-screen relative aspect-video w-full bg-black">
          <div
            className={`absolute inset-0 ${
              poweredOn
                ? staticFlash
                  ? 'channel-static'
                  : 'tv-on'
                : 'tv-off'
            }`}
            style={{ transformOrigin: 'center' }}
          >
            {poweredOn && (
              <>
                <Image
                  src={current.imageUrl}
                  alt={`${current.title} key visual`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 960px"
                  className="photo-retro object-cover"
                  priority={index === 0}
                  key={`img-${current.slug}`}
                />
                {/* dark scrim for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                {/* OSD top-left */}
                <div className="absolute left-3 top-3 flex items-center gap-3">
                  <ChannelOsd channel={index + 1} />
                  <span className="font-vt flex items-center gap-1.5 text-sm text-red-400">
                    <span className="retro-blink inline-block h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
                    REC
                  </span>
                </div>

                {/* Show info bottom */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                  <p className="font-vt text-sm tracking-wide text-amber-300/90">
                    ▶ NOW SHOWING · {current.year} · {current.studio}
                  </p>
                  <h3 className="font-pixel chroma-text-soft mt-1 text-lg text-amber-100 sm:text-2xl">
                    {current.title}
                  </h3>
                  <p className="font-vt mt-1 max-w-xl text-base text-amber-100/85 sm:text-lg">
                    “{current.quote}”
                  </p>
                  <p className="font-vt mt-2 hidden max-w-xl text-sm text-amber-100/60 sm:block">
                    {current.tagline}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* power-off black screen stays clickable */}
          {!poweredOn && (
            <button
              type="button"
              onClick={() => setPoweredOn(true)}
              className="absolute inset-0 z-10 flex items-center justify-center"
              aria-label="Turn the TV back on"
            >
              <span className="font-vt cursor-blink text-xl text-emerald-300/70">
                NO SIGNAL — PRESS POWER
              </span>
            </button>
          )}
        </div>

        {/* Control panel */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPoweredOn((p) => !p)}
              aria-pressed={poweredOn}
              className="bevel-out wiggle-hover flex h-11 w-11 items-center justify-center rounded-full bg-[#6b4a28] text-amber-100 transition-colors hover:bg-[#8a5f36]"
              aria-label={poweredOn ? 'Power off TV' : 'Power on TV'}
            >
              <Power className="h-5 w-5" aria-hidden="true" />
            </button>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                poweredOn
                  ? 'bg-red-400 shadow-[0_0_8px_rgba(255,80,80,0.9)] retro-blink'
                  : 'bg-[#241308]'
              }`}
              aria-hidden="true"
            />
            <span className="font-vt text-sm text-amber-200/60">
              {poweredOn ? 'ON AIR' : 'STANDBY'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => switchChannel(-1)}
              disabled={!poweredOn}
              className="bevel-out wiggle-hover flex h-11 w-11 items-center justify-center bg-[#6b4a28] text-amber-100 transition-colors hover:bg-[#8a5f36] disabled:opacity-40"
              aria-label="Previous channel"
            >
              <SkipBack className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="font-vt bevel-in flex h-11 min-w-24 items-center justify-center bg-black px-3 text-lg text-emerald-300">
              {String(index + 1).padStart(2, '0')} / {String(anime.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => switchChannel(1)}
              disabled={!poweredOn}
              className="bevel-out wiggle-hover flex h-11 w-11 items-center justify-center bg-[#6b4a28] text-amber-100 transition-colors hover:bg-[#8a5f36] disabled:opacity-40"
              aria-label="Next channel"
            >
              <SkipForward className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <p className="font-vt hidden text-xs text-amber-200/50 md:block">
            tip: use ← → keys to flip channels
          </p>
        </div>
      </div>
    </section>
  )
}

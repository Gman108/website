'use client'

import Image from 'next/image'
import { CalendarDays, Film, Music, Pause, Tv } from 'lucide-react'
import type { AnimeEntry } from './types'
import { usePlayer } from './player'

/** Segmented LED nostalgia meter (0–10). */
export function NostalgiaMeter({ value }: { value: number }) {
  const lit = Math.round(value)
  return (
    <div
      className="flex items-center gap-2"
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={10}
      aria-label={`Nostalgia level ${value} out of 10`}
    >
      <div className="flex gap-[3px]" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={`led-seg ${i < lit ? 'on' : ''} ${i >= 8 ? 'hot' : ''}`} />
        ))}
      </div>
      <span className="font-vt text-sm text-amber-300">{value.toFixed(1)}</span>
    </div>
  )
}

interface AnimeCardProps {
  anime: AnimeEntry
  onOpen: (anime: AnimeEntry) => void
  index: number
}

export function AnimeCard({ anime, onOpen, index }: AnimeCardProps) {
  const { current, isPlaying, playTrack } = usePlayer()
  const isCurrent = current?.slug === anime.slug
  const cardPlaying = isCurrent && isPlaying

  return (
    <article className="bevel-out rounded-md bg-card p-2.5 transition-transform duration-200 hover:-translate-y-1">
      {/* tape label header */}
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="font-vt text-xs tracking-widest text-amber-300/80">
          VHS-{String(index + 1).padStart(3, '0')}
        </span>
        <span className="font-vt flex items-center gap-1 text-xs text-amber-200/50">
          <Tv className="h-3 w-3" aria-hidden="true" />
          {anime.episodes}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onOpen(anime)}
        className="group block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-amber-300"
        aria-label={`Open details for ${anime.title}`}
      >
        <div className="bevel-in relative aspect-video w-full overflow-hidden bg-black">
          <Image
            src={anime.imageUrl}
            alt={`${anime.title} — ${anime.titleJp} key visual`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="photo-retro object-cover group-hover:scale-[1.03]"
          />
          <span className="font-vt absolute left-2 top-2 rounded-sm bg-black/70 px-1.5 text-xs tracking-wider text-amber-200">
            {anime.year}
          </span>
          {anime.nostalgia >= 9.7 && (
            <span className="font-vt absolute right-2 top-2 wiggle-hover rounded-sm bg-accent px-1.5 text-xs font-bold text-[#241308]">
              ★ CLASSIC
            </span>
          )}
        </div>

        <div className="px-1 pt-2.5">
          <h3 className="font-pixel chroma-text-soft text-[11px] leading-relaxed text-amber-100 sm:text-xs">
            {anime.title}
          </h3>
          <p className="font-vt mt-1 truncate text-sm text-amber-200/60">
            {anime.titleJp}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-vt flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3" aria-hidden="true" />
              {anime.year}
            </span>
            <span className="font-vt flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Film className="h-3 w-3" aria-hidden="true" />
              {anime.genre.split(' / ')[0]}
            </span>
          </div>
          <div className="mt-2.5">
            <NostalgiaMeter value={anime.nostalgia} />
          </div>
          <p className="font-vt mt-2 text-xs text-amber-300/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            ▶ press PLAY to open tape
          </p>
        </div>
      </button>

      {/* theme song play button */}
      {anime.audioUrl && (
        <button
          type="button"
          onClick={() => playTrack(anime.slug)}
          className={`bevel-out mt-2 flex w-full cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-amber-300 ${
            cardPlaying
              ? 'bg-primary text-[#241308]'
              : 'bg-[#241308] text-amber-200 hover:bg-[#1c0f06]'
          }`}
          aria-label={`${cardPlaying ? 'Pause' : 'Play'} the theme song of ${anime.title}: ${anime.themeName ?? 'theme song'}`}
        >
          {cardPlaying ? (
            <Pause className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <Music className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span className="font-vt truncate text-sm">
            ♪ {anime.themeName ?? 'THEME SONG'}
          </span>
          <span className="font-vt ml-auto hidden shrink-0 text-xs opacity-70 sm:inline">
            {anime.themeArtist ?? ''}
          </span>
        </button>
      )}

      <div className="mt-2 retro-stripes h-1.5 w-full rounded-sm opacity-70" aria-hidden="true" />
    </article>
  )
}

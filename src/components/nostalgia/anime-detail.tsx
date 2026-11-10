'use client'

import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CalendarDays, Building2, Tv, Quote, Pause, Play } from 'lucide-react'
import type { AnimeEntry, GuestbookEntry } from './types'
import { NostalgiaMeter } from './anime-card'
import { usePlayer } from './player'

interface AnimeDetailDialogProps {
  anime: AnimeEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  comments: GuestbookEntry[]
}

const MOOD_FACES: Record<string, string> = {
  nostalgic: '(´ω｀)',
  crying: '(╥_╥)',
  hyped: 'ᕦ(ò_óˇ)ᕤ',
  sparkly: '(✿◠‿◠)',
  cozy: '(—˃ω˂—)',
  jazzy: '♪(๑ᴖ◡ᴖ๑)♪',
  existential: 'ಠ_ಠ',
}

function timeAgo(dateStr: string) {
  const then = new Date(dateStr).getTime()
  if (Number.isNaN(then)) return 'back in the day'
  const days = Math.floor((Date.now() - then) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  return `${Math.floor(days / 30)} months ago`
}

export function AnimeDetailDialog({
  anime,
  open,
  onOpenChange,
  comments,
}: AnimeDetailDialogProps) {
  const { current, isPlaying, playTrack } = usePlayer()
  if (!anime) return null
  const related = comments.filter((c) => c.animeSlug === anime.slug).slice(0, 5)
  const thisPlaying = current?.slug === anime.slug && isPlaying

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bevel-out retro-scroll max-h-[90vh] gap-0 overflow-y-auto rounded-md border-none bg-[#241308] p-0 sm:max-w-2xl">
        {/* dialog title bar */}
        <div className="retro-stripes flex h-7 items-center justify-between px-3">
          <span className="font-pixel bg-[#241308] px-2 py-0.5 text-[9px] text-amber-200">
            {anime.slug.toUpperCase()}.AVI — NOW PLAYING
          </span>
          <span className="font-vt bg-[#241308] px-2 text-sm text-amber-200 retro-blink">
            ▮▮
          </span>
        </div>

        <DialogHeader className="sr-only">
          <DialogTitle>{anime.title}</DialogTitle>
          <DialogDescription>{anime.tagline}</DialogDescription>
        </DialogHeader>

        <div className="px-4 py-4 sm:px-6">
          <div className="tv-screen relative aspect-video w-full bg-black">
            <Image
              src={anime.imageUrl}
              alt={`${anime.title} key visual`}
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="photo-retro object-cover"
            />
            <span className="font-vt absolute left-3 top-3 rounded-sm bg-black/70 px-1.5 text-sm tracking-wider text-red-400">
              ● REC
            </span>
          </div>

          <h3 className="font-pixel chroma-text-soft mt-4 text-sm leading-relaxed text-amber-100 sm:text-base">
            {anime.title}
          </h3>
          <p className="font-vt mt-1 text-lg text-amber-300/80">{anime.titleJp}</p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <span className="font-vt flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" aria-hidden="true" /> {anime.year}
            </span>
            <span className="font-vt flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" aria-hidden="true" /> {anime.studio}
            </span>
            <span className="font-vt flex items-center gap-1.5 text-sm text-muted-foreground">
              <Tv className="h-4 w-4" aria-hidden="true" /> {anime.episodes}
            </span>
          </div>

          <div className="bevel-in mt-4 bg-[#1c0f06] p-3">
            <NostalgiaMeter value={anime.nostalgia} />
          </div>

          <p className="mt-4 font-vt text-lg leading-snug text-amber-100/90">
            {anime.synopsis}
          </p>

          <blockquote className="bevel-out mt-4 flex items-start gap-2 rounded-md bg-[#1c0f06] p-3">
            <Quote className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span className="font-vt text-lg text-accent">
              {anime.quote}{' '}
              <span className="text-amber-200/50">— the line we all remember</span>
            </span>
          </blockquote>

          {/* theme song block */}
          {anime.audioUrl && (
            <div className="bevel-out mt-4 flex items-center gap-3 rounded-md bg-[#1c0f06] p-3">
              <button
                type="button"
                onClick={() => playTrack(anime.slug)}
                className={`bevel-out flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${
                  thisPlaying
                    ? 'bg-primary text-[#241308]'
                    : 'bg-[#6b4a28] text-amber-100 hover:bg-[#8a5f36]'
                }`}
                aria-label={`${thisPlaying ? 'Pause' : 'Play'} the theme song ${anime.themeName ?? ''}`}
              >
                {thisPlaying ? (
                  <Pause className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Play className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-vt text-xs tracking-widest text-amber-300">
                  ♪ OPENING THEME
                </p>
                <p className="font-vt truncate text-lg text-amber-100">
                  {anime.themeName ?? 'Theme song'}
                </p>
                <p className="font-vt truncate text-sm text-muted-foreground">
                  {anime.themeArtist ?? '—'}
                </p>
              </div>
              {thisPlaying && (
                <div className="vu-meter hidden shrink-0 sm:flex" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className="vu-bar on"
                      style={{ animationDuration: `${0.4 + i * 0.11}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {anime.genre.split(' / ').map((g) => (
              <span
                key={g}
                className="font-vt bevel-out rounded-sm bg-[#3a2110] px-2 py-0.5 text-sm text-amber-200"
              >
                #{g.toLowerCase().replace(/\s+/g, '-')}
              </span>
            ))}
          </div>

          {related.length > 0 && (
            <section className="mt-6" aria-label={`Fan memories about ${anime.title}`}>
              <h4 className="font-pixel text-[10px] text-amber-300">
                ▼ FAN MEMORIES ABOUT THIS TAPE
              </h4>
              <ul className="mt-3 space-y-3">
                {related.map((c) => (
                  <li key={c.id} className="bevel-in bg-[#1c0f06] p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-vt text-base text-amber-300">
                        {MOOD_FACES[c.mood] ?? MOOD_FACES.nostalgic}{' '}
                        <span className="text-amber-100">{c.author}</span>
                      </span>
                      <span className="font-vt text-xs text-amber-200/40">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="font-vt mt-1 text-base leading-snug text-amber-100/80">
                      {c.message}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="font-vt mt-2 text-center text-sm text-amber-300/60">
                ── add your own memory in the guestbook below ──
              </p>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

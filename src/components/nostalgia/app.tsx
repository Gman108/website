'use client'

import { useMemo, useState } from 'react'
import { Search, Archive, Globe } from 'lucide-react'
import { CrtEffects, Starfield, SakuraPetals } from './crt-effects'
import { RetroMarquee } from './retro-marquee'
import { TvHero } from './tv-hero'
import { AnimeCard } from './anime-card'
import { AnimeDetailDialog } from './anime-detail'
import { Guestbook } from './guestbook'
import { PlayerProvider, BoomboxBar } from './player'
import type { AnimeEntry, GuestbookEntry } from './types'

const DECADES = [
  { key: 'all', label: 'ALL ERAS' },
  { key: '90s', label: "'80s–'90s" },
  { key: '2000s', label: '2000s' },
] as const

interface NostalgiaAppProps {
  initialAnime: AnimeEntry[]
  initialComments: GuestbookEntry[]
}

export function NostalgiaApp({ initialAnime, initialComments }: NostalgiaAppProps) {
  const [decade, setDecade] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<AnimeEntry | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = useMemo(() => {
    return initialAnime.filter((a) => {
      const inDecade =
        decade === 'all' ||
        (decade === '90s' ? a.year < 2000 : a.year >= 2000)
      const q = query.trim().toLowerCase()
      const inQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.titleJp.toLowerCase().includes(q) ||
        a.genre.toLowerCase().includes(q) ||
        a.studio.toLowerCase().includes(q)
      return inDecade && inQuery
    })
  }, [initialAnime, decade, query])

  const visitorCount = 13337 + initialComments.length * 7

  function openDetail(anime: AnimeEntry) {
    setSelected(anime)
    setDialogOpen(true)
  }

  return (
    <PlayerProvider anime={initialAnime}>
      <div className="crt-flicker relative flex min-h-screen flex-col pb-24">
      <CrtEffects />
      <SakuraPetals count={14} />

      {/* fake old-browser window chrome */}
      <div className="bevel-out bg-[#3a2110]">
        <div className="flex items-center justify-between border-b-2 border-[#6b4a28] bg-[#4a2c16] px-3 py-1.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5252]" aria-hidden="true" />
            <span className="h-3 w-3 rounded-full bg-[#ffb347]" aria-hidden="true" />
            <span className="h-3 w-3 rounded-full bg-[#7ce38b]" aria-hidden="true" />
          </div>
          <p className="font-pixel truncate px-2 text-[8px] tracking-wider text-amber-200/80 sm:text-[9px]">
            NOSTALGIA-TV.EXE — Netscape Navigator
          </p>
          <span className="font-vt hidden text-sm text-amber-200/50 sm:inline">_ □ ✕</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5">
          <Globe className="h-4 w-4 shrink-0 text-amber-300/70" aria-hidden="true" />
          <p className="font-vt bevel-in w-full truncate bg-black px-2 py-0.5 text-sm text-emerald-300/90">
            http://www.nostalgia-tv.geocities.com/~anime_shrine/index.html
          </p>
        </div>
      </div>

      {/* header */}
      <header className="relative overflow-hidden border-b-2 border-[#4a2c16] bg-[#1c0f06]">
        <Starfield count={70} />
        <div className="relative mx-auto max-w-5xl px-4 py-8 text-center sm:px-6 sm:py-12">
          <p className="font-vt text-base tracking-[0.3em] text-accent">
            ▼▽▼ WELCOME TO MY ANIME SHRINE ▼▽▼
          </p>
          <h1 className="font-pixel chroma-text mt-4 text-xl leading-relaxed text-amber-100 sm:text-4xl sm:leading-relaxed">
            NOSTALGIA-TV
          </h1>
          <p className="font-vt mt-3 cursor-blink inline-block text-lg text-amber-300/90 sm:text-2xl">
            the retro anime archive est. 2007
          </p>
          <p className="font-vt mx-auto mt-4 max-w-2xl text-base leading-snug text-amber-100/70 sm:text-lg">
            The classics that raised us — Clannad, Kanon, AIR, Evangelion, Sailor
            Moon, DBZ &amp; more — preserved on well-loved VHS tapes and displayed
            on a warm humming CRT. Every tape plays its opening theme on the
            cassette deck, and the guestbook is always open!
          </p>
          <div className="retro-stripes mx-auto mt-6 h-2 w-56 rounded-sm opacity-80" aria-hidden="true" />
        </div>
      </header>

      <RetroMarquee
        items={[
          '★ NEW: CASSETTE DECK INSTALLED — EVERY TAPE NOW PLAYS ITS OPENING THEME ♪',
          '★ NOW SHOWING: CLANNAD — DANGO DAIKAZOKU FOREVER',
          '“IT’S OVER 9000!” — 30 YEARS OF DBZ',
          'SEE YOU SPACE COWBOY… ♪ TANK! ON DECK',
          'HOEEE~ NEW SAKURA TAPES IN',
          'GOTTA CATCH ’EM ALL — INDIGO LEAGUE THEME PLAYING',
          'UGUU~ KANON SNOW UPDATE',
          'IN THE NAME OF THE MOON ★ MOONLIGHT DENSETSU ON AIR',
        ]}
      />

      <main className="relative space-y-12 py-10 sm:space-y-16 sm:py-14">
        <TvHero anime={initialAnime} />

        {/* archive */}
        <section aria-labelledby="archive-heading" className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="archive-heading" className="font-pixel chroma-text-soft flex items-center gap-2 text-sm text-amber-100 sm:text-base">
              <Archive className="h-5 w-5 text-amber-300" aria-hidden="true" />
              THE TAPE ARCHIVE
            </h2>
            <p className="font-vt text-sm text-amber-200/50">
              {filtered.length} / {initialAnime.length} tapes on the shelf
            </p>
          </div>

          {/* filter bar */}
          <div className="bevel-out mt-4 flex flex-col gap-3 rounded-md bg-[#3a2110] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by era">
              {DECADES.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDecade(d.key)}
                  aria-pressed={decade === d.key}
                  className={`font-vt bevel-out cursor-pointer rounded-sm px-3 py-1.5 text-base transition-colors ${
                    decade === d.key
                      ? 'bg-primary text-[#241308]'
                      : 'bg-[#241308] text-amber-200 hover:bg-[#1c0f06]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2">
              <Search className="h-4 w-4 text-amber-300/70" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="search tapes… try “Key” or “mecha”"
                aria-label="Search the archive"
                className="font-vt bevel-in h-10 w-full rounded-sm bg-black px-3 text-base text-amber-100 placeholder:text-amber-200/25 focus:outline-none focus-visible:outline-2 focus-visible:outline-amber-300 sm:w-72"
              />
            </label>
          </div>

          {/* grid */}
          {filtered.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a, i) => (
                <AnimeCard key={a.slug} anime={a} index={i} onOpen={openDetail} />
              ))}
            </div>
          ) : (
            <p className="font-vt bevel-in mt-6 bg-[#1c0f06] p-6 text-center text-lg text-amber-200/60">
              …static… no tapes matched. Try another search! (´;ω;`)
            </p>
          )}
        </section>

        <Guestbook anime={initialAnime} initialComments={initialComments} />
      </main>

      {/* footer */}
      <footer className="mt-auto border-t-2 border-[#4a2c16] bg-[#1c0f06]">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center sm:px-6">
          <p className="font-vt text-sm tracking-widest text-amber-300/80">
            ★ THIS SITE IS PART OF THE ANIME NOSTALGIA WEBRING ★
          </p>
          <p className="font-vt mt-2 text-base text-amber-200/60">
            « prev site | <span className="text-accent underline decoration-dotted">random</span> | next site »
          </p>

          <div className="mt-5 inline-flex flex-col items-center gap-2">
            <span className="font-vt text-sm tracking-widest text-amber-200/60">
              YOU ARE VISITOR NUMBER
            </span>
            <span className="flex gap-1" aria-label={`Visitor number ${visitorCount}`}>
              {String(visitorCount)
                .padStart(6, '0')
                .split('')
                .map((digit, i) => (
                  <span key={i} className="counter-digit text-lg">
                    {digit}
                  </span>
                ))}
            </span>
          </div>

          <div className="bevel-out mx-auto mt-6 inline-flex items-center gap-2 rounded-sm bg-[#3a2110] px-3 py-1.5">
            <span className="retro-blink h-3 w-3 rounded-full bg-amber-400" aria-hidden="true" />
            <span className="font-vt text-sm text-amber-200">
              UNDER CONSTRUCTION (since 2007, forever)
            </span>
          </div>

          <p className="font-vt mt-6 text-sm text-amber-200/40">
            Best viewed at 800×600 · Netscape Navigator 4.0 · 56k modem ·
            speakers ON (MIDI autoplays in your heart)
          </p>
          <p className="font-vt mt-1 text-sm text-amber-200/40">
            NOSTALGIA-TV — no rights reserved, only memories · 1992–2007
          </p>
        </div>
      </footer>

      <AnimeDetailDialog
        anime={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        comments={initialComments}
      />
      </div>
      <BoomboxBar />
    </PlayerProvider>
  )
}

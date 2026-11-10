'use client'

import { useEffect, useMemo, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Send, BookHeart } from 'lucide-react'
import type { AnimeEntry, GuestbookEntry } from './types'

const MOODS = [
  { key: 'nostalgic', face: '(´ω｀)', label: 'nostalgic' },
  { key: 'crying', face: '(╥_╥)', label: 'crying' },
  { key: 'hyped', face: 'ᕦ(ò_óˇ)ᕤ', label: 'hyped' },
  { key: 'sparkly', face: '(✿◠‿◠)', label: 'sparkly' },
  { key: 'cozy', face: '(—˃ω˂—)', label: 'cozy' },
  { key: 'jazzy', face: '♪(๑ᴖ◡ᴖ๑)♪', label: 'jazzy' },
  { key: 'existential', face: 'ಠ_ಠ', label: 'existential' },
]

const MOOD_FACES: Record<string, string> = Object.fromEntries(
  MOODS.map((m) => [m.key, m.face])
)

function timeAgo(dateStr: string) {
  const then = new Date(dateStr).getTime()
  if (Number.isNaN(then)) return 'back in the day'
  const days = Math.floor((Date.now() - then) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  return `${Math.floor(days / 30)} months ago`
}

interface GuestbookProps {
  anime: AnimeEntry[]
  initialComments: GuestbookEntry[]
}

export function Guestbook({ anime, initialComments }: GuestbookProps) {
  const { toast } = useToast()
  const [comments, setComments] = useState<GuestbookEntry[]>(initialComments)
  const [author, setAuthor] = useState('')
  const [message, setMessage] = useState('')
  const [mood, setMood] = useState('nostalgic')
  const [animeSlug, setAnimeSlug] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const titleBySlug = useMemo(
    () => Object.fromEntries(anime.map((a) => [a.slug, a.title])),
    [anime]
  )

  // keep list fresh when opened from other sections
  useEffect(() => {
    setComments(initialComments)
  }, [initialComments, reloadKey])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!author.trim() || !message.trim()) {
      toast({
        title: 'Hold up! (⊙_⊙)',
        description: 'Your pen name and a memory are required to sign the guestbook.',
      })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: author.trim(),
          message: message.trim(),
          mood,
          animeSlug: animeSlug || null,
        }),
      })
      if (!res.ok) throw new Error('post failed')
      const created: GuestbookEntry = await res.json()
      setComments((prev) => [created, ...prev])
      setMessage('')
      toast({
        title: 'Guestbook signed! ✍',
        description: `Thanks for the memory, ${created.author}. Your entry is on the wall forever.`,
      })
    } catch {
      toast({
        title: 'The modem screeched… (╥_╥)',
        description: 'Could not reach the server. Try again in a bit.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section aria-labelledby="guestbook-heading" className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="bevel-out rounded-md bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <BookHeart className="h-6 w-6 text-accent" aria-hidden="true" />
          <h2 id="guestbook-heading" className="font-pixel chroma-text-soft text-sm text-amber-100 sm:text-base">
            SIGN THE FAN GUESTBOOK
          </h2>
          <span className="font-vt text-sm text-amber-300/60">
            {comments.length} memories posted
          </span>
        </div>
        <p className="font-vt mt-2 text-base text-amber-100/70">
          Leave a memory about the shows that raised you. No logins, no likes —
          just the old internet, the way we loved it.
        </p>

        {/* ── form ── */}
        <form onSubmit={submit} className="bevel-in mt-5 bg-[#1c0f06] p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-vt text-sm tracking-wide text-amber-300">
                PEN NAME:
              </span>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={40}
                placeholder="xX_SakuraFan2005_Xx"
                className="font-vt mt-1 h-11 w-full bevel-out rounded-sm bg-[#241308] px-3 text-lg text-amber-100 placeholder:text-amber-200/25 focus:outline-none focus-visible:outline-2 focus-visible:outline-amber-300"
              />
            </label>

            <label className="block">
              <span className="font-vt text-sm tracking-wide text-amber-300">
                ABOUT WHICH TAPE? (optional)
              </span>
              <select
                value={animeSlug}
                onChange={(e) => setAnimeSlug(e.target.value)}
                className="font-vt mt-1 h-11 w-full bevel-out rounded-sm bg-[#241308] px-3 text-lg text-amber-100 focus:outline-none focus-visible:outline-2 focus-visible:outline-amber-300"
              >
                <option value="">— the whole era —</option>
                {anime.map((a) => (
                  <option key={a.slug} value={a.slug}>
                    {a.title} ({a.year})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="mt-4">
            <legend className="font-vt text-sm tracking-wide text-amber-300">
              YOUR MOOD:
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMood(m.key)}
                  aria-pressed={mood === m.key}
                  className={`font-vt bevel-out rounded-sm px-2.5 py-1.5 text-base transition-colors ${
                    mood === m.key
                      ? 'bg-accent text-[#241308]'
                      : 'bg-[#3a2110] text-amber-200 hover:bg-[#4a2c16]'
                  }`}
                >
                  {m.face} {m.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-4 block">
            <span className="font-vt text-sm tracking-wide text-amber-300">
              YOUR MEMORY:
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="I stayed up till 2AM watching this on a school night and never regretted it…"
              className="font-vt retro-scroll mt-1 w-full bevel-out rounded-sm bg-[#241308] px-3 py-2 text-lg leading-snug text-amber-100 placeholder:text-amber-200/25 focus:outline-none focus-visible:outline-2 focus-visible:outline-amber-300"
            />
            <span className="font-vt float-right mt-0.5 text-xs text-amber-200/40">
              {message.length}/500
            </span>
          </label>

          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="font-vt hidden text-xs text-amber-200/40 sm:block">
              ※ entries are stored forever, like a GeoCities shrine
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="wiggle-hover bevel-out flex h-12 min-w-44 cursor-pointer items-center justify-center gap-2 rounded-sm bg-primary px-4 font-pixel text-[10px] text-[#241308] transition-colors hover:bg-[#ffc266] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  DIALING…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  SIGN GUESTBOOK
                </>
              )}
            </button>
          </div>
        </form>

        {/* ── entries ── */}
        <ul className="retro-scroll mt-6 max-h-[28rem] space-y-3 overflow-y-auto pr-1" aria-label="Guestbook entries">
          {comments.map((c, i) => (
            <li key={c.id} className="bevel-in bg-[#1c0f06] p-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-vt text-base text-amber-300">
                  {MOOD_FACES[c.mood] ?? MOOD_FACES.nostalgic}{' '}
                  <span className="text-amber-100">{c.author}</span>
                  {c.animeSlug && (
                    <span className="text-amber-200/50"> on 「{titleBySlug[c.animeSlug] ?? c.animeSlug}」</span>
                  )}
                </span>
                <span className="font-vt text-xs text-amber-200/40">
                  #{String(comments.length - i).padStart(3, '0')} · {timeAgo(c.createdAt)}
                </span>
              </div>
              <p className="font-vt mt-1.5 text-base leading-snug text-amber-100/85">
                {c.message}
              </p>
            </li>
          ))}
          {comments.length === 0 && (
            <li className="font-vt bevel-in bg-[#1c0f06] p-4 text-center text-base text-amber-200/60">
              No memories yet — be the first to sign!
            </li>
          )}
        </ul>
      </div>
    </section>
  )
}

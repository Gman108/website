import { db } from '@/lib/db'
import { NostalgiaApp } from '@/components/nostalgia/app'
import type { AnimeEntry, GuestbookEntry } from '@/components/nostalgia/types'

export const dynamic = 'force-dynamic'

async function getData(): Promise<{
  anime: AnimeEntry[]
  comments: GuestbookEntry[]
}> {
  try {
    const anime = await db.anime.findMany({
      orderBy: { nostalgia: 'desc' },
      include: { _count: { select: { comments: true } } },
    })
    const comments = await db.comment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return {
      anime: anime.map((a) => ({ ...a, nostalgia: Number(a.nostalgia) })),
      comments: comments.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
    }
  } catch (error) {
    console.error('Failed to load nostalgia data', error)
    return { anime: [], comments: [] }
  }
}

export default async function Home() {
  const { anime, comments } = await getData()
  return <NostalgiaApp initialAnime={anime} initialComments={comments} />
}

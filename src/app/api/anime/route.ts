import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const anime = await db.anime.findMany({
      orderBy: { nostalgia: 'desc' },
      include: { _count: { select: { comments: true } } },
    })
    return NextResponse.json(anime)
  } catch (error) {
    console.error('Failed to load anime', error)
    return NextResponse.json({ error: 'Failed to load anime' }, { status: 500 })
  }
}

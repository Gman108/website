import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('anime')
    const comments = await db.comment.findMany({
      where: slug ? { animeSlug: slug } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json(comments)
  } catch (error) {
    console.error('Failed to load comments', error)
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const author = (body.author ?? '').toString().trim().slice(0, 40)
    const message = (body.message ?? '').toString().trim().slice(0, 500)
    const mood = (body.mood ?? 'nostalgic').toString().trim().slice(0, 20)
    const animeSlug = body.animeSlug ? (body.animeSlug as string).trim() : null

    if (!author || !message) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 })
    }

    const comment = await db.comment.create({
      data: { author, message, mood, animeSlug },
    })
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Failed to post comment', error)
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 })
  }
}

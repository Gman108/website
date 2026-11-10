export interface AnimeEntry {
  id: number
  slug: string
  title: string
  titleJp: string
  year: number
  studio: string
  genre: string
  episodes: string
  synopsis: string
  tagline: string
  quote: string
  imageUrl: string
  nostalgia: number
  themeName?: string | null
  themeArtist?: string | null
  audioUrl?: string | null
  _count?: { comments: number }
}

export interface GuestbookEntry {
  id: number
  author: string
  message: string
  mood: string
  animeSlug: string | null
  createdAt: string
}

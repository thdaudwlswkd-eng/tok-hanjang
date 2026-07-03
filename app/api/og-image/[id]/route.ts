import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const card = await prisma.card.findUnique({ where: { id: params.id } })
    if (!card) return new NextResponse('Not found', { status: 404 })

    const imageUrl = (card.heroMode === 'card-image' && card.cardImage)
      ? card.cardImage
      : (card.profilePhoto ?? (card.photos ? JSON.parse(card.photos)[0] : null))

    if (!imageUrl) return new NextResponse('No image', { status: 404 })

    const res = await fetch(imageUrl, { next: { revalidate: 3600 } })
    if (!res.ok) return new NextResponse('Image fetch failed', { status: 502 })

    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    const body = await res.arrayBuffer()

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return new NextResponse('Error', { status: 500 })
  }
}

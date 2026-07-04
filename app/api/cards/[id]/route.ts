import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const card = await prisma.card.findUnique({ where: { id: params.id } })
  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const c = card as Record<string, unknown>
  return NextResponse.json({
    ...card,
    photos: card.photos ? JSON.parse(card.photos) : [],
    hours: card.hours ? JSON.parse(card.hours) : null,
    snsLinks: card.snsLinks ? JSON.parse(card.snsLinks) : null,
    bookingSettings: c.bookingSettings ? JSON.parse(c.bookingSettings as string) : null,
  })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()

  const updateData: Record<string, unknown> = {}
  const fields = ['name', 'title', 'bio', 'career', 'profilePhoto', 'phone', 'fax', 'email', 'kakaoLink', 'address', 'lat', 'lng', 'slideshowUrl', 'videoUrl', 'ogImage', 'theme', 'textColor', 'heroMode', 'cardImage'] as const

  for (const f of fields) {
    if (f in body) updateData[f] = body[f]
  }
  if ('photos' in body) updateData.photos = JSON.stringify(body.photos)
  if ('hours' in body) updateData.hours = JSON.stringify(body.hours)
  if ('snsLinks' in body) updateData.snsLinks = JSON.stringify(body.snsLinks)
  if ('bookingEnabled' in body) updateData.bookingEnabled = Boolean(body.bookingEnabled)
  if ('bookingSettings' in body) {
    updateData.bookingSettings = typeof body.bookingSettings === 'string'
      ? body.bookingSettings
      : JSON.stringify(body.bookingSettings)
  }

  const card = await prisma.card.update({ where: { id: params.id }, data: updateData })
  const c = card as Record<string, unknown>

  return NextResponse.json({
    ...card,
    photos: card.photos ? JSON.parse(card.photos) : [],
    hours: card.hours ? JSON.parse(card.hours) : null,
    snsLinks: card.snsLinks ? JSON.parse(card.snsLinks) : null,
    bookingSettings: c.bookingSettings ? JSON.parse(c.bookingSettings as string) : 
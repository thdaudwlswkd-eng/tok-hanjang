import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const bookings = await prisma.booking.findMany({
    where: { cardId: params.id },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
  })
  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { name, phone, date, time, guests, note } = await req.json()

  if (!name || !phone || !date || !time) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const booking = await prisma.booking.create({
    data: { cardId: params.id, name, phone, date, time, guests: guests ? Number(guests) : null, note: note || null },
  })

  return NextResponse.json(booking, { status: 201 })
}

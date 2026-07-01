import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  const card = await prisma.card.create({ data: {} })
  return NextResponse.json({ id: card.id })
}

import { ImageResponse } from 'next/og'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import React from 'react'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const card = await prisma.card.findUnique({ where: { id: params.id } })
    if (!card) return new NextResponse('Not found', { status: 404 })

    // card-image 모드: 실제 이미지 프록시
    if (card.heroMode === 'card-image' && card.cardImage) {
      const res = await fetch(card.cardImage)
      if (!res.ok) return new NextResponse('Image fetch failed', { status: 502 })
      const contentType = res.headers.get('content-type') ?? 'image/jpeg'
      const body = await res.arrayBuffer()
      return new NextResponse(body, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      })
    }

    // profile 모드: 명함 첫 화면과 동일한 가로 배치 이미지 생성
    const theme = card.theme ?? '#0f172a'
    const tc = card.textColor ?? '#ffffff'
    const profilePhoto = (card as Record<string, unknown>).profilePhoto as string | null ?? null
    const fax = (card as Record<string, unknown>).fax as string | null ?? null
    const email = (card as Record<string, unknown>).email as string | null ?? null

    // 왼쪽: 원형 프로필 사진
    const photoEl = profilePhoto
      ? React.createElement('img', {
          src: profilePhoto,
          width: 220,
          height: 220,
          style: {
            borderRadius: '50%',
            objectFit: 'cover',
            border: `5px solid ${tc}50`,
            flexShrink: 0,
          },
        })
      : React.createElement('div', {
          style: {
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: `${tc}20`,
            border: `5px solid ${tc}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 100,
            flexShrink: 0,
          },
        }, '\u{1F464}')

    // 오른쪽: 텍스트 블록
    const textItems = [
      card.name
        ? React.createElement('div', {
            key: 'name',
            style: { fontSize: 60, fontWeight: 700, color: tc, lineHeight: 1.2 },
          }, card.name)
        : null,
      card.title
        ? React.createElement('div', {
            key: 'title',
            style: { fontSize: 28, color: tc, opacity: 0.85, marginTop: 8 },
          }, card.title)
        : null,
      card.phone
        ? React.createElement('div', {
            key: 'phone',
            style: { fontSize: 26, color: tc, opacity: 0.7, marginTop: 16 },
          }, card.phone)
        : null,
      fax
        ? React.createElement('div', {
            key: 'fax',
            style: { fontSize: 22, color: tc, opacity: 0.65, marginTop: 6 },
          }, `F. ${fax}`)
        : null,
      email
        ? React.createElement('div', {
            key: 'email',
            style: { fontSize: 22, color: tc, opacity: 0.65, marginTop: 6 },
          }, email)
        : null,
      card.address
        ? React.createElement('div', {
            key: 'address',
            style: { fontSize: 20, color: tc, opacity: 0.55, marginTop: 6 },
          }, card.address)
        : null,
    ].filter(Boolean)

    const textBlock = React.createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 60,
        minWidth: 0,
        flex: 1,
      },
    }, ...textItems)

    // 브랜드 배지
    const brandEl = React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: 36,
        right: 48,
        fontSize: 20,
        color: tc,
        opacity: 0.3,
        letterSpacing: '0.1em',
      },
    }, '\ud86d\udc01\ud55c\uc7a5')

    const root = React.createElement('div', {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, rgba(0,0,0,0.25), rgba(0,0,0,0)), ${theme}`,
        position: 'relative',
        padding: '0 80px',
      },
    }, photoEl, textBlock, brandEl)

    return new ImageResponse(root, { width: 1200, height: 630 })
  } catch (e) {
    console.error('[og-image]', e)
    return new NextResponse('Error', { status: 500 })
  }
}

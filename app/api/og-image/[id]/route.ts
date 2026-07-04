import { ImageResponse } from 'next/og'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import React from 'react'

export const runtime = 'nodejs'

async function loadKoreanFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap',
      { headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0)' } }
    ).then(r => r.text())

    const fontUrl = css.match(/src: url\((.+?)\) format\('truetype'\)/)?.[1]
    if (!fontUrl) return null

    return await fetch(fontUrl).then(r => r.arrayBuffer())
  } catch {
    return null
  }
}

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
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    // profile 모드: 카드 썸네일 이미지 생성 (React.createElement — no JSX)
    const theme = card.theme ?? '#0f172a'
    const textColor = card.textColor ?? '#ffffff'
    const profilePhoto = card.profilePhoto ?? null

    const fontData = await loadKoreanFont()

    const photoEl = profilePhoto
      ? React.createElement('img', {
          src: profilePhoto,
          width: 180,
          height: 180,
          style: {
            borderRadius: '50%',
            objectFit: 'cover',
            border: '4px solid rgba(255,255,255,0.3)',
          },
        })
      : React.createElement('div', {
          style: {
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 80,
          },
        }, '👤')

    const nameEl = card.name
      ? React.createElement('div', {
          style: { fontSize: 54, fontWeight: 700, color: textColor },
        }, card.name)
      : null

    const titleEl = card.title
      ? React.createElement('div', {
          style: { fontSize: 28, color: textColor, opacity: 0.7 },
        }, card.title)
      : null

    const phoneEl = card.phone
      ? React.createElement('div', {
          style: { fontSize: 24, color: textColor, opacity: 0.5, marginTop: 4 },
        }, card.phone)
      : null

    const textBlock = React.createElement('div', {
      style: {
        marginTop: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      },
    }, nameEl, titleEl, phoneEl)

    const badgeEl = React.createElement('div', {
      style: {
        position: 'absolute',
        top: 48,
        fontSize: 20,
        color: textColor,
        opacity: 0.5,
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: 999,
        padding: '6px 20px',
        letterSpacing: '0.15em',
      },
    }, '명함형 홈페이지')

    const brandEl = React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: 36,
        fontSize: 18,
        color: textColor,
        opacity: 0.2,
        letterSpacing: '0.12em',
      },
    }, '톡한장')

    const root = React.createElement('div', {
      style: {
        width: '800px',
        height: '800px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme,
        fontFamily: 'Noto Sans KR, sans-serif',
        position: 'relative',
      },
    }, badgeEl, photoEl, textBlock, brandEl)

    return new ImageResponse(root, {
      width: 800,
      height: 800,
      ...(fontData
        ? { fonts: [{ name: 'Noto Sans KR', data: fontData, style: 'normal' }] }
        : {}),
    })
  } catch (e) {
    console.error('[og-image]', e)
    return new NextResponse('Error', { status: 500 })
  }
}

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'
import { CardData, BusinessHours, SnsLinks } from '@/lib/types'
import Slideshow from '@/components/viewer/Slideshow'
import QuickContactBar from '@/components/viewer/QuickContactBar'
import BookingSection from '@/components/viewer/BookingSection'
import SnsSection from '@/components/viewer/SnsSection'
import MapSection from '@/components/viewer/MapSection'
import HoursSection from '@/components/viewer/HoursSection'
import ShareSection from '@/components/viewer/ShareSection'
import VideoSection from '@/components/viewer/VideoSection'
import OwnerBanner from '@/components/viewer/OwnerBanner'

interface Props {
  params: { id: string }
}

interface RawCard extends CardData {
  bookingSettings?: string | null
  fax?: string | null
  email?: string | null
}

const getCard = cache(async (id: string): Promise<RawCard | null> => {
  try {
    const card = await prisma.card.findUnique({ where: { id } })
    if (!card) return null
    const raw = card as Record<string, unknown>
    return {
      ...card,
      photos: card.photos ? JSON.parse(card.photos) : [],
      hours: card.hours ? JSON.parse(card.hours) as BusinessHours : null,
      snsLinks: card.snsLinks ? JSON.parse(card.snsLinks) as SnsLinks : null,
      bookingSettings: raw.bookingSettings as string | null ?? null,
      fax: raw.fax as string | null ?? null,
      email: raw.email as string | null ?? null,
    }
  } catch {
    return null
  }
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const card = await getCard(params.id)
  if (!card) return { title: '페이지를 찾을 수 없습니다' }

  const title = '핸드폰으로 뚝딱 만드는 명함형 홈페이지'
  const description = [card.name, card.title].filter(Boolean).join(' · ')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const imageUrl = `${baseUrl}/api/og-image/${params.id}`
  const cardUrl = `${baseUrl}/card/${params.id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: cardUrl,
      images: [{ url: imageUrl, width: 800, height: 800, alt: card.name ?? '명함 이미지' }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function CardPage({ params }: Props) {
  const card = await getCard(params.id)
  if (!card) notFound()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const shareUrl = `${baseUrl}/card/${card.id}`

  const tc = card.textColor ?? '#ffffff'

  const pendingBookings = await prisma.booking.count({ where: { cardId: card.id, status: 'pending' } })

  const parsedBookingSettings = card.bookingSettings
    ? JSON.parse(card.bookingSettings)
    : null

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto pb-24">
      <OwnerBanner cardId={card.id} pendingBookings={pendingBookings} />

      {/* 명함 첫 화면 */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ height: '100svh' }}>
        {card.heroMode === 'card-image' && card.cardImage ? (
          /* 명함사진 모드 */
          <div className="w-full h-full bg-black flex items-center justify-center">
            <img
              src={card.cardImage}
              alt={card.name ?? '명함'}
              style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </div>
        ) : (
          /* 프로필 모드 — 가로 배치 */
          <div
            className="w-full h-full flex items-center justify-center px-8"
            style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.25), rgba(0,0,0,0)), ${card.theme ?? '#0f172a'}` }}
          >
            {/* 왼쪽: 원형 프로필 사진 */}
            <div
              className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${tc}20`, border: `3px solid ${tc}40` }}
            >
              {card.profilePhoto
                ? <img src={card.profilePhoto} alt={card.name ?? '프로필'} className="w-full h-full object-cover" />
                : <span className="text-5xl">&#x1F464;</span>}
            </div>

            {/* 오른쪽: 텍스트 정보 */}
            <div className="ml-6 flex flex-col min-w-0">
              {card.name && (
                <p className="text-2xl font-bold leading-tight" style={{ color: tc }}>{card.name}</p>
              )}
              {card.title && (
                <p className="text-sm mt-1" style={{ color: tc, opacity: 0.85 }}>{card.title}</p>
              )}
              {card.phone && (
                <p className="text-sm mt-2" style={{ color: tc, opacity: 0.7 }}>{card.phone}</p>
              )}
              {(card as RawCard).fax && (
                <p className="text-xs mt-1" style={{ color: tc, opacity: 0.65 }}>F. {(card as RawCard).fax}</p>
              )}
              {(card as RawCard).email && (
                <p className="text-xs mt-1" style={{ color: tc, opacity: 0.65 }}>{(card as RawCard).email}</p>
              )}
              {card.address && (
                <p className="text-xs mt-1 leading-relaxed" style={{ color: tc, opacity: 0.6 }}>{card.address}</p>
              )}
            </div>
          </div>
        )}

        {/* 하단 스크롤 화살표 */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <span className="text-white/40 text-2xl animate-bounce">&#x2193;</span>
        </div>
      </section>

      <QuickContactBar phone={card.phone} kakaoLink={card.kakaoLink} variant="inline" />

      {card.photos && card.photos.length > 0 && (
        <Slideshow photos={card.photos} />
      )}

      {card.videoUrl && <VideoSection videoUrl={card.videoUrl} />}

      {card.career && (
        <section className="px-5 py-6 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-800 mb-3">&#x1F4CB; 경력 및 소개</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{card.career}</p>
        </section>
      )}

      <SnsSection snsLinks={card.snsLinks} />

      <BookingSection cardId={card.id} bookingSettings={parsedBookingSettings} />

      <HoursSection hours={card.hours} />

      <MapSection address={card.address} />

      <ShareSection url={shareUrl} name={card.name} />

      <div className="border-t border-slate-100 px-5 py-5 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
        <div>
          <p className="text-xs text-slate-500">이 명함은 <span className="font-bold text-blue-600">톡한장</span>으로 만들었어요</p>
          <p className="text-xs text-slate-400 mt-0.5">나도 5분 만에 모바일 명함 만들기</p>
        </div>
        <a href="/start" className="bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap shadow">
          나도 만들기
        </a>
      </div>

      <QuickContactBar phone={card.phone} kakaoLink={card.kakaoLink} variant="sticky" />
    </div>
  )
}

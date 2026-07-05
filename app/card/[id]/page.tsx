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

  const rawCard = card as Record<string, unknown>
  const v = rawCard.updatedAt instanceof Date ? rawCard.updatedAt.getTime() : 0
  const cardImageUrl = rawCard.cardImage as string | null ?? null
  const imageUrl = cardImageUrl ?? `${baseUrl}/api/og-image/${params.id}?v=${v}`
  const cardUrl = `${baseUrl}/card/${params.id}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: cardUrl,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: card.name ?? '명함 이미지' }],
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
  const bg = card.theme ?? '#0f172a'

  const pendingBookings = await prisma.booking.count({ where: { cardId: card.id, status: 'pending' } })

  const parsedBookingSettings = card.bookingSettings
    ? JSON.parse(card.bookingSettings)
    : null

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto pb-24">

      {/* 명함 첫 화면 */}
      <section className="relative overflow-hidden" style={{ height: '100svh' }}>
        {/* 오너 배너 */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <OwnerBanner cardId={card.id} pendingBookings={pendingBookings} />
        </div>

        {/* 배경: 명함 이미지(테마색 레터박스) or 테마 컬러 */}
        {card.cardImage ? (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: bg }}
          >
            <img
              src={card.cardImage}
              alt={card.name ?? '명함'}
              className="w-full h-full"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.25), rgba(0,0,0,0)), ${bg}` }}
          />
        )}

        {/* 이름 + 직함 오버레이 (하단) */}
        {(card.name || card.title) && (
          <div
            className="absolute bottom-0 left-0 right-0 px-6 pb-16"
            style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}
          >
            {card.name && (
              <p className="text-2xl font-bold leading-tight drop-shadow" style={{ color: tc }}>{card.name}</p>
            )}
            {card.title && (
              <p className="text-sm mt-1 drop-shadow" style={{ color: tc, opacity: 0.85 }}>{card.title}</p>
            )}
          </div>
        )}

        {/* 스크롤 화살표 */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center z-10">
          <span className="text-white/40 text-2xl animate-bounce">&#x2193;</span>
        </div>
      </section>

      <QuickContactBar phone={card.phone} kakaoLink={card.kakaoLink} variant="inline" />

      {/* 연락처 정보 */}
      {(card.phone || (card as RawCard).fax || (card as RawCard).email || card.address) && (
        <section className="px-5 py-5 border-b border-slate-100">
          <div className="space-y-3">
            {card.phone && (
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">📞</span>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">전화</p>
                  <a href={`tel:${card.phone}`} className="text-sm font-semibold text-slate-800">{card.phone}</a>
                </div>
              </div>
            )}
            {(card as RawCard).fax && (
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">📠</span>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">팩스</p>
                  <p className="text-sm font-semibold text-slate-800">{(card as RawCard).fax}</p>
                </div>
              </div>
            )}
            {(card as RawCard).email && (
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">✉️</span>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">이메일</p>
                  <a href={`mailto:${(card as RawCard).email}`} className="text-sm font-semibold text-slate-800">{(card as RawCard).email}</a>
                </div>
              </div>
            )}
            {card.address && (
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">📍</span>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">주소</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{card.address}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

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

      <QuickContactBar p
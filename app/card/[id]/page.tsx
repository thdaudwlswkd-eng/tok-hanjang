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
          <div className="w-full h-full bg-black flex items-center justify-center">
            <img
              src={card.cardImage}
              alt={card.name ?? '명함'}
              style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </div>
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center px-8"
            style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0)), ${card.theme ?? '#0f172a'}` }}
          >
            <div
              className="w-36 h-36 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 mb-6"
              style={{ backgroundColor: `${tc}20`, border: `3px solid ${tc}30` }}
            >
              {card.profilePhoto
                ? <img src={card.profilePhoto} alt={card.name ?? '프로필'} className="w-full h-full object-cover" />
                : <span className="text-6xl">&#x1F464;</span>}
            </div>
            {card.name && (
              <p className="text-3xl font-bold mb-2 text-center" style={{ color: tc }}>{card.name}</p>
            )}
            {card.title && (
              <p className="text-lg mb-2 text-center" style={{ color: tc, opacity: 0.8 }}>{card.title}</p>
            )}
            {card.phone && (
              <p className="text-base text-center" style={{ color: tc, opacity: 0.6 }}>{card.phone}</p>
            )}
          </div>
        )}
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

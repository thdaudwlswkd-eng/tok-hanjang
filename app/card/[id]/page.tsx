import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'
import { CardData, BusinessHours, SnsLinks } from '@/lib/types'
import Slideshow from '@/components/viewer/Slideshow'
import ContactButtons from '@/components/viewer/ContactButtons'
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
  const description = ''
  const image = (card.heroMode === 'card-image' && card.cardImage)
    ? card.cardImage
    : (card.profilePhoto ?? card.photos?.[0] ?? undefined)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image.startsWith('http') ? image : `${baseUrl}${image}` }] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image.startsWith('http') ? image : `${baseUrl}${image}`] : [],
    },
  }
}

export default async function CardPage({ params }: Props) {
  const card = await getCard(params.id)
  if (!card) notFound()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const shareUrl = `${baseUrl}/card/${card.id}`

  const headerBg = card.theme?.startsWith('#')
    ? `linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0)), ${card.theme}`
    : 'linear-gradient(to bottom, #0f172a, #1e293b)'

  const tc = card.textColor ?? '#ffffff'
  function rgba(hex: string, a: number) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${a})`
  }

  const pendingBookings = card.bookingEnabled
    ? await prisma.booking.count({ where: { cardId: card.id, status: 'pending' } })
    : 0

  const parsedBookingSettings = card.bookingSettings
    ? JSON.parse(card.bookingSettings)
    : null

  const hasSnsLinks = card.snsLinks && Object.values(card.snsLinks).some(Boolean)
  const hasContent = card.name || card.title || card.bio || card.career ||
    (card.photos && card.photos.length > 0) || card.phone || card.kakaoLink ||
    card.address || card.hours || hasSnsLinks || card.bookingEnabled

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto">
      <OwnerBanner cardId={card.id} pendingBookings={pendingBookings} />

      {/* 명함 헤더 — 화면 꽉 차게 */}
      {card.heroMode === 'card-image' && card.cardImage ? (
        <section className="relative bg-black flex items-center justify-center overflow-hidden" style={{ height: '100svh' }}>
          <img
            src={card.cardImage}
            alt="명함"
            style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', display: 'block', objectFit: 'contain' }}
          />
          {/* 스크롤 힌트 */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-6">
            <p className="text-white/80 text-xs mb-1">아래로 스크롤</p>
            <span className="text-white/60 text-lg animate-bounce">↓</span>
          </div>
        </section>
      ) : (
      <section
        className="text-white px-6 relative flex flex-col items-center justify-center"
        style={{ background: headerBg, height: '100svh' }}
      >
        {/* 명함형 홈페이지 뱃지 */}
        <div className="flex justify-center mb-6">
          <span className="text-xs px-3 py-1 rounded-full border border-white/30 text-white/60 tracking-widest">
            명함형 홈페이지
          </span>
        </div>

        {card.profilePhoto && (
          <div className="flex justify-center mb-6">
            <img
              src={card.profilePhoto}
              alt="프로필"
              className="w-40 h-40 rounded-full object-cover border-[3px] border-white/40 shadow-2xl"
            />
          </div>
        )}
        <div className="text-center">
          {card.name && (
            <h1 className="text-3xl font-bold leading-tight" style={{ color: tc }}>{card.name}</h1>
          )}
          {card.title && (
            <p className="text-base mt-2" style={{ color: rgba(tc, 0.7) }}>{card.title}</p>
          )}
          {card.phone && (
            <p className="text-base mt-1.5" style={{ color: rgba(tc, 0.55) }}>{card.phone}</p>
          )}
        </div>
        {card.bio && (
          <p className="text-sm leading-relaxed mt-5 text-center max-w-xs" style={{ color: rgba(tc, 0.8) }}>{card.bio}</p>
        )}

        {/* 스크롤 힌트 */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center">
          <p className="text-xs mb-1" style={{ color: rgba(tc, 0.45) }}>아래로 스크롤</p>
          <span className="text-lg animate-bounce" style={{ color: rgba(tc, 0.4) }}>↓</span>
        </div>
      </section>
      )}

      {/* 연락처 + 예약 버튼 */}
      <ContactButtons
        phone={card.phone}
        kakaoLink={card.kakaoLink}
        bookingEnabled={card.bookingEnabled}
        bookingSettings={parsedBookingSettings}
        cardId={card.id}
      />

      {/* 슬라이드쇼 */}
      {card.photos && card.photos.length > 0 && (
        <Slideshow photos={card.photos} />
      )}

      {/* 업로드 동영상 */}
      {card.videoUrl && <VideoSection videoUrl={card.videoUrl} />}

      {/* 경력 소개 */}
      {card.career && (
        <section className="px-5 py-6 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-800 mb-3">📋 경력 및 소개</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{card.career}</p>
        </section>
      )}

      <SnsSection snsLinks={card.snsLinks} />
      <MapSection address={card.address} />
      <HoursSection hours={card.hours} />
      <ShareSection url={shareUrl} name={card.name} />

      {!hasContent && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-4xl mb-4">📭</p>
          <p>아직 내용이 없습니다</p>
          <a href={`/create?id=${card.id}`} className="text-blue-500 font-semibold mt-2 inline-block">
            편집하러 가기
          </a>
        </div>
      )}

      {/* 나도 만들기 배너 */}
      <div className="border-t border-slate-100 px-5 py-5 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
        <div>
          <p className="text-xs text-slate-500">이 명함은 <span className="font-bold text-blue-600">톡한장</span>으로 만들었어요 ✨</p>
          <p className="text-xs text-slate-400 mt-0.5">나도 5분 만에 모바일 명함 만들기</p>
        </div>
        <a href="/start" className="bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap shadow">
          나도 만들기
        </a>
      </div>
    </div>
  )
}
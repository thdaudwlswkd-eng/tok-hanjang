'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import PhotoStep from '@/components/editor/PhotoStep'
import ProfileStep from '@/components/editor/ProfileStep'
import ThemeStep from '@/components/editor/ThemeStep'
import ContactStep, { BookingSettings, DEFAULT_BOOKING_SETTINGS } from '@/components/editor/ContactStep'
import SnsStep from '@/components/editor/SnsStep'
import MapStep from '@/components/editor/MapStep'
import HoursStep from '@/components/editor/HoursStep'
import { BusinessHours, SnsLinks, DEFAULT_THEME_COLOR, DEFAULT_TEXT_COLOR } from '@/lib/types'

const STEPS = [
  { id: 'photos',  label: '사진',    icon: '📸' },
  { id: 'profile', label: '소개',    icon: '👤' },
  { id: 'theme',   label: '색상',    icon: '🎨' },
  { id: 'contact', label: '연락처',  icon: '📞' },
  { id: 'sns',     label: 'SNS',     icon: '🔗' },
  { id: 'map',     label: '위치',    icon: '🗺️' },
  { id: 'hours',   label: '영업시간', icon: '🕐' },
]

function CreatePageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get('id')!

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showShare, setShowShare] = useState(false)
  const [copied, setCopied] = useState(false)

  // Form state
  const [photos, setPhotos] = useState<string[]>([])
  const [profilePhoto, setProfilePhoto] = useState('')
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [career, setCareer] = useState('')
  const [theme, setTheme] = useState(DEFAULT_THEME_COLOR)
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR)
  const [phone, setPhone] = useState('')
  const [kakaoLink, setKakaoLink] = useState('')
  const [snsLinks, setSnsLinks] = useState<SnsLinks>({})
  const [bookingEnabled, setBookingEnabled] = useState(false)
  const [bookingSettings, setBookingSettings] = useState<BookingSettings>(DEFAULT_BOOKING_SETTINGS)
  const [videoUrl, setVideoUrl] = useState('')
  const [address, setAddress] = useState('')
  const [hours, setHours] = useState<BusinessHours | null>(null)
  const [heroMode, setHeroMode] = useState('profile')
  const [cardImage, setCardImage] = useState('')
  const [loaded, setLoaded] = useState(false)

  // 기존 저장 데이터 불러오기
  useEffect(() => {
    if (!id) return
    fetch(`/api/cards/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        if (data.photos) setPhotos(Array.isArray(data.photos) ? data.photos : JSON.parse(data.photos))
        if (data.profilePhoto) setProfilePhoto(data.profilePhoto)
        if (data.name) setName(data.name)
        if (data.title) setTitle(data.title)
        if (data.bio) setBio(data.bio)
        if (data.career) setCareer(data.career)
        if (data.theme) setTheme(data.theme)
        if (data.textColor) setTextColor(data.textColor)
        if (data.phone) setPhone(data.phone)
        if (data.kakaoLink) setKakaoLink(data.kakaoLink)
        if (data.snsLinks) setSnsLinks(typeof data.snsLinks === 'string' ? JSON.parse(data.snsLinks) : data.snsLinks)
        if (data.bookingEnabled !== undefined) setBookingEnabled(data.bookingEnabled)
        if (data.bookingSettings) setBookingSettings(typeof data.bookingSettings === 'string' ? JSON.parse(data.bookingSettings) : data.bookingSettings)
        if (data.videoUrl) setVideoUrl(data.videoUrl)
        if (data.address) setAddress(data.address)
        if (data.hours) setHours(typeof data.hours === 'string' ? JSON.parse(data.hours) : data.hours)
        if (data.heroMode) setHeroMode(data.heroMode)
        if (data.cardImage) setCardImage(data.cardImage)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [id])

  const getPayload = useCallback(() => ({
    photos,
    profilePhoto,
    name,
    title,
    bio,
    career,
    theme,
    textColor,
    phone,
    kakaoLink,
    snsLinks,
    bookingEnabled,
    bookingSettings: JSON.stringify(bookingSettings),
    videoUrl,
    address,
    heroMode,
    cardImage,
    hours,
  }), [photos, profilePhoto, name, title, bio, career, theme, textColor, phone, kakaoLink, snsLinks, bookingEnabled, bookingSettings, videoUrl, address, heroMode, cardImage, hours])

  async function save() {
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch(`/api/cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getPayload()),
      })
      if (!res.ok) {
        setSaveError('저장 실패. 인터넷 연결을 확인하고 다시 시도해주세요.')
        return false
      }
      return true
    } catch {
      setSaveError('저장 중 오류가 발생했습니다.')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function finish() {
    await save()
    setShowShare(true)
  }

  function cardUrl() {
    return `${window.location.origin}/card/${id}`
  }

  async function copyLink() {
    await navigator.clipboard.writeText(cardUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function shareLink() {
    if (typeof navigator.share === 'function') {
      await navigator.share({ url: cardUrl(), title: '내 명함 홈페이지' }).catch(() => {})
    } else {
      await copyLink()
    }
  }

  function preview() {
    save().then(() => window.open(`/card/${id}`, '_blank'))
  }

  const isLast = step === STEPS.length - 1

  if (!loaded) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-slate-400 text-sm">불러오는 중...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="text-slate-500 text-lg">
              ←
            </button>
          )}
          <div>
            <p className="text-xs text-slate-400">{step + 1} / {STEPS.length}</p>
            <h1 className="font-bold text-slate-800 text-base leading-tight">
              {STEPS[step].icon} {STEPS[step].label}
            </h1>
          </div>
        </div>
        <button
          onClick={preview}
          className="text-blue-500 text-sm font-semibold px-3 py-1.5 rounded-xl bg-blue-50"
        >
          미리보기
        </button>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-slate-200">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-1.5 py-3 bg-white border-b border-slate-100">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
              i === step
                ? 'bg-blue-500 text-white font-semibold'
                : i < step
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-400'
            }`}
          >
            <span>{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6 overflow-y-auto">
        {step === 0 && (
          <PhotoStep
            photos={photos}
            profilePhoto={profilePhoto}
            onPhotosChange={setPhotos}
            onProfilePhotoChange={setProfilePhoto}
            videoUrl={videoUrl}
            onVideoChange={setVideoUrl}
            heroMode={heroMode}
            cardImage={cardImage}
            onHeroModeChange={setHeroMode}
            onCardImageChange={setCardImage}
          />
        )}
        {step === 1 && (
          <ProfileStep
            name={name}
            title={title}
            bio={bio}
            career={career}
            heroMode={heroMode}
            onChange={(field, value) => {
              if (field === 'name') setName(value)
              else if (field === 'title') setTitle(value)
              else if (field === 'bio') setBio(value)
              else if (field === 'career') setCareer(value)
            }}
          />
        )}
        {step === 2 && (
          <ThemeStep theme={theme} onChange={setTheme} textColor={textColor} onTextColorChange={setTextColor} />
        )}
        {step === 3 && (
          <ContactStep
            phone={phone}
            kakaoLink={kakaoLink}
            bookingEnabled={bookingEnabled}
            bookingSettings={bookingSettings}
            onChange={(field, value) => {
              if (field === 'phone') setPhone(value)
              else if (field === 'kakaoLink') setKakaoLink(value)
            }}
            onBookingChange={setBookingEnabled}
            onBookingSettingsChange={setBookingSettings}
            cardId={id}
          />
        )}
        {step === 4 && (
          <SnsStep snsLinks={snsLinks} onChange={setSnsLinks} />
        )}
        {step === 5 && (
          <MapStep
            address={address}
            onChange={(_, value) => setAddress(value)}
          />
        )}
        {step === 6 && (
          <HoursStep hours={hours} onChange={setHours} />
        )}
      </div>

      {/* Footer nav */}
      <div className="bg-white border-t border-slate-100 px-5 py-4 safe-area-bottom">
        {isLast ? (
          <button
            onClick={finish}
            disabled={saving}
            className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg disabled:opacity-60"
          >
            {saving ? '저장 중...' : '완성! 공유 링크 받기 →'}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={async () => { await save(); setShowShare(true) }}
              disabled={saving}
              className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold disabled:opacity-60"
            >
              저장
            </button>
            <button
              onClick={async () => { await save(); setStep(step + 1) }}
              className="flex-[2] py-4 bg-blue-500 text-white rounded-2xl font-bold"
            >
              다음 →
            </button>
          </div>
        )}

        {saveError && (
          <p className="text-center text-xs text-red-500 mt-2">⚠️ {saveError}</p>
        )}
        <p className="text-center text-xs text-slate-400 mt-2">
          입력하지 않은 항목은 자동으로 숨겨집니다
        </p>
      </div>

      {/* 공유 오버레이 */}
      {showShare && (
        <div className="fixed inset-0 flex items-end justify-center" style={{ zIndex: 200 }}>
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowShare(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl px-5 pt-8 pb-12" style={{ zIndex: 1 }}>
            {/* 닫기 */}
            <button
              type="button"
              onClick={() => setShowShare(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 text-sm"
            >
              ✕
            </button>

            {/* 완성 메시지 */}
            <div className="text-center mb-6">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-xl font-bold text-slate-800">명함이 완성되었습니다!</p>
              <p className="text-sm text-slate-500 mt-1">링크를 복사하거나 공유하세요</p>
            </div>

            {/* 링크 복사 */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-5">
              <span className="text-sm text-slate-500 truncate flex-1 font-mono">
                {typeof window !== 'undefined' ? cardUrl() : ''}
              </span>
              <button
                type="button"
                onClick={copyLink}
                className="text-sm font-bold text-blue-500 whitespace-nowrap px-2"
              >
                {copied ? '✓ 복사됨' : '복사'}
              </button>
            </div>

            {/* 버튼 */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={shareLink}
                className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-base"
              >
                📤 공유하기
              </button>
              <a
                href={`/card/${id}`}
                className="block w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-base text-center"
              >
                완성된 명함 보러가기 →
              </a>
              <button
                type="button"
                onClick={() => setShowShare(false)}
                className="w-full py-3 text-slate-400 text-sm"
              >
                계속 편집하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CreatePage() {
  return (
    <Suspense>
      <CreatePageInner />
    </Suspense>
  )
}

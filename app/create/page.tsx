'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import BasicInfoStep from '@/components/editor/BasicInfoStep'
import MediaStep from '@/components/editor/MediaStep'
import SnsKakaoStep from '@/components/editor/SnsKakaoStep'
import BookingHoursStep, { BookingSettings, DEFAULT_BOOKING_SETTINGS } from '@/components/editor/BookingHoursStep'
import ContactLocationStep from '@/components/editor/ContactLocationStep'
import { BusinessHours, SnsLinks, DEFAULT_THEME_COLOR, DEFAULT_TEXT_COLOR } from '@/lib/types'

const STEPS = [
  { id: 'basic',    label: '기본정보', icon: '🪪' },
  { id: 'media',    label: '소개·미디어', icon: '📸' },
  { id: 'sns',      label: 'SNS',     icon: '🔗' },
  { id: 'booking',  label: '예약·시간', icon: '📅' },
  { id: 'contact',  label: '연락처·위치', icon: '📍' },
]

function CreatePageInner() {
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
  const [fax, setFax] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [hours, setHours] = useState<BusinessHours | null>(null)
  const [cardImage, setCardImage] = useState('')
  const [slideshowUrl, setSlideshowUrl] = useState('')
  const [loaded, setLoaded] = useState(false)

  // 기존 저장 데이터 불러오기
  useEffect(() => {
    if (!id) return
    const owned: string[] = JSON.parse(localStorage.getItem('myCards') || '[]')
    if (!owned.includes(id)) { owned.push(id); localStorage.setItem('myCards', JSON.stringify(owned)) }
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
        if (data.fax) setFax(data.fax)
        if (data.email) setEmail(data.email)
        if (data.address) setAddress(data.address)
        if (data.hours) setHours(typeof data.hours === 'string' ? JSON.parse(data.hours) : data.hours)
        if (data.cardImage) setCardImage(data.cardImage)
        if (data.slideshowUrl) setSlideshowUrl(data.slideshowUrl)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [id])

  const getPayload = useCallback(() => ({
    photos, profilePhoto, name, title, bio, career,
    theme, textColor, phone, kakaoLink, snsLinks,
    bookingEnabled,
    bookingSettings: JSON.stringify(bookingSettings),
    videoUrl, fax, email, address, heroMode: 'card-image', cardImage, slideshowUrl, hours,
  }), [photos, profilePhoto, name, title, bio, career, theme, textColor, phone, kakaoLink, snsLinks, bookingEnabled, bookingSettings, videoUrl, fax, email, address, cardImage, slideshowUrl, hours])

  async function save() {
    setSaving(true); setSaveError('')
    try {
      const res = await fetch(`/api/cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getPayload()),
      })
      if (!res.ok) { setSaveError('저장 실패. 인터넷 연결을 확인해주세요.'); return false }
      return true
    } catch {
      setSaveError('저장 중 오류가 발생했습니다.')
      return false
    } finally { setSaving(false) }
  }

  const saveRef = useRef(save)
  useEffect(() => { saveRef.current = save })

  useEffect(() => {
    if (!loaded) return
    const timer = setTimeout(() => { saveRef.current() }, 800)
    return () => clearTimeout(timer)
  }, [photos, cardImage, slideshowUrl, loaded])

  async function saveField(fields: Record<string, unknown>) {
    try {
      await fetch(`/api/cards/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
    } catch { /* ignore */ }
  }

  async function handlePhotosChange(newPhotos: string[]) {
    setPhotos(newPhotos)
    await saveField({ photos: newPhotos })
  }

  async function handleProfilePhotoChange(url: string) {
    setProfilePhoto(url)
    await saveField({ profilePhoto: url })
  }

  async function handleCardImageChange(url: string) {
    setCardImage(url)
    await saveField({ cardImage: url })
  }

  async function handleSlideshowUrlChange(url: string) {
    setSlideshowUrl(url)
    await saveField({ slideshowUrl: url })
  }

  async function handleVideoChange(url: string) {
    setVideoUrl(url)
    await saveField({ videoUrl: url })
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
    save().then(() => window.open(`/card/${id}?edit=1`, '_blank'))
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
        <button onClick={preview} className="text-blue-500 text-sm font-semibold px-3 py-1.5 rounded-xl bg-blue-50">
          미리보기
        </button>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-slate-200">
        <div className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-1 py-3 bg-white border-b border-slate-100 overflow-x-auto">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap ${
              i === step
                ? 'bg-blue-500 text-white font-semibold'
                : i < step
                ? 'bg-blue-100 text-blue-700'
                : 'text-slate-400'
            }`}
          >
            <span>{s.icon}</span>
            <span className="text-xs">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6 overflow-y-auto">
        {step === 0 && (
          <BasicInfoStep
            cardImage={cardImage}
            onCardImageChange={handleCardImageChange}
            name={name}
            title={title}
            phone={phone}
            fax={fax}
            email={email}
            address={address}
            onNameChange={setName}
            onTitleChange={setTitle}
            onPhoneChange={setPhone}
            onFaxChange={setFax}
            onEmailChange={setEmail}
            onAddressChange={setAddress}
            theme={theme}
            onThemeChange={setTheme}
            textColor={textColor}
            onTextColorChange={setTextColor}
          />
        )}
        {step === 1 && (
          <MediaStep
            bio={bio}
            career={career}
            onBioChange={setBio}
            onCareerChange={setCareer}
            photos={photos}
            onPhotosChange={handlePhotosChange}
            videoUrl={videoUrl}
            onVideoChange={handleVideoChange}
            slideshowVideoUrl={slideshowUrl}
            onSlideshowVideoUrlChange={handleSlideshowUrlChange}
            heroMode="card-image"
          />
        )}
        {step === 2 && (
          <SnsKakaoStep
            snsLinks={snsLinks}
            kakaoLink={kakaoLink}
            onChange={setSnsLinks}
            onKakaoLinkChange={setKakaoLink}
          />
        )}
        {step === 3 && (
          <BookingHoursStep
            bookingEnabled={bookingEnabled}
            bookingSettings={bookingSettings}
            onBookingChange={setBookingEnabled}
            onBookingSettingsChange={setBookingSettings}
            hours={hours}
            onHoursChange={setHours}
            cardId={id}
          />
        )}
        {step === 4 && (
          <ContactLocationStep
            phone={phone}
            kakaoLink={kakaoLink}
            bookingEnabled={bookingEnabled}
            address={address}
            onAddressChange={setAddress}
          />
        )}
      </div>

      {/* Footer nav */}
      <div className="bg-white border-t border-slate-100 px-5 py-4 safe-area-bottom">
        {isLast ? (
          <button onClick={finish} disabled={saving}
            className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg disabled:opacity-60">
            {saving ? '저장 중...' : '완성! 공유 링크 받기 →'}
          </button>
        ) : (
          <div className="flex gap-3">
            <button onClick={async () => { await save(); setShowShare(true) }} disabled={saving}
              className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-semibold disabled:opacity-60">
              저장
            </button>
            <button onClick={async () => { await save(); setStep(step + 1) }}
              className="flex-[2] py-4 bg-blue-500 text-white rounded-2xl font-bold">
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
            <button type="button" onClick={() => setShowShare(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 text-sm">
              ✕
            </button>
            <div className="text-center mb-6">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-xl font-bold text-slate-800">명함이 완성되었습니다!</p>
              <p className="text-sm text-slate-500 mt-1">링크를 복사하거나 공유하세요</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 mb-5">
              <span className="text-sm text-slate-500 truncate flex-1 font-mono">
                {typeof window !== 'undefined' ? cardUrl() : ''}
              </span>
              <button type="button" onClick={copyLink}
                className="text-sm font-bold text-blue-500 whitespace-nowrap px-2">
                {copied ? '✓ 복사됨' : '복사'}
              </button>
            </div>
            <div className="space-y-2.5">
              <button type="button" onClick={shareLink}
                className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-base">
                📤 공유하기
              </button>
              <a href={`/card/${id}`} target="_blank" rel="noopener noreferrer"
                className="block w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-base text-center">
                완성된 명함 보러가기 →
              </a>
              <button type="button" onClick={() => setShowShare(false)}
                className="w-full py-3 text-slate-400 text-sm">
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
                                                                                                                                                                                                                                                                                                   
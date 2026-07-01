'use client'

import Link from 'next/link'
import { useState } from 'react'

export interface BookingSettings {
  allowedDays: number[]
  startTime: string
  endTime: string
  maxGuests: number
  blockedDates: string[]
  message: string
}

export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  allowedDays: [1, 2, 3, 4, 5],
  startTime: '09:00',
  endTime: '18:00',
  maxGuests: 10,
  blockedDates: [],
  message: '',
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const MONTH_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function BookingFormPreview({ settings, onBlockDate }: {
  settings: BookingSettings
  onBlockDate?: (date: string) => void
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [guests, setGuests] = useState(1)

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function isAvailable(d: number) {
    const str = toDateStr(year, month, d)
    if (str < todayStr) return false
    const dow = new Date(year, month, d).getDay()
    if (!settings.allowedDays.includes(dow)) return false
    if (settings.blockedDates.includes(str)) return false
    return true
  }

  function isBlocked(d: number) {
    return settings.blockedDates.includes(toDateStr(year, month, d))
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function getTimeSlots() {
    const slots = []
    const [sh, sm] = settings.startTime.split(':').map(Number)
    const [eh, em] = settings.endTime.split(':').map(Number)
    let cur = sh * 60 + sm
    const end = eh * 60 + em
    while (cur <= end) {
      slots.push(`${String(Math.floor(cur/60)).padStart(2,'0')}:${String(cur%60).padStart(2,'0')}`)
      cur += 30
    }
    return slots
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="space-y-4">
      {/* 이름 */}
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1.5">이름 <span className="text-red-400">*</span></label>
        <div className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 text-sm">홍길동</div>
      </div>

      {/* 연락처 */}
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1.5">연락처 <span className="text-red-400">*</span></label>
        <div className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 text-sm">010-1234-5678</div>
      </div>

      {/* 인원 */}
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1.5">인원 수 <span className="text-red-400">*</span></label>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setGuests(g => Math.max(1, g-1))}
            className="w-11 h-11 rounded-full bg-slate-100 text-slate-700 text-2xl font-bold flex items-center justify-center">−</button>
          <span className="text-xl font-bold text-slate-800 min-w-[4rem] text-center">{guests}명</span>
          <button type="button" onClick={() => setGuests(g => Math.min(settings.maxGuests, g+1))}
            className="w-11 h-11 rounded-full bg-slate-100 text-slate-700 text-2xl font-bold flex items-center justify-center">+</button>
        </div>
      </div>

      {/* 달력 */}
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-2">
          날짜 선택 <span className="text-red-400">*</span>
          {onBlockDate && <span className="text-xs text-slate-400 font-normal ml-2">날짜 길게 누르면 불가 설정</span>}
        </label>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
            <button type="button" onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 text-lg">‹</button>
            <span className="font-bold text-slate-800 text-sm">{year}년 {MONTH_KO[month]}</span>
            <button type="button" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 text-lg">›</button>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAY_LABELS.map((d, i) => (
              <div key={d} className={`py-2 text-center text-xs font-semibold ${i===0?'text-red-400':i===6?'text-blue-400':'text-slate-400'}`}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 p-2 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />
              const str = toDateStr(year, month, d)
              const avail = isAvailable(d)
              const blocked = isBlocked(d)
              const isSelected = str === selectedDate
              const isToday = str === todayStr
              const dow = (firstDay + d - 1) % 7
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!avail && !onBlockDate}
                  onClick={() => {
                    if (avail) { setSelectedDate(str); setSelectedTime('') }
                  }}
                  className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-colors
                    ${isSelected ? 'bg-blue-500 text-white font-bold' :
                      blocked ? 'bg-red-100 text-red-300 line-through' :
                      isToday ? 'border-2 border-blue-400 text-blue-600' :
                      avail ? (dow===0?'text-red-500 hover:bg-red-50':dow===6?'text-blue-500 hover:bg-blue-50':'text-slate-700 hover:bg-slate-100') :
                      'text-slate-200 cursor-not-allowed'}`}
                >
                  {d}
                </button>
              )
            })}
          </div>
          <div className="px-3 pb-3 text-xs text-slate-400 text-center">
            예약 가능: {settings.allowedDays.map(d => DAY_LABELS[d]).join('·')}요일
          </div>
        </div>
        {selectedDate && <p className="text-sm text-blue-600 font-semibold mt-2 text-center">선택: {selectedDate}</p>}
      </div>

      {/* 시간 */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">시간 선택 <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-4 gap-2">
            {getTimeSlots().map(t => (
              <button key={t} type="button" onClick={() => setSelectedTime(t)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  selectedTime === t ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-blue-50'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 메모 */}
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1.5">메모 <span className="text-slate-400 font-normal">(선택)</span></label>
        <div className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 text-sm h-16">요청사항이 있으면 적어주세요</div>
      </div>

      <div className="w-full py-4 bg-blue-200 text-white rounded-2xl font-bold text-base text-center">예약 신청하기</div>
    </div>
  )
}

interface Props {
  phone: string
  kakaoLink: string
  bookingEnabled: boolean
  bookingSettings: BookingSettings
  onChange: (field: string, value: string) => void
  onBookingChange: (enabled: boolean) => void
  onBookingSettingsChange: (settings: BookingSettings) => void
  cardId?: string
}

export default function ContactStep({
  phone, kakaoLink, bookingEnabled, bookingSettings,
  onChange, onBookingChange, onBookingSettingsChange, cardId
}: Props) {
  const [blockInput, setBlockInput] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  function addBlockedDate() {
    if (!blockInput) return
    if (bookingSettings.blockedDates.includes(blockInput)) return
    onBookingSettingsChange({
      ...bookingSettings,
      blockedDates: [...bookingSettings.blockedDates, blockInput].sort()
    })
    setBlockInput('')
  }

  function removeBlockedDate(date: string) {
    onBookingSettingsChange({
      ...bookingSettings,
      blockedDates: bookingSettings.blockedDates.filter(d => d !== date)
    })
  }

  function toggleDay(day: number) {
    const days = bookingSettings.allowedDays.includes(day)
      ? bookingSettings.allowedDays.filter(d => d !== day)
      : [...bookingSettings.allowedDays, day].sort()
    onBookingSettingsChange({ ...bookingSettings, allowedDays: days })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">전화번호</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="예) 010-1234-5678"
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <p className="text-xs text-slate-400 mt-1">입력하면 전화·문자 버튼이 자동으로 나타납니다</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">카카오톡 오픈채팅 링크 (선택)</label>
        <input
          type="url"
          value={kakaoLink}
          onChange={(e) => onChange('kakaoLink', e.target.value)}
          placeholder="https://open.kakao.com/o/..."
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <p className="text-xs text-slate-400 mt-1">카카오톡 → 채팅 → + → 오픈채팅 → 링크 복사</p>
      </div>

      {/* 예약 기능 토글 */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="font-semibold text-slate-700 text-sm">예약 받기</p>
            <p className="text-xs text-slate-400 mt-0.5">손님이 날짜·시간을 선택해 예약 신청</p>
          </div>
          <button
            type="button"
            onClick={() => onBookingChange(!bookingEnabled)}
            className={`relative w-12 h-7 rounded-full transition-colors ${bookingEnabled ? 'bg-blue-500' : 'bg-slate-200'}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${bookingEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {bookingEnabled && (
          <div className="border-t border-slate-100 px-4 py-4 space-y-5 bg-slate-50">

            {/* 예약 안내 메시지 */}
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2">💬 예약 안내 메시지</p>
              <textarea
                value={bookingSettings.message}
                onChange={e => onBookingSettingsChange({ ...bookingSettings, message: e.target.value })}
                placeholder="예) 예약 후 확인 문자를 드립니다. 주차 가능합니다."
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">손님 예약 화면 상단에 표시됩니다</p>
            </div>

            {/* 예약 폼 미리보기 */}
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-3">📅 예약 신청 화면 (미리보기)</p>
              {bookingSettings.message && (
                <div className="mb-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-800 whitespace-pre-wrap">
                  {bookingSettings.message}
                </div>
              )}
              <BookingFormPreview settings={bookingSettings} />
            </div>

            {/* 고급 설정 토글 */}
            <button
              type="button"
              onClick={() => setShowAdvanced(v => !v)}
              className="w-full py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 bg-white flex items-center justify-center gap-1"
            >
              ⚙️ 상세 설정 {showAdvanced ? '▲' : '▼'}
            </button>

            {showAdvanced && (
              <div className="space-y-5">
                {/* 가능한 요일 */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">📅 예약 가능한 요일</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {DAY_LABELS.map((label, i) => (
                      <button key={i} type="button" onClick={() => toggleDay(i)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                          bookingSettings.allowedDays.includes(i) ? 'bg-blue-500 text-white' : 'bg-white text-slate-400 border border-slate-200'
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 운영 시간 */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">🕐 예약 가능 시간</p>
                  <div className="flex items-center gap-3">
                    <input type="time" value={bookingSettings.startTime}
                      onChange={e => onBookingSettingsChange({ ...bookingSettings, startTime: e.target.value })}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <span className="text-slate-400 text-sm">~</span>
                    <input type="time" value={bookingSettings.endTime}
                      onChange={e => onBookingSettingsChange({ ...bookingSettings, endTime: e.target.value })}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>

                {/* 최대 인원 */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">👥 최대 예약 인원</p>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={() => onBookingSettingsChange({ ...bookingSettings, maxGuests: Math.max(1, bookingSettings.maxGuests - 1) })}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 text-xl font-bold flex items-center justify-center">−</button>
                    <span className="text-lg font-bold text-slate-800 min-w-[4rem] text-center">{bookingSettings.maxGuests}명</span>
                    <button type="button" onClick={() => onBookingSettingsChange({ ...bookingSettings, maxGuests: Math.min(999, bookingSettings.maxGuests + 1) })}
                      className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 text-xl font-bold flex items-center justify-center">+</button>
                  </div>
                </div>

                {/* 예약 불가 날짜 */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 mb-2">🚫 예약 불가 날짜</p>
                  <div className="flex gap-2">
                    <input type="date" value={blockInput} min={new Date().toISOString().split('T')[0]}
                      onChange={e => setBlockInput(e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button type="button" onClick={addBlockedDate}
                      className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold">추가</button>
                  </div>
                  {bookingSettings.blockedDates.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {bookingSettings.blockedDates.map(d => (
                        <span key={d} className="flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                          {d}
                          <button type="button" onClick={() => removeBlockedDate(d)} className="text-red-400 font-bold">✕</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 예약 관리 바로가기 */}
      {bookingEnabled && cardId && (
        <Link href={`/card/${cardId}/bookings`}
          className="flex items-center justify-between w-full px-4 py-4 bg-green-50 border border-green-200 rounded-2xl">
          <div>
            <p className="text-sm font-semibold text-green-800">예약 관리하기</p>
            <p className="text-xs text-green-600 mt-0.5">들어온 예약 확인 · 답장 보내기</p>
          </div>
          <span className="text-green-500 text-lg">→</span>
        </Link>
      )}

      {/* 버튼 미리보기 */}
      <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-blue-800">미리보기</p>
        <div className="flex gap-2 flex-wrap">
          {phone && (
            <>
              <span className="px-3 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold">📞 전화</span>
              <span className="px-3 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold">💬 문자</span>
            </>
          )}
          {kakaoLink && (
            <span className="px-3 py-2 bg-yellow-400 text-slate-800 rounded-xl text-sm font-semibold">💛 카카오톡</span>
          )}
          {bookingEnabled && (
            <span className="px-3 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold">📅 예약하기</span>
          )}
          {!phone && !kakaoLink && !bookingEnabled && (
            <span className="text-sm text-slate-400">연락처를 입력하거나 예약 기능을 켜면 버튼이 표시됩니다</span>
          )}
        </div>
      </div>
    </div>
  )
}

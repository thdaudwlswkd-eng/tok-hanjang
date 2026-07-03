'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BusinessHours, DAY_LABELS, DEFAULT_HOURS } from '@/lib/types'
import { BookingSettings, DEFAULT_BOOKING_SETTINGS } from '@/components/editor/ContactStep'

export { BookingSettings, DEFAULT_BOOKING_SETTINGS }

const DAY_LABEL_ARR = ['일', '월', '화', '수', '목', '금', '토']
const MONTH_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function BookingFormPreview({ settings }: { settings: BookingSettings }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [guests, setGuests] = useState(1)
  const [previewName, setPreviewName] = useState('')
  const [previewPhone, setPreviewPhone] = useState('')
  const [previewMemo, setPreviewMemo] = useState('')
  const [submitted, setSubmitted] = useState(false)

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
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
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

  if (submitted) return (
    <div className="py-10 text-center space-y-3">
      <p className="text-4xl">✅</p>
      <p className="font-bold text-slate-800">예약 신청 완료!</p>
      <p className="text-sm text-slate-500">실제 손님에게 이렇게 보여집니다</p>
      <button type="button" onClick={() => { setSubmitted(false); setPreviewName(''); setPreviewPhone(''); setPreviewMemo(''); setSelectedDate(''); setSelectedTime('') }}
        className="mt-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold">
        다시 테스트
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1.5">이름 <span className="text-red-400">*</span></label>
        <input type="text" value={previewName} onChange={e => setPreviewName(e.target.value)} placeholder="홍길동"
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1.5">연락처 <span className="text-red-400">*</span></label>
        <input type="tel" value={previewPhone} onChange={e => setPreviewPhone(e.target.value)} placeholder="010-1234-5678"
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
      </div>
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
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-2">날짜 선택 <span className="text-red-400">*</span></label>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
            <button type="button" onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 text-lg">‹</button>
            <span className="font-bold text-slate-800 text-sm">{year}년 {MONTH_KO[month]}</span>
            <button type="button" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 text-lg">›</button>
          </div>
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAY_LABEL_ARR.map((d, i) => (
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
                <button key={i} type="button" disabled={!avail}
                  onClick={() => { if (avail) { setSelectedDate(str); setSelectedTime('') } }}
                  className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-colors
                    ${isSelected ? 'bg-blue-500 text-white font-bold' :
                      blocked ? 'bg-red-100 text-red-300 line-through' :
                      isToday ? 'border-2 border-blue-400 text-blue-600' :
                      avail ? (dow===0?'text-red-500 hover:bg-red-50':dow===6?'text-blue-500 hover:bg-blue-50':'text-slate-700 hover:bg-slate-100') :
                      'text-slate-200 cursor-not-allowed'}`}
                >{d}</button>
              )
            })}
          </div>
          <div className="px-3 pb-3 text-xs text-slate-400 text-center">
            예약 가능: {settings.allowedDays.map(d => DAY_LABEL_ARR[d]).join('·')}요일
          </div>
        </div>
        {selectedDate && <p className="text-sm text-blue-600 font-semibold mt-2 text-center">선택: {selectedDate}</p>}
      </div>
      {selectedDate && (
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">시간 선택 <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-4 gap-2">
            {getTimeSlots().map(t => (
              <button key={t} type="button" onClick={() => setSelectedTime(t)}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  selectedTime === t ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-blue-50'
                }`}>{t}</button>
            ))}
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-1.5">메모 <span className="text-slate-400 font-normal">(선택)</span></label>
        <textarea value={previewMemo} onChange={e => setPreviewMemo(e.target.value)}
          placeholder="요청사항이 있으면 적어주세요" rows={3}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
      </div>
      <button type="button"
        onClick={() => {
          if (!previewName || !previewPhone || !selectedDate || !selectedTime) {
            alert('이름, 연락처, 날짜, 시간을 모두 선택해주세요')
            return
          }
          setSubmitted(true)
        }}
        className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-base text-center active:bg-blue-600">
        예약 신청하기
      </button>
    </div>
  )
}

interface Props {
  bookingEnabled: boolean
  bookingSettings: BookingSettings
  onBookingChange: (enabled: boolean) => void
  onBookingSettingsChange: (settings: BookingSettings) => void
  hours: BusinessHours | null
  onHoursChange: (hours: BusinessHours | null) => void
  cardId?: string
}

const DAYS = Object.keys(DEFAULT_HOURS) as (keyof BusinessHours)[]

export default function BookingHoursStep({
  bookingEnabled, bookingSettings, onBookingChange, onBookingSettingsChange,
  hours, onHoursChange, cardId,
}: Props) {
  const hoursEnabled = hours !== null
  const hoursData = hours ?? DEFAULT_HOURS

  function updateDay(day: keyof BusinessHours, field: 'open' | 'from' | 'to', value: string | boolean) {
    if (!hours) return
    onHoursChange({ ...hours, [day]: { ...hours[day], [field]: value } })
  }

  return (
    <div className="space-y-7">
      {/* 예약 받기 */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="font-semibold text-slate-700 text-sm">📅 예약 받기</p>
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

            {/* 예약 가능 시간 */}
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2">🕐 예약 가능 시간</p>
              <div className="flex items-center gap-3">
                <input type="time" value={bookingSettings.startTime}
                  onChange={e => onBookingSettingsChange({ ...bookingSettings, startTime: e.target.value })}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <span className="text-slate-400 text-sm">~</span>
                <input type="time" value={bookingSettings.endTime}
                  onChange={e => onBookingSettingsChange({ ...bookingSettings, endTime: e.target.value })}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>

            {/* 예약 폼 미리보기 */}
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2">📋 예약 신청 화면 미리보기</p>
              <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
                <span className="text-amber-500 text-sm">👁️</span>
                <p className="text-xs text-amber-700">손님에게 보여지는 화면이에요.</p>
              </div>
              {bookingSettings.message && (
                <div className="mb-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-800 whitespace-pre-wrap">
                  {bookingSettings.message}
                </div>
              )}
              <BookingFormPreview settings={bookingSettings} />
            </div>

            {/* 예약 관리 바로가기 */}
            {cardId && (
              <Link href={`/card/${cardId}/bookings`}
                className="flex items-center justify-between w-full px-4 py-4 bg-green-50 border border-green-200 rounded-2xl">
                <div>
                  <p className="text-sm font-semibold text-green-800">예약 관리하기</p>
                  <p className="text-xs text-green-600 mt-0.5">들어온 예약 확인 · 답장 보내기</p>
                </div>
                <span className="text-green-500 text-lg">→</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 영업시간 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-slate-800">🕐 영업시간 표시</p>
            <p className="text-xs text-slate-400 mt-0.5">비활성화하면 영업시간이 숨겨집니다</p>
          </div>
          <button
            onClick={() => onHoursChange(hoursEnabled ? null : DEFAULT_HOURS)}
            className={`relative w-12 h-7 rounded-full transition-colors ${hoursEnabled ? 'bg-blue-500' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${hoursEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {hoursEnabled && (
          <div className="space-y-3">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-3">
                <button
                  onClick={() => updateDay(day, 'open', !hoursData[day].open)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                    hoursData[day].open
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-slate-300 text-slate-300'
                  }`}
                >
                  {hoursData[day].open ? '✓' : ''}
                </button>
                <span className={`w-6 text-sm font-semibold ${day === 'sun' ? 'text-red-500' : day === 'sat' ? 'text-blue-500' : 'text-slate-700'}`}>
                  {DAY_LABELS[day]}
                </span>
                {hoursData[day].open ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={hoursData[day].from}
                      onChange={(e) => updateDay(day, 'from', e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-xl border border-slate-200 text-sm text-center bg-white" />
                    <span className="text-slate-400 text-sm">~</span>
                    <input type="time" value={hoursData[day].to}
                      onChange={(e) => updateDay(day, 'to', e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-xl border border-slate-200 text-sm text-center bg-white" />
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">휴무</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useState } from 'react'

export interface BookingSettings {
  allowedDays: number[]   // 0=일 1=월 2=화 3=수 4=목 5=금 6=토
  startTime: string       // "09:00"
  endTime: string         // "18:00"
  maxGuests: number
  blockedDates: string[]  // ["2025-07-20"]
}

export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  allowedDays: [1, 2, 3, 4, 5],
  startTime: '09:00',
  endTime: '18:00',
  maxGuests: 10,
  blockedDates: [],
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

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

  function toggleDay(day: number) {
    const days = bookingSettings.allowedDays.includes(day)
      ? bookingSettings.allowedDays.filter(d => d !== day)
      : [...bookingSettings.allowedDays, day].sort()
    onBookingSettingsChange({ ...bookingSettings, allowedDays: days })
  }

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
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${bookingEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* 예약 설정 패널 */}
        {bookingEnabled && (
          <div className="border-t border-slate-100 px-4 py-4 space-y-5 bg-slate-50">

            {/* 가능한 요일 */}
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2">📅 예약 가능한 요일</p>
              <div className="flex gap-1.5 flex-wrap">
                {DAY_LABELS.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                      bookingSettings.allowedDays.includes(i)
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 운영 시간 */}
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2">🕐 예약 가능 시간</p>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={bookingSettings.startTime}
                  onChange={e => onBookingSettingsChange({ ...bookingSettings, startTime: e.target.value })}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="text-slate-400 text-sm">~</span>
                <input
                  type="time"
                  value={bookingSettings.endTime}
                  onChange={e => onBookingSettingsChange({ ...bookingSettings, endTime: e.target.value })}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* 최대 인원 */}
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2">👥 최대 예약 인원</p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => onBookingSettingsChange({ ...bookingSettings, maxGuests: Math.max(1, bookingSettings.maxGuests - 1) })}
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 text-xl font-bold flex items-center justify-center"
                >−</button>
                <span className="text-lg font-bold text-slate-800 min-w-[4rem] text-center">{bookingSettings.maxGuests}명</span>
                <button
                  type="button"
                  onClick={() => onBookingSettingsChange({ ...bookingSettings, maxGuests: Math.min(999, bookingSettings.maxGuests + 1) })}
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-700 text-xl font-bold flex items-center justify-center"
                >+</button>
              </div>
            </div>

            {/* 예약 불가 날짜 */}
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-2">🚫 예약 불가 날짜</p>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={blockInput}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setBlockInput(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={addBlockedDate}
                  className="px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold"
                >추가</button>
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

      {/* 예약 관리 바로가기 */}
      {bookingEnabled && cardId && (
        <Link
          href={`/card/${cardId}/bookings`}
          className="flex items-center justify-between w-full px-4 py-4 bg-green-50 border border-green-200 rounded-2xl"
        >
          <div>
            <p className="text-sm font-semibold text-green-800">예약 관리하기</p>
            <p className="text-xs text-green-600 mt-0.5">들어온 예약 확인 · 답장 보내기</p>
          </div>
          <span className="text-green-500 text-lg">→</span>
        </Link>
      )}

      {/* 미리보기 */}
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

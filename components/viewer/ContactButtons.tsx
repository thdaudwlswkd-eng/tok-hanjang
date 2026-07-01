'use client'

import { useState } from 'react'
import BookingModal from './BookingModal'

interface BookingSettings {
  allowedDays: number[]
  startTime: string
  endTime: string
  maxGuests: number
  blockedDates: string[]
}

interface Props {
  phone?: string | null
  kakaoLink?: string | null
  bookingEnabled?: boolean | null
  bookingSettings?: BookingSettings | null
  cardId: string
}

export default function ContactButtons({ phone, kakaoLink, bookingEnabled, bookingSettings, cardId }: Props) {
  const [showBooking, setShowBooking] = useState(false)

  if (!phone && !kakaoLink && !bookingEnabled) return null

  return (
    <>
      <div className="px-5 py-4 space-y-2">
        {(phone || kakaoLink) && (
          <div className="flex gap-2">
            {phone && (
              <>
                <a
                  href={`tel:${phone.replace(/[^0-9]/g, "")}`}
                  className="flex-1 py-3.5 bg-blue-500 text-white rounded-2xl font-bold text-center text-sm active:bg-blue-600 transition-colors"
                >
                  📞 전화
                </a>
                <a
                  href={`sms:${phone.replace(/[^0-9]/g, "")}`}
                  className="flex-1 py-3.5 bg-green-500 text-white rounded-2xl font-bold text-center text-sm active:bg-green-600 transition-colors"
                >
                  💬 문자
                </a>
              </>
            )}
            {kakaoLink && (
              <a
                href={kakaoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 bg-kakao text-slate-900 rounded-2xl font-bold text-center text-sm active:opacity-80 transition-opacity"
              >
                💛 카카오톡
              </a>
            )}
          </div>
        )}

        {bookingEnabled && (
          <button
            type="button"
            onClick={() => setShowBooking(true)}
            className="w-full py-3.5 bg-slate-800 text-white rounded-2xl font-bold text-sm active:opacity-80 transition-opacity"
          >
            📅 예약하기
          </button>
        )}
      </div>

      {showBooking && (
        <BookingModal cardId={cardId} bookingSettings={bookingSettings} onClose={() => setShowBooking(false)} />
      )}
    </>
  )
}

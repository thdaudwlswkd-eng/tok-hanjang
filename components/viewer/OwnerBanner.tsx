'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Props {
  cardId: string
  pendingBookings: number
}

export default function OwnerBanner({ cardId, pendingBookings }: Props) {
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const owned: string[] = JSON.parse(localStorage.getItem('myCards') || '[]')
    setIsOwner(owned.includes(cardId))
  }, [cardId])

  if (!isOwner) return null

  return (
    <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
      <p className="text-xs text-slate-300">내 명함 홈페이지</p>
      <div className="flex items-center gap-2">
        {pendingBookings > 0 && (
          <Link
            href={`/card/${cardId}/bookings`}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/50 px-3 py-1.5 rounded-lg"
          >
            예약 관리
            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {pendingBookings > 9 ? '9+' : pendingBookings}
            </span>
          </Link>
        )}
        <Link
          href={`/create?id=${cardId}`}
          className="text-xs font-semibold text-blue-400 bg-blue-950/50 px-3 py-1.5 rounded-lg"
        >
          편집하기
        </Link>
      </div>
    </div>
  )
}

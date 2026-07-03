'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface BookingSettings {
  allowedDays: number[]
  startTime: string
  endTime: string
  maxGuests: number
  blockedDates: string[]
  message?: string
}

interface Props {
  cardId: string
  bookingSettings?: BookingSettings | null
  onClose: () => void
}

const DAY_KO = ['일', '월', '화', '수', '목', '금', '토']
const MONTH_KO = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function Calendar({
  settings,
  selected,
  onSelect,
}: {
  settings?: BookingSettings | null
  selected: string
  onSelect: (d: string) => void
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function isAvailable(d: number) {
    const str = toDateStr(year, month, d)
    if (str < todayStr) return false
    if (!settings) return true
    const dow = new Date(year, month, d).getDay()
    if (!settings.allowedDays.includes(dow)) return false
    if (settings.blockedDates.includes(str)) return false
    return true
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <button type="button" onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 text-lg">‹</button>
        <span className="font-bold text-slate-800">{year}년 {MONTH_KO[month]}</span>
        <button type="button" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-600 text-lg">›</button>
      </div>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {DAY_KO.map((d, i) => (
          <div key={d} className={`py-2 text-center text-xs font-semibold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>{d}</div>
        ))}
      </div>
      {/* 날짜 */}
      <div className="grid grid-cols-7 p-2 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const str = toDateStr(year, month, d)
          const avail = isAvailable(d)
          const isSelected = str === selected
          const isToday = str === todayStr
          const dow = (firstDay + d - 1) % 7
          return (
            <button
              key={i}
              type="button"
              disabled={!avail}
              onClick={() => onSelect(str)}
              className={`
                aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-colors
                ${isSelected ? 'bg-blue-500 text-white font-bold' :
                  isToday ? 'border-2 border-blue-400 text-blue-600' :
                  avail ? (dow === 0 ? 'text-red-500 hover:bg-red-50' : dow === 6 ? 'text-blue-500 hover:bg-blue-50' : 'text-slate-700 hover:bg-slate-100') :
                  'text-slate-200 cursor-not-allowed'}
              `}
            >
              {d}
            </button>
          )
        })}
      </div>
      {settings && (
        <div className="px-3 pb-3 text-xs text-slate-400 text-center">
          예약 가능: {settings.allowedDays.map(d => DAY_KO[d]).join('·')}요일
        </div>
      )}
    </div>
  )
}

export default function BookingModal({ cardId, bookingSettings, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<'info' | 'date' | 'time'>('info')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [guests, setGuests] = useState(1)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { setMounted(true) }, [])

  const maxGuests = bookingSettings?.maxGuests ?? 99

  // 시간 목록 생성
  function getTimeSlots() {
    if (!bookingSettings) {
      const slots = []
      for (let h = 9; h <= 20; h++) {
        slots.push(`${String(h).padStart(2,'0')}:00`)
        if (h < 20) slots.push(`${String(h).padStart(2,'0')}:30`)
      }
      return slots
    }
    const slots = []
    const [sh, sm] = bookingSettings.startTime.split(':').map(Number)
    const [eh, em] = bookingSettings.endTime.split(':').map(Number)
    let cur = sh * 60 + sm
    const end = eh * 60 + em
    while (cur <= end) {
      slots.push(`${String(Math.floor(cur/60)).padStart(2,'0')}:${String(cur%60).padStart(2,'0')}`)
      cur += 30
    }
    return slots
  }

  async function submit() {
    if (!name.trim() || !phone.trim() || !date || !time) {
      setError('이름, 연락처, 날짜, 시간을 모두 선택해 주세요')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/cards/${cardId}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), guests, date, time, note: note.trim() || null }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
    } catch {
      setError('예약 신청 중 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  const timeSlots = getTimeSlots()

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-black/50" style={{ zIndex: 0 }} onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 flex justify-center" style={{ zIndex: 1 }}>
      <div className="w-full max-w-lg bg-white rounded-t-3xl px-5 pt-6 pb-10 max-h-[92vh] overflow-y-auto">

        {done ? (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">✅</p>
            <p className="font-bold text-slate-800 text-xl">예약 신청 완료!</p>
            <p className="text-sm text-slate-500 mt-2">확인 후 연락드리겠습니다.</p>
            <button type="button" onClick={onClose} className="mt-8 w-full py-4 bg-blue-500 text-white rounded-2xl font-bold">닫기</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-800">📅 예약 신청</h2>
              <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 text-sm">✕</button>
            </div>

            {bookingSettings?.message && (
              <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-800 whitespace-pre-wrap">
                {bookingSettings.message}
              </div>
            )}

            <div className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">이름 <span className="text-red-400">*</span></label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="홍길동"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">연락처 <span className="text-red-400">*</span></label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-1234-5678"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>

              {/* 인원 */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">인원 수 <span className="text-red-400">*</span></label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))}
                    className="w-11 h-11 rounded-full bg-slate-100 text-slate-700 text-2xl font-bold flex items-center justify-center">−</button>
                  <span className="text-xl font-bold text-slate-800 min-w-[4rem] text-center">{guests}명</span>
                  <button type="button" onClick={() => setGuests(g => Math.min(maxGuests, g + 1))}
                    className="w-11 h-11 rounded-full bg-slate-100 text-slate-700 text-2xl font-bold flex items-center justify-center">+</button>
                </div>
              </div>

              {/* 날짜 달력 */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">날짜 선택 <span className="text-red-400">*</span></label>
                <Calendar settings={bookingSettings} selected={date} onSelect={d => { setDate(d); setTime('') }} />
                {date && <p className="text-sm text-blue-600 font-semibold mt-2 text-center">선택: {date}</p>}
              </div>

              {/* 시간 선택 */}
              {date && (
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">시간 선택 <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map(t => (
                      <button key={t} type="button" onClick={() => setTime(t)}
                        className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          time === t ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-blue-50'
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
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="요청사항이 있으면 적어주세요" rows={2}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <button type="button" onClick={submit} disabled={loading || !date || !time}
                className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-base disabled:opacity-50">
                {loading ? '신청 중...' : '예약 신청하기'}
              </button>
            </div>
          </>
        )}
      </div>
      </div>
    </div>,
    document.body
  )
}

'use client'

import { BusinessHours, DAY_LABELS, DEFAULT_HOURS } from '@/lib/types'

interface Props {
  hours?: BusinessHours | null
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

function isOpenNow(hours: BusinessHours): boolean {
  const now = new Date()
  const dayIdx = now.getDay() // 0=Sun, 1=Mon...
  const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
  const today = hours[dayMap[dayIdx]]
  if (!today.open) return false
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return hhmm >= today.from && hhmm <= today.to
}

export default function HoursSection({ hours }: Props) {
  const displayHours = hours ?? DEFAULT_HOURS
  const open = isOpenNow(displayHours)

  return (
    <section className="px-5 py-6 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-bold text-slate-800">🕐 영업시간</h2>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-green-500 pulse-dot' : 'bg-red-400'}`} />
          {open ? '영업 중' : '영업 종료'}
        </span>
      </div>

      {!hours && (
        <p className="text-xs text-slate-400 mb-3">기본 영업시간으로 표시됩니다. 편집 페이지에서 변경할 수 있어요.</p>
      )}
      <div className="space-y-2">
        {DAYS.map((day) => {
          const now = new Date()
          const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
          const isToday = dayMap[now.getDay()] === day

          return (
            <div
              key={day}
              className={`flex items-center justify-between py-2 px-3 rounded-xl text-sm ${isToday ? 'bg-blue-50 font-semibold' : ''}`}
            >
              <span className={`w-6 ${day === 'sun' ? 'text-red-500' : day === 'sat' ? 'text-blue-500' : 'text-slate-700'}`}>
                {DAY_LABELS[day]}
              </span>
              {displayHours[day].open ? (
                <span className="text-slate-700">
                  {displayHours[d
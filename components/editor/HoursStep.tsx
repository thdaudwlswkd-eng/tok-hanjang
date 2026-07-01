'use client'

import { BusinessHours, DAY_LABELS, DEFAULT_HOURS } from '@/lib/types'

interface Props {
  hours: BusinessHours | null
  onChange: (hours: BusinessHours | null) => void
}

const DAYS = Object.keys(DEFAULT_HOURS) as (keyof BusinessHours)[]

export default function HoursStep({ hours, onChange }: Props) {
  const enabled = hours !== null
  const data = hours ?? DEFAULT_HOURS

  function toggle() {
    onChange(enabled ? null : DEFAULT_HOURS)
  }

  function updateDay(day: keyof BusinessHours, field: 'open' | 'from' | 'to', value: string | boolean) {
    if (!hours) return
    onChange({ ...hours, [day]: { ...hours[day], [field]: value } })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-800">영업시간 표시</p>
          <p className="text-xs text-slate-400">비활성화하면 영업시간이 숨겨집니다</p>
        </div>
        <button
          onClick={toggle}
          className={`relative w-12 h-7 rounded-full transition-colors ${enabled ? 'bg-blue-500' : 'bg-slate-300'}`}
        >
          <span
            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-3">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-3">
              <div className="w-6 text-center">
                <button
                  onClick={() => updateDay(day, 'open', !data[day].open)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                    data[day].open
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'border-slate-300 text-slate-300'
                  }`}
                >
                  {data[day].open ? '✓' : ''}
                </button>
              </div>
              <span className={`w-6 text-sm font-semibold ${day === 'sun' ? 'text-red-500' : day === 'sat' ? 'text-blue-500' : 'text-slate-700'}`}>
                {DAY_LABELS[day]}
              </span>
              {data[day].open ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={data[day].from}
                    onChange={(e) => updateDay(day, 'from', e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-xl border border-slate-200 text-sm text-center bg-white"
                  />
                  <span className="text-slate-400 text-sm">~</span>
                  <input
                    type="time"
                    value={data[day].to}
                    onChange={(e) => updateDay(day, 'to', e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-xl border border-slate-200 text-sm text-center bg-white"
                  />
                </div>
              ) : (
                <span className="text-sm text-slate-400">휴무</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

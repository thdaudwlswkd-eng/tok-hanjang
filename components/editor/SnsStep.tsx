'use client'

import { SnsLinks, SNS_PLATFORMS } from '@/lib/types'

interface Props {
  snsLinks: SnsLinks
  onChange: (links: SnsLinks) => void
}

export default function SnsStep({ snsLinks, onChange }: Props) {
  function handleChange(id: keyof SnsLinks, value: string) {
    onChange({ ...snsLinks, [id]: value })
  }

  const filledCount = SNS_PLATFORMS.filter(p => snsLinks[p.id]).length

  return (
    <div>
      <h2 className="text-base font-bold text-slate-800 mb-1">SNS 링크</h2>
      <p className="text-sm text-slate-400 mb-5">
        입력한 항목만 명함에 아이콘 버튼으로 표시됩니다
      </p>

      <div className="space-y-3">
        {SNS_PLATFORMS.map((platform) => {
          const value = snsLinks[platform.id] ?? ''
          const filled = !!value

          return (
            <div
              key={platform.id}
              className={`bg-white rounded-2xl border transition-colors p-4 ${
                filled ? 'border-slate-300' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ backgroundColor: platform.color + '18' }}
                >
                  {platform.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-400 mb-1">
                    {platform.label}
                    {filled && <span className="ml-1 text-green-500">✓</span>}
                  </p>
                  <input
                    type="url"
                    value={value}
                    onChange={(e) => handleChange(platform.id, e.target.value)}
                    placeholder={platform.placeholder}
                    className="w-full text-sm text-slate-700 outline-none placeholder:text-slate-300 bg-transparent"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filledCount > 0 && (
        <p className="text-center text-xs text-blue-500 font-semibold mt-4">
          {filledCount}개 링크가 명함에 표시됩니다
        </p>
      )}
    </div>
  )
}

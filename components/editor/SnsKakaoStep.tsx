'use client'

import { SnsLinks, SNS_PLATFORMS } from '@/lib/types'

interface Props {
  snsLinks: SnsLinks
  kakaoLink: string
  onChange: (links: SnsLinks) => void
  onKakaoLinkChange: (v: string) => void
}

export default function SnsKakaoStep({ snsLinks, kakaoLink, onChange, onKakaoLinkChange }: Props) {
  function handleChange(id: keyof SnsLinks, value: string) {
    onChange({ ...snsLinks, [id]: value })
  }

  const filledCount = SNS_PLATFORMS.filter(p => snsLinks[p.id]).length

  return (
    <div className="space-y-6">
      {/* 카카오톡 오픈채팅 */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-1">💛 카카오톡 오픈채팅 링크</p>
        <p className="text-xs text-slate-400 mb-3">입력하면 카카오톡 버튼이 명함에 나타납니다</p>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg bg-yellow-50">
              💛
            </div>
            <input
              type="url"
              value={kakaoLink}
              onChange={(e) => onKakaoLinkChange(e.target.value)}
              placeholder="https://open.kakao.com/o/..."
              className="flex-1 text-sm text-slate-700 outline-none placeholder:text-slate-300 bg-transparent"
            />
            {kakaoLink && <span className="text-green-500 text-sm">✓</span>}
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">카카오톡 → 채팅 → + → 오픈채팅 → 링크 복사</p>
      </div>

      {/* SNS 링크 */}
      <div>
        <p className="text-sm font-bold text-slate-700 mb-1">🔗 SNS 링크</p>
        <p className="text-sm text-slate-400 mb-4">입력한 항목만 명함에 아이콘 버튼으로 표시됩니다</p>

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
            {filledCount}개 SNS 링크가 명함에 표시됩니다
          </p>
        )}
      </div>
    </div>
  )
}

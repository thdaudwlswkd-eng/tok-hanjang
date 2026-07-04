'use client'

interface Props {
  phone?: string | null
  kakaoLink?: string | null
  variant?: 'inline' | 'sticky'
}

export default function QuickContactBar({ phone, kakaoLink, variant = 'sticky' }: Props) {
  if (!phone && !kakaoLink) return null

  if (variant === 'sticky') {
    return (
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-white border-t border-slate-200 px-4 py-3 flex gap-2">
        {phone && (
          <>
            <a
              href={`tel:${phone.replace(/[^0-9]/g, '')}`}
              className="flex-1 py-3.5 bg-blue-500 text-white rounded-2xl font-bold text-center text-sm active:bg-blue-600 transition-colors"
            >
              📞 전화
            </a>
            <a
              href={`sms:${phone.replace(/[^0-9]/g, '')}`}
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
            className="flex-1 py-3.5 bg-yellow-400 text-slate-900 rounded-2xl font-bold text-center text-sm active:opacity-80 transition-opacity"
          >
            💛 카카오톡
          </a>
        )}
      </div>
    )
  }

  // inline variant — 히어로 바로 아래
  return (
    <div className="px-4 py-4 flex gap-2 bg-white border-b border-slate-100">
      {phone && (
        <>
          <a
            href={`tel:${phone.replace(/[^0-9]/g, '')}`}
            className="flex-1 py-3.5 bg-blue-500 text-white rounded-2xl font-bold text-center text-sm active:bg-blue-600 transition-colors"
          >
            📞 전화
          </a>
          <a
            href={`sms:${phone.replace(/[^0-9]/g, '')}`}
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
          className="flex-1 py-3.5 bg-yellow-400 text-slate-900 rounded-2xl font-bold text-center text-sm active:opacity-80 transition-opacity"
        >
          💛 카카오톡
        </a>
      )}
    </div>
  )
}

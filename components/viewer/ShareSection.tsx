'use client'

import { useState } from 'react'

interface Props {
  url: string
  name?: string | null
}

export default function ShareSection({ url, name }: Props) {
  const [toast, setToast] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name ? `${name}의 명함` : '내 명함 홈페이지',
          url,
        })
        return
      } catch {
        // 사용자가 취소한 경우 — 복사로 대체하지 않음
        return
      }
    }
    copyLink()
  }

  return (
    <>
      {/* Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          toast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-slate-800 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl whitespace-nowrap">
          ✓ 링크가 복사되었습니다
        </div>
      </div>

      <section className="px-5 py-6 border-t border-slate-100 bg-slate-50">
        <h2 className="text-base font-bold text-slate-800 mb-1">🔗 공유하기</h2>
        <p className="text-xs text-slate-400 mb-4">링크를 복사해서 카톡·문자·SNS로 보내세요</p>

        {/* Link box */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-500 truncate">
            {url}
          </div>
          <button
            onClick={copyLink}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 text-white active:opacity-70 transition-opacity"
          >
            복사
          </button>
        </div>

        {/* Share button */}
        <button
          onClick={share}
          className="w-full py-3.5 bg-blue-500 text-white rounded-2xl font-bold text-sm active:opacity-80 transition-opacity"
        >
          공유하기
        </button>
      </section>
    </>
  )
}

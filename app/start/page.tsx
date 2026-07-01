'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const FEATURES = [
  { emoji: '📸', title: '사진 슬라이드쇼 자동 생성' },
  { emoji: '📞', title: '전화 · 문자 · 카카오톡 버튼' },
  { emoji: '📅', title: '예약 신청 받기' },
  { emoji: '🗺️', title: '지도 · 오시는 길 안내' },
  { emoji: '🔗', title: 'SNS 링크 모음' },
  { emoji: '🕐', title: '영업시간 안내' },
  { emoji: '🎨', title: '색상 · 글자색 자유 선택' },
  { emoji: '📤', title: '카카오톡 · 문자로 링크 공유' },
]

export default function StartPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function start() {
    setLoading(true)
    try {
      const res = await fetch('/api/cards', { method: 'POST' })
      const { id } = await res.json()
      router.push(`/create?id=${id}`)
    } catch {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col items-center px-5 py-12">
      <div className="max-w-sm w-full space-y-8">

        {/* 헤더 */}
        <div className="text-center space-y-2">
          <p className="text-blue-400 text-sm font-semibold tracking-widest uppercase">톡한장</p>
          <h1 className="text-3xl font-bold leading-tight">
            나만의 모바일 명함을<br />5분 만에 만드세요
          </h1>
          <p className="text-slate-400 text-sm pt-1">
            링크 하나로 내 모든 정보를 전달하는<br />한 페이지 명함 홈페이지
          </p>
        </div>

        {/* 가격 카드 */}
        <div className="bg-white/10 backdrop-blur rounded-3xl p-6 space-y-5 border border-white/10">
          <div className="text-center">
            <p className="text-slate-400 text-sm">평생 이용</p>
            <p className="text-4xl font-bold mt-1">
              99,000<span className="text-lg font-normal text-slate-300">원</span>
            </p>
            <p className="text-slate-400 text-xs mt-1">월정액 없음 · 한 번 결제로 평생 사용</p>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-2.5">
                <span className="text-base">{f.emoji}</span>
                <span className="text-sm text-slate-200">{f.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <button
            onClick={start}
            disabled={loading}
            className="w-full py-4 bg-blue-500 hover:bg-blue-400 disabled:opacity-60 rounded-2xl text-lg font-bold transition-colors shadow-lg"
          >
            {loading ? '준비 중...' : '지금 바로 시작하기 →'}
          </button>
          <p className="text-center text-slate-500 text-xs">
            결제 없이 먼저 체험해보세요
          </p>
        </div>

        {/* 예시 명함 링크 */}
        <div className="text-center">
          <a href="/" className="text-slate-500 text-xs underline underline-offset-2">
            명함 예시 보기
          </a>
        </div>

      </div>
    </main>
  )
}

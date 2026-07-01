'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const FEATURES = [
  { emoji: '📸', title: '사진 슬라이드쇼', desc: '사진을 올리면 슬라이드쇼 자동 생성, 배경음악 추가 가능' },
  { emoji: '🎥', title: '동영상 업로드', desc: '내 영상 파일을 올려 명함 페이지에서 바로 재생' },
  { emoji: '📞', title: '전화 · 문자 · 카카오톡', desc: '버튼 한 번으로 전화, 문자, 카카오 오픈채팅 연결' },
  { emoji: '🔗', title: 'SNS 링크 모음', desc: '인스타그램, 유튜브, 틱톡, X, 스레드, 블로그 한곳에' },
  { emoji: '🗺️', title: '지도 · 오시는 길', desc: '주소 입력하면 카카오맵 연동 안내 자동 생성' },
  { emoji: '🕐', title: '영업시간 안내', desc: '요일별 오픈·마감 시간, 휴무일 설정' },
  { emoji: '📅', title: '예약하기', desc: '날짜·시간·인원 선택 예약 신청, 사장님 답장 발송' },
  { emoji: '🎨', title: '색상 · 글자색 선택', desc: '60가지 배경색과 글자색을 자유롭게 조합' },
  { emoji: '📤', title: '링크 공유', desc: '카카오톡 · 문자 · SNS에 링크 하나로 바로 공유' },
]

export default function LandingPage() {
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
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center px-5 py-14 text-white">
      <div className="max-w-sm w-full space-y-10">

        {/* Hero */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">톡한장</h1>
          <p className="text-slate-400 text-sm font-medium tracking-wide">(모바일 비즈니스 카드)</p>
          <p className="text-slate-300 text-base leading-relaxed pt-2">
            핸드폰으로 5분 만에 완성하는<br />나만의 한 페이지 명함 홈페이지
          </p>
        </div>

        {/* Feature list */}
        <ul className="space-y-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex items-start gap-3 bg-white/5 rounded-2xl px-4 py-3.5">
              <span className="text-xl mt-0.5 flex-shrink-0">{f.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-white">{f.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="space-y-3 pt-2">
          <button
            onClick={start}
            disabled={loading}
            className="w-full py-4 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 disabled:opacity-60 rounded-2xl text-lg font-bold transition-colors shadow-lg"
          >
            {loading ? '준비 중...' : '지금 바로 만들기'}
          </button>
          <p className="text-center text-slate-500 text-xs">가입 없이 바로 시작</p>
        </div>

      </div>
    </main>
  )
}

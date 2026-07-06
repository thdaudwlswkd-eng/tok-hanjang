'use client'

interface Props {
  onUnlock: () => void
}

export default function PaywallScreen({ onUnlock }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col max-w-lg mx-auto">

      {/* 상단 헤더 */}
      <div className="text-center pt-14 pb-6 px-6">
        <p className="text-4xl mb-3">🪪</p>
        <h1 className="text-2xl font-bold text-slate-800 leading-snug">
          나만의 명함 홈페이지를<br />지금 만들어보세요
        </h1>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
          핸드폰으로 5분 만에 완성하고<br />카카오톡으로 바로 공유하세요
        </p>
      </div>

      {/* 기능 소개 */}
      <div className="mx-5 bg-white rounded-3xl shadow-sm border border-slate-100 px-6 py-5 space-y-4">
        {[
          { icon: '📱', title: '핸드폰으로 5분 만에 완성', desc: '복잡한 앱 없이 바로 만들기' },
          { icon: '🔗', title: '카카오톡으로 바로 공유', desc: '링크 하나로 누구에게나 전달' },
          { icon: '✏️', title: '언제든 수정 가능', desc: '내용이 바뀌면 바로 업데이트' },
          { icon: '📅', title: '예약 기능 포함', desc: '예약 신청 받고 문자로 확인' },
          { icon: '📸', title: '사진·영상 갤러리', desc: '내 작업물을 멋지게 소개' },
        ].map(item => (
          <div key={item.title} className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{item.icon}</span>
            <div>
              <p className="text-sm font-bold text-slate-800">{item.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 가격 + 결제 버튼 */}
      <div className="mx-5 mt-5">
        <div className="bg-blue-500 rounded-3xl px-6 py-5 text-white text-center">
          <p className="text-xs opacity-80 mb-1">한번 결제, 평생 사용</p>
          <p className="text-3xl font-bold mb-1">₩ 9,900</p>
          <p className="text-xs opacity-70">부가세 포함 · 추가 요금 없음</p>
        </div>

        <button
          onClick={onUnlock}
          className="w-full mt-3 py-4 bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-md active:scale-95 transition-transform"
        >
          결제하고 시작하기 →
        </button>

        {/* 테스트 모드 안내 */}
        <p className="text-center text-xs text-slate-300 mt-3">
          🔧 현재 테스트 버전 — 결제 없이 임시 사용 가능
        </p>
      </div>

      <div className="h-12" />
    </div>
  )
}

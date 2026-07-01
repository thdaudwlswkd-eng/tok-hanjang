import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="text-5xl mb-4">🔍</p>
      <h1 className="text-xl font-bold text-slate-800 mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-slate-500 text-sm mb-6">링크가 잘못되었거나 삭제된 페이지입니다</p>
      <Link href="/" className="px-6 py-3 bg-blue-500 text-white rounded-2xl font-semibold">
        홈으로 돌아가기
      </Link>
    </div>
  )
}

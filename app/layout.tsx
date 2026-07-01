import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '내 명함 홈페이지',
  description: '핸드폰으로 만드는 나만의 한 페이지 홈페이지',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}

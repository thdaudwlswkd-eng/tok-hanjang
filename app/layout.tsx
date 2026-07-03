import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '톡한장 - 명함형 홈페이지',
    template: '%s',
  },
  description: '핸드폰으로 뚝딱 만드는 명함형 홈페이지',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}

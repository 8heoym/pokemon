import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '포켓몬 수학 모험',
  description: '포켓몬과 함께하는 초등학교 2학년 곱셈 학습 게임',
  keywords: ['포켓몬', '수학', '곱셈', '구구단', '초등학교', '교육', '게임'],
  authors: [{ name: '포켓몬 수학 모험 팀' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
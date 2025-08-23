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
      <body className={`${inter.className} pokemon-bg`}>
        <div className="min-h-screen">
          <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
            <div className="container mx-auto flex items-center justify-between">
              <h1 className="text-2xl font-bold font-pokemon">
                🔥 포켓몬 수학 모험 ⚡
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm opacity-90">
                  포켓몬과 함께 구구단을 마스터하자!
                </span>
              </div>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
          
          <footer className="bg-gray-800 text-white p-6 mt-8">
            <div className="container mx-auto text-center">
              <div className="flex justify-center items-center space-x-4 mb-4">
                <span>🎮</span>
                <span>재미있게 배우는 수학</span>
                <span>⭐</span>
                <span>포켓몬과 함께</span>
                <span>🚀</span>
              </div>
              <p className="text-sm opacity-75">
                © 2024 포켓몬 수학 모험. 모든 포켓몬 관련 컨텐츠는 교육 목적으로 사용되었습니다.
              </p>
              <p className="text-xs opacity-60 mt-2">
                Made with ❤️ for young Pokemon trainers learning multiplication
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
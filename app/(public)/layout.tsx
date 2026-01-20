// app/(public)/layout.tsx
import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: '삼육멋사14기',
  description: '멋쟁이사자처럼 14기 사이트',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}

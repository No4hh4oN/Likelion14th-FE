// app/(admin)/layout.tsx
import '@/styles/globals.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <div className="admin-layout">
          <div className="admin-content">
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}

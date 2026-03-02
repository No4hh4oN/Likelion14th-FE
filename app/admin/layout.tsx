import type { Metadata } from "next";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";
import AdminAccessGuard from "@/features/admin/AdminAccessGuard";

export const metadata: Metadata = {
  title: "멋쟁이사자처럼14기 운영페이지",
  description: "멋쟁이사자처럼 14기 관리자 페이지",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="admin-layout">
          <div className="admin-content">
            <Header />
            <main>
              <AdminAccessGuard>{children}</AdminAccessGuard>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}


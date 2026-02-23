import type { Metadata } from "next";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "삼육멋사14기 운영페이지",
  description: "멋쟁이사자처럼 14기 사이트",
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
            <main>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
